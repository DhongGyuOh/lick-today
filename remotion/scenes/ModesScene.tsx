import { interpolate, spring, useCurrentFrame, Audio, staticFile } from "remotion";

interface ModesSceneProps {
  durationFrames: number;
}

const MODES = [
  { name: "Ionian (Major)", short: "이오니안", intervals: [2, 2, 1, 2, 2, 2, 1], color: "#f97316", emoji: "☀️", desc: "밝고 안정적인 메이저 사운드" },
  { name: "Dorian", short: "도리안", intervals: [2, 1, 2, 2, 2, 1, 2], color: "#fb923c", emoji: "🌅", desc: "마이너지만 6도가 장6도, 재즈/펑크" },
  { name: "Phrygian", short: "프리지안", intervals: [1, 2, 2, 2, 1, 2, 2], color: "#f43f5e", emoji: "🌑", desc: "♭2가 특징, 스페인/메탈 사운드" },
  { name: "Lydian", short: "리디안", intervals: [2, 2, 2, 1, 2, 2, 1], color: "#a855f7", emoji: "✨", desc: "♯4가 특징, 몽환적이고 열린 소리" },
  { name: "Mixolydian", short: "믹소리디안", intervals: [2, 2, 1, 2, 2, 1, 2], color: "#3b82f6", emoji: "🎸", desc: "♭7이 특징, 블루스/록 지배적" },
  { name: "Aeolian (Minor)", short: "에올리안", intervals: [2, 1, 2, 2, 1, 2, 2], color: "#22c55e", emoji: "🌙", desc: "내추럴 마이너, 가장 친숙한 단조" },
  { name: "Locrian", short: "로크리안", intervals: [1, 2, 2, 1, 2, 2, 2], color: "#64748b", emoji: "🌪️", desc: "♭2, ♭5 불안정, 잘 쓰이지 않음" },
];

