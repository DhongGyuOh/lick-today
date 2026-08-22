import { interpolate, spring, useCurrentFrame } from "remotion";

interface ScaleSceneProps {
  progress: number;
}

const SCALE_NAMES = ["Major", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Minor", "Locrian"];
const SCALE_INTERVALS = [
  [2, 2, 1, 2, 2, 2, 1],   // Major
  [2, 1, 2, 2, 2, 1, 2],   // Dorian
  [1, 2, 2, 2, 1, 2, 2],   // Phrygian
  [2, 2, 2, 1, 2, 2, 1],   // Lydian
  [2, 2, 1, 2, 2, 1, 2],   // Mixolydian
  [2, 1, 2, 2, 1, 2, 2],   // Minor (Aeolian)
  [1, 2, 2, 1, 2, 2, 2],   // Locrian
];

export default function ScaleScene({ progress }: ScaleSceneProps) {
  const frame = useCurrentFrame();
  const totalFrames = 240; // 8 seconds at 30fps

  // Fretboard animation
  const fretHighlight = spring({
    frame: frame,
    fps: 30,
    config: { damping: 18, stiffness: 100 },
    from: 0,
    to: 1,
  });

  // Mode cards staggered entry
  const modeEntries = SCALE_NAMES.map((_, i) =>
    spring({
      frame: frame - i * 12,
      fps: 30,
      config: { damping: 20, stiffness: 150 },
      from: 0,
      to: 1,
    })
  );

  // Root note pulse
  const rootPulse = interpolate(frame / 30, [0, 1, 2], [1, 1.15, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, padding: "60px 80px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ color: "#f97316", fontSize: "18px", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "8px" }}>
          SCALE VISUALIZATION
        </div>
        <div style={{ fontSize: "44px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>
          스케일 시각화 도구로 프렛보드 마스터
        </div>
      </div>

      {/* Main fretboard */}
      <div style={{ position: "relative", marginBottom: "40px" }}>
        <svg viewBox="0 0 1400 320" style={{ width: "100%", maxWidth: "1400px", height: "auto" }}>
          {/* Strings */}
          {[0, 1, 2, 3, 4, 5].map((s) => (
            <line
              key={s}
              x1="60"
              y1={50 + s * 44}
              x2="1340"
              y2={50 + s * 44}
              stroke={s === 0 || s === 5 ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.08)"}
              strokeWidth={s === 0 || s === 5 ? 2.5 : 1.5}
            />
          ))}

          {/* Frets */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((f) => (
            <line
              key={f}
              x1={60 + f * 98}
              y1="50"
              x2={60 + f * 98}
              y2="270"
              stroke={f === 0 ? "#737373" : f === 12 ? "#f97316" : "rgba(255,255,255,0.06)"}
              strokeWidth={f === 0 ? 4 : f === 12 ? 3 : 1}
            />
          ))}

          {/* Fret numbers */}
          {[1, 3, 5, 7, 9, 12].map((f) => (
            <text
              key={f}
              x={60 + f * 98}
              y="30"
              textAnchor="middle"
              fill="#737373"
              fontSize="14"
              fontWeight="600"
            >
              {f}
            </text>
          ))}

          {/* String labels */}
          {["E", "B", "G", "D", "A", "E"].map((name, i) => (
            <text key={name} x="20" y={50 + i * 44 + 5} textAnchor="middle" fill="#888" fontSize="14" fontFamily="monospace" fontWeight="600">
              {name}
            </text>
          ))}

          {/* Scale pattern dots - C Major / A Minor at 8th fret */}
          {SCALE_INTERVALS[0].reduce((acc, interval, i) => {
            const nextNote = acc.notes[acc.notes.length - 1] + interval;
            return { notes: [...acc.notes, nextNote], string: acc.string };
          }, { notes: [0], string: 2 }).notes.map((semitone, idx) => {
            // Map to fretboard position (simplified: C major starting at 8th fret on low E)
            const notes = [
              { string: 5, fret: 8 },   // C (low E)
              { string: 5, fret: 10 },  // D
              { string: 4, fret: 7 },   // E
              { string: 4, fret: 8 },   // F
              { string: 4, fret: 10 },  // G
              { string: 3, fret: 7 },   // A
              { string: 3, fret: 9 },   // B
              { string: 2, fret: 8 },   // C
              { string: 2, fret: 10 },  // D
              { string: 1, fret: 7 },   // E
              { string: 1, fret: 8 },   // F
              { string: 1, fret: 10 },  // G
              { string: 0, fret: 8 },   // A
              { string: 0, fret: 10 },  // B
              { string: 0, fret: 12 },  // C (high E)
            ];
            return notes[idx];
          }).filter(Boolean).map((note, idx) => (
            note && (
              <circle
                key={idx}
                cx={60 + note.fret * 98}
                cy={50 + note.string * 44}
                r={interpolate(fretHighlight, [0, 1], [0, 1]) * (note.fret === 8 || note.fret === 12 ? 14 : 10)}
                fill={note.fret === 8 || note.fret === 12 ? "#f97316" : "#3b82f6"}
                opacity={interpolate(fretHighlight, [0, 1], [0, 0.9])}
                stroke="#ffffff"
                strokeWidth={1}
                style={{
                  transform: `scale(${rootPulse})`,
                  transformOrigin: `${60 + note.fret * 98}px ${50 + note.string * 44}px`,
                }}
              />
            )
          ))}

          {/* Position indicator */}
          <text x="700" y="295" textAnchor="middle" fill="#f97316" fontSize="16" fontWeight="600">
            C Major / A Minor · 8th Position
          </text>
        </svg>
      </div>

      {/* Mode cards row */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", maxWidth: "1400px" }}>
        {SCALE_NAMES.map((name, i) => {
          const entry = modeEntries[i];
          const opacity = interpolate(entry, [0, 1], [0, 1]);
          const y = interpolate(entry, [0, 1], [30, 0]);
          const scale = interpolate(entry, [0, 1], [0.9, 1]);

          const isMajor = i === 0 || i === 3;
          const isMinor = i === 5;
          const color = isMajor ? "#f97316" : isMinor ? "#22c55e" : "#a855f7";

          return (
            <div
              key={name}
              style={{
                opacity,
                transform: `translateY(${y}px) scale(${scale})`,
                padding: "20px 28px",
                background: `linear-gradient(135deg, rgba(23,23,23,0.95), rgba(38,38,38,0.9))`,
                border: `1px solid ${color}40`,
                borderRadius: "16px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                textAlign: "center",
                minWidth: "140px",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ color, fontSize: "20px", fontWeight: 800, marginBottom: "4px" }}>
                {name}
              </div>
              <div style={{ color: "#888", fontSize: "13px", fontFamily: "monospace" }}>
                {SCALE_INTERVALS[i].join(" · ")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <div style={{ marginTop: "24px", textAlign: "center", color: "#a3a3a3", fontSize: "18px" }}>
        각 모드의 <span style={{ color: "#f97316", fontWeight: 600 }}>구성음</span>을 보며 프렛보드 위치를 익히세요
      </div>
    </div>
  );
}