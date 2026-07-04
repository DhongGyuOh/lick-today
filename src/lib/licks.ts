import fs from "fs";
import path from "path";
import type { DailyLicks, Lick } from "@/types/lick";

const DATA_DIR = path.join(process.cwd(), "data", "licks");

/** data/licks/*.json 파일명을 모두 읽어 날짜 문자열 목록 반환 (내림차순 정렬) */
export function getAllDates(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort((a, b) => (a < b ? 1 : -1)); // 최신 날짜가 먼저
}

/** 특정 날짜의 DailyLicks(5개 릭 묶음)를 반환 */
export function getLicksByDate(date: string): DailyLicks | null {
  const filePath = path.join(DATA_DIR, `${date}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as DailyLicks;
}

/** 가장 최신 날짜의 DailyLicks 반환 (메인 페이지용) */
export function getLatestLicks(): DailyLicks | null {
  const dates = getAllDates();
  if (dates.length === 0) return null;
  return getLicksByDate(dates[0]);
}

/** 전체 릭을 하나의 배열로 (날짜 정보 포함) */
export function getAllLicksFlat(): { date: string; lick: Lick }[] {
  return getAllDates().flatMap((date) => {
    const daily = getLicksByDate(date);
    if (!daily) return [];
    return daily.licks.map((lick) => ({ date, lick }));
  });
}

/** id로 릭 + 소속 날짜 조회 (상세 페이지용) */
export function getLickById(id: string): { date: string; lick: Lick } | null {
  const found = getAllLicksFlat().find(({ lick }) => lick.id === id);
  return found ?? null;
}
