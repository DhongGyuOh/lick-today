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

  // 키별 4도, 7도 음 계산 (동적 팁용)
  const majorScale = getScale(root, "major");
  const fourth = majorScale[3]; // 4도
  const seventh = majorScale[6]; // 7도

  const scaleDescriptions: Record<ScaleType, { desc: string; feel: string; genres: string[]; tip: string; songs: string[] }> = {
    major: {
      desc: "기본이 되는 스케일. 전체·전음·반음·전음·전음·전음·반음 간격으로 구성됩니다.",
      feel: "밝고 명랑하며 안정적인 느낌. 클래식부터 팝까지 모든 장르의 기반.",
      genres: ["팝", "록", "클래식", "컨트리", "재즈"],
      tip: `메이저 스케일은 모든 스케일의 기반입니다. 4도(${fourth})와 7도(${seventh})를 빼면 펜타토닉이 됩니다.`,
      songs: ["Here Comes The Sun - Beatles", "Twinkle Twinkle - Mozart", "Happy - Pharrell Williams"],
    },
    minor: {
      desc: "메이저 스케일의 3도를 반음 낮춘 자연단음계입니다. 전체·반음·전음·전음·반음·전음·전음 간격.",
      feel: "우울하고 서정적이며 깊은 감정 표현. 슬픔, 그리움, 진지한 분위기 연출에 적합.",
      genres: ["발라드", "록", "클래식", "EDM", "映画音楽"],
      tip: `${root} 마이너는 메이저의 릴레이티브 키 관계를 가집니다.`,
      songs: ["Stairway To Heaven - Led Zeppelin", "Losing My Religion - R.E.M.", "Nokia Tune (Gran Vals) - Tarrega"],
    },
    "harmonic-minor": {
      desc: "자연단음계의 7도를 반음 올린 스케일입니다. V 코드를 메이저로 만들어 강한 해결감을 줍니다.",
      feel: "이국적이고 드라마틱한 분위기. 클래식, 중동 음악, 메탈에서 자주 활용.",
      genres: ["클래식", "메탈", "중동 음악", "재즈", "프러시안 스케일"],
      tip: `마이너 ii-V-i 진행에서 하모닉 마이너가 필요합니다.`,
      songs: ["Hava Nagila - 전통 민요", "Misirlou - Dick Dale", "Mission Impossible Theme - Lalo Schifrin"],
    },
    "major-pentatonic": {
      desc: `메이저 스케일에서 4도(${fourth})와 7도(${seventh})를 뺀 5음 스케일입니다. (1, 2, 3, 5, 6)`,
      feel: "부드럽고 자연스러우며 편안한 멜로디. 초보자에게 가장 접근하기 쉬운 스케일.",
      genres: ["팝", "록", "컨트리", "아시아 음악", "뉴에이지"],
      tip: "펜타토닉은 반음 간격이 없어 어떤 코드에서도 잘 어울립니다.",
      songs: ["My Girl - The Temptations", "Sweet Home Alabama - Lynyrd Skynyrd", "아리랑 - 한국 민요"],
    },
    "minor-pentatonic": {
      desc: `마이너 스케일에서 2도와 6도를 뺀 5음 스케일입니다. (1, ♭3, 4, 5, ♭7)`,
      feel: "강렬하고 자유로우며 블루지한 느낌. 록, 블루스의 기초가 되는 스케일.",
      genres: ["블루스", "록", "메탈", "펑크", "알앤비"],
      tip: "마이너 펜타토닉 = 메이저 펜타토닉의 릴레이티브. 블루스와 록에서 가장 많이 사용됩니다.",
      songs: ["Smoke On The Water - Deep Purple", "Back In Black - AC/DC", "Billie Jean - Michael Jackson"],
    },
    "major-hexatonic": {
      desc: `메이저 스케일에서 7도(${seventh})를 뺀 6음 스케일입니다. (1, 2, 3, 4, 5, 6)`,
      feel: "메이저 펜타토닉보다 풍부하면서도 자연스러운 멜로디. 4도의 추가로 리드미컬한 표현 가능.",
      genres: ["팝", "록", "컨트리", "아프리카 음악"],
      tip: `메이저 펜타토닉에 4도(${fourth})를 추가한 것입니다.`,
      songs: ["Three Little Birds - Bob Marley", "Country Roads - John Denver", "Stand By Me - Ben E. King"],
    },
    "minor-hexatonic": {
      desc: "마이너 펜타토닉에 ♭5(블루스 노트)를 추가한 6음 스케일입니다. (1, ♭3, 4, ♭5, 5, ♭7)",
      feel: "특유의 블루스한 긴장감과 해소감. ♭5가 gritty하고 소울풀한 맛을 더해줌.",
      genres: ["블루스", "록", "펑크", "알앤비", "소울"],
      tip: "블루스 스케일이라고도 합니다. ♭5가 특유의 블루스 감성을 만듭니다.",
      songs: ["The Thrill Is Gone - B.B. King", "Red House - Jimi Hendrix", "Sweet Home Chicago - Robert Johnson"],
    },
    "mixolydian": {
      desc: "메이저 스케일의 7도를 반음 낮춘 모드입니다. (1, 2, 3, 4, 5, 6, ♭7)",
      feel: "메이저인데 블루지하고 개방적인 느낌. 도미넌트7 코드와 완벽하게 어울림.",
      genres: ["블루스", "록", "펑크", "포크", "소울"],
      tip: "믹소리디안 = 메이저에서 7도만 반음 낮춘 것. 도미넌트7 코드(V7) 위에서 사용하면 블루스한 맛이 살아납니다.",
      songs: ["Sweet Home Alabama - Lynyrd Skynyrd", "Norwegian Wood - Beatles", "Get Ready - The Temptations"],
    },
    "ionian": {
      desc: "1도에서 시작하는 모드. 메이저 스케일과 동일합니다. (1, 2, 3, 4, 5, 6, 7)",
      feel: "밝고 안정적이며 완성된 느낌. 가장 기본적이고 친숙한 스케일.",
      genres: ["팝", "클래식", "컨트리", "록", "뉴에이지"],
      tip: "이오니안 = 메이저 스케일과 완전히 동일합니다. 모든 모드의 기준점이 됩니다.",
      songs: ["Here Comes The Sun - Beatles", "Ode To Joy - Beethoven", "Let It Be - Beatles"],
    },
    "dorian": {
      desc: "2도에서 시작하는 모드. 마이너인데 6도가 반음 높습니다. (1, 2, ♭3, 4, 5, 6, ♭7)",
      feel: "신비롭고 재즈로운 느낌. 마이너보다 밝고, 메이저보다 어두운 중간 감성.",
      genres: ["재즈", "소울", "펑크", "록", "EDM"],
      tip: "도리안 = 마이너에서 6도만 반음 올린 것. 소울풀하고 세련된 느낌을 줍니다.",
      songs: ["So What - Miles Davis", "Oye Como Va - Santana", "Billie Jean - Michael Jackson"],
    },
    "phrygian": {
      desc: "3도에서 시작하는 모드. 2음이 반음 내려갑니다. (1, ♭2, ♭3, 4, 5, ♭6, ♭7)",
      feel: "이국적이고 어두우며 긴장감 있는 느낌. 스페인 음악이나 메탈에서 자주 들림.",
      genres: ["스페인 음악", "메탈", "중동 음악", "록", "EDM"],
      tip: "프리지안 = 메이저에서 2, 3, 6, 7도를 반음 내린 것. 플라멩코의 기본 스케일입니다.",
      songs: ["Wherever I May Roam - Metallica", "Hava Nagila - 전통 민요", "Stray Cat Strut - Stray Cats"],
    },
    "lydian": {
      desc: "4도에서 시작하는 모드. 4음이 반음 올라갑니다. (1, 2, 3, #4, 5, 6, 7)",
      feel: "신비롭고 몽환적이며 하늘같은 느낌. SF 영화음악이나 프로그레시브에서 잘 어울림.",
      genres: ["프로그레시브", "SF 영화음악", "재즈", "팝", "뉴에이지"],
      tip: "리디안 = 메이저에서 4도만 반음 올린 것. #4가 특유의 몽환적인 분위기를 만듭니다.",
      songs: ["The Simpsons Theme - Danny Elfman", "Dream On - Aerosmith", "Flying - The Beatles"],
    },
    "aeolian": {
      desc: "6도에서 시작하는 모드. 자연 내추럴 마이너와 동일합니다. (1, 2, ♭3, 4, 5, ♭6, ♭7)",
      feel: "슬프고 어두우며 서정적인 느낌. 가장 일반적인 마이너 스케일.",
      genres: ["발라드", "록", "클래식", "EDM", "映画音楽"],
      tip: "에올리안 = 자연 마이너와 동일. 메이저의 릴레이티브 키 관계를 가집니다.",
      songs: ["Stairway To Heaven - Led Zeppelin", "Losing My Religion - R.E.M.", "Nokia Tune - Tarrega"],
    },
    "locrian": {
      desc: "7도에서 시작하는 모드. 2음과 5음이 반음 내려갑니다. (1, ♭2, ♭3, 4, ♭5, ♭6, ♭7)",
      feel: "불안정하고 긴장되며 어두운 느낌. 가장 덜 사용되는 모드이지만 특수한 효과 가능.",
      genres: ["메탈", "재즈", "프로그레시브", "어반"],
      tip: "로크리안 = 마이너에서 2도와 5도를 반음 더 내린 것. 디미니드 코드에 사용됩니다.",
      songs: ["Mars - Gustav Holst", "A Love Supreme Part 1 - John Coltrane"],
    },
  };

  const currentDesc = scaleDescriptions[scaleType];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          {root} {SCALE_TYPE_LABELS[scaleType]} 스케일
        </h1>
        <p className="text-neutral-400 text-sm mb-2">
          {currentDesc.desc}
        </p>

        {/* 느낌과 장르 */}
        <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-800/50 mb-3">
          <p className="text-blue-300 text-xs mb-2">
            🎵 <span className="font-semibold">느낌:</span> {currentDesc.feel}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {currentDesc.genres.map((g) => (
              <span key={g} className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-medium">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* 대표곡 */}
        {currentDesc.songs.length > 0 && (
          <div className="p-3 rounded-lg bg-green-900/20 border border-green-800/50 mb-3">
            <p className="text-green-300 text-xs mb-2">
              🎶 <span className="font-semibold">대표곡:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentDesc.songs.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-medium">
                  #{s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 팁 */}
        <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/50">
          <p className="text-yellow-300 text-xs">
            💡 <span className="font-semibold">팁:</span> {currentDesc.tip}
          </p>
        </div>
      </div>

      {/* 스케일 타입 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          스케일 타입
        </label>
        <div className="flex flex-wrap gap-2">
          {(["major", "minor", "harmonic-minor", "major-pentatonic", "minor-pentatonic", "major-hexatonic", "minor-hexatonic", "ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"] as ScaleType[]).map((type) => {
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
