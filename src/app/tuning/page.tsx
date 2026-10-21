"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import TunerGauge from "@/components/TunerGauge";
import {
  centsBetween,
  detectPitch,
  findNearestTargetIndex,
  noteFromFrequency,
  semitoneFromFrequency,
} from "@/lib/pitch";

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

// 기준음 길이 (초 / 밀리초)
const TONE_DURATION_SEC = 1.5;
const TONE_DURATION_MS = TONE_DURATION_SEC * 1000;

// 마이크 분석에 사용하는 버퍼 길이 (샘플)
// 4096 샘플 @ 44.1kHz = 약 93ms. 저음 E2(82Hz)의 주기가 약 535샘플이므로
// 두 주기 이상이 들어가야 정확한 주기를 잡을 수 있습니다.
const ANALYSIS_BUFFER_SIZE = 4096;

// 감지된 음을 "몇 번 줄을 튜닝하는 중"으로 간주하는 최대 오차 (센트).
// 게이지 표시 범위(±50센트)보다 넓게 잡습니다. 그래야 크게 어긋난 줄도
// "너무 높음/낮음"으로 방향을 알려줄 수 있습니다. (100센트 = 반음 1개이므로
//  이 안에 있으면 인접한 다른 줄로 착각할 여지가 없습니다.)
const GAUGE_CENTS_LIMIT = 100;

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
  /** 목표음 대비 오차 (센트). 음을 감지하지 못했으면 null */
  const [cents, setCents] = useState<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const bufferLengthRef = useRef<number>(ANALYSIS_BUFFER_SIZE);
  const playingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 튜닝 상태 변경 시 자동으로 저장 (불변 패턴)
  useEffect(() => {
    saveTuning(offsets);
  }, [offsets]);

  // AudioContext 는 하나만 공유해서 사용합니다.
  // (브라우저는 동시에 열 수 있는 AudioContext 개수를 제한하기 때문에 클릭할 때마다
  //  새로 만들면 결국 "上下文가 너무 많습니다" 오류로 소리가 끊깁니다.)
  //  iOS/Safari 는 사용자 제스처 안에서 생성/재개하지 않으면 suspended 상태로 머물러
  //  소리가 아예 나오지 않으므로, 반드시 resume() 을 함께 호출해야 합니다.
  const ensureAudioContext = useCallback(async (): Promise<AudioContext | null> => {
    // Safari 구버전의 webkitAudioContext 도 함께 지원합니다.
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) {
      console.warn("AudioContext 를 지원하지 않는 브라우저입니다.");
      return null;
    }

    // closed 상태면 새로 만들고, 살아있는 인스턴스가 있으면 재사용합니다.
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;

    if (ctx.state !== "running") {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn("AudioContext 재개 실패:", err);
      }
    }
    if (ctx.state !== "running") {
      console.warn(`AudioContext 가 running 상태가 아닙니다 (state=${ctx.state}).`);
      return null;
    }
    return ctx;
  }, []);

  // 기준음 재생 (oscillator 는 자바스크립트 생성).
  const playReferenceTone = useCallback(
    async (index: number) => {
      const string = STANDARD_TUNING[index];
      if (!string) return;

      const frequency = string.frequency * Math.pow(2, (offsets[index] ?? 0) / 12);
      if (!isFinite(frequency) || frequency <= 0) return; // NaN/Infinity 방어

      const ctx = await ensureAudioContext();
      if (!ctx) {
        alert("이 브라우저에서는 오디오 재생을 지원하지 않습니다.");
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startAt = ctx.currentTime;
      const stopAt = startAt + TONE_DURATION_SEC;
      // 짧게 붙었다 떨어지지 않게 20ms 정도는 유지 후 지수 감쇠
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.3, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, stopAt);

      osc.start(startAt);
      osc.stop(stopAt + 0.05);

      setPlayingIndex(index);
      const timer = setTimeout(() => {
        setPlayingIndex((prev) => (prev === index ? null : prev));
      }, TONE_DURATION_MS);
      playingTimerRef.current = timer;
    },
    [ensureAudioContext, offsets]
  );

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

  // 마이크 분석 루프.
  // offsets 는 매 프레임的最新 값이 필요하므로 ref 로 읽고,
  // 재귀 호출(self reference) 대신 ref 에 담긴 함수로 다음 프레임을 예약합니다.
  const offsetsRef = useRef<TuningState>(offsets);
  const analyzeStepRef = useRef<() => void>(() => {});

  useEffect(() => {
    offsetsRef.current = offsets;
  }, [offsets]);

  const analyzeStep = useCallback(() => {
    if (!analyserRef.current) return;
    const buffer = new Float32Array(bufferLengthRef.current);
    analyserRef.current.getFloatTimeDomainData(buffer);
    const reading = detectPitch(
      buffer,
      audioCtxRef.current?.sampleRate ?? 44100
    );

    if (reading) {
      const frequency = reading.frequency;
      setDetectedFreq(Math.round(frequency * 10) / 10);

      // 현재 조정 상태를 반영한 각 줄의 목표 주파수
      const currentOffsets = offsetsRef.current;
      const targets = STANDARD_TUNING.map(
        (s, i) => s.frequency * Math.pow(2, (currentOffsets[i] ?? 0) / 12)
      );

      // 감지된 음과 가장 가까운(센트 기준) 줄을 찾습니다.
      const bestIdx = findNearestTargetIndex(frequency, targets);
      const cents = centsBetween(frequency, targets[bestIdx]);

      // 게이지 표시 범위(±100센트) 안이면 그 줄을 튜닝하는 것으로 봅니다.
      // 범위를 벗어나면 "방향만 알려주고" 줄 매칭은 하지 않습니다.
      // (예: 6번 줄을 튜닝하는데 4번 줄 소리를 들은 경우 등)
      if (Math.abs(cents) <= GAUGE_CENTS_LIMIT) {
        setMatchedStringIndex(bestIdx);
        setCents(Math.round(cents * 10) / 10);
      } else {
        setMatchedStringIndex(null);
        setCents(null);
      }
    } else {
      setDetectedFreq(null);
      setMatchedStringIndex(null);
      setCents(null);
    }
    rafRef.current = requestAnimationFrame(() => analyzeStepRef.current());
  }, []);

  useEffect(() => {
    analyzeStepRef.current = analyzeStep;
  }, [analyzeStep]);

  const startMic = useCallback(async () => {
    try {
      // AudioContext 는 사용자 제스처(클릭) 안에서 생성/재개해야 합니다.
      // 마이크 권한 프롬프트로 await 를 걸면 제스처 컨텍스트가 끊겨서 suspended 로
      //  남을 수 있으므로, 권한 요청보다 먼저 컨텍스트를 준비합니다.
      const ctx = await ensureAudioContext();
      if (!ctx) {
        alert("이 브라우저에서는 오디오 입력을 지원하지 않습니다.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const analyser = ctx.createAnalyser();
      // getFloatTimeDomainData 로 얻는 버퍼 길이는 fftSize / 2 이므로,
      // 저음줄의 두 주기가 들어가도록 4096 샘플을 확보합니다.
      analyser.fftSize = ANALYSIS_BUFFER_SIZE;
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
  }, [analyzeStep, ensureAudioContext]);

  // 마이크만 정지합니다. AudioContext 는 기준음 재생과 공유하므로 여기서 닫지 않습니다.
  const stopMic = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
    if (analyserRef.current) analyserRef.current = null;
    setIsMicActive(false);
    setDetectedFreq(null);
    setMatchedStringIndex(null);
    setCents(null);
  }, []);

  // 컴포넌트 언마운트 시 정리 (마이크 정지 + 공유 AudioContext 닫기)
  useEffect(() => {
    return () => {
      stopMic();
      if (playingTimerRef.current) {
        clearTimeout(playingTimerRef.current);
        playingTimerRef.current = null;
      }
      if (audioCtxRef.current) {
        void audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
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
          <div className="mt-4 space-y-3">
            <TunerGauge
              cents={cents}
              noteLabel={
                detectedFreq ? noteFromFrequency(detectedFreq).label : null
              }
              frequency={detectedFreq}
              targetLabel={
                matchedStringIndex !== null
                  ? noteFromFrequency(
                      STANDARD_TUNING[matchedStringIndex].frequency *
                        Math.pow(2, (offsets[matchedStringIndex] ?? 0) / 12)
                    ).label
                  : "—"
              }
              targetStringLabel={
                matchedStringIndex !== null
                  ? `${6 - matchedStringIndex}번 줄`
                  : "줄을 고르세요"
              }
            />
            {matchedStringIndex === null && (
              <p className="text-xs text-neutral-500">
                줄을 튜닝하는 중이라면 그 줄에 가까운 소리를 내보내 보세요.
              </p>
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
