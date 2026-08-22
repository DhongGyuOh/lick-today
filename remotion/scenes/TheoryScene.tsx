import { interpolate, spring, useCurrentFrame } from "remotion";

interface TheorySceneProps {
  progress: number;
}

export default function TheoryScene({ progress }: TheorySceneProps) {
  const frame = useCurrentFrame();

  // Panel animations
  const panel1Entry = spring({
    frame: frame * 0.3,
    fps: 30,
    config: { damping: 20, stiffness: 150 },
    from: 0,
    to: 1,
  });
  const panel2Entry = spring({
    frame: frame * 0.3 - 15,
    fps: 30,
    config: { damping: 20, stiffness: 150 },
    from: 0,
    to: 1,
  });
  const panel3Entry = spring({
    frame: frame * 0.3 - 30,
    fps: 30,
    config: { damping: 20, stiffness: 150 },
    from: 0,
    to: 1,
  });

  const panel1Opacity = interpolate(panel1Entry, [0, 1], [0, 1]);
  const panel1Y = interpolate(panel1Entry, [0, 1], [40, 0]);
  const panel2Opacity = interpolate(panel2Entry, [0, 1], [0, 1]);
  const panel2Y = interpolate(panel2Entry, [0, 1], [40, 0]);
  const panel3Opacity = interpolate(panel3Entry, [0, 1], [0, 1]);
  const panel3Y = interpolate(panel3Entry, [0, 1], [40, 0]);

  // Floating music notes decoration
  const noteFloat = interpolate(frame / 30, [0, 2, 4], [0, -15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, padding: "80px 120px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Background grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px", opacity: panel1Opacity, transform: `translateY(${panel1Y}px)` }}>
        <div style={{ color: "#f97316", fontSize: "20px", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "8px" }}>
          MUSIC THEORY
        </div>
        <div style={{ fontSize: "48px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>
          화성학 · 이론 설명
        </div>
      </div>

      {/* Three theory panels */}
      <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", justifyContent: "center", maxWidth: "1400px" }}>
        {/* Panel 1: Chord Theory */}
        <div
          style={{
            opacity: panel1Opacity,
            transform: `translateY(${panel1Y}px)`,
            width: "400px",
            padding: "32px",
            background: "linear-gradient(135deg, rgba(23,23,23,0.95), rgba(38,38,38,0.9))",
            border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎵</div>
          <div style={{ color: "#f97316", fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>코드 이론</div>
          <div style={{ color: "#d4d4d4", fontSize: "18px", lineHeight: 1.6 }}>
            메이저/마이너 트라이어드<br />7th 코드 구성음<br />코드 톤 타겟팅
          </div>
        </div>

        {/* Panel 2: Scale Theory */}
        <div
          style={{
            opacity: panel2Opacity,
            transform: `translateY(${panel2Y}px)`,
            width: "400px",
            padding: "32px",
            background: "linear-gradient(135deg, rgba(23,23,23,0.95), rgba(38,38,38,0.9))",
            border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎹</div>
          <div style={{ color: "#a855f7", fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>스케일 & 모드</div>
          <div style={{ color: "#d4d4d4", fontSize: "18px", lineHeight: 1.6 }}>
            메이저/내추럴 마이너<br />도리안, 믹소리디안<br />펜타토닉 & 블루스
          </div>
        </div>

        {/* Panel 3: Rhythm & Notation */}
        <div
          style={{
            opacity: panel3Opacity,
            transform: `translateY(${panel3Y}px)`,
            width: "400px",
            padding: "32px",
            background: "linear-gradient(135deg, rgba(23,23,23,0.95), rgba(38,38,38,0.9))",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>📝</div>
          <div style={{ color: "#22c55e", fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>리듬 & 표기법</div>
          <div style={{ color: "#d4d4d4", fontSize: "18px", lineHeight: 1.6 }}>
            싱코페이션 패턴<br />타브 악보 읽기<br />아르티큘레이션 기호
          </div>
        </div>
      </div>

      {/* Floating decorative notes */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "10%",
          opacity: 0.3,
          transform: `translateY(${noteFloat}px)`,
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: "32px" }}>♪</span>
        <span style={{ fontSize: "24px", marginLeft: "20px" }}>♫</span>
        <span style={{ fontSize: "28px", marginLeft: "40px" }}>♩</span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          right: "10%",
          opacity: 0.3,
          transform: `translateY(${noteFloat}px)`,
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: "28px" }}>♫</span>
        <span style={{ fontSize: "32px", marginLeft: "25px" }}>♪</span>
      </div>
    </div>
  );
}