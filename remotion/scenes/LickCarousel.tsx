import { interpolate, spring, useCurrentFrame } from "remotion";
import type { PromoCompositionProps, PromoLick } from "../types";

const difficultyStyles: Record<PromoLick["difficulty"], { bg: string; color: string; label: string }> = {
  Beginner: { bg: "rgba(34, 197, 94, 0.18)", color: "#4ade80", label: "Beginner" },
  Intermediate: { bg: "rgba(234, 179, 8, 0.18)", color: "#facc15", label: "Intermediate" },
  Advanced: { bg: "rgba(239, 68, 68, 0.18)", color: "#f87171", label: "Advanced" },
};

interface LickCarouselProps extends PromoCompositionProps {
  progress: number;
}

function truncateTitle(title: string) {
  return title.length > 34 ? `${title.slice(0, 34)}…` : title;
}

function LickCard({ lick, index }: { lick: PromoLick; index: number }) {
  const frame = useCurrentFrame();
  const delay = index * 12;

  const opacity = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardEntry = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 18, stiffness: 160 },
    from: 0,
    to: 1,
  });
  const translateY = interpolate(cardEntry, [0, 1], [50, 0]);
  const scaleEntry = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 18, stiffness: 160 },
    from: 0,
    to: 1,
  });
  const scale = interpolate(scaleEntry, [0, 1], [0.96, 1]);
  const shimmer = interpolate(frame - delay, [30, 75, 120], [-120, 120, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const difficulty = difficultyStyles[lick.difficulty];

  return (
    <div
      style={{
        position: "relative",
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        height: "150px",
        padding: "26px 30px",
        borderRadius: "28px",
        background: "linear-gradient(135deg, rgba(23, 23, 23, 0.96), rgba(38, 38, 38, 0.82))",
        border: "1px solid rgba(249, 115, 22, 0.24)",
        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.38)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${shimmer}%`,
          width: "70px",
          background: "linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.16), transparent)",
          transform: "skewX(-14deg)",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "28px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
            <span style={{ color: "#737373", fontSize: "22px", fontWeight: 700 }}>#{lick.index}</span>
            <span
              style={{
                padding: "7px 14px",
                borderRadius: "999px",
                background: difficulty.bg,
                color: difficulty.color,
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              {difficulty.label}
            </span>
            {lick.hasDrums ? (
              <span
                style={{
                  padding: "7px 14px",
                  borderRadius: "999px",
                  background: "rgba(168, 85, 247, 0.18)",
                  color: "#d8b4fe",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                🥁 드럼 백킹
              </span>
            ) : null}
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: "34px",
              lineHeight: 1.18,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {truncateTitle(lick.title)}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            color: "#d4d4d4",
            fontSize: "24px",
            fontWeight: 600,
            flexShrink: 0,
            paddingTop: "46px",
          }}
        >
          <span>{lick.key}</span>
          <span style={{ color: "#737373" }}>·</span>
          <span>{lick.style}</span>
          <span style={{ color: "#737373" }}>·</span>
          <span style={{ color: "#fb923c" }}>{lick.bpm} BPM</span>
        </div>
      </div>
    </div>
  );
}

export default function LickCarousel({ date, licks, progress }: LickCarouselProps) {
  const frame = useCurrentFrame();
  const fretOffset = interpolate(progress, [0, 1], [0, 120]);
  const titleOpacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({
    frame,
    fps: 30,
    config: { damping: 20, stiffness: 160 },
    from: 34,
    to: 0,
  });

  return (
    <div style={{ position: "absolute", inset: 0, padding: "84px 120px" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(90deg, rgba(249,115,22,0.08) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "150px 100%, 100% 96px",
          backgroundPosition: `${-fretOffset}px 0, 0 ${fretOffset / 2}px`,
          maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "36px",
          }}
        >
          <div>
            <div style={{ color: "#f97316", fontSize: "24px", fontWeight: 800, letterSpacing: "0.08em" }}>
              TODAY'S PICKS · {date}
            </div>
            <div
              style={{
                color: "#ffffff",
                fontSize: "64px",
                lineHeight: 1.05,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                marginTop: "8px",
              }}
            >
              오늘 연습할 릭 5개
            </div>
          </div>
          <div
            style={{
              color: "#a3a3a3",
              fontSize: "28px",
              fontWeight: 500,
              textAlign: "right",
              lineHeight: 1.35,
            }}
          >
            탭악보와 재생으로<br />바로 따라 치기
          </div>
        </div>

        <div style={{ display: "grid", gap: "18px" }}>
          {licks.slice(0, 5).map((lick, index) => (
            <LickCard key={`${lick.index}-${lick.title}`} lick={lick} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}