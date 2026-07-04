import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllDates, getLicksByDate } from "@/lib/licks";

export function generateStaticParams() {
  return getAllDates().map((date) => ({ date }));
}

export default async function ArchiveDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const daily = getLicksByDate(date);

  if (!daily) return notFound();

  return (
    <div>
      <Link
        href="/archive"
        className="text-sm text-neutral-400 hover:text-white transition-colors"
      >
        ← 아카이브로
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">{daily.date}의 릭 5</h1>
      <div className="grid gap-4">
        {daily.licks.map((lick, idx) => (
          <Link
            key={lick.id}
            href={`/lick/${lick.id}`}
            className="group block rounded-xl border border-neutral-800 bg-neutral-900 p-5 hover:border-orange-600/60 transition-colors"
          >
            <span className="text-xs text-neutral-500">#{idx + 1}</span>
            <h2 className="text-lg font-semibold group-hover:text-orange-400 transition-colors">
              {lick.title}
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              {lick.key} · {lick.style} · {lick.bpm} BPM · {lick.difficulty}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
