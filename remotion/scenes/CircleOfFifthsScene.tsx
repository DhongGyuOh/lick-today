import { interpolate, spring, useCurrentFrame, Audio, staticFile } from "remotion";

interface CircleOfFifthsSceneProps {
  durationFrames: number;
}

const circlePositions = [
  { major: "C", minor: "Am", mx: 260, my: 42, ix: 260, iy: 92, sig: "♮" },
  { major: "G", minor: "Em", mx: 369, my: 71.2, ix: 344, iy: 114.5, sig: "1♯" },
  { major: "D", minor: "Bm", mx: 448.8, my: 151, ix: 405.5, iy: 176, sig: "2♯" },
  { major: "A", minor: "F♯m", mx: 478, my: 260, ix: 428, iy: 260, sig: "3♯" },
  { major: "E", minor: "C♯m", mx: 448.8, my: 369, ix: 405.5, iy: 344, sig: "4♯" },
  { major: "B", minor: "G♯m", mx: 369, my: 448.8, ix: 344, iy: 405.5, sig: "5♯" },
  { major: "F♯/G♭", minor: "D♯m", mx: 260, my: 478, ix: 260, iy: 428, sig: "6♯/6♭" },
  { major: "D♭", minor: "B♭m", mx: 151, my: 448.8, ix: 176, iy: 405.5, sig: "5♭" },
  { major: "A♭", minor: "Fm", mx: 71.2, my: 369, ix: 114.5, iy: 344, sig: "4♭" },
  { major: "E♭", minor: "Cm", mx: 42, my: 260, ix: 92, iy: 260, sig: "3♭" },
  { major: "B♭", minor: "Gm", mx: 71.2, my: 151, ix: 114.5, iy: 176, sig: "2♭" },
  { major: "F", minor: "Dm", mx: 151, my: 71.2, ix: 176, iy: 114.5, sig: "1♭" },
];

