"use client";

import { useState, useRef, useEffect } from "react";

interface HeroVideoProps {
  src: string;
  ariaLabel?: string;
}

export default function HeroVideo({ src, ariaLabel = "Lick Today 소개 영상" }: HeroVideoProps) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 비디오 요소의 muted 속성을 상태와 동기화
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-orange-600/30 bg-neutral-900 shadow-2xl shadow-orange-950/20 relative">
      <video
        ref={videoRef}
        className="aspect-video w-full bg-neutral-950 object-cover"
        src={src}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
        aria-label={ariaLabel}
      />
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5"
        aria-label={isMuted ? "소리 켜기" : "소리 끄기"}
      >
        {isMuted ? "🔊 소리 켜기" : "🔇 소리 끄기"}
      </button>
    </section>
  );
}