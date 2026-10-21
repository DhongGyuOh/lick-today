// src/lib/pitch.ts 의 detectPitch 정확도 검증 (개발용)
// node --experimental-strip-types 로 TS 를 직접 로드하거나, 아래에 동일한 로직을 복사합니다.

const STANDARD_TUNING = [
  { note: "E", frequency: 82.41 },
  { note: "A", frequency: 110.0 },
  { note: "D", frequency: 146.83 },
  { note: "G", frequency: 196.0 },
  { note: "B", frequency: 246.94 },
  { note: "E", frequency: 329.63 },
];

const MIN_FREQUENCY = 40;
const MAX_FREQUENCY = 1000;
const YIN_THRESHOLD = 0.15;
const MIN_RMS = 0.01;

function detectPitch(buffer, sampleRate, options = {}) {
  const { innerWidth = 2048 } = options;
  const size = buffer.length;
  if (size < 256 || sampleRate <= 0) return null;

  let rms = 0;
  for (let i = 0; i < size; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / size);
  if (rms < MIN_RMS) return null;

  const minLag = Math.max(2, Math.floor(sampleRate / MAX_FREQUENCY));
  let maxLag = Math.floor(sampleRate / MIN_FREQUENCY);
  if (maxLag > Math.floor(size / 2)) maxLag = Math.floor(size / 2);
  if (maxLag <= minLag + 2) return null;

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

  const cmnd = new Float32Array(maxLag);
  cmnd[0] = 1;
  let runningSum = 0;
  for (let lag = 1; lag < maxLag; lag++) {
    runningSum += diff[lag];
    cmnd[lag] = runningSum === 0 ? 1 : (diff[lag] * lag) / runningSum;
  }

  let tau = -1;
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (cmnd[lag] < YIN_THRESHOLD) {
      while (lag + 1 < maxLag && cmnd[lag + 1] < cmnd[lag]) lag++;
      tau = lag;
      break;
    }
  }
  if (tau === -1) {
    let best = minLag + 1;
    for (let lag = minLag + 1; lag < maxLag; lag++) {
      if (cmnd[lag] < cmnd[best]) best = lag;
    }
    if (cmnd[best] > 0.5) return null;
    tau = best;
  }

  for (const divisor of [3, 2]) {
    const candidate = Math.round(tau / divisor);
    if (candidate <= minLag + 1 || candidate >= tau) continue;
    let local = candidate;
    while (local + 1 < tau && cmnd[local + 1] < cmnd[local]) local++;
    if (cmnd[local] < YIN_THRESHOLD) {
      tau = local;
      break;
    }
  }

  const x0 = tau > 1 ? tau - 1 : tau;
  const x2 = tau + 1 < maxLag ? tau + 1 : tau;
  let refinedTau;
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
  return { frequency, confidence: Math.max(0, Math.min(1, 1 - cmnd[tau])) };
}

// --- 신호 생성 ---
function makeSignal(freq, sampleRate, size, harmonics = [1, 0.5, 0.25, 0.12]) {
  const buf = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const t = i / sampleRate;
    let v = 0;
    for (let h = 0; h < harmonics.length; h++) {
      v += harmonics[h] * Math.sin(2 * Math.PI * freq * (h + 1) * t);
    }
    buf[i] = v * 0.3;
  }
  return buf;
}

function addNoise(buf, level, seed = 12345) {
  let s = seed;
  for (let i = 0; i < buf.length; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    buf[i] += ((s / 0x7fffffff) * 2 - 1) * level;
  }
}

function centsBetween(f, target) {
  return 1200 * Math.log2(f / target);
}

const sampleRate = 44100;
const offsetCents = [-50, -25, -10, -5, 0, 5, 10, 25, 50];
let failures = 0;

function check(label, got, target, tolerance = 5) {
  if (!got) {
    console.log(`  FAIL ${label}: 감지 실패`);
    failures++;
    return null;
  }
  const err = centsBetween(got, target);
  const ok = Math.abs(err) <= tolerance;
  if (!ok) failures++;
  return { err, ok };
}

console.log("=== cents 정확도 (노이즈 없음, size=4096) ===");
for (const s of STANDARD_TUNING) {
  const row = [];
  for (const c of offsetCents) {
    const target = s.frequency * Math.pow(2, c / 1200);
    const buf = makeSignal(target, sampleRate, 4096);
    const r = check(`${s.note} ${c}c`, detectPitch(buf, sampleRate)?.frequency, target);
    row.push(`${String(c).padStart(3)}c:${r ? r.err.toFixed(1).padStart(6) : "  FAIL"}`);
  }
  console.log(`  ${s.note.padEnd(2)} ${s.frequency.toFixed(2).padStart(6)}Hz  ${row.join(" ")}`);
}

console.log("\n=== 노이즈 허용 오차 (size=4096) ===");
for (const noise of [0.05, 0.1, 0.15, 0.2, 0.3]) {
  let errs = [];
  let fail = 0;
  for (const s of STANDARD_TUNING) {
    for (const c of [-25, 0, 25]) {
      const target = s.frequency * Math.pow(2, c / 1200);
      const buf = makeSignal(target, sampleRate, 4096);
      addNoise(buf, noise);
      const got = detectPitch(buf, sampleRate);
      if (!got) { fail++; continue; }
      errs.push(Math.abs(centsBetween(got.frequency, target)));
    }
  }
  const mae = errs.length ? errs.reduce((a, b) => a + b, 0) / errs.length : NaN;
  const max = errs.length ? Math.max(...errs) : NaN;
  const octErrs = errs.filter((e) => e > 600).length;
  console.log(
    `  노이즈 ${noise}: MAE ${mae.toFixed(2)} cents, max ${max.toFixed(1)}, 실패 ${fail}, 옥타브오류 ${octErrs}`
  );
}

console.log("\n=== 다른 샘플레이트 ===");
for (const sr of [44100, 48000, 22050]) {
  let errs = [];
  for (const s of STANDARD_TUNING) {
    const buf = makeSignal(s.frequency, sr, 4096);
    const got = detectPitch(buf, sr);
    if (got) errs.push(Math.abs(centsBetween(got.frequency, s.frequency)));
  }
  const mae = errs.reduce((a, b) => a + b, 0) / errs.length;
  console.log(`  ${sr}Hz: MAE ${mae.toFixed(2)} cents`);
}

console.log("\n=== 저역/고역极端 (E2 ~ E4 범위 밖) ===");
for (const f of [60, 70, 400, 700, 900]) {
  const buf = makeSignal(f, sampleRate, 4096);
  const got = detectPitch(buf, sampleRate);
  console.log(
    `  ${f}Hz -> ${got ? got.frequency.toFixed(2) + "Hz (conf " + got.confidence.toFixed(2) + ")" : "FAIL"}`
  );
}

console.log("\n=== 성능 (프레임당 ms) ===");
for (const size of [2048, 4096, 8192]) {
  const buf = makeSignal(196, sampleRate, size);
  const t0 = performance.now();
  const N = 300;
  for (let i = 0; i < N; i++) detectPitch(buf, sampleRate);
  console.log(`  size=${size}: ${((performance.now() - t0) / N).toFixed(2)} ms/frame`);
}

console.log(failures === 0 ? "\n✅ 모든 cents 정확도 검사 통과" : `\n❌ 실패 ${failures}건`);
process.exit(failures === 0 ? 0 : 1);
