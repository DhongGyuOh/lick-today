"use client";

import { useState } from "react";
import Link from "next/link";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  src: string;
  thumbnail?: string;
  duration: string;
  category: string;
  emoji: string;
}

const videos: VideoItem[] = [
  {
    id: "promo",
    title: "Lick Today 소개",
    description: "매일 5개의 새로운 기타 릭을 만나보세요. AI가 만든 탭악보와 이론 설명으로 바로 연습할 수 있습니다.",
    src: "/promo.mp4",
    duration: "41초",
    category: "소개",
    emoji: "🎸",
  },
  {
    id: "circle-of-fifths",
    title: "5도권 (Circle of Fifths)",
    description: "조표와 코드 진행의 관계를 한눈에. 5도 간격으로 나열된 키의 순환을 시각적으로 설명합니다.",
    src: "/circle-of-fifths.mp4",
    duration: "57초",
    category: "이론",
    emoji: "⭕",
  },
  {
    id: "modes",
    title: "모드 (Modes) - 7가지 스케일",
    description: "메이저 스케일에서 파생된 7가지 모드. 이오니안부터 로크리안까지 각 모드의 색채와 특징음을 프렛보드와 함께 배웁니다.",
    src: "/modes.mp4",
    duration: "64초",
    category: "이론",
    emoji: "✨",
  },
];

export default function VideosPage() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const openModal = (video: VideoItem) => {
    setActiveVideo(video);
    setIsMuted(true);
  };

  const closeModal = () => {
    setActiveVideo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && activeVideo) {
      closeModal();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3">🎬 영상 가이드</h1>
        <p className="text-neutral-400 text-lg">
          Lick Today의 핵심 기능을 영상으로 확인하세요. 카드를 클릭하면 전체화면으로 재생됩니다.
        </p>
      </div>

      {/* Video Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {videos.map((video) => (
          <article
            key={video.id}
            onClick={() => openModal(video)}
            className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden transition-all hover:border-orange-600/60 hover:shadow-2xl hover:shadow-orange-950/20"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openModal(video)}
            role="button"
            aria-label={`${video.title} 영상 보기`}
          >
            {/* Thumbnail / Video Preview */}
            <div className="relative aspect-video overflow-hidden bg-neutral-950">
              <video
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                src={video.src}
                muted
                preload="metadata"
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-600/90 text-white">
                  {video.category}
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-black/70 text-white">
                  {video.duration}
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-orange-600/90 flex items-center justify-center text-2xl shadow-xl">
                  ▶
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{video.emoji}</span>
                <h2 className="text-xl font-bold group-hover:text-orange-400 transition-colors">
                  {video.title}
                </h2>
              </div>
              <p className="text-sm text-neutral-400 line-clamp-2">
                {video.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-medium transition-colors"
        >
          ← 메인으로 돌아가기
        </Link>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="relative w-full max-w-5xl mx-4 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <video
              ref={(el) => {
                if (el) {
                  el.muted = isMuted;
                  el.play().catch(() => {});
                }
              }}
              className="w-full h-full"
              src={activeVideo.src}
              autoPlay
              muted={isMuted}
              loop
              playsInline
            />
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors text-2xl"
              aria-label="닫기"
            >
              ✕
            </button>
            {/* Mute toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
              aria-label={isMuted ? "소리 켜기" : "소리 끄기"}
            >
              {isMuted ? "🔊 소리 켜기" : "🔇 소리 끄기"}
            </button>
            {/* Title */}
            <div className="absolute bottom-4 left-4 z-10">
              <h2 id="modal-title" className="text-xl font-bold text-white">
                {activeVideo.emoji} {activeVideo.title}
              </h2>
              <p className="text-neutral-400 text-sm">{activeVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}