import { Composition } from "remotion";
import LickTodayPromo from "./LickTodayPromo";
import CircleOfFifthsScene from "./scenes/CircleOfFifthsScene";
import ModesScene from "./scenes/ModesScene";
import type { PromoCompositionProps } from "./types";

export const REMOTION_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 1240, // Matches public/tts.wav at ~41.3 seconds
} as const;

const defaultProps: PromoCompositionProps = {
  date: "2026-08-07",
  licks: [
    {
      index: 1,
      title: "쨉쨉이 스타일의 펑키 싱코페이션 릭",
      key: "E minor",
      style: "Funk Rock",
      difficulty: "Intermediate",
      bpm: 112,
      hasDrums: true,
    },
    {
      index: 2,
      title: "쨉쨉이 감성의 슬라이드 & 풀오프 멜로디",
      key: "G major",
      style: "Indie Rock",
      difficulty: "Beginner",
      bpm: 95,
      hasDrums: true,
    },
    {
      index: 3,
      title: "쨉쨉이 스타일 아르페지오 & 해머온 릭",
      key: "D major",
      style: "Pop Rock",
      difficulty: "Intermediate",
      bpm: 108,
      hasDrums: true,
    },
    {
      index: 4,
      title: "쨉쨉이 감성의 블루지한 펜타토닉 릭",
      key: "A minor",
      style: "Blues Rock",
      difficulty: "Intermediate",
      bpm: 100,
      hasDrums: true,
    },
    {
      index: 5,
      title: "쨉쨉이 스타일의 경쾌한 더블스탑 릭",
      key: "C major",
      style: "Bright Pop",
      difficulty: "Advanced",
      bpm: 120,
      hasDrums: true,
    },
  ],
};

export default function Root() {
  return (
    <>
      <Composition
        id="LickTodayPromo"
        component={LickTodayPromo as any}
        defaultProps={defaultProps}
        {...REMOTION_CONFIG}
      />
      <Composition
        id="CircleOfFifths"
        component={CircleOfFifthsScene as any}
        defaultProps={{ durationFrames: 1707 }} // 56.9s * 30fps
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={1707}
      />
      <Composition
        id="Modes"
        component={ModesScene as any}
        defaultProps={{ durationFrames: 1929 }} // 64.3s * 30fps
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={1929}
      />
    </>
  );
}