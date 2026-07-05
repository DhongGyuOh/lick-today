export interface Lick {
  id: string;
  title: string;
  key: string; // 예: "A minor"
  style: string; // 예: "Blues", "Rock", "Jazz"
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  bpm: number;
  theory: string; // 이론 설명 (스케일, 코드, 테크닉 등)
  tags: string[];
  alphaTex: string; // alphaTab 렌더링/재생용 AlphaTex 텍스트 (기타 단독 또는 기타+드럼 멀티트랙)
  hasDrums?: boolean; // alphaTex에 드럼 트랙(\track "Drums" \instrument percussion)이 포함되어 있는지 여부. 없으면 false로 취급.
}

export interface DailyLicks {
  date: string; // YYYY-MM-DD
  licks: Lick[];
}
