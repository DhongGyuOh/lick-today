"use client";

import { useState } from "react";

type KeyRoot = "C" | "Db" | "D" | "Eb" | "E" | "F" | "F#" | "G" | "Ab" | "A" | "Bb" | "B";
type ChordMode = "triad" | "7th";

const KEYS: KeyRoot[] = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const MAJOR_SCALES_SEMITONES: Record<KeyRoot, number[]> = {
  C: [0, 2, 4, 5, 7, 9, 11], Db: [1, 3, 5, 6, 8, 10, 0], D: [2, 4, 6, 7, 9, 11, 1],
  Eb: [3, 5, 7, 8, 10, 0, 2], E: [4, 6, 8, 9, 11, 1, 3], F: [5, 7, 9, 10, 0, 2, 4],
  "F#": [6, 8, 10, 11, 1, 3, 5], G: [7, 9, 11, 0, 2, 4, 6], Ab: [8, 10, 0, 1, 3, 5, 7],
  A: [9, 11, 1, 2, 4, 6, 8], Bb: [10, 0, 2, 3, 5, 7, 9], B: [11, 1, 3, 4, 6, 8, 10],
};

const CHORD_NAMES: Record<KeyRoot, string[]> = {
  C: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"], Db: ["Db", "Ebm", "Fm", "Gb", "Ab", "Bbm", "Cdim"],
  D: ["D", "Em", "F#m", "G", "A", "Bm", "C#dim"], Eb: ["Eb", "Fm", "Gm", "Ab", "Bb", "Cm", "Ddim"],
  E: ["E", "F#m", "G#m", "A", "B", "C#m", "D#dim"], F: ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"],
  "F#": ["F#", "G#m", "A#m", "B", "C#", "D#m", "E#dim"], G: ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
  Ab: ["Ab", "Bbm", "Cm", "Db", "Eb", "Fm", "Gdim"], A: ["A", "Bm", "C#m", "D", "E", "F#m", "G#dim"],
  Bb: ["Bb", "Cm", "Dm", "Eb", "F", "Gm", "Adim"], B: ["B", "C#m", "D#m", "E", "F#", "G#m", "A#dim"],
};

const CHORD_QUALITIES = ["Major", "minor", "minor", "Major", "Major", "minor", "dim"];
const ROMAN_NUMERALS = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];

// 개방현 반음: 인덱스 0=6번줄 ~ 5=1번줄
const OPEN_SEMITONES = [4, 9, 2, 7, 11, 4];

type CAGEDShape = {
  name: string;
  frets: (number | null)[];
  rootString: number;
  rootFret: number;
  degrees: (number | null)[];
};

const MAJOR_CAGED: CAGEDShape[] = [
  { name: "C", frets: [null, 3, 2, 0, 1, 0], rootString: 1, rootFret: 3, degrees: [null, 1, 3, 5, 1, 3] },
  { name: "A", frets: [null, 0, 2, 2, 2, 0], rootString: 1, rootFret: 0, degrees: [null, 1, 5, 1, 3, 5] },
  { name: "G", frets: [3, 2, 0, 0, 0, 3], rootString: 0, rootFret: 3, degrees: [1, 3, 5, 1, 3, 1] },
  { name: "E", frets: [0, 2, 2, 1, 0, 0], rootString: 0, rootFret: 0, degrees: [1, 5, 1, 3, 5, 1] },
  { name: "D", frets: [null, null, 0, 2, 3, 2], rootString: 2, rootFret: 0, degrees: [null, null, 1, 5, 1, 3] },
];

const MINOR_CAGED: CAGEDShape[] = [
  { name: "C", frets: [null, 3, 1, 0, 1, 0], rootString: 1, rootFret: 3, degrees: [null, 1, 3, 5, 1, 3] },
  { name: "A", frets: [null, 0, 2, 2, 1, 0], rootString: 1, rootFret: 0, degrees: [null, 1, 5, 1, 3, 5] },
  { name: "G", frets: [3, 1, 0, 0, 0, 3], rootString: 0, rootFret: 3, degrees: [1, 3, 5, 1, 3, 1] },
  { name: "E", frets: [0, 2, 2, 0, 0, 0], rootString: 0, rootFret: 0, degrees: [1, 5, 1, 3, 5, 1] },
  { name: "D", frets: [null, null, 0, 2, 3, 1], rootString: 2, rootFret: 0, degrees: [null, null, 1, 5, 1, 3] },
];

const DIM_CAGED: CAGEDShape[] = [
  { name: "E", frets: [0, 1, 2, 0, null, null], rootString: 0, rootFret: 0, degrees: [1, 5, 1, 3, null, null] },
  { name: "A", frets: [null, 0, 1, 2, 1, null], rootString: 1, rootFret: 0, degrees: [null, 1, 5, 1, 3, null] },
];

