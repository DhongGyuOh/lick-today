export interface Lick {
  id: string;
  title: string;
  key: string; // 예: "A minor"
  style: string; // 예: "Blues", "Rock", "Jazz"
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  bpm: number;
  theory: string; // 이론 설명 (스케일, 코드, 테크닉 등)
  tags: string[];
  alphaTex: string; // alphaTab 렌더링/재생용 AlphaTex 텍스트
}

export interface DailyLicks {
  date: string; // YYYY-MM-DD
  licks: Lick[];
}
