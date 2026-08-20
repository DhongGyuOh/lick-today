import { interpolate, spring } from "remotion";

interface OutroProps {
  progress: number;
}

export default function Outro({ progress }: OutroProps) {
  const ctaOpacity = interpolate(progress, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaY = interpolate(
    spring({
      frame: progress * 60,
      fps: 30,
      config: { damping: 20, stiffness: 180 },
      from: 0,
      to: 1,
    }),
    [0, 1],
    [40, 0]
  );

  const featuresOpacity = interpolate(progress, [0.3, 0.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const featuresY = interpolate(
    spring({
      frame: progress * 60,
      fps: 30,
      config: { damping: 20, stiffness: 180 },
      from: 0,
      to: 1,
    }),
    [0, 1],
    [30, 0]
  );

  const logoOpacity = interpolate(progress, [0.6, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(
    spring({
      frame: progress * 60,
      fps: 30,
      config: { damping: 18, stiffness: 160 },
      from: 0,
      to: 1,
    }),
    [0, 1],
    [0.85, 1]
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px",
      }}
    >
      <div
        style={{
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            marginBottom: "12px",
          }}
        >
          오늘의 릭 5개를<br />지금 연습해보세요
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.6)",
            letterSpacing: "0.02em",
          }}
        >
          매일 새로운 릭이 업데이트됩니다
        </div>
      </div>

      <div
        style={{
          opacity: featuresOpacity,
          transform: `translateY(${featuresY}px)`,
          display: "flex",
          gap: "24px",
        }}
      >
        {[
          { icon: "📝", text: "탭악보" },
          { icon: "📚", text: "이론 설명" },
          { icon: "▶️", text: "재생" },
          { icon: "🥁", text: "드럼 백킹" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "18px 28px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(249, 115, 22, 0.22)",
              borderRadius: "20px",
              backdropFilter: "blur(10px)",
              transition: "transform 0.2s ease",
            }}
          >
            <span style={{ fontSize: "28px" }}>{item.icon}</span>
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff" }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "56px",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #ffffff 0%, #f97316 50%, #fb923c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          🎸 Lick Today
        </div>
      </div>
    </div>
  );
}