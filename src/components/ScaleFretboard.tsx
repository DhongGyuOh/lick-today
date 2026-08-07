import { Fragment } from "react";

/** 선택 가능한 12개 키 (실용적인 이명동음 표기 사용) */
export type KeyRoot =
  | "C"
  | "Db"
  | "D"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "Ab"
  | "A"
  | "Bb"
  | "B";

export type ScaleType = "major" | "minor" | "harmonic-minor";

export const SCALE_TYPE_LABELS: Record<ScaleType, string> = {
  major: "메이저",
  minor: "마이너",
  "harmonic-minor": "하모닉 마이너",
};

export const KEYS: KeyRoot[] = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

/** 키별 메이저 스케일 음계 (도수 1~7 순서) */
export const MAJOR_SCALES: Record<KeyRoot, string[]> = {
  C: ["C", "D", "E", "F", "G", "A", "B"],
  Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  D: ["D", "E", "F#", "G", "A", "B", "C#"],
  Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
  F: ["F", "G", "A", "Bb", "C", "D", "E"],
  "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  G: ["G", "A", "B", "C", "D", "E", "F#"],
  Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  A: ["A", "B", "C#", "D", "E", "F#", "G#"],
  Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
  B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
};

/** 키별 내추럴 마이너 스케일 음계 (도수 1~7 순서) */
export const MINOR_SCALES: Record<KeyRoot, string[]> = {
  C: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
  Db: ["Db", "Eb", "E", "Gb", "Ab", "A", "B"],
  D: ["D", "E", "F", "G", "A", "Bb", "C"],
  Eb: ["Eb", "F", "Gb", "Ab", "Bb", "B", "Db"],
  E: ["E", "F#", "G", "A", "B", "C", "D"],
  F: ["F", "G", "Ab", "Bb", "C", "Db", "Eb"],
  "F#": ["F#", "G#", "A", "B", "C#", "D", "E"],
  G: ["G", "A", "Bb", "C", "D", "Eb", "F"],
  Ab: ["Ab", "Bb", "B", "Db", "Eb", "E", "Gb"],
  A: ["A", "B", "C", "D", "E", "F", "G"],
  Bb: ["Bb", "C", "Db", "Eb", "F", "Gb", "Ab"],
  B: ["B", "C#", "D", "E", "F#", "G", "A"],
};

/** 키별 하모닉 마이너 스케일 음계 (도수 1~7 순서) */
export const HARMONIC_MINOR_SCALES: Record<KeyRoot, string[]> = {
  C: ["C", "D", "Eb", "F", "G", "Ab", "B"],
  Db: ["Db", "Eb", "E", "Gb", "Ab", "A", "C"],
  D: ["D", "E", "F", "G", "A", "Bb", "C#"],
  Eb: ["Eb", "F", "Gb", "Ab", "Bb", "B", "D"],
  E: ["E", "F#", "G", "A", "B", "C", "D#"],
  F: ["F", "G", "Ab", "Bb", "C", "Db", "E"],
  "F#": ["F#", "G#", "A", "B", "C#", "D", "E#"],
  G: ["G", "A", "Bb", "C", "D", "Eb", "F#"],
  Ab: ["Ab", "Bb", "B", "Db", "Eb", "E", "G"],
  A: ["A", "B", "C", "D", "E", "F", "G#"],
  Bb: ["Bb", "C", "Db", "Eb", "F", "Gb", "A"],
  B: ["B", "C#", "D", "E", "F#", "G", "A#"],
};

export function getScale(root: KeyRoot, type: ScaleType): string[] {
  switch (type) {
    case "major":
      return MAJOR_SCALES[root];
    case "minor":
      return MINOR_SCALES[root];
    case "harmonic-minor":
      return HARMONIC_MINOR_SCALES[root];
  }
}

