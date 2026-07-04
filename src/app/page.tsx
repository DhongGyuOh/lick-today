import Link from "next/link";
import { getLatestLicks } from "@/lib/licks";

const difficultyColor: Record<string, string> = {
  Beginner: "bg-green-500/15 text-green-400",
  Intermediate: "bg-yellow-500/15 text-yellow-400",
  Advanced: "bg-red-500/15 text-red-400",
};

export default function HomePage() {
  const daily = getLatestLicks();

  if (!daily) {
    return (
      <p className="text-neutral-400">
        아직 등록된 릭이 없습니다. data/licks/ 폴더에 JSON을 추가해주세요.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">오늘의 릭 5</h1>
        <p className="text-neutral-400 text-sm">{daily.date}</p>
      </div>

      <div className="grid gap-4">
        {daily.licks.map((lick, idx) => (
          <Link
            key={lick.id}
            href={`/lick/${lick.id}`}
            className="group block rounded-xl border border-neutral-800 bg-neutral-900 p-5 hover:border-orange-600/60 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs text-neutral-500">#{idx + 1}</span>
                <h2 className="text-lg font-semibold group-hover:text-orange-400 transition-colors">
                  {lick.title}
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  {lick.key} · {lick.style} · {lick.bpm} BPM
                </p>
              </div>
              <span
                className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                  difficultyColor[lick.difficulty] ??
                  "bg-neutral-700/30 text-neutral-300"
                }`}
              >
                {lick.difficulty}
              </span>
            </div>
            <p className="text-sm text-neutral-500 mt-3 line-clamp-2">
              {lick.theory}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