const DEGREE_COLORS: Record<number, string> = {
  1: "#fb923c", 3: "#c084fc", 5: "#38bdf8", 7: "#4ade80",
};

function getShapeOffset(shape: CAGEDShape, targetRootSemitone: number): number {
  const openRootSemitone = (OPEN_SEMITONES[shape.rootString] + shape.rootFret) % 12;
  return (targetRootSemitone - openRootSemitone + 12) % 12;
}

function shiftFrets(frets: (number | null)[], offset: number): (number | null)[] {
  return frets.map(f => f === null ? null : f + offset);
}

function getDisplayRange(shiftedFrets: (number | null)[]): [number, number] {
  const fretted = shiftedFrets.filter(f => f !== null && f > 0) as number[];
  if (fretted.length === 0) return [0, 4];
  const min = Math.min(...fretted);
  const max = Math.max(...fretted);
  const start = Math.max(0, min - 1);
  const end = Math.max(start + 4, max + 1);
  return [start, Math.min(end, 15)];
}

// 7도 자동 추가 — 실제 기타 연주 위치 기반
function addSeventh(
  shiftedFrets: (number | null)[],
  degrees: (number | null)[],
  rootSemitone: number,
  quality: string
): { frets: (number | null)[]; degrees: (number | null)[] } {
  const interval = quality === "Major" ? 11 : 10;
  const target7 = (rootSemitone + interval) % 12;

  let bestString = -1;
  let bestFret = -1;
  let bestScore = -Infinity;

  const existingFrets = shiftedFrets.filter(f => f !== null && f! > 0) as number[];
  const avgFret = existingFrets.length > 0
    ? existingFrets.reduce((a, b) => a + b, 0) / existingFrets.length
    : 3;

  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= 12; f++) {
      if ((OPEN_SEMITONES[s] + f) % 12 !== target7) continue;

      let score = 0;
      const occupied = shiftedFrets[s] !== null && shiftedFrets[s]! > 0;
      const currentDegree = occupied ? degrees[s] : null;

      if (!occupied) {
        // 빈 줄 사용
        score += 40;
        if (f === 0) score += 60; // 개방현 최고
      } else if (currentDegree === 1) {
        // 루트 대체 (좋음 — 루트는 보통 중복)
        score += 50;
        if (f === 0) score += 40; // 개방현 대체 추가 보너스
        score -= Math.abs(f - shiftedFrets[s]!) * 3; // 프렛 변화 페널티
      } else if (currentDegree === 5) {
        // 5도 대체 (허용)
        score += 30;
        if (f === 0) score += 30; // 개방현 대체 보너스
        score -= Math.abs(f - shiftedFrets[s]!) * 3;
      } else if (currentDegree === 3) {
        // 3도 대체 — 절대 불가 (메이저/마이너 결정)
        continue;
      } else {
        continue;
      }

      // 평균 프렛과의 거리 (가까울수록 좋음)
      score -= Math.abs(f - avgFret) * 1;
      // 낮은 프렛 선호 (연주 용이성)
      score -= f * 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestString = s;
        bestFret = f;
      }
    }
  }

  if (bestString >= 0) {
    const newFrets = [...shiftedFrets];
    const newDegrees = [...degrees];
    newFrets[bestString] = bestFret;
    newDegrees[bestString] = 7;
    return { frets: newFrets, degrees: newDegrees };
  }
  return { frets: shiftedFrets, degrees };
}