/** 도수별 색상 (다크 배경 기준) — 음계 보드와 도수 보드가 같은 색으로 대응 */
export const TONE_COLORS: Record<number, string> = {
  1: "#fb923c", // 으뜸음
  2: "#f472b6",
  3: "#c084fc",
  4: "#4ade80",
  5: "#38bdf8",
  6: "#fde047",
  7: "#f87171",
};

/** 음이름(샤프/플랫 포함) → 반음 index */
const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  "E#": 5,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

/** 1번줄(고음 E) → 6번줄(저음 E), 위에서 아래로 보는 순서 */
const STRINGS = [
  { name: "E", start: 4 }, // 1번줄 (가장 얇은 줄, 고음)
  { name: "B", start: 11 },
  { name: "G", start: 7 },
  { name: "D", start: 2 },
  { name: "A", start: 9 },
  { name: "E", start: 4 }, // 6번줄 (가장 두꺼운 줄, 저음)
];

const FRET_COUNT = 24;
const INLAY_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

interface ScaleFretboardProps {
  /** note = 음계 표기, degree = 도수 표기(1234567) */
  mode: "note" | "degree";
  root: KeyRoot;
  scaleType: ScaleType;
  title: string;
  description?: string;
}

export default function ScaleFretboard({
  mode,
  root,
  scaleType,
  title,
  description,
}: ScaleFretboardProps) {
  const scale = getScale(root, scaleType);
  // 반음 index → { 실제 음이름, 도수 }
  const scaleBySemitone: Record<number, { note: string; degree: number }> = {};
  scale.forEach((note, i) => {
    scaleBySemitone[NOTE_TO_SEMITONE[note]] = { note, degree: i + 1 };
  });

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      {description && (
        <p className="text-sm text-neutral-500 mb-3">{description}</p>
      )}
      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="min-w-[1200px]">
          {/* 프렛 번호 행 */}
          <div className="flex mb-1">
            <div className="w-10 shrink-0" /> {/* 현 이름 공간 */}
            {Array.from({ length: FRET_COUNT }, (_, f) => (
              <div
                key={f + 1}
                className="flex-1 text-center text-[10px] text-neutral-600 min-w-[32px]"
              >
                {f + 1}
              </div>
            ))}
          </div>

          {/* 프렛보드: 6개 줄 */}
          {STRINGS.map((string, stringIndex) => (
            <div key={string.name} className="flex items-center">
              {/* 현 이름 */}
              <div className="w-10 shrink-0 text-xs font-bold text-neutral-500 text-center">
                {string.name}
              </div>

              {/* 프렛들 */}
              <div className="flex flex-1 relative">
                {Array.from({ length: FRET_COUNT }, (_, f) => {
                  const fret = f + 1; // 1번 프렛부터 시작
                  const semitone = (string.start + fret) % 12;
                  const cell = scaleBySemitone[semitone];
                  const color = cell ? TONE_COLORS[cell.degree] : undefined;

                  return (
                    <div
                      key={fret}
                      className={`flex-1 min-w-[32px] h-12 flex items-center justify-center relative ${
                        fret === 1 ? "border-l-2 border-neutral-600" : ""
                      } ${
                        stringIndex < 5 ? "border-b border-neutral-700/50" : ""
                      }`}
                    >
                      {/* 프렛 와이어 (세로선) */}
                      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-neutral-700" />

                      {/* 인레이 점 */}
                      {stringIndex === 2 && INLAY_FRETS.includes(fret) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {fret === 12 || fret === 24 ? (
                            <div className="flex flex-col gap-2">
                              <span className="h-1 w-1 rounded-full bg-neutral-700" />
                              <span className="h-1 w-1 rounded-full bg-neutral-700" />
                            </div>
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
                          )}
                        </div>
                      )}

                      {/* 스케일 음 표시 */}
                      {cell && (
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold z-10"
                          style={{
                            color,
                            borderColor: color,
                            backgroundColor: `${color}1f`,
                          }}
                        >
                          {mode === "note" ? cell.note : cell.degree}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
