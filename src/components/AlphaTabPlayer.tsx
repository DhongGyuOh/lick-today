"use client";

import { useEffect, useRef, useState } from "react";
import type { model } from "@coderline/alphatab";

interface Props {
  alphaTex: string;
}

interface TrackUiState {
  index: number;
  name: string;
  isPercussion: boolean;
  isMuted: boolean;
  isSolo: boolean;
  volume: number; // 0 ~ 1.5
}

// next.config.ts의 basePath와 동일한 값을 사용해 서브패스 배포에서도
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

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function AlphaTabPlayer({ alphaTex }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<import("@coderline/alphatab").AlphaTabApi | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0); // ms
  const [endTime, setEndTime] = useState(0); // ms
  const [tracks, setTracks] = useState<TrackUiState[]>([]);
  // 악보(표기)에 지금 어떤 트랙을 보여줄지: "all" = 전체, number = 해당 트랙 index만 단독 표시
  const [scoreView, setScoreView] = useState<"all" | number>("all");

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
      api.playerPositionChanged.on((e) => {
        setCurrentTime(e.currentTime);
        setEndTime(e.endTime);
      });
      // 악보(스코어)가 로드되면 실제 트랙 목록으로 믹서 패널을 구성.
      // 트랙이 1개뿐이면(드럼 없는 기존 릭) 패널 자체를 숨김.
      //
      // 주의: api.renderTracks(...)를 호출해서 "표시할 트랙"을 바꿀 때도 이 scoreLoaded
      // 이벤트가 다시 발생하는데, 그때 넘어오는 score.tracks는 "지금 화면에 그려진 트랙"만
      // 담고 있어서 이걸로 매번 다시 만들면 숨긴 트랙이 목록에서 통째로 사라져 버린다
      // (= 다시 켤 방법이 없어지는 버그의 원인). 그래서 최초 1회(진짜 새 곡 로드)만 목록을
      // 구성하고, renderTracks로 인한 재발생은 무시한다. mute/solo/volume 상태는 각 토글
      // 핸들러가 알아서 로컬 상태를 갱신하므로 이 이벤트에 의존할 필요가 없다.
      let hasLoadedInitialTracks = false;
      api.scoreLoaded.on((score) => {
        if (hasLoadedInitialTracks) return;
        hasLoadedInitialTracks = true;
        setTracks(
          score.tracks.map((t) => ({
            index: t.index,
            name: t.name || (t.isPercussion ? "Drums" : `Track ${t.index + 1}`),
            isPercussion: t.isPercussion,
            isMuted: t.playbackInfo.isMute,
            isSolo: t.playbackInfo.isSolo,
            volume: 1,
          }))
        );
        setScoreView("all");
      });

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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const api = apiRef.current;
    if (!api) return;
    const ms = Number(e.target.value);
    api.timePosition = ms;
    setCurrentTime(ms); // 슬라이더 조작 즉시 반영 (다음 tick에서 실제 값으로 다시 갱신됨)
  };

  const findTrack = (index: number): model.Track | undefined =>
    apiRef.current?.score?.tracks.find((t) => t.index === index);

  const toggleMute = (index: number) => {
    const api = apiRef.current;
    const track = findTrack(index);
    if (!api || !track) return;
    const next = !track.playbackInfo.isMute;
    api.changeTrackMute([track], next);
    setTracks((prev) =>
      prev.map((t) => (t.index === index ? { ...t, isMuted: next } : t))
    );
  };

  const toggleSolo = (index: number) => {
    const api = apiRef.current;
    const track = findTrack(index);
    if (!api || !track) return;
    const next = !track.playbackInfo.isSolo;
    api.changeTrackSolo([track], next);
    setTracks((prev) =>
      prev.map((t) => (t.index === index ? { ...t, isSolo: next } : t))
    );
  };

  const changeVolume = (index: number, volume: number) => {
    const api = apiRef.current;
    const track = findTrack(index);
    if (!api || !track) return;
    api.changeTrackVolume([track], volume);
    setTracks((prev) =>
      prev.map((t) => (t.index === index ? { ...t, volume } : t))
    );
  };

  // 악보(표기)를 특정 트랙 하나만 단독으로 보여주도록 전환합니다. "all"이면 전체 트랙을 다시 보여줍니다.
  // mute/solo/volume(재생)과는 완전히 별개 개념이라, 여기서 화면에 안 보이는 트랙도 재생에는
  // 그대로 포함됩니다(들리지만 악보에는 안 그려짐).
  const showTrackInScore = (target: "all" | number) => {
    const api = apiRef.current;
    const score = api?.score;
    if (!api || !score) return;

    setIsRendered(false); // 다시 그려지는 동안 잠깐 로딩 표시
    if (target === "all") {
      api.renderTracks(score.tracks);
    } else {
      const track = score.tracks.find((t) => t.index === target);
      if (!track) return;
      api.renderTracks([track]);
    }
    setScoreView(target);
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

      {isReady && (
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-neutral-400 w-10 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={endTime || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-orange-600 cursor-pointer"
          />
          <span className="text-xs text-neutral-400 w-10 tabular-nums">
            {formatTime(endTime)}
          </span>
        </div>
      )}

      {/* 트랙이 2개 이상(예: 기타 + 드럼)일 때만 믹서 패널 표시.
          트랙 이름을 누르면 그 트랙 악보만 단독으로 보여줌(선택된 트랙은 강조 표시). */}
      {isReady && tracks.length > 1 && (
        <div className="grid gap-2 mb-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">트랙을 선택하면 악보가 전환됩니다</span>
            {scoreView !== "all" && (
              <button
                onClick={() => showTrackInScore("all")}
                className="text-xs text-orange-400 hover:text-orange-300 font-medium"
              >
                전체 보기
              </button>
            )}
          </div>
          {tracks.map((t) => (
            <div key={t.index} className="flex items-center gap-3">
              <button
                onClick={() => showTrackInScore(t.index)}
                aria-pressed={scoreView === t.index}
                className={`flex items-center gap-1.5 w-28 shrink-0 text-left text-sm px-2 py-1 rounded transition-colors truncate ${
                  scoreView === t.index
                    ? "bg-orange-600 text-white"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                {t.isPercussion ? "🥁 " : "🎸 "}
                {t.name}
              </button>
              <button
                onClick={() => toggleMute(t.index)}
                aria-pressed={t.isMuted}
                className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                  t.isMuted
                    ? "bg-red-600 text-white"
                    : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                }`}
              >
                Mute
              </button>
              <button
                onClick={() => toggleSolo(t.index)}
                aria-pressed={t.isSolo}
                className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                  t.isSolo
                    ? "bg-green-600 text-white"
                    : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                }`}
              >
                Solo
              </button>
              <input
                type="range"
                min={0}
                max={1.5}
                step={0.05}
                value={t.volume}
                onChange={(e) => changeVolume(t.index, Number(e.target.value))}
                className="flex-1 accent-orange-600 cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full min-h-[120px] overflow-x-auto bg-white rounded-lg p-2"
      />
    </div>
  );
}