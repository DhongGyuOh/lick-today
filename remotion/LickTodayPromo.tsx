import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  Audio,
  staticFile,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansKR";
import BrandIntro from "./scenes/BrandIntro";
import LickCarousel from "./scenes/LickCarousel";
import Outro from "./scenes/Outro";
import Captions from "./scenes/Captions";
import TheoryScene from "./scenes/TheoryScene";
import PracticeScene from "./scenes/PracticeScene";
import ScaleScene from "./scenes/ScaleScene";
import type { PromoCompositionProps } from "./types";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "700", "900"],
});

// Audio duration: 41.3 seconds
const AUDIO_DURATION_FRAMES = 1240; // 41.33s * 30fps
const SCENE_DURATIONS = {
  brandIntro: 90, // 3s
  lickCarousel: 180, // 6s
  theory: 270, // 9s
  practice: 165, // 5.5s
  scale: 240, // 8s
  outro: 295, // ~9.8s
} as const;

const TOTAL_DURATION = AUDIO_DURATION_FRAMES;

export default function LickTodayPromo({ date, licks }: PromoCompositionProps) {
  const frame = useCurrentFrame();

  // Caption progress
  const captionProgress = interpolate(
    frame,
    [0, AUDIO_DURATION_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
        fontFamily,
        overflow: "hidden",
      }}
    >
      <Audio
        src={staticFile("/tts.wav")}
        startFrom={0}
        endAt={AUDIO_DURATION_FRAMES}
      />

      <Sequence from={0} durationInFrames={SCENE_DURATIONS.brandIntro} layout="absolute-fill">
        <BrandIntro progress={interpolate(frame, [0, SCENE_DURATIONS.brandIntro], [0, 1])} scale={1} />
      </Sequence>

      <Sequence from={SCENE_DURATIONS.brandIntro} durationInFrames={SCENE_DURATIONS.lickCarousel} layout="absolute-fill">
        <LickCarousel date={date} licks={licks} progress={interpolate(frame, [SCENE_DURATIONS.brandIntro, SCENE_DURATIONS.brandIntro + SCENE_DURATIONS.lickCarousel], [0, 1])} />
      </Sequence>

      <Sequence from={SCENE_DURATIONS.brandIntro + SCENE_DURATIONS.lickCarousel} durationInFrames={SCENE_DURATIONS.theory} layout="absolute-fill">
        <TheoryScene progress={interpolate(frame, [SCENE_DURATIONS.brandIntro + SCENE_DURATIONS.lickCarousel, SCENE_DURATIONS.brandIntro + SCENE_DURATIONS.lickCarousel + SCENE_DURATIONS.theory], [0, 1])} />
      </Sequence>

      <Sequence from={SCENE_DURATIONS.brandIntro + SCENE_DURATIONS.lickCarousel + SCENE_DURATIONS.theory} durationInFrames={SCENE_DURATIONS.practice} layout="absolute-fill">
        <PracticeScene progress={interpolate(frame, [0, SCENE_DURATIONS.practice], [0, 1])} />
      </Sequence>

      <Sequence from={SCENE_DURATIONS.brandIntro + SCENE_DURATIONS.lickCarousel + SCENE_DURATIONS.theory + SCENE_DURATIONS.practice} durationInFrames={SCENE_DURATIONS.scale} layout="absolute-fill">
        <ScaleScene progress={interpolate(frame, [0, SCENE_DURATIONS.scale], [0, 1])} />
      </Sequence>

      <Sequence from={TOTAL_DURATION - SCENE_DURATIONS.outro} durationInFrames={SCENE_DURATIONS.outro} layout="absolute-fill">
        <Outro progress={interpolate(frame, [TOTAL_DURATION - SCENE_DURATIONS.outro, TOTAL_DURATION], [0, 1])} />
      </Sequence>

      <Captions progress={captionProgress} />
    </AbsoluteFill>
  );
}