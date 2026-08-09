"use client";

import { useState, useCallback } from "react";
import AlphaTabPlayer from "@/components/AlphaTabPlayer";
import {
  KEYS,
  getScale,
  type KeyRoot,
} from "@/components/ScaleFretboard";

type ScaleType = "major" | "minor";

const KEY_NAMES: Record<KeyRoot, string> = {
  C: "C", Db: "D♭", D: "D", Eb: "E♭", E: "E", F: "F",
  "F#": "F#", G: "G", Ab: "A♭", A: "A", Bb: "B♭", B: "B",
};

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const STYLE_NAMES = ["Blues", "Jazz", "Pop", "Funk", "Rock"];
const TEMPO_OPTIONS = [80, 100, 120];

// 메이저 다이아토닉 코드 (도수 기반)
const MAJOR_CHORDS = [
  { root: 0, quality: "Major", name: "I" },
  { root: 2, quality: "minor", name: "ii" },
  { root: 4, quality: "minor", name: "iii" },
  { root: 5, quality: "Major", name: "IV" },
  { root: 7, quality: "Major", name: "V" },
  { root: 9, quality: "minor", name: "vi" },
  { root: 11, quality: "dim", name: "vii°" },
];

function getNoteFromSemitone(semitone: number): string {
  return CHROMATIC[((semitone % 12) + 12) % 12];
}

function generateMelodyPhrase(
  rootSemitone: number,
  scaleSemitones: number[],
  chordTones: number[],
  length: number
): number[] {
  const notes: number[] = [];
  let currentSemitone = rootSemitone;

  for (let i = 0; i < length; i++) {
    // 코드톤 우선 선택 (70%), 스케일 톤 (30%)
    if (Math.random() < 0.7 && chordTones.length > 0) {
      const target = chordTones[Math.floor(Math.random() * chordTones.length)];
      // 인접한 코드톤으로 이동
      const diff = ((target - currentSemitone + 12) % 12);
      if (diff <= 6) {
        currentSemitone = (currentSemitone + diff) % 12;
      } else {
        currentSemitone = (currentSemitone - (12 - diff) + 12) % 12;
      }
    } else {
      // 스케일 음 중 랜덤
      const nextIndex = Math.floor(Math.random() * scaleSemitones.length);
      currentSemitone = scaleSemitones[nextIndex];
    }
    notes.push(currentSemitone);
  }
  return notes;
}

// 코드 진행별 프렛 매핑 (메이저 스케일 기준)
// ii-V-I-vi 진행에서 각 코드의 프렛 위치
const CHORD_FRET_MAP: Record<number, { string: number; fret: number }[]> = {
  // ii (Dm): D F A
  1: [
    { string: 4, fret: 0 }, // D (4번줄 개방)
    { string: 3, fret: 2 }, // A (3번줄 2프렛)
    { string: 2, fret: 1 }, // F (2번줄 1프렛)
    { string: 5, fret: 5 }, // D (5번줄 5프렛)
  ],
  // V (G): G B D
  4: [
    { string: 6, fret: 3 }, // G (6번줄 3프렛)
    { string: 3, fret: 0 }, // G (3번줄 개방)
    { string: 5, fret: 2 }, // B (5번줄 2프렛)
    { string: 4, fret: 5 }, // G (4번줄 5프렛)
  ],
  // I (C): C E G
  0: [
    { string: 5, fret: 3 }, // C (5번줄 3프렛)
    { string: 3, fret: 0 }, // G (3번줄 개방)
    { string: 2, fret: 0 }, // B (2번줄 개방) - 코드톤 아님 주의
    { string: 4, fret: 2 }, // E (4번줄 2프렛)
  ],
  // vi (Am): A C E
  5: [
    { string: 5, fret: 0 }, // A (5번줄 개방)
    { string: 3, fret: 2 }, // A (3번줄 2프렛)
    { string: 2, fret: 1 }, // C (2번줄 1프렛)
    { string: 4, fret: 2 }, // E (4번줄 2프렛)
  ],
};

