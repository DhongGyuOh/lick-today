"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  alphaTex: string;
}

// next.config.ts의 basePath와 동일한 값을 사용해 GitHub Pages 서브패스에서도
// 정적 에셋(font/soundfont/worker)을 올바르게 찾도록 합니다.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// alphaTab은 기본적으로 자신이 로드된 위치(import.meta.url)를 기준으로
// alphaTab.worker.mjs / alphaTab.worklet.mjs를 찾으려 하는데, Next.js가 npm 패키지를
// 자체 청크로 번들링해버리면 그 자동 감지가 깨집니다(공식 webpack/vite 플러그인을 쓰지 않는
// 모든 번들러 환경에서 발생하는 문제). 그래서 워커/오디오워클릿 생성 방식을
// Environment.initializeMain으로 직접 지정해, 우리가 public/alphatab/에 복사해둔
// 정적 파일을 명시적인 절대 경로로 로드하도록 합니다.
// 여러 컴포넌트 인스턴스가 있어도 한 번만 초기화하면 되므로 모듈 스코프 플래그로 가드합니다.
let alphaTabMainInitialized = false;

async function ensureAlphaTabMainInitialized(alphaTab: typeof import("@coderline/alphatab")) {
  if (alphaTabMainInitialized) return;
  alphaTabMainInitialized = true;

  alphaTab.Environment.initializeMain(
    (_settings, workerName) => {
      // 렌더러/신디사이저 둘 다 이 경로를 통해 생성되며 workerName으로 구분됩니다.
      return new Worker(`${BASE_PATH}/alphatab/alphaTab.worker.mjs`, {
        type: "module",
        name: workerName,
      });
    },
    (context) => {
      return context.audioWorklet.addModule(`${BASE_PATH}/alphatab/alphaTab.worklet.mjs`);
    }
  );
}

export default function AlphaTabPlayer({ alphaTex }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<import("@coderline/alphatab").AlphaTabApi | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false; // StrictMode/재렌더로 effect가 두 번 도는 것을 방어
    let localApi: import("@coderline/alphatab").AlphaTabApi | null = null;

    (async () => {
      if (!containerRef.current) return;
      const alphaTab = await import("@coderline/alphatab");
      await ensureAlphaTabMainInitialized(alphaTab);

      // await 도중 컴포넌트가 이미 unmount/재실행 되었다면 여기서 중단
      if (cancelled || !containerRef.current) return;

      const settings: import("@coderline/alphatab").json.SettingsJson = {
        core: {
          fontDirectory: `${BASE_PATH}/alphatab/font/`,
          scriptFile: `${BASE_PATH}/alphatab/alphaTab.worker.mjs`,
          tex: true,
          logLevel: "debug", // 콘솔에서 alphaTab 내부 로그 확인 가능
        },
        player: {
          enablePlayer: true,
          enableCursor: true,
          enableUserInteraction: true,
          soundFont: `${BASE_PATH}/alphatab/soundfont/sonivox.sf2`,
          scrollElement: containerRef.current,
        },
      };

      const api = new alphaTab.AlphaTabApi(containerRef.current, settings);
      localApi = api;
      apiRef.current = api;

      api.error.on((e) => {
        console.error("[alphaTab] error", e);
        setError(`알파탭 오류: ${JSON.stringify(e)}`);
      });
      api.renderStarted.on(() => console.log("[alphaTab] render started"));
      api.renderFinished.on(() => {
        console.log("[alphaTab] render finished");
        setIsRendered(true);
      });
      api.soundFontLoaded.on(() => console.log("[alphaTab] soundfont loaded"));
      api.playerReady.on(() => {
        console.log("[alphaTab] player ready");
        setIsReady(true);
      });
      api.playerStateChanged.on((e) => setIsPlaying(e.state === 1));

      api.tex(alphaTex);
    })();

    return () => {
      cancelled = true;
      localApi?.destroy();
      if (apiRef.current === localApi) apiRef.current = null;
    };
  }, [alphaTex]);

  const handlePlayPause = () => {
    apiRef.current?.playPause();
  };

  const handleStop = () => {
    apiRef.current?.stop();
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={handlePlayPause}
          disabled={!isReady}
          className="px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-orange-700 transition-colors"
        >
          {isPlaying ? "⏸ 일시정지" : "▶ 재생"}
        </button>
        <button
          onClick={handleStop}
          disabled={!isReady}
          className="px-4 py-2 rounded-md bg-neutral-700 text-white text-sm font-medium disabled:opacity-40 hover:bg-neutral-600 transition-colors"
        >
          ⏹ 정지
        </button>
        {!isReady && !error && (
          <span className="text-sm text-neutral-400">
            사운드 로딩 중{isRendered ? " (악보는 렌더링됨)" : ""}...
          </span>
        )}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
      <div
        ref={containerRef}
        className="w-full min-h-[120px] overflow-x-auto bg-white rounded-lg p-2"
      />
    </div>
  );
}

