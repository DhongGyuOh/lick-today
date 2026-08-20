import { interpolate, spring } from "remotion";

interface BrandIntroProps {
  progress: number;
  scale: number;
}

export default function BrandIntro({ progress, scale }: BrandIntroProps) {
  // Guitar string animation - 6 strings drawing from left to right
  const stringDrawProgress = spring({
    frame: progress * 90,
    fps: 30,
    config: { damping: 25, stiffness: 180 },
    from: 0,
    to: 1,
  });

  // Logo entrance
  const logoOpacity = interpolate(progress, [0.2, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoY = interpolate(
    spring({
      frame: progress * 90,
      fps: 30,
      config: { damping: 22, stiffness: 180 },
      from: 0,
      to: 1,
    }),
    [0, 1],
    [40, 0]
  );

  // Slogan entrance
  const sloganOpacity = interpolate(progress, [0.5, 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sloganY = interpolate(
    spring({
      frame: progress * 90,
      fps: 30,
      config: { damping: 22, stiffness: 180 },
      from: 0,
      to: 1,
    }),
    [0, 1],
    [30, 0]
  );

  // Feature tags entrance
  const tagsOpacity = interpolate(progress, [0.7, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagsY = interpolate(
    spring({
      frame: progress * 90,
      fps: 30,
      config: { damping: 22, stiffness: 180 },
      from: 0,
      to: 1,
    }),
    [0, 1],
    [20, 0]
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
        transform: `scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      {/* Animated Guitar Strings Background */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: interpolate(progress, [0, 0.3, 1], [1, 1, 0.3], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            style={{
              width: `${interpolate(stringDrawProgress, [0, 1], [0, 100])}%`,
              height: "2px",
              background: `linear-gradient(90deg, #ea580c, #f97316, #fb923c)`,
              borderRadius: "1px",
              boxShadow: "0 0 8px rgba(249, 115, 22, 0.6)",
              transformOrigin: "left",
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          opacity: logoOpacity,
          transform: `translateY(${logoY}px)`,
        }}
      >
        <div
          style={{
            fontSize: "88px",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #ffffff 0%, #f97316 50%, #fb923c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "8px",
          }}
        >
          🎸 Lick Today
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.7)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          매일 5개의 기타 릭
        </div>
      </div>

      {/* Slogan */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          marginTop: "24px",
          opacity: sloganOpacity,
          transform: `translateY(${sloganY}px)`,
        }}
      >
        <div
          style={{
            fontSize: "32px",
            fontWeight: 500,
            color: "#ffffff",
            marginBottom: "4px",
          }}
        >
          AI가 만든 탭악보 · 이론 설명 · 재생
        </div>
      </div>

      {/* Feature tags */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          gap: "16px",
          marginTop: "32px",
          opacity: tagsOpacity,
          transform: `translateY(${tagsY}px)`,
        }}
      >
        {[
          { icon: "📝", text: "탭악보" },
          { icon: "📚", text: "이론 설명" },
          { icon: "▶️", text: "재생" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              borderRadius: "50px",
              backdropFilter: "blur(10px)",
            }}
          >
            <span style={{ fontSize: "20px" }}>{item.icon}</span>
            <span style={{ fontSize: "18px", fontWeight: 500, color: "#ffffff" }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}