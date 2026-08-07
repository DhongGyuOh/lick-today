"use client";

import { useState } from "react";
import ScaleFretboard, {
  KEYS,
  getScale,
  TONE_COLORS,
  SCALE_TYPE_LABELS,
  type KeyRoot,
  type ScaleType,
} from "@/components/ScaleFretboard";

export default function ScalePage() {
  const [root, setRoot] = useState<KeyRoot>("C");
  const [scaleType, setScaleType] = useState<ScaleType>("major");
  const scale = getScale(root, scaleType);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          {root} {SCALE_TYPE_LABELS[scaleType]} 스케일
        </h1>
        <p className="text-neutral-400 text-sm">
          키와 스케일 타입을 선택하면 24프렛 프렛보드의 위치를 음계와 도수로
          한눈에 볼 수 있습니다.
        </p>
      </div>

      {/* 스케일 타입 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          스케일 타입
        </label>
        <div className="flex flex-wrap gap-2">
          {(["major", "minor", "harmonic-minor"] as ScaleType[]).map((type) => {
            const active = type === scaleType;
            return (
              <button
                key={type}
                onClick={() => setScaleType(type)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/50"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600 hover:text-neutral-200"
                }`}
              >
                {SCALE_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 키 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          키 (Key)
        </label>
        <div className="flex flex-wrap gap-2">
          {KEYS.map((key) => {
            const active = key === root;
            return (
              <button
                key={key}
                onClick={() => setRoot(key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600 hover:text-neutral-200"
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* 음계 ↔ 도수 색상 범례 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {scale.map((note, i) => {
          const degree = i + 1;
          const color = TONE_COLORS[degree];
          return (
            <span
              key={note}
              className="flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs"
            >
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                style={{
                  color,
                  backgroundColor: `${color}1f`,
                }}
              >
                {note}
              </span>
              <span className="text-neutral-400">=</span>
              <span className="font-bold" style={{ color }}>
                {degree}
              </span>
            </span>
          );
        })}
      </div>

      <div className="space-y-8">
        <ScaleFretboard
          mode="note"
          root={root}
          scaleType={scaleType}
          title="🎵 음계 (Note)"
          description={`${root} ${SCALE_TYPE_LABELS[scaleType]} 스케일을 구성하는 음들이 프렛보드 위에 표시됩니다.`}
        />
        <ScaleFretboard
          mode="degree"
          root={root}
          scaleType={scaleType}
          title="🔢 도수 (Degree)"
          description="같은 위치를 스케일 도수 1·2·3·4·5·6·7로 표현한 것입니다. 1 = 으뜸음."
        />
      </div>
    </div>
  );
}
