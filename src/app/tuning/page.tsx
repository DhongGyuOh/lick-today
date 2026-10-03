"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// 표준 기타 튜닝: 6 번줄(저음 E) → 1 번줄(고음 E), Hz 기준
const STANDARD_TUNING: { readonly note: string; readonly frequency: number }[] = [
  { note: "E", frequency: 82.41 },  // 6 번줄 (가장 두꺼운 줄, 저음)
  { note: "A", frequency: 110.00 }, // 5 번줄
  { note: "D", frequency: 146.83 }, // 4 번줄
  { note: "G", frequency: 196.00 }, // 3 번줄
  { note: "B", frequency: 246.94 }, // 2 번줄
  { note: "E", frequency: 329.63 }, // 1 번줄 (가장 얇은 줄, 고음)
];

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Autocorrelation을 이용한 피치 감지 (YIN 알고리즘 기반)
function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const size = buffer.length;
  let maxSamples = Math.floor(sampleRate / 40); // 40Hz 이상만 감지
  if (maxSamples > size) maxSamples = size;

  let best_offset = -1;
  let best_correlation = 0;
  let rms = 0;

  // RMS 계산 (신호 강도 체크)
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / size);
  if (rms < 0.01) return null; // 신호가 너무 약함

  // Autocorrelation 계산
  let lastCorrelation = 1;
  for (let lag = 1; lag < maxSamples; lag++) {
    let sum = 0;
    for (let index = 0; index < maxSamples; index++) {
      sum += Math.abs(buffer[index] - buffer[index + lag]);
    }
    let correlation = 1 - sum / maxSamples / 2;
    if (correlation > 0.9 && correlation > best_correlation) {
      if (correlation > lastCorrelation) {
        let shift = 0;
        if (lag + 1 < maxSamples) {
          shift =
            (buffer[lag + 1] - buffer[lag - 1]) / (2 * (2 * buffer[lag] - buffer[lag - 1] - buffer[lag + 1]));
        }
        if (Math.abs(shift) < 1) {
          best_correlation = correlation;
          best_offset = lag + shift;
          break;
        }
      }
    }
    lastCorrelation = correlation;
  }

  if (best_correlation > 0.85) {
    return sampleRate / best_offset;
  }
  return null;
}

// Hz → 반음 인덱스 (C0 = 0)
function semitoneFromFrequency(frequency: number): number {
  return Math.round(12 * Math.log2(frequency / 440) + 69) - 12; // MIDI 노트 번호 → 0~11
}

// 현재 튜닝 상태를 로컬 스토리지에 저장/읽습니다.
const STORAGE_KEY = "lick-today-tuning";

type TuningState = Record<number, number>; // stringIndex → 반음 오프셋

function loadTuning(): TuningState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TuningState) : {};
  } catch {
    return {};
  }
}

function saveTuning(state: TuningState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('튜닝 저장 실패 (localStorage 미지원 또는 쿼터 초과):', err);
  }
}

