import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansKR";
import BrandIntro from "./scenes/BrandIntro";
import LickCarousel from "./scenes/LickCarousel";
import Outro from "./scenes/Outro";
import type { PromoCompositionProps } from "./types";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "700", "900"],
});

const SCENE_DURATIONS = {
  brandIntro: 90, // 3 seconds
  lickCarousel: 210, // 7 seconds
  outro: 60, // 2 seconds
} as const;

const TOTAL_DURATION =
  SCENE_DURATIONS.brandIntro + SCENE_DURATIONS.lickCarousel + SCENE_DURATIONS.outro;

export default function LickTodayPromo({ date, licks }: PromoCompositionProps) {
  const frame = useCurrentFrame();

  // Compute scene progress (0-1) for cross-scene transitions
  const brandIntroProgress = interpolate(
    frame,
    [0, SCENE_DURATIONS.brandIntro],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const lickCarouselProgress = interpolate(
    frame,
    [SCENE_DURATIONS.brandIntro, SCENE_DURATIONS.brandIntro + SCENE_DURATIONS.lickCarousel],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const outroProgress = interpolate(
    frame,
    [TOTAL_DURATION - SCENE_DURATIONS.outro, TOTAL_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Spring animations for smooth entry/exit
  const brandIntroScale = interpolate(
    spring({
      frame,
      fps: 30,
      config: { damping: 20, stiffness: 200 },
      from: 0,
      to: 1,
    }),
    [0, 1],
    [0.95, 1]
  );

  const lickCarouselOpacity = interpolate(
    spring({
      frame: frame - SCENE_DURATIONS.brandIntro,
      fps: 30,
      config: { damping: 20, stiffness: 200 },
      from: 0,
      to: 1,
    }),
    [0, 1],
    [0, 1]
  );

  const outroOpacity = interpolate(
    spring({
      frame: frame - (TOTAL_DURATION - SCENE_DURATIONS.outro),
      fps: 30,
      config: { damping: 20, stiffness: 200 },
      from: 0,
      to: 1,
    }),
    [0, 1],
    [0, 1]
  );

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
        fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          background: "radial-gradient(ellipse at 50% 50%, rgba(249, 115, 22, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Scene 1: Brand Intro */}
      <Sequence
        from={0}
        durationInFrames={SCENE_DURATIONS.brandIntro}
        layout="absolute-fill"
      >
        <BrandIntro progress={brandIntroProgress} scale={brandIntroScale} />
      </Sequence>

      {/* Scene 2: Lick Carousel */}
      <Sequence
        from={SCENE_DURATIONS.brandIntro}
        durationInFrames={SCENE_DURATIONS.lickCarousel}
        layout="absolute-fill"
      >
        <div style={{ opacity: lickCarouselOpacity }}>
          <LickCarousel date={date} licks={licks} progress={lickCarouselProgress} />
        </div>
      </Sequence>

      {/* Scene 3: Outro */}
      <Sequence
        from={TOTAL_DURATION - SCENE_DURATIONS.outro}
        durationInFrames={SCENE_DURATIONS.outro}
        layout="absolute-fill"
      >
        <div style={{ opacity: outroOpacity }}>
          <Outro progress={outroProgress} />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
}