import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllLicksFlat, getLickById } from "@/lib/licks";
import AlphaTabPlayer from "@/components/AlphaTabPlayer";

export function generateStaticParams() {
  return getAllLicksFlat().map(({ lick }) => ({ id: lick.id }));
}

export default async function LickDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = getLickById(id);

  if (!found) return notFound();

  const { date, lick } = found;

  return (
    <div>
      <Link
        href="/"
        className="text-sm text-neutral-400 hover:text-white transition-colors"
      >
        ← 오늘의 릭으로
      </Link>

      <div className="mt-4 mb-6">
        <p className="text-xs text-neutral-500 mb-1">{date}</p>
        <h1 className="text-2xl font-bold">{lick.title}</h1>
        <p className="text-sm text-neutral-400 mt-1">
          {lick.key} · {lick.style} · {lick.bpm} BPM · {lick.difficulty}
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {lick.hasDrums && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/15 text-purple-300 font-medium">
              🥁 드럼 백킹
            </span>
          )}
          {lick.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <section className="mb-8">
        <AlphaTabPlayer alphaTex={lick.alphaTex} />
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-base font-semibold mb-2">🎵 이론 설명</h2>
        <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
          {lick.theory}
        </p>
      </section>
    </div>
  );
}