export default function TuningPage() {
  const [offsets, setOffsets] = useState<TuningState>(() => loadTuning());
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  // 마이크 입력 상태
  const [isMicActive, setIsMicActive] = useState(false);
  const [detectedFreq, setDetectedFreq] = useState<number | null>(null);
  const [matchedStringIndex, setMatchedStringIndex] = useState<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const bufferLengthRef = useRef<number>(2048);

  // 튜닝 상태 변경 시 자동으로 저장 (불변 패턴)
  useEffect(() => {
    saveTuning(offsets);
  }, [offsets]);

  // AudioContext 를 직접 만들어 기준음 재생 (oscillator 는 자바스크립트 생성).
  const playReferenceTone = useCallback((index: number) => {
    const AudioCtx =
      (window.AudioContext || (window as any).webkitAudioContext) as
        | typeof AudioContext
        | undefined;
    if (!AudioCtx) {
      console.warn("AudioContext 를 지원하지 않는 브라우저입니다.");
      return;
    }

    const string = STANDARD_TUNING[index];
    const frequency = string.frequency * Math.pow(2, (offsets[index] ?? 0) / 12);
    if (!isFinite(frequency) || frequency <= 0) return; // NaN/Infinity 방어
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
    setPlayingIndex(index);
    setTimeout(() => setPlayingIndex(null), 1500);
    ctx.close();
  }, [offsets]);

  const setOffset = useCallback((index: number, delta: number) => {
    setOffsets((prev) => ({ ...prev, [index]: (prev[index] ?? 0) + delta }));
  }, []);

  const currentNote = useCallback(
    (index: number): string => {
      const base = semitoneFromFrequency(STANDARD_TUNING[index].frequency);
      const adjusted = (base + (offsets[index] ?? 0)) % 12;
      return CHROMATIC[(adjusted + 12) % 12];
    },
    [offsets]
  );

  const isInTune = useCallback(
    (index: number): boolean => (offsets[index] ?? 0) === 0,
    [offsets]
  );

  // 마이크 분석 루프
  const analyzeStep = useCallback(() => {
    if (!analyserRef.current) return;
    const buffer = new Float32Array(bufferLengthRef.current);
    analyserRef.current.getFloatTimeDomainData(buffer);
    const freq = detectPitch(buffer, audioCtxRef.current?.sampleRate ?? 44100);
    if (freq) {
      setDetectedFreq(Math.round(freq * 10) / 10);
      // 가장 가까운 스트링 찾기
      let bestIdx = 0;
      let bestDiff = Infinity;
      STANDARD_TUNING.forEach((s, i) => {
        const target = s.frequency * Math.pow(2, (offsets[i] ?? 0) / 12);
        const diff = Math.abs(freq - target);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestIdx = i;
        }
      });
      // 10% 이내면 매칭으로 간주
      if (bestDiff / STANDARD_TUNING[bestIdx].frequency < 0.15) {
        setMatchedStringIndex(bestIdx);
      } else {
        setMatchedStringIndex(null);
      }
    } else {
      setDetectedFreq(null);
      setMatchedStringIndex(null);
    }
    rafRef.current = requestAnimationFrame(analyzeStep);
  }, [offsets]);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      bufferLengthRef.current = analyser.fftSize / 2;
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);
      // 분석 루프 시작
      rafRef.current = requestAnimationFrame(analyzeStep);
      setIsMicActive(true);
    } catch (e) {
      console.error("마이크 접근 실패:", e);
      alert("마이크 접근이 거부되었습니다. 브라우저 권한을 확인해주세요.");
    }
  }, [analyzeStep]);

  const stopMic = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
    if (analyserRef.current) analyserRef.current = null;
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    setIsMicActive(false);
    setDetectedFreq(null);
    setMatchedStringIndex(null);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => stopMic();
  }, [stopMic]);

  // 현재 튜닝 상태의 alphaTab 튜닝 문자열 (alphaTex) — 표준값도 동적으로 생성하여 항상 일치
  const currentAlphaTexTuning = STANDARD_TUNING.map((s, i) => {
    const base = semitoneFromFrequency(s.frequency);
    const adjusted = base + (offsets[i] ?? 0);
    const note = CHROMATIC[(adjusted % 12 + 12) % 12];
    const octave = Math.floor(adjusted / 12);
    return note + octave;
  }).join(" ");

  const alphaTexTuning = `\tuning(${currentAlphaTexTuning})`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">6 줄 튜닝</h1>
        <div className="flex gap-4 items-center">
          <p className="text-neutral-400 text-sm">
            각 줄의 기준음을 듣거나 마이크로 피치를 감지하여 맞추세요.
          </p>
          <button
            onClick={isMicActive ? stopMic : startMic}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isMicActive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
          >
            {isMicActive ? "⏹ 마이크 끄기" : "🎤 마이크 튜너 시작"}
          </button>
        </div>
        {isMicActive && (
          <div className="mt-4 p-3 bg-neutral-800 rounded-lg flex items-center gap-4">
            <span className="text-sm text-neutral-400">감지된 피치:</span>
            <span className="text-xl font-bold text-orange-400">
              {detectedFreq ? `${detectedFreq} Hz` : "---"}
            </span>
            {matchedStringIndex !== null && (
              <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded">
                {6 - matchedStringIndex}번 줄 근처
              </span>
            )}
          </div>
        )}
      </div>

      {/* 튜너 테이블 */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-neutral-500">줄</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-neutral-500">이음</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-neutral-500">
                기준음 (Hz)
              </th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-neutral-500">
                현재 피치
              </th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-neutral-500">
                튜닝 상태
              </th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-neutral-500">
                조절
              </th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-neutral-500">
                기준음 듣기
              </th>
            </tr>
          </thead>
          <tbody>
            {STANDARD_TUNING.map((string, index) => {
              const offset = offsets[index] ?? 0;
              const adjustedFrequency = string.frequency * Math.pow(2, offset / 12);
              return (
                <tr
                  key={index}
                  className={`border-b border-neutral-800/50 last:border-b-0 ${
                    playingIndex === index ? "bg-orange-950/30" : ""
                  }`}
                >
                  <td scope="row" className="px-4 py-3 text-sm text-neutral-300">
                    {6 - index}번 줄
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-neutral-200">
                    {string.note}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-400">
                    {offset === 0
                      ? string.frequency.toFixed(2)
                      : adjustedFrequency.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-bold">
                    <span
                      className={`${
                        isInTune(index)
                          ? "text-green-400"
                          : offset > 0
                          ? "text-orange-400"
                          : "text-blue-400"
                      }`}
                    >
                      {currentNote(index)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isInTune(index)
                          ? "bg-green-500/20 text-green-400"
                          : offset > 0
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {offset === 0
                        ? "🎵 제격"
                        : offset > 0
                        ? `▲ ${offset}반음`
                        : `▼ ${Math.abs(offset)}반음`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setOffset(index, -1)}
                        disabled={playingIndex !== null}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-800 text-neutral-300 text-lg font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                        aria-label="반음 내리기"
                      >
                        −
                      </button>
                      <span
                        className={`text-sm font-mono w-10 text-center ${
                          offset === 0
                            ? "text-neutral-500"
                            : offset > 0
                            ? "text-orange-400"
                            : "text-blue-400"
                        }`}
                      >
                        {offset === 0 ? "0" : offset > 0 ? `+${offset}` : offset}
                      </span>
                      <button
                        onClick={() => setOffset(index, 1)}
                        disabled={playingIndex !== null}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-800 text-neutral-300 text-lg font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                        aria-label="반음 올리기"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => playReferenceTone(index)}
                      disabled={playingIndex !== null}
                      aria-label={`${6 - index} 번 줄 기준음 듣기`}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        playingIndex === index
                          ? "bg-orange-600 text-white cursor-wait"
                          : "bg-orange-600 text-white hover:bg-orange-700"
                      }`}
                    >
                      {playingIndex === index ? "🔊 재생 중" : "🔊 듣기"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 팁 섹션 */}
      <div className="mt-6 space-y-4">
        <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-800/50">
          <p className="text-yellow-300 text-sm">
            💡 <span className="font-semibold">팁:</span> 다른 악기와 함께 연주하거나,
            앱레토/피아노 튜너 앱으로 비교해서 미세하게 조절하세요.
            기준음은 오실레이터로 생성되므로 디지털 튜너보다 ±1~2 반음 오차일 수 있습니다.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/50">
          <p className="text-blue-300 text-xs mb-2">
            🔧 alphaTab용 튜닝 문자열 (alphaTex):
          </p>
          <code className="block text-xs bg-neutral-950 px-3 py-2 rounded border border-neutral-800 font-mono text-neutral-300 break-all">
            {alphaTexTuning}
          </code>
          <p className="text-neutral-400 text-xs mt-2">
            현재 조정된 상태: <code className="font-mono text-neutral-300">
              \tuning({currentAlphaTexTuning})
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