export default function ModesScene({ durationFrames }: ModesSceneProps) {
  const frame = useCurrentFrame();

  // Progress based on frame / total duration
  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Mode card entries
  const modeEntries = MODES.map((_, i) =>
    spring({
      frame: frame - i * 15,
      fps: 30,
      config: { damping: 20, stiffness: 150 },
      from: 0,
      to: 1,
    })
  );

  // Fretboard diagram animation
  const fretDraw = spring({
    frame: frame * 0.5,
    fps: 30,
    config: { damping: 25, stiffness: 100 },
    from: 0,
    to: 1,
  });

  // Highlight current mode based on progress - cycles through 7 modes
  const currentModeIndex = Math.floor(
    interpolate(progress, [0, 0.95], [0, 6.99], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div style={{ position: "absolute", inset: 0, padding: "50px 80px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Audio
        src={staticFile("/tts_mod.wav")}
        startFrom={0}
        endAt={durationFrames}
      />
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ color: "#f97316", fontSize: "20px", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "8px" }}>
          GUITAR MODES
        </div>
        <div style={{ fontSize: "44px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>
          모드 (Modes) - 7가지 스케일
        </div>
        <div style={{ marginTop: "8px", color: "#a3a3a3", fontSize: "20px" }}>
          메이저 스케일에서 파생된 7가지 모드, 각기 다른 색채
        </div>
      </div>

      {/* Fretboard diagram - shows C Major / modes at 8th fret */}
      <div style={{ position: "relative", marginBottom: "32px", width: "100%", maxWidth: "1200px" }}>
        <svg viewBox="0 0 1200 280" style={{ width: "100%", height: "auto" }}>
          {/* Strings */}
          {[0, 1, 2, 3, 4, 5].map((s) => (
            <line
              key={s}
              x1="40"
              y1={40 + s * 40}
              x2="1160"
              y2={40 + s * 40}
              stroke={s === 0 || s === 5 ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.08)"}
              strokeWidth={s === 0 || s === 5 ? 2.5 : 1.5}
            />
          ))}

          {/* Frets 7-15 (8th position area) */}
          {[7, 8, 9, 10, 11, 12, 13, 14, 15].map((f) => (
            <line
              key={f}
              x1={40 + (f - 7) * 120}
              y1="40"
              x2={40 + (f - 7) * 120}
              y2="240"
              stroke={f === 8 || f === 12 ? "#f97316" : f === 7 ? "#737373" : "rgba(255,255,255,0.06)"}
              strokeWidth={f === 7 ? 4 : f === 8 || f === 12 ? 3 : 1}
            />
          ))}

          {/* Fret numbers */}
          {[7, 8, 9, 10, 11, 12, 13, 14, 15].map((f) => (
            <text
              key={f}
              x={40 + (f - 7) * 120}
              y="25"
              textAnchor="middle"
              fill="#737373"
              fontSize="13"
              fontWeight="600"
            >
              {f}
            </text>
          ))}

          {/* String labels */}
          {["E", "B", "G", "D", "A", "E"].map((name, i) => (
            <text key={name} x="14" y={40 + i * 40 + 5} textAnchor="middle" fill="#888" fontSize="13" fontFamily="monospace" fontWeight="600">
              {name}
            </text>
          ))}

          {/* Current mode pattern on fretboard */}
          {(() => {
            const mode = MODES[currentModeIndex];
            // Simple pattern: show scale degrees on fretboard for C root at 8th fret
            // This is a simplified visualization
            const notes = [
              { string: 5, fret: 8, degree: "1" },   // C
              { string: 5, fret: 10, degree: mode.intervals[0] === 2 ? "2" : "♭2" },
              { string: 4, fret: 7, degree: mode.intervals[0] + mode.intervals[1] === 4 ? "3" : "♭3" },
              { string: 4, fret: mode.intervals[0] + mode.intervals[1] + mode.intervals[2] === 5 ? 8 : 9, degree: "4" },
              { string: 4, fret: 10, degree: "5" },
              { string: 3, fret: 7, degree: mode.intervals.slice(0,4).reduce((a,b)=>a+b) === 9 ? "6" : "♭6" },
              { string: 3, fret: 9, degree: "7" },
              { string: 2, fret: 8, degree: "1" },
              { string: 2, fret: 10, degree: "2" },
              { string: 1, fret: 7, degree: "3" },
              { string: 1, fret: 8, degree: "4" },
              { string: 1, fret: 10, degree: "5" },
              { string: 0, fret: 8, degree: "6" },
              { string: 0, fret: 10, degree: "7" },
              { string: 0, fret: 12, degree: "1" },
            ];
            return notes.map((note, idx) => (
              <circle
                key={idx}
                cx={40 + (note.fret - 7) * 120}
                cy={40 + note.string * 40}
                r={interpolate(fretDraw, [0, 1], [0, 1]) * (note.fret === 8 || note.fret === 12 ? 13 : 10)}
                fill={note.fret === 8 || note.fret === 12 ? mode.color : "#3b82f6"}
                opacity={interpolate(fretDraw, [0, 1], [0, 0.9])}
                stroke="#ffffff"
                strokeWidth={1}
              />
            ));
          })()}

          {/* Position label */}
          <text x="600" y="270" textAnchor="middle" fill="#f97316" fontSize="14" fontWeight="600">
            {MODES[currentModeIndex].name} · C Root at 8th Fret
          </text>
        </svg>
      </div>

      {/* Mode cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", maxWidth: "1200px", width: "100%", marginBottom: "32px" }}>
        {MODES.map((mode, i) => {
          const entry = modeEntries[i];
          const opacity = interpolate(entry, [0, 1], [0, 1]);
          const y = interpolate(entry, [0, 1], [30, 0]);
          const scale = interpolate(entry, [0, 1], [0.9, 1]);
          const isActive = i === currentModeIndex;

          return (
            <div
              key={mode.name}
              style={{
                opacity,
                transform: `translateY(${y}px) scale(${scale})`,
                padding: "20px 16px",
                background: `linear-gradient(135deg, rgba(23,23,23,0.95), rgba(38,38,38,0.9))`,
                border: `1px solid ${isActive ? mode.color : mode.color}40`,
                borderWidth: isActive ? 3 : 1,
                borderRadius: "16px",
                boxShadow: isActive ? `0 12px 40px ${mode.color}40` : "0 12px 40px rgba(0,0,0,0.4)",
                textAlign: "center",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{mode.emoji}</div>
              <div style={{ color: mode.color, fontSize: "18px", fontWeight: 800, marginBottom: "4px" }}>
                {mode.short}
              </div>
              <div style={{ color: "#888", fontSize: "12px", fontFamily: "monospace", marginBottom: "8px" }}>
                {mode.intervals.join(" · ")}
              </div>
              <div style={{ color: "#a3a3a3", fontSize: "13px", lineHeight: 1.4 }}>
                {mode.desc}
              </div>
              {isActive && (
                <div style={{ marginTop: "8px", color: mode.color, fontSize: "12px", fontWeight: 700 }}>
                  ▼ 현재 재생 중
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interval legend */}
      <div
        style={{
          padding: "20px 32px",
          maxWidth: "1200px",
          background: "rgba(249,115,22,0.08)",
          border: "1px solid rgba(249,115,22,0.3)",
          borderRadius: "12px",
          color: "#fdba74",
          fontSize: "15px",
        }}
      >
        <strong>간격 기호: </strong>
        <span style={{ fontFamily: "monospace", marginRight: "16px" }}>1 = 반음</span>
        <span style={{ fontFamily: "monospace", marginRight: "16px" }}>2 = 전음</span>
        <span style={{ color: "#a3a3a3" }}>C 메이저 기준: C-D-E-F-G-A-B (2-2-1-2-2-2-1)</span>
      </div>
    </div>
  );
}