function ChordDiagram({
  shape, chordName, offset, quality, mode,
}: {
  shape: CAGEDShape; chordName: string; offset: number; quality: string; mode: ChordMode;
}) {
  const shifted = shiftFrets(shape.frets, offset);
  const [startFret, endFret] = getDisplayRange(shifted);
  const numFrets = endFret - startFret;

  // 7도 계산 — 코드톤 모드일 때만
  const rootSemitone = (OPEN_SEMITONES[shape.rootString] + shape.rootFret + offset) % 12;
  const result = mode === "7th"
    ? addSeventh(shifted, shape.degrees, rootSemitone, quality)
    : { frets: shifted, degrees: shape.degrees };

  const width = 130;
  const height = 130;
  const lm = 30;
  const tm = 15;
  const fs = Math.min(24, (height - tm - 10) / numFrets);
  const ss = (width - lm - 10) / 5;

  return (
    <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900">
      <div className="text-center mb-2">
        <div className="text-base font-bold">{chordName}</div>
        <div className="text-[10px] text-neutral-500">{shape.name} Shape</div>
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
        {/* 프렛 번호 */}
        {Array.from({ length: numFrets + 1 }, (_, i) => {
          const fret = startFret + i;
          if (fret === 0) return null;
          return <text key={fret} x={lm - 12} y={tm + i * fs + 4} textAnchor="middle" fontSize="9" fill="#666">{fret}</text>;
        })}

        {/* 넛 */}
        {startFret === 0 && <line x1={lm} y1={tm} x2={lm + 5 * ss} y2={tm} stroke="#888" strokeWidth="3" />}

        {/* 프렛 와이어 */}
        {Array.from({ length: numFrets }, (_, i) => (
          <line key={i} x1={lm} y1={tm + (i + 1) * fs} x2={lm + 5 * ss} y2={tm + (i + 1) * fs} stroke="#444" strokeWidth="1" />
        ))}

        {/* 줄 (위쪽이 1번줄) */}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={lm + i * ss} y1={tm} x2={lm + i * ss} y2={tm + numFrets * fs} stroke="#555" strokeWidth={2 - i * 0.15} />
        ))}

        {/* 음 표시 */}
        {result.frets.map((fret, si) => {
          const x = lm + si * ss;
          const degree = result.degrees[si];

          if (degree === null) {
            return <text key={si} x={x} y={tm - 5} textAnchor="middle" fontSize="12" fill="#999">×</text>;
          }

          if (fret === 0) {
            const color = DEGREE_COLORS[degree];
            return (
              <g key={si}>
                <circle cx={x} cy={tm - 6} r="5" fill="none" stroke={color} strokeWidth="2" />
                <text x={x} y={tm - 3} textAnchor="middle" fontSize="7" fill={color} fontWeight="bold">{degree}</text>
              </g>
            );
          }

          if (fret === null) return null;

          // 줄 위에 안착 (프렛 와이어 중간)
          const y = startFret === 0
            ? tm + (fret - 0.5) * fs
            : tm + (fret - startFret + 0.5) * fs;
          const color = DEGREE_COLORS[degree] || "#fb923c";
          return (
            <g key={si}>
              <circle cx={x} cy={y} r="7" fill={color} stroke="#1a1a1a" strokeWidth="1.5" />
              <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">{degree}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ChordsPage() {
  const [selectedKey, setSelectedKey] = useState<KeyRoot>("C");
  const [mode, setMode] = useState<ChordMode>("triad");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{selectedKey} Major 다이아토닉 코드</h1>
        <p className="text-neutral-400 text-sm">CAGED 시스템으로 보는 코드 폼</p>
      </div>

      {/* 모드 선택 */}
      <div className="mb-5 flex gap-3 text-sm">
        <button onClick={() => setMode("triad")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === "triad" ? "bg-orange-500/20 text-orange-300 border border-orange-500/50" : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"}`}>
          트라이어드 (3음)
        </button>
        <button onClick={() => setMode("7th")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === "7th" ? "bg-orange-500/20 text-orange-300 border border-orange-500/50" : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"}`}>
          코드톤 (7th, 4음)
        </button>
      </div>

      {/* 범례 */}
      <div className="mb-5 flex flex-wrap gap-4 text-sm">
        {[1, 3, 5, 7].map(d => (
          <div key={d} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: DEGREE_COLORS[d] }} />
            <span className="text-neutral-400">{d} {d === 1 ? "(Root)" : d === 3 ? "(3rd)" : d === 5 ? "(5th)" : "(7th)"}</span>
          </div>
        ))}
      </div>

      {/* 키 선택 */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-neutral-300 mb-2">키 선택</label>
        <div className="flex flex-wrap gap-2">
          {KEYS.map(key => (
            <button key={key} onClick={() => setSelectedKey(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${key === selectedKey ? "bg-orange-500/20 text-orange-300 border border-orange-500/50" : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"}`}>
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* 코드 */}
      <div className="space-y-10">
        {ROMAN_NUMERALS.map((roman, degree) => {
          const rootSemitone = MAJOR_SCALES_SEMITONES[selectedKey][degree];
          const chordName = CHORD_NAMES[selectedKey][degree];
          const quality = CHORD_QUALITIES[degree];
          const shapes = quality === "Major" ? MAJOR_CAGED : quality === "minor" ? MINOR_CAGED : DIM_CAGED;

          return (
            <div key={degree} className="pb-8 border-b border-neutral-800">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-orange-400">{roman}</span>
                <span className="text-xl font-bold">{chordName}{mode === "7th" ? quality === "Major" ? "maj7" : quality === "minor" ? "7" : "m7♭5" : ""}</span>
                <span className="text-sm text-neutral-500">{quality}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {shapes.map((shape, idx) => (
                  <ChordDiagram key={idx} shape={shape} chordName={chordName + (mode === "7th" ? (quality === "Major" ? "maj7" : quality === "minor" ? "7" : "m7♭5") : "")} offset={getShapeOffset(shape, rootSemitone)} quality={quality} mode={mode} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
