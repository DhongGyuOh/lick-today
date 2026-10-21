"use client";

import { memo } from "react";

/**
 * 실시간 피치 튜너 게이지.
 *
 * 막대(meter) 한 개가 "목표음 대비 얼마나 어긋났는가(센트)"를 보여줍니다.
 * 중앙이 정답(0센트)이며, 왼쪽은 낮음(blue), 오른쪽은 높음(red)입니다.
 *
 * 색만으로 의미를 전달하지 않습니다 — 니들 위치, 숫자(±센트), 상태 문구를
 * 항상 함께 표시합니다.
 */

/** 게이지 표시 범위 (센트) */
const SCALE_CENTS = 50;

/**
 * 이 범위 안이면 "제격"으로 간주.
 * 실제 기타 튜너 기준 ±5센트면 충분히 "맞았다"고 느끼는 수준입니다.
 */
export const IN_TUNE_CENTS = 5;

const COLORS = {
  low: "#3987e5", // 낮음 (blue)
  high: "#e66767", // 높음 (red)
  inTune: "#0ca30c", // 제격 (status good)
  track: "#2c2c2a", // 트랙 (gridline)
  tick: "#383835", // 눈금 (baseline/axis)
  muted: "#898781", // 축 라벨 (muted)
  secondary: "#c3c2b7", // 보조 텍스트
  primary: "#ffffff", // 주 텍스트
  surface: "#171717", // 카드 표면
} as const;

export type TunerState = "idle" | "inTune" | "low" | "high";

export interface TunerGaugeProps {
  /** 목표음 대비 오차 (센트). 음을 감지하지 못했으면 null */
  cents: number | null;
  /** 감지된 음 이름 (예: "E2"). 미감지 시 null */
  noteLabel: string | null;
  /** 감지된 주파수 (Hz). 미감지 시 null */
  frequency: number | null;
  /** 목표음 이름 (예: "E2") */
  targetLabel: string;
  /** 목표 줄 이름 (예: "6번 줄") */
  targetStringLabel: string;
}

function TunerGaugeComponent({
  cents,
  noteLabel,
  frequency,
  targetLabel,
  targetStringLabel,
}: TunerGaugeProps) {
  const hasSignal = cents !== null && isFinite(cents);

  // 클램프: 표시 범위를 벗어나도 니들이 끝을 넘어가지 않게 합니다.
  const clamped = hasSignal
    ? Math.max(-SCALE_CENTS, Math.min(SCALE_CENTS, cents))
    : 0;
  // -SCALE_CENTS → 0%, +SCALE_CENTS → 100%
  const position = ((clamped + SCALE_CENTS) / (SCALE_CENTS * 2)) * 100;

  // 표시 범위를 벗어났는지 (니들이 끝에 붙어 있는 상태)
  const isPegged = hasSignal && Math.abs(cents) > SCALE_CENTS;

  const state: TunerState = !hasSignal
    ? "idle"
    : Math.abs(cents) <= IN_TUNE_CENTS
    ? "inTune"
    : cents < 0
    ? "low"
    : "high";

  const needleColor =
    state === "inTune"
      ? COLORS.inTune
      : state === "low"
      ? COLORS.low
      : state === "high"
      ? COLORS.high
      : COLORS.muted;

  const statusText =
    state === "idle"
      ? "음을 기다리는 중"
      : state === "inTune"
      ? "제격"
      : state === "low"
      ? "너무 낮음"
      : "너무 높음";

  // 제격 구간(±5센트)의 폭을 %로 환산
  const inTuneWidth = (IN_TUNE_CENTS / (SCALE_CENTS * 2)) * 100;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      {/* 상단: 큰 숫자 + 상태 */}
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <div className="text-xs text-neutral-500 mb-1">
            {targetStringLabel} 기준 {targetLabel}
          </div>
          <div className="flex items-baseline gap-3">
            <span
              className="text-4xl font-bold tabular-nums"
              style={{ color: hasSignal ? needleColor : COLORS.muted }}
            >
              {hasSignal ? `${cents > 0 ? "+" : ""}${Math.round(cents)}` : "—"}
            </span>
            <span className="text-sm text-neutral-500">센트</span>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-lg font-semibold"
            style={{ color: hasSignal ? needleColor : COLORS.muted }}
          >
            {noteLabel ?? "—"}
          </div>
          <div className="text-xs text-neutral-500 tabular-nums">
            {frequency ? `${frequency.toFixed(1)} Hz` : "Hz"}
          </div>
        </div>
      </div>

      {/* 게이지: 좌우 방향 한 축, 중앙이 0센트 */}
      <div className="relative h-14 select-none">
        {/* 트랙 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-3 rounded-full"
          style={{ backgroundColor: COLORS.track }}
        />
        {/* 제격 구간 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full"
          style={{
            backgroundColor: COLORS.inTune,
            opacity: state === "inTune" ? 1 : 0.4,
            left: `${50 - inTuneWidth / 2}%`,
            width: `${inTuneWidth}%`,
          }}
        />

        {/* 눈금 (-50, -25, 0, +25, +50) */}
        {[-50, -25, 0, 25, 50].map((tick) => (
          <div
            key={tick}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${((tick + SCALE_CENTS) / (SCALE_CENTS * 2)) * 100}%` }}
          >
            <div
              className="w-px h-3"
              style={{
                backgroundColor:
                  tick === 0 ? COLORS.secondary : COLORS.tick,
              }}
            />
          </div>
        ))}

        {/* 중앙선 (0센트) */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-7"
          style={{ left: "50%", backgroundColor: COLORS.secondary }}
        />

        {/* 니들 (현재 위치) */}
        {hasSignal && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-100 ease-out"
            style={{ left: `${position}%` }}
          >
            {/* 표면 링(2px)으로 트랙과 분리 */}
            <div
              className="w-1.5 h-9 rounded-full"
              style={{
                backgroundColor: needleColor,
                boxShadow: `0 0 0 2px ${COLORS.surface}`,
              }}
            />
          </div>
        )}
      </div>

      {/* 축 라벨 */}
      <div className="relative h-5 mt-1">
        <span
          className="absolute -translate-x-1/2 text-[10px] tabular-nums"
          style={{ left: "0%", color: COLORS.muted }}
        >
          −50
        </span>
        <span
          className="absolute -translate-x-1/2 text-[10px] tabular-nums"
          style={{ left: "50%", color: COLORS.secondary }}
        >
          0
        </span>
        <span
          className="absolute -translate-x-1/2 text-[10px] tabular-nums"
          style={{ left: "100%", color: COLORS.muted }}
        >
          +50
        </span>
      </div>

      {/* 상태 문구 — 색이 아닌 텍스트로도 상태를 전달합니다 */}
      <div
        className="mt-3 text-sm font-medium"
        style={{ color: hasSignal ? needleColor : COLORS.muted }}
        role="status"
        aria-live="polite"
      >
        {hasSignal && state !== "inTune" && (
          <span className="text-neutral-400 font-normal">
            {state === "low" ? "줄을 조입니다 " : "줄을 풀어줍니다 "}
          </span>
        )}
        {statusText}
        {isPegged && (
          <span className="text-neutral-500 font-normal text-xs ml-2">
            (±{SCALE_CENTS}센트를 벗어남)
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(TunerGaugeComponent);