function generateAlphaTex(
  root: KeyRoot,
  scaleType: ScaleType,
  style: string,
  tempo: number
): string {
  const scale = getScale(root, scaleType);
  const scaleSemitones = scale.map((n) => CHROMATIC.indexOf(n));

  // 코드 진행: ii-V-I-vi (8마디)
  const chordProgression = [
    { degree: 1, name: "ii" },  // 2도
    { degree: 4, name: "V" },   // 5도
    { degree: 0, name: "I" },   // 1도
    { degree: 5, name: "vi" },  // 6도
  ];

  let alphaTex = `\\title \"${KEY_NAMES[root]} ${scaleType === "major" ? "메이저" : "마이너"} ${style}\"\n`;
  alphaTex += `\\tempo ${tempo}\n`;
  alphaTex += `\\track \"Lead Guitar\"\n`;
  alphaTex += `\\staff{tabs}\n`;
  alphaTex += `\\tuning(e4 b3 g3 d3 a2 e2)\n`;

  // 8마디 생성
  for (let measure = 0; measure < 8; measure++) {
    const chordIndex = measure % chordProgression.length;
    const chordDegree = chordProgression[chordIndex].degree;

    // 해당 코드의 프렛 위치 가져오기
    const chordFrets = CHORD_FRET_MAP[chordDegree];

    // 코드톤 위주 멜로디 생성 (랜덤 선택)
    const notes: string[] = [];

    for (let beat = 0; beat < 8; beat++) {
      // 랜덤으로 코드톤 선택
      const randomIndex = Math.floor(Math.random() * chordFrets.length);
      const chordNote = chordFrets[randomIndex];

      // 리듬 패턴 다양화
      const rhythmChoice = Math.random();

      if (rhythmChoice < 0.5) {
        // 코드톤
        notes.push(`${chordNote.fret}.${chordNote.string}`);
      } else if (rhythmChoice < 0.8) {
        // 인접 코드톤
        const adjacentIndex = (randomIndex + 1) % chordFrets.length;
        const adjacentNote = chordFrets[adjacentIndex];
        notes.push(`${adjacentNote.fret}.${adjacentNote.string}`);
      } else {
        // 스케일 연결음 (랜덤)
        const scaleIndex = Math.floor(Math.random() * scaleSemitones.length);
        const scaleNote = scaleSemitones[scaleIndex];
        // 프렛 변환 (간단히)
        const fret = scaleNote % 12;
        notes.push(`${fret}.3`);
      }
    }

    alphaTex += `:8 ${notes.join(" ")} |\n`;
  }

  // 피아노 트랙 (코드 백킹)
  alphaTex += `\\track \"Electric Piano\" \\instrument electricpiano1\n`;
  alphaTex += `\\staff{tabs}\n`;
  alphaTex += `\\tuning(e4 b3 g3 d3 a2 e2)\n`;

  for (let measure = 0; measure < 8; measure++) {
    const chordIndex = measure % chordProgression.length;
    const chordDegree = chordProgression[chordIndex].degree;
    const chordFrets = CHORD_FRET_MAP[chordDegree];

    // 코드 반주 (랜덤 변형)
    const pattern = Math.random();
    if (pattern < 0.5) {
      // 코드 반복
      alphaTex += `:4 (${chordFrets[0].fret}.${chordFrets[0].string} ${chordFrets[1].fret}.${chordFrets[1].string} ${chordFrets[2].fret}.${chordFrets[2].string}) r r r |\n`;
    } else {
      // 코드 분산
      alphaTex += `:8 ${chordFrets[0].fret}.${chordFrets[0].string} r ${chordFrets[1].fret}.${chordFrets[1].string} r ${chordFrets[2].fret}.${chordFrets[2].string} r r r |\n`;
    }
  }

  return alphaTex;
}

export default function DdalggakPage() {
  const [root, setRoot] = useState<KeyRoot>("C");
  const [scaleType, setScaleType] = useState<ScaleType>("major");
  const [style, setStyle] = useState<string>("Blues");
  const [tempo, setTempo] = useState<number>(100);
  const [generatedTex, setGeneratedTex] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const generateLick = useCallback(() => {
    const tex = generateAlphaTex(root, scaleType, style, tempo);
    setGeneratedTex(tex);
    setShowPreview(true);
  }, [root, scaleType, style, tempo]);

  const downloadJson = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const lickData = {
      date: today,
      licks: [
        {
          id: `${today}-generated-${Date.now()}`,
          title: `${KEY_NAMES[root]} ${scaleType === "major" ? "메이저" : "마이너"} ${style} 릭`,
          key: `${KEY_NAMES[root]} ${scaleType === "major" ? "major" : "minor"}`,
          style: style,
          difficulty: "Intermediate",
          bpm: tempo,
          theory: `${KEY_NAMES[root]} ${scaleType === "major" ? "메이저" : "마이너"} 스케일을 활용한 ${style} 릭입니다.`,
          tags: ["generated", style.toLowerCase()],
          hasDrums: false,
          alphaTex: generatedTex,
        },
      ],
    };

    const blob = new Blob([JSON.stringify(lickData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${today}-lick.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [root, scaleType, style, tempo, generatedTex]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">딸깍</h1>
        <p className="text-neutral-400 text-sm">
          키와 스타일을 선택하면 릭이 자동으로 생성됩니다.
        </p>
      </div>

      {/* 설정 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* 키 선택 */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            키
          </label>
          <div className="flex flex-wrap gap-1.5">
            {KEYS.map((key) => (
              <button
                key={key}
                onClick={() => setRoot(key)}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                  key === root
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/50"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {KEY_NAMES[key]}
              </button>
            ))}
          </div>
        </div>

        {/* 스케일 타입 */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            스케일
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(["major", "minor"] as ScaleType[]).map((type) => (
              <button
                key={type}
                onClick={() => setScaleType(type)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  type === scaleType
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/50"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {type === "major" ? "메이저" : "마이너"}
              </button>
            ))}
          </div>
        </div>

        {/* 스타일 */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            스타일
          </label>
          <div className="flex flex-wrap gap-1.5">
            {STYLE_NAMES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  s === style
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/50"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* BPM */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            BPM
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TEMPO_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTempo(t)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  t === tempo
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/50"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 생성 버튼 */}
      <button
        onClick={generateLick}
        className="w-full py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors mb-6"
      >
        🎸 릭 생성
      </button>

      {/* 생성된 릭 */}
      {showPreview && generatedTex && (
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {KEY_NAMES[root]} {scaleType === "major" ? "메이저" : "마이너"} {style}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={generateLick}
                className="px-3 py-1.5 text-sm rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
              >
                다시생성
              </button>
              <button
                onClick={downloadJson}
                className="px-3 py-1.5 text-sm rounded-lg bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 transition-colors"
              >
                JSON 다운로드
              </button>
            </div>
          </div>

          {/* 악보 렌더링 + 재생 */}
          <AlphaTabPlayer alphaTex={generatedTex} />
        </div>
      )}
    </div>
  );
}