export default function CircleOfFifthsScene({ durationFrames }: CircleOfFifthsSceneProps) {
  const frame = useCurrentFrame();

  // Progress based on frame / total duration
  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Center pulse
  const centerPulse = interpolate(frame / 30, [0, 1, 2], [1, 1.08, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Key highlights rotation - full rotation over the video duration
  const rotationProgress = progress;

  // Info panel animation
  const panelEntry = spring({
    frame: frame,
    fps: 30,
    config: { damping: 20, stiffness: 150 },
    from: 0,
    to: 1,
  });
  const panelOpacity = interpolate(panelEntry, [0, 1], [0, 1]);
  const panelY = interpolate(panelEntry, [0, 1], [40, 0]);

  // Current key index for highlighting (cycles through all 12 keys)
  const currentKeyIndex = Math.floor(interpolate(progress, [0, 1], [0, 11.999]));

  return (
    <div style={{ position: "absolute", inset: 0, padding: "60px 80px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Audio
        src={staticFile("/tts_5.wav")}
        startFrom={0}
        endAt={durationFrames}
      />
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(249,115,22,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px", opacity: panelOpacity, transform: `translateY(${panelY}px)` }}>
        <div style={{ color: "#f97316", fontSize: "20px", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "8px" }}>
          CIRCLE OF FIFTHS
        </div>
        <div style={{ fontSize: "44px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>
          5도권 (Circle of Fifths)
        </div>
        <div style={{ marginTop: "8px", color: "#a3a3a3", fontSize: "20px" }}>
          조표와 코드 진행의 관계를 한눈에
        </div>
      </div>

      {/* Main circle visualization */}
      <div style={{ position: "relative", width: "520px", height: "520px", flexShrink: 0 }}>
        <svg viewBox="0 0 520 520" style={{ width: "100%", height: "100%", transform: `scale(${centerPulse})`, transformOrigin: "center" }}>
          {/* Outer circle */}
          <circle cx="260" cy="260" r="218" fill="none" stroke="#333" strokeWidth="2" />
          {/* Inner circle */}
          <circle cx="260" cy="260" r="168" fill="none" stroke="#333" strokeWidth="2" />
          {/* Radial lines */}
          {circlePositions.map((k) => (
            <line key={k.major} x1={k.mx} y1={k.my} x2={k.ix} y2={k.iy} stroke="#2a2a2a" strokeWidth="1" />
          ))}

          {/* Major keys (outer) */}
          {circlePositions.map((k, i) => {
            const isActive = i === currentKeyIndex;
            return (
              <g key={k.major} transform={`rotate(${rotationProgress * 360}, 260, 260)`}>
               <circle
                  cx={k.mx}
                  cy={k.my}
                  r={isActive ? 38 : 34}
                  fill={isActive ? "rgba(249,115,22,0.25)" : "rgba(249,115,22,0.1)"}
                  stroke="#f97316"
                  strokeWidth={isActive ? 3 : 2}
                  filter={isActive ? "drop-shadow(0 0 16px rgba(249,115,22,0.6))" : "none"}
                  style={{ transition: "all 0.3s" }}
                />
                <text
                  x={k.mx}
                  y={k.my + 6}
                  textAnchor="middle"
                  fill="#fdba74"
                  fontSize={isActive ? "17" : "15"}
                  fontWeight="bold"
                >
                  {k.major}
                </text>
                <text x={k.mx} y={k.my + 22} textAnchor="middle" fill="#737373" fontSize="10.5">
                  {k.sig}
                </text>
              </g>
            );
          })}

          {/* Minor keys (inner) */}
          {circlePositions.map((k, i) => {
            const isActive = i === currentKeyIndex;
            return (
              <g key={`m-${k.minor}`} transform={`rotate(${rotationProgress * 360}, 260, 260)`}>
                <circle
                  cx={k.ix}
                  cy={k.iy}
                  r={isActive ? 28 : 24}
                  fill={isActive ? "rgba(34,197,94,0.25)" : "rgba(96,165,250,0.1)"}
                  stroke={isActive ? "#22c55e" : "#3b82f6"}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  filter={isActive ? "drop-shadow(0 0 12px rgba(34,197,94,0.5))" : "none"}
                />
                <text
                  x={k.ix}
                  y={k.iy + 5}
                  textAnchor="middle"
                  fill={isActive ? "#86efac" : "#93c5fd"}
                  fontSize={isActive ? "13" : "12"}
                  fontWeight="bold"
                >
                  {k.minor}
                </text>
              </g>
            );
          })}

          {/* Center label */}
          <g transform={`rotate(-${rotationProgress * 360}, 260, 260)`}>
            <circle cx="260" cy="260" r="50" fill="rgba(10,10,10,0.9)" stroke="#f97316" strokeWidth="2" />
            <text x="260" y="252" textAnchor="middle" fill="#e5e5e5" fontSize="18" fontWeight="bold">
              5도권
            </text>
            <text x="260" y="275" textAnchor="middle" fill="#737373" fontSize="12">
              Circle of Fifths
            </text>
          </g>
        </svg>
      </div>

      {/* Info panel */}
      <div
        style={{
          marginTop: "24px",
          padding: "24px 32px",
          maxWidth: "800px",
          background: "linear-gradient(135deg, rgba(23,23,23,0.95), rgba(38,38,38,0.9))",
          border: "1px solid rgba(249,115,22,0.2)",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          opacity: panelOpacity,
          transform: `translateY(${panelY}px)`,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", textAlign: "center" }}>
          <div>
            <div style={{ color: "#f97316", fontSize: "16px", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "8px" }}>
              시계 방향
            </div>
            <div style={{ color: "#e5e5e5", fontSize: "18px", fontFamily: "monospace", lineHeight: 1.6 }}>
              C → G → D → A → E → B<br />
              5도씩 상승 · ♯ 증가
            </div>
          </div>
          <div style={{ borderLeft: "1px solid #333", borderRight: "1px solid #333" }}>
            <div style={{ color: "#3b82f6", fontSize: "16px", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "8px" }}>
              반시계 방향
            </div>
            <div style={{ color: "#e5e5e5", fontSize: "18px", fontFamily: "monospace", lineHeight: 1.6 }}>
              C → F → B♭ → E♭ → A♭<br />
              4도씩 상승 · ♭ 증가
            </div>
          </div>
          <div>
            <div style={{ color: "#22c55e", fontSize: "16px", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "8px" }}>
              인접 키 관계
            </div>
            <div style={{ color: "#e5e5e5", fontSize: "18px", lineHeight: 1.6 }}>
              인접한 두 키는 코드 1개만 다름<br />
              자연스러운 전조·코드 진행 가능
            </div>
          </div>
        </div>
      </div>

      {/* Current key highlight info */}
      <div
        style={{
          marginTop: "16px",
          padding: "16px 24px",
          background: "rgba(249,115,22,0.1)",
          border: "1px solid rgba(249,115,22,0.3)",
          borderRadius: "12px",
          color: "#fdba74",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        현재 강조: <span style={{ fontFamily: "monospace" }}>{circlePositions[currentKeyIndex].major}</span> / <span style={{ fontFamily: "monospace", color: "#86efac" }}>{circlePositions[currentKeyIndex].minor}</span> &nbsp;|&nbsp; 조표: {circlePositions[currentKeyIndex].sig}
      </div>
    </div>
  );
}