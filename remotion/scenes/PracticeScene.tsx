import { interpolate, spring, useCurrentFrame } from "remotion";

interface PracticeSceneProps {
  progress: number;
}

export default function PracticeScene({ progress }: PracticeSceneProps) {
  const frame = useCurrentFrame();

  // Tab staff animation
  const staffDraw = spring({
    frame: frame,
    fps: 30,
    config: { damping: 25, stiffness: 120 },
    from: 0,
    to: 1,
  });

  // Note entries staggered
  const noteEntries = Array.from({ length: 16 }, (_, i) =>
    spring({
      frame: frame - i * 3,
      fps: 30,
      config: { damping: 18, stiffness: 180 },
      from: 0,
      to: 1,
    })
  );

  // Playhead sweep
  const playheadPos = interpolate(frame, [0, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Speed control indicator
  const speedIndicator = Math.floor(interpolate(frame, [60, 120, 180], [0.5, 0.75, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * 100);

  return (
    <div style={{ position: "absolute", inset: 0, padding: "80px 120px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(249,115,22,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ color: "#f97316", fontSize: "20px", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "8px" }}>
          PRACTICE MODE
        </div>
        <div style={{ fontSize: "48px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>
          탭 악보로 천천히 연습
        </div>
      </div>

      {/* Main tab staff area */}
      <div style={{ position: "relative", width: "100%", maxWidth: "1200px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
        {/* Tab staff lines */}
        <div style={{ position: "relative", width: "100%", height: "240px" }}>
          {/* 6 strings */}
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${30 + i * 34}px`,
                left: "60px",
                right: "60px",
                height: "2px",
                background: i === 0 || i === 5 ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.1)",
                borderRadius: "1px",
              }}
            />
          ))}

          {/* String labels */}
          {["E", "B", "G", "D", "A", "E"].map((note, i) => (
            <div
              key={note}
              style={{
                position: "absolute",
                top: `${30 + i * 34 - 8}px`,
                left: "16px",
                color: "#888",
                fontSize: "16px",
                fontWeight: 600,
                fontFamily: "monospace",
              }}
            >
              {note}
            </div>
          ))}

          {/* Tab numbers (frets) - animated appearance */}
          {[
            { string: 0, frets: [null, null, 12, 12, 14, 14, 12, 12, null, null, 12, 12, 11, 11, 9, 9] }, // high E
            { string: 1, frets: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] }, // B
            { string: 2, frets: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] }, // G
            { string: 3, frets: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] }, // D
            { string: 4, frets: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] }, // A
            { string: 5, frets: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] }, // low E
          ].map(({ string, frets }) =>
            frets.map((fret, beat) =>
              fret !== null ? (
                <div
                  key={`${string}-${beat}`}
                  style={{
                    position: "absolute",
                    top: `${30 + string * 34 - 18}px`,
                    left: `${80 + beat * 68}px`,
                    opacity: noteEntries[string * 16 + beat] ? interpolate(noteEntries[string * 16 + beat], [0, 1], [0, 1]) : 0,
                    transform: noteEntries[string * 16 + beat] ? `translateY(${interpolate(noteEntries[string * 16 + beat], [0, 1], [20, 0])}px) scale(${interpolate(noteEntries[string * 16 + beat], [0, 1], [0.5, 1])})` : "scale(0.5)",
                    color: "#f97316",
                    fontSize: "22px",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    textAlign: "center",
                    width: "48px",
                    pointerEvents: "none",
                  }}
                >
                  {fret}
                </div>
              ) : null
            )
          )}

          {/* Playhead line */}
          <div
            style={{
              position: "absolute",
              top: "30px",
              bottom: "30px",
              left: `${80 + playheadPos * (1200 - 160)}px`,
              width: "3px",
              background: "#f97316",
              boxShadow: "0 0 12px rgba(249,115,22,0.8)",
              borderRadius: "2px",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-12px",
                left: "-6px",
                width: "15px",
                height: "15px",
                background: "#f97316",
                borderRadius: "50%",
                boxShadow: "0 0 16px rgba(249,115,22,0.9)",
              }}
            />
          </div>
        </div>

        {/* Control bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px", padding: "20px 32px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "16px", width: "100%", maxWidth: "1200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#ffffff" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #ea580c, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>▶</div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>재생 중</div>
              <div style={{ fontSize: "14px", color: "#a3a3a3" }}>스페이스바로 일시정지</div>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#d4d4d4" }}>
            <div style={{ fontSize: "16px" }}>속도: <span style={{ color: "#f97316", fontWeight: 700 }}>{speedIndicator}%</span></div>
            <div style={{ width: "120px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${speedIndicator}%`, height: "100%", background: "linear-gradient(90deg, #ea580c, #f97316)", borderRadius: "3px" }} />
            </div>
            <div style={{ fontSize: "14px", color: "#a3a3a3" }}>반복: 구간 지정</div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div style={{ marginTop: "32px", textAlign: "center", color: "#a3a3a3", fontSize: "20px" }}>
        마음에 드는 프레이즈는 <span style={{ color: "#f97316", fontWeight: 600 }}>구간 반복</span> 으로 익혀보세요
      </div>
    </div>
  );
}