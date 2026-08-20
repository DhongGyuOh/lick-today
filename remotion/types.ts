/**
 * Remotion composition props types.
 * Kept independent from src/types/lick.ts to avoid Node fs coupling in Remotion runtime.
 */

export interface PromoLick {
  index: number;
  title: string;
  key: string;
  style: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  bpm: number;
  hasDrums: boolean;
}

export interface PromoCompositionProps {
  date: string;
  licks: PromoLick[];
}