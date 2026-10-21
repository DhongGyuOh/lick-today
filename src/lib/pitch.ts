/**
 * 기타 튜너용 피치(음높이) 감지 유틸.
 *
 * 알고리즘: YIN (de Cheveigné & Kawahara, 2002)
 *   difference function → 누적 평균 정규화(CMND) → 임계값 하강 지점 → 포물선 보간
 *
 * 센트(cents) 단위로 목표음과의 차이를 계산하므로, 튜너 게이지의 "중앙 = 제격"이
 * 정확히 맞습니다. (이전 구현은 모든 음에서 약 210센트씩 일정하게 어긋났습니다.)
 */

/** 반음 단위 음 이름 (샵 표기) */
export const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

/** 감지 주파수 범위 (Hz) — 기타 6줄 + 여유 */
const MIN_FREQUENCY = 40;
const MAX_FREQUENCY = 1000;

/** YIN 임계값 — CMND가 이 값보다 작아지는 첫 지점을 주기로 선택 */
const YIN_THRESHOLD = 0.15;

/** 이보다 작은 RMS(신호 세기)이면 소리로 보지 않습니다 */
const MIN_RMS = 0.01;

export interface PitchReading {
  /** 감지된 주파수 (Hz) */
  frequency: number;
  /** 신뢰도 0~1 (1 - CMND) */
  confidence: number;
}

export interface NoteInfo {
  /** 음 이름 (예: "E") */
  name: string;
  /** 옥타브 (예: 2) */
  octave: number;
  /** MIDI 노트 번호 (A4 = 69) */
  midi: number;
  /** 표시용 (예: "E2") */
  label: string;
}

/**
 * 주파수(Hz)를 가장 가까운 음 이름으로 변환합니다.
 * A4 = 440Hz = MIDI 69 기준 (과학적 표기법, 가운데 C = C4).
 */
export function noteFromFrequency(frequency: number): NoteInfo {
  if (!(frequency > 0) || !isFinite(frequency)) {
    return { name: "-", octave: 0, midi: 0, label: "-" };
  }
  const midi = Math.round(12 * Math.log2(frequency / 440) + 69);
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { name, octave, midi, label: `${name}${octave}` };
}

/**
 * 주파수(Hz)를 반음 인덱스로 변환합니다 (C0 = 0).
 * 음 이름만 필요할 때 (옥타브 무시) 사용합니다.
 */
export function semitoneFromFrequency(frequency: number): number {
  if (!(frequency > 0) || !isFinite(frequency)) return 0;
  return Math.round(12 * Math.log2(frequency / 440) + 69) - 12; // MIDI 노트 번호 → 0~11
}

/**
 * 두 주파수의 차이를 센트(cents)로 계산합니다.
 * 100센트 = 반음 1개, 1200센트 = 옥타브 1개.
 * 양수 = reference 보다 높음, 음수 = 낮음.
 */
export function centsBetween(frequency: number, reference: number): number {
  if (!(frequency > 0) || !(reference > 0)) return 0;
  return 1200 * Math.log2(frequency / reference);
}

/**
 * 주어진 목표 주파수 목록 중, 감지된 주파수와 가장 가까운(센트 기준) 항목의 인덱스를
 * 반환합니다. 즉 "지금 튜닝하고 있는 줄"을 찾는 데 쓰입니다.
 */
export function findNearestTargetIndex(
  frequency: number,
  targetFrequencies: readonly number[]
): number {
  let bestIndex = 0;
  let bestDistance = Infinity;
  targetFrequencies.forEach((target, i) => {
    const distance = Math.abs(centsBetween(frequency, target));
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  });
  return bestIndex;
}

