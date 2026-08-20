import { Composition } from "remotion";
import LickTodayPromo from "./LickTodayPromo";
import type { PromoCompositionProps } from "./types";

export const REMOTION_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 360, // 12 seconds at 30fps
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
    <Composition
      id="LickTodayPromo"
      // Remotion's Composition expects Zod schema generic; LickTodayPromo's
      // props are PromoCompositionProps and defaultProps matches, so as any
      // safely bridges the LooseComponentType constraint.
      component={LickTodayPromo as any}
      defaultProps={defaultProps}
      {...REMOTION_CONFIG}
    />
  );
}