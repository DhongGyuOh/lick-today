import { interpolate, useCurrentFrame } from "remotion";

interface CaptionsProps {
  progress: number;
}

/**
 * Caption segments with their start/end times in seconds
 * Based on the provided narration script
 */
const CAPTION_SEGMENTS: Array<{
  start: number;
  end: number;
  text: string;
}> = [
  { start: 0.0, end: 4.5, text: "매일 새로운 기타 프레이즈를 연습하고 싶다면, Lick Today를 만나보세요." },
  { start: 4.5, end: 9.0, text: "Lick Today는 하루에 하나씩 새로운 기타 릭을 소개하는 웹사이트입니다." },
  { start: 9.0, end: 13.5, text: "오늘의 릭을 탭 악보로 확인하고, 브라우저에서 바로 재생하며 소리를 들어볼 수 있습니다." },
  { start: 13.5, end: 18.0, text: "천천히 악보를 따라 연습하고, 마음에 드는 프레이즈는 반복해서 익혀보세요." },
  { start: 18.0, end: 23.5, text: "짧은 릭 하나하나가 쌓이면, 어느새 나만의 기타 어휘와 즉흥 연주 아이디어도 자연스럽게 늘어납니다." },
  { start: 23.5, end: 27.0, text: "매일 단 몇 분이면 충분합니다." },
  { start: 27.0, end: 31.5, text: "오늘의 한 프레이즈가, 내일의 더 나은 연주로 이어집니다." },
  { start: 31.5, end: 34.5, text: "Lick Today." },
  { start: 34.5, end: 41.3, text: "매일 하나의 릭으로, 기타 실력을 조금씩 쌓아보세요." },
];

export default function Captions({ progress }: CaptionsProps) {
  const frame = useCurrentFrame();
  const fps = 30;
  const currentTime = frame / fps;

  // Find active caption
  const activeCaption = CAPTION_SEGMENTS.find(
    (seg) => currentTime >= seg.start && currentTime < seg.end
  );

  if (!activeCaption) {
    return null;
  }

  // Fade in/out animation
  const captionProgress = (currentTime - activeCaption.start) / (activeCaption.end - activeCaption.start);
  const opacity = interpolate(captionProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yOffset = interpolate(captionProgress, [0, 0.1, 0.9, 1], [20, 0, 0, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: "120px",
        left: "50%",
        transform: `translateX(-50%) translateY(${yOffset}px)`,
        opacity,
        textAlign: "center",
        pointerEvents: "none",
        zIndex: 100,
        maxWidth: "85%",
        padding: "0 40px",
      }}
    >
      <div
        style={{
          fontSize: "42px",
          fontWeight: 600,
          color: "#ffffff",
          lineHeight: 1.3,
          textShadow: "0 4px 24px rgba(0, 0, 0, 0.8), 0 0 2px rgba(0, 0, 0, 0.9)",
          letterSpacing: "-0.01em",
        }}
      >
        {activeCaption.text}
      </div>
    </div>
  );
}