/**
 * 버퍼에서 기본 주파수를 감지합니다. (YIN 알고리즘)
 *
 * @param buffer 시계열 샘플 (Float32Array)
 * @param sampleRate 샘플레이트 (Hz)
 * @param options.innerWidth difference function 계산에 쓸 구간 길이 (기본 2048).
 *   저음 줄(82Hz)의 주기가 약 535샘플이므로, 두 주기 이상을 담을 수 있어야 합니다.
 * @returns 감지 결과. 신호가 너무 약하거나 주기를 찾지 못하면 null.
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  options: { innerWidth?: number } = {}
): PitchReading | null {
  const { innerWidth = 2048 } = options;
  const size = buffer.length;
  if (size < 256 || sampleRate <= 0) return null;

  // 1) 신호 세기(RMS) 확인
  let rms = 0;
  for (let i = 0; i < size; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / size);
  if (rms < MIN_RMS) return null;

  // 가능한 주기(lag) 범위
  const minLag = Math.max(2, Math.floor(sampleRate / MAX_FREQUENCY));
  let maxLag = Math.floor(sampleRate / MIN_FREQUENCY);
  if (maxLag > Math.floor(size / 2)) maxLag = Math.floor(size / 2);
  if (maxLag <= minLag + 2) return null;

  // 2) difference function d(tau) = sum (x[j] - x[j+tau])^2
  const diff = new Float32Array(maxLag);
  for (let lag = 1; lag < maxLag; lag++) {
    const n = Math.min(size - lag, innerWidth);
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const d = buffer[i] - buffer[i + lag];
      sum += d * d;
    }
    diff[lag] = sum;
  }

  // 3) 누적 평균 정규화 d'(tau) = d(tau) * tau / sum(d[1..tau])
  //    (이 정규화 없이는 배음 때문에 잘못된 주기가 선택됩니다)
  const cmnd = new Float32Array(maxLag);
  cmnd[0] = 1;
  let runningSum = 0;
  for (let lag = 1; lag < maxLag; lag++) {
    runningSum += diff[lag];
    cmnd[lag] = runningSum === 0 ? 1 : (diff[lag] * lag) / runningSum;
  }

  // 4) 임계값 아래로 처음 떨어지는 구간의 전역 최소 지점을 주기로 선택
  let tau = -1;
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (cmnd[lag] < YIN_THRESHOLD) {
      while (lag + 1 < maxLag && cmnd[lag + 1] < cmnd[lag]) lag++;
      tau = lag;
      break;
    }
  }
  if (tau === -1) {
    // 임계값을 한 번도 못 건드리면 전체 최소 지점을 쓰되, 신뢰도가 너무 낮으면 버립니다.
    let best = minLag + 1;
    for (let lag = minLag + 1; lag < maxLag; lag++) {
      if (cmnd[lag] < cmnd[best]) best = lag;
    }
    if (cmnd[best] > 0.5) return null;
    tau = best;
  }

  // 5) 포물선 보간으로 서브샘플 정확도 확보
  //    (옥타브 오류는 CMND 정규화만으로 이미 억제됩니다. 별도의 약수 탐색을 넣으면
  //     노이즈 환경에서 오히려 정확도가 떨어져서 넣지 않습니다.)
  const x0 = tau > 1 ? tau - 1 : tau;
  const x2 = tau + 1 < maxLag ? tau + 1 : tau;
  let refinedTau: number;
  if (x0 === tau) {
    refinedTau = cmnd[tau] <= cmnd[x2] ? tau : x2;
  } else if (x2 === tau) {
    refinedTau = cmnd[tau] <= cmnd[x0] ? tau : x0;
  } else {
    const s0 = cmnd[x0];
    const s1 = cmnd[tau];
    const s2 = cmnd[x2];
    const denominator = 2 * (2 * s1 - s2 - s0);
    refinedTau = denominator === 0 ? tau : tau + (s2 - s0) / denominator;
  }
  if (!(refinedTau > 0)) return null;

  const frequency = sampleRate / refinedTau;
  if (!isFinite(frequency) || frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
    return null;
  }

  return {
    frequency,
    confidence: Math.max(0, Math.min(1, 1 - cmnd[tau])),
  };
}
