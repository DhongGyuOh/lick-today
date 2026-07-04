import Link from "next/link";
import { getAllDates } from "@/lib/licks";

export default function ArchivePage() {
  const dates = getAllDates();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">아카이브</h1>
      {dates.length === 0 ? (
        <p className="text-neutral-400">아직 등록된 날짜가 없습니다.</p>
      ) : (
        <ul className="grid gap-2">
          {dates.map((date) => (
            <li key={date}>
              <Link
                href={`/archive/${date}`}
                className="block rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 hover:border-orange-600/60 transition-colors"
              >
                {date}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
