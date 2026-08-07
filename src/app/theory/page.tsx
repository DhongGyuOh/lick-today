import Link from "next/link";

export default function TheoryPage() {
  const circlePositions = [
    { major: "C", minor: "Am", mx: 260, my: 42, ix: 260, iy: 92, sig: "♮" },
    { major: "G", minor: "Em", mx: 369, my: 71.2, ix: 344, iy: 114.5, sig: "1♯" },
    { major: "D", minor: "Bm", mx: 448.8, my: 151, ix: 405.5, iy: 176, sig: "2♯" },
    { major: "A", minor: "F♯m", mx: 478, my: 260, ix: 428, iy: 260, sig: "3♯" },
    { major: "E", minor: "C♯m", mx: 448.8, my: 369, ix: 405.5, iy: 344, sig: "4♯" },
    { major: "B", minor: "G♯m", mx: 369, my: 448.8, ix: 344, iy: 405.5, sig: "5♯" },
    { major: "F♯/G♭", minor: "D♯m", mx: 260, my: 478, ix: 260, iy: 428, sig: "6♯/6♭" },
    { major: "D♭", minor: "B♭m", mx: 151, my: 448.8, ix: 176, iy: 405.5, sig: "5♭" },
    { major: "A♭", minor: "Fm", mx: 71.2, my: 369, ix: 114.5, iy: 344, sig: "4♭" },
    { major: "E♭", minor: "Cm", mx: 42, my: 260, ix: 92, iy: 260, sig: "3♭" },
    { major: "B♭", minor: "Gm", mx: 71.2, my: 151, ix: 114.5, iy: 176, sig: "2♭" },
    { major: "F", minor: "Dm", mx: 151, my: 71.2, ix: 176, iy: 114.5, sig: "1♭" },
  ];

  const fretShapes = [
    {
      name: "C",
      root: "루트 · 5번줄 3프렛",
      notes: [
        { s: 1, f: 3, root: true },
        { s: 2, f: 2 },
        { s: 3, f: 0 },
        { s: 4, f: 1 },
        { s: 5, f: 0 },
      ],
      muted: [0],
    },
    {
      name: "A",
      root: "루트 · 5번줄 개방",
      notes: [
        { s: 1, f: 0, root: true },
        { s: 2, f: 2 },
        { s: 3, f: 2 },
        { s: 4, f: 2 },
        { s: 5, f: 0 },
      ],
      muted: [0],
    },
    {
      name: "G",
      root: "루트 · 6번줄 3프렛",
      notes: [
        { s: 0, f: 3, root: true },
        { s: 1, f: 0 },
        { s: 2, f: 0 },
        { s: 3, f: 0 },
        { s: 4, f: 0 },
        { s: 5, f: 3 },
      ],
      muted: [],
    },
    {
      name: "E",
      root: "루트 · 6번줄 개방",
      notes: [
        { s: 0, f: 0, root: true },
        { s: 1, f: 2 },
        { s: 2, f: 2 },
        { s: 3, f: 1 },
        { s: 4, f: 0 },
        { s: 5, f: 0 },
      ],
      muted: [],
    },
    {
      name: "D",
      root: "루트 · 4번줄 개방",
      notes: [
        { s: 2, f: 0, root: true },
        { s: 3, f: 2 },
        { s: 4, f: 3 },
        { s: 5, f: 2 },
      ],
      muted: [0, 1],
    },
  ];

  const steps = [
    { n: 1, emoji: "🎯", title: "루트 음 찾기", desc: "코드의 기본. 지판 위에서 루트를 자유롭게 찾기" },
    { n: 2, emoji: "🥉", title: "3도 구분하기", desc: "장3도(메이저)·단3도(마이너)를 소리로 구분" },
    { n: 3, emoji: "🦴", title: "5도 더하기", desc: "루트와 5도로 코드의 뼈대 만들기" },
    { n: 4, emoji: "↕️", title: "옥타브 (8도)", desc: "한 옥타브 위 루트를 찾아 음역대 넓히기" },
    { n: 5, emoji: "✋", title: "코드 전체 모양", desc: "CAGED 형태로 코드 전체를 한 번에 파악" },
    { n: 6, emoji: "➕", title: "7도 추가", desc: "메이저7·도미넌트7·마이너7 구분" },
    { n: 7, emoji: "6️⃣", title: "6도 확장", desc: "6th 코드와 7th 코드의 차이 이해" },
    { n: 8, emoji: "✨", title: "텐션 (9·11·13)", desc: "코드 위의 컬러 톤으로 세련된 사운드" },
    { n: 9, emoji: "🔗", title: "스케일과 연결", desc: "코드톤이 속한 스케일을 찾아 즉흥 연주로" },
    { n: 10, emoji: "🎸", title: "실전 적용", desc: "실제 곡의 코드 진행 위에서 연주하기" },
  ];

  const sections = [
    { id: "interval", title: "1. 음정 (Interval)", emoji: "🎵" },
    { id: "chord-tone", title: "2. 코드톤 (Chord Tone)", emoji: "🎹" },
    { id: "power-chord", title: "3. 파워코드", emoji: "⚡" },
    { id: "major-diatonic", title: "4. 메이저 스케일과 다이아토닉 코드", emoji: "🎼" },
    { id: "function", title: "5. 기능화성", emoji: "🏠" },
    { id: "substitute", title: "6. 기능 계열과 대리코드", emoji: "🔄" },
    { id: "progressions", title: "7. 대표적인 코드 진행", emoji: "➡️" },
    { id: "dominant", title: "8. 도미넌트와 도미넌트7", emoji: "💥" },
    { id: "tension", title: "9. 긴장과 해결", emoji: "🌊" },
    { id: "relative", title: "10. 나란한조 (Relative Key)", emoji: "🔗" },
    { id: "circle", title: "11. 5도권 (Circle of Fifths)", emoji: "⭕" },
    { id: "harmonic-minor", title: "12. 하모닉 마이너", emoji: "🎭" },
    { id: "minor-251", title: "13. 마이너 ii-V-i", emoji: "🌙" },
    { id: "caged", title: "14. CAGED 시스템", emoji: "🔤" },
    { id: "learning-order", title: "15. 코드톤 학습 순서", emoji: "📚" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">기타 음악이론</h1>
        <p className="text-neutral-400">
          초보자를 위한 체계적인 음악이론 학습 가이드
        </p>
      </div>

      {/* 목차 */}
      <div className="mb-12 p-6 rounded-xl border border-neutral-800 bg-neutral-900">
        <h2 className="text-xl font-bold mb-4">📖 목차</h2>
        <div className="grid gap-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <span className="text-2xl">{section.emoji}</span>
              <span className="text-neutral-300 hover:text-white">
                {section.title}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* 1. 음정 */}
      <section id="interval" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">🎵 1. 음정 (Interval)</h2>
        <p className="text-neutral-400 mb-6">
          음정은 두 음 사이의 거리를 나타냅니다. 도수로 표현하며, 모든 음악이론의 기초가 됩니다.
        </p>

        <div className="mb-6 p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <h3 className="text-lg font-semibold mb-4">도수 개념</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { degree: "1", name: "완전1도 (Perfect Unison)" },
              { degree: "♭2", name: "단2도 (Minor 2nd)" },
              { degree: "2", name: "장2도 (Major 2nd)" },
              { degree: "♭3", name: "단3도 (Minor 3rd)" },
              { degree: "3", name: "장3도 (Major 3rd)" },
              { degree: "4", name: "완전4도 (Perfect 4th)" },
              { degree: "♭5", name: "감5도 (Diminished 5th)" },
              { degree: "5", name: "완전5도 (Perfect 5th)" },
              { degree: "♭6", name: "단6도 (Minor 6th)" },
              { degree: "6", name: "장6도 (Major 6th)" },
              { degree: "♭7", name: "단7도 (Minor 7th)" },
              { degree: "7", name: "장7도 (Major 7th)" },
            ].map((interval) => (
              <div
                key={interval.degree}
                className="p-3 rounded-lg border border-neutral-700 bg-neutral-800/50"
              >
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {interval.degree}
                </div>
                <div className="text-xs text-neutral-400">{interval.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-blue-800/50 bg-blue-900/20">
          <h3 className="text-lg font-semibold mb-3">C 기준 예시</h3>
          <div className="flex flex-wrap gap-2">
            {["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"].map(
              (note, i) => (
                <span
                  key={note}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-mono"
                >
                  {note}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* 2. 코드톤 */}
      <section id="chord-tone" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">🎹 2. 코드톤 (Chord Tone)</h2>
        <p className="text-neutral-400 mb-6">
          코드톤은 코드를 구성하는 음들입니다. 코드톤을 이용하면 멜로디가 코드와 자연스럽게 어울립니다.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-xl border border-green-800/50 bg-green-900/20">
            <h3 className="font-semibold mb-3 text-green-300">트라이어드</h3>
            <div className="text-3xl font-bold mb-2">1 - 3 - 5</div>
            <p className="text-sm text-neutral-400">
              3개 음으로 구성된 기본 코드
            </p>
            <div className="mt-3 text-sm">
              <div className="text-neutral-300">예: C 코드</div>
              <div className="text-green-400 font-mono">C - E - G</div>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-purple-800/50 bg-purple-900/20">
            <h3 className="font-semibold mb-3 text-purple-300">7th 코드</h3>
            <div className="text-3xl font-bold mb-2">1 - 3 - 5 - 7</div>
            <p className="text-sm text-neutral-400">
              7도를 추가한 세련된 코드
            </p>
            <div className="mt-3 text-sm">
              <div className="text-neutral-300">예: CMaj7</div>
              <div className="text-purple-400 font-mono">C - E - G - B</div>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-orange-800/50 bg-orange-900/20">
            <h3 className="font-semibold mb-3 text-orange-300">도미넌트7</h3>
            <div className="text-3xl font-bold mb-2">1 - 3 - 5 - ♭7</div>
            <p className="text-sm text-neutral-400">
              강한 해결감을 주는 코드
            </p>
            <div className="mt-3 text-sm">
              <div className="text-neutral-300">예: G7</div>
              <div className="text-orange-400 font-mono">G - B - D - F</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <h3 className="font-semibold mb-3">💡 코드톤을 이용한 솔로</h3>
          <p className="text-neutral-400 text-sm">
            솔로를 연주할 때 각 코드의 코드톤을 강조하면 멜로디가 코드 진행과 완벽하게 어울립니다.
            특히 박자의 강박에 코드톤을 배치하면 안정적이고 음악적인 프레이즈를 만들 수 있습니다.
          </p>
        </div>
      </section>

      {/* 3. 파워코드 */}
      <section id="power-chord" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">⚡ 3. 파워코드</h2>
        
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900 mb-6">
          <h3 className="font-semibold mb-3">구성음</h3>
          <div className="text-4xl font-bold mb-3 text-yellow-400">
            1 - 5 - (8)
          </div>
          <p className="text-neutral-400 text-sm">
            루트(1도)와 5도만으로 구성. 옥타브(8도)는 선택적으로 추가
          </p>
        </div>

        <div className="p-5 rounded-xl border border-yellow-800/50 bg-yellow-900/20">
          <h3 className="font-semibold mb-3 text-yellow-300">
            ⭐ 파워코드의 특징
          </h3>
          <p className="text-neutral-300 mb-3">
            <strong>3도가 없어 메이저/마이너가 결정되지 않습니다</strong>
          </p>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li>• 록 음악에서 디스토션과 함께 자주 사용</li>
            <li>• 중립적인 사운드로 다양한 상황에 활용</li>
            <li>• 기타 지판에서 이동이 쉬움</li>
          </ul>
          <div className="mt-4 text-sm">
            <div className="text-neutral-300 mb-1">예: C5 (C 파워코드)</div>
            <div className="text-yellow-400 font-mono">C - G - C</div>
          </div>
        </div>
      </section>

      {/* 4. 메이저 스케일과 다이아토닉 코드 */}
      <section id="major-diatonic" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">
          🎼 4. 메이저 스케일과 다이아토닉 코드
        </h2>
        
        <div className="mb-6 p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <h3 className="font-semibold mb-3">C 메이저 스케일</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            {["C", "D", "E", "F", "G", "A", "B"].map((note, i) => (
              <div key={note} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-300 font-bold mb-1">
                  {note}
                </div>
                <div className="text-xs text-neutral-500">{i + 1}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-neutral-400">
            전음-전음-반음-전음-전음-전음-반음 간격으로 구성
          </p>
        </div>

        <div className="p-5 rounded-xl border border-purple-800/50 bg-purple-900/20">
          <h3 className="font-semibold mb-4 text-purple-300">
            C Major 다이아토닉 코드
          </h3>
          <div className="grid gap-3">
            {[
              { roman: "I", chord: "C", type: "Major" },
              { roman: "ii", chord: "Dm", type: "minor" },
              { roman: "iii", chord: "Em", type: "minor" },
              { roman: "IV", chord: "F", type: "Major" },
              { roman: "V", chord: "G", type: "Major" },
              { roman: "vi", chord: "Am", type: "minor" },
              { roman: "vii°", chord: "Bdim", type: "diminished" },
            ].map((item) => (
              <div
                key={item.roman}
                className="flex items-center gap-4 p-3 rounded-lg bg-neutral-800/50"
              >
                <div className="w-16 text-center text-xl font-bold text-purple-400">
                  {item.roman}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{item.chord}</div>
                  <div className="text-xs text-neutral-500">{item.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 기능화성 */}
      <section id="function" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">🏠 5. 기능화성</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-green-800/50 bg-green-900/20">
            <div className="text-3xl mb-2">🏠</div>
            <h3 className="font-semibold mb-2 text-green-300">토닉 (Tonic)</h3>
            <div className="text-2xl font-bold mb-3">I</div>
            <p className="text-sm text-neutral-400">
              안정 · 집 · 휴식의 느낌
            </p>
          </div>

          <div className="p-5 rounded-xl border border-blue-800/50 bg-blue-900/20">
            <div className="text-3xl mb-2">🚶</div>
            <h3 className="font-semibold mb-2 text-blue-300">
              서브도미넌트 (Subdominant)
            </h3>
            <div className="text-2xl font-bold mb-3">IV</div>
            <p className="text-sm text-neutral-400">
              긴장으로 이동 · 집 밖
            </p>
          </div>

          <div className="p-5 rounded-xl border border-red-800/50 bg-red-900/20">
            <div className="text-3xl mb-2">💥</div>
            <h3 className="font-semibold mb-2 text-red-300">
              도미넌트 (Dominant)
            </h3>
            <div className="text-2xl font-bold mb-3">V</div>
            <p className="text-sm text-neutral-400">
              가장 강한 긴장 · 해결 요구
            </p>
          </div>
        </div>
      </section>

      {/* 6. 기능 계열과 대리코드 */}
      <section id="substitute" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">🔄 6. 기능 계열과 대리코드</h2>
        <p className="text-neutral-400 mb-6">
          각 기능에는 여러 코드가 속합니다. 같은 기능에 속한 코드는 서로
          <strong className="text-neutral-200"> 대리코드(Substitute)</strong>로 대신할 수 있습니다.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-xl border border-green-800/50 bg-green-900/20">
            <div className="text-3xl mb-2">🏠</div>
            <h3 className="font-semibold mb-2 text-green-300">토닉 계열</h3>
            <div className="text-2xl font-bold mb-3 text-green-400">I · iii · vi</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {["C", "Em", "Am"].map((c) => (
                <span
                  key={c}
                  className="px-2 py-1 rounded bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-mono"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="text-sm text-neutral-400">안정과 휴식의 기능 · iii, vi가 I를 대신</p>
          </div>

          <div className="p-5 rounded-xl border border-blue-800/50 bg-blue-900/20">
            <div className="text-3xl mb-2">🚶</div>
            <h3 className="font-semibold mb-2 text-blue-300">서브도미넌트 계열</h3>
            <div className="text-2xl font-bold mb-3 text-blue-400">ii · IV</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {["Dm", "F"].map((c) => (
                <span
                  key={c}
                  className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-mono"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="text-sm text-neutral-400">집 밖으로 이동 · ii가 IV를 대신</p>
          </div>

          <div className="p-5 rounded-xl border border-red-800/50 bg-red-900/20">
            <div className="text-3xl mb-2">💥</div>
            <h3 className="font-semibold mb-2 text-red-300">도미넌트 계열</h3>
            <div className="text-2xl font-bold mb-3 text-red-400">V · vii°</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {["G", "Bdim"].map((c) => (
                <span
                  key={c}
                  className="px-2 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-mono"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="text-sm text-neutral-400">긴장과 해결 요구 · vii°가 V를 대신</p>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <h3 className="font-semibold mb-4">🔍 대리가 가능한 이유: 공통음</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-neutral-800/50">
              <div className="text-green-400 font-bold mb-2">토닉 기준 C</div>
              <div className="font-mono text-neutral-300 mb-1">
                C → Em &nbsp;<span className="text-neutral-500">공통음: E·G</span>
              </div>
              <div className="font-mono text-neutral-300">
                C → Am &nbsp;<span className="text-neutral-500">공통음: C·E</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-800/50">
              <div className="text-blue-400 font-bold mb-2">서브도미넌트 기준 F</div>
              <div className="font-mono text-neutral-300">
                F → Dm &nbsp;<span className="text-neutral-500">공통음: F·A</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-800/50">
              <div className="text-red-400 font-bold mb-2">도미넌트 기준 G</div>
              <div className="font-mono text-neutral-300">
                G → Bdim &nbsp;<span className="text-neutral-500">공통음: B·D</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 대표적인 코드 진행 */}
      <section id="progressions" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">➡️ 7. 대표적인 코드 진행</h2>
        <p className="text-neutral-400 mb-6">
          실제 곡에서 가장 자주 등장하는 세 가지 진행입니다. 소리로 익숙해지면 코드의 흐름이 보입니다.
        </p>

        <div className="mb-4 p-5 rounded-xl border border-blue-800/50 bg-blue-900/20">
          <h3 className="font-semibold mb-1 text-blue-300">IV - V - I</h3>
          <div className="text-xs text-neutral-500 mb-4">기본 회귀 진행 · 가장 안정적인 마무리</div>
          <div className="flex flex-wrap items-center gap-2">
            {["F", "G", "C"].map((chord, i) => (
              <span key={chord} className="flex items-center gap-2">
                {i > 0 && <span className="text-blue-400 font-bold">→</span>}
                <span className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-200 font-mono font-bold">
                  {chord}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4 p-5 rounded-xl border border-purple-800/50 bg-purple-900/20">
          <h3 className="font-semibold mb-1 text-purple-300">ii - V - I</h3>
          <div className="text-xs text-neutral-500 mb-4">재즈와 보사노바의 기본 진행</div>
          <div className="flex flex-wrap items-center gap-2">
            {["Dm", "G", "C"].map((chord, i) => (
              <span key={chord} className="flex items-center gap-2">
                {i > 0 && <span className="text-purple-400 font-bold">→</span>}
                <span className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-200 font-mono font-bold">
                  {chord}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-red-800/50 bg-red-900/20">
          <h3 className="font-semibold mb-1 text-red-300">iiø - V7 - i</h3>
          <div className="text-xs text-neutral-500 mb-4">마이너 키의 기본 진행</div>
          <div className="flex flex-wrap items-center gap-2">
            {["Bm7♭5", "E7", "Am"].map((chord, i) => (
              <span key={chord} className="flex items-center gap-2">
                {i > 0 && <span className="text-red-400 font-bold">→</span>}
                <span className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 font-mono font-bold">
                  {chord}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 도미넌트와 도미넌트7 */}
      <section id="dominant" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">💥 8. 도미넌트와 도미넌트7</h2>
        <p className="text-neutral-400 mb-6">
          도미넌트(V)는 음악에 긴장감을 만들고 토닉(I)으로 해결되기를 요구하는 코드입니다.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-xl border border-orange-800/50 bg-orange-900/20">
            <h3 className="font-semibold mb-2 text-orange-300">V 코드 (트라이어드)</h3>
            <div className="text-2xl font-bold mb-1">G</div>
            <div className="text-orange-400 font-mono mb-3">G - B - D</div>
            <p className="text-sm text-neutral-400">
              이미 긴장감이 있지만 토닉으로 향하는 힘은 약한 편
            </p>
          </div>
          <div className="p-5 rounded-xl border border-red-800/50 bg-red-900/20">
            <h3 className="font-semibold mb-2 text-red-300">V7 코드 (도미넌트7)</h3>
            <div className="text-2xl font-bold mb-1">G7</div>
            <div className="text-red-400 font-mono mb-3">
              G - B - D - <span className="text-yellow-300 font-bold">F (♭7)</span>
            </div>
            <p className="text-sm text-neutral-400">
              ♭7이 추가되어 토닉으로 강하게 끌어당깁니다
            </p>
          </div>
        </div>

        <div className="mb-6 p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <h3 className="font-semibold mb-4">🎯 G7 → C 해결 동작 (가이드 톤)</h3>
          <svg viewBox="0 0 460 180" className="w-full max-w-xl mx-auto">
            <defs>
              <marker
                id="arrowOrange"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
              </marker>
            </defs>
            <text x="230" y="24" textAnchor="middle" fill="#a3a3a3" fontSize="13">
              V7 → I
            </text>

            {/* B → C (위로 반음) */}
            <circle cx="100" cy="60" r="26" fill="#f97316/20" stroke="#f97316" strokeWidth="2" />
            <text x="100" y="67" textAnchor="middle" fill="#fdba74" fontSize="20" fontWeight="bold">
              B
            </text>
            <text x="100" y="112" textAnchor="middle" fill="#a3a3a3" fontSize="12">
              3rd
            </text>
            <line
              x1="130"
              y1="60"
              x2="195"
              y2="60"
              stroke="#f97316"
              strokeWidth="3"
              markerEnd="url(#arrowOrange)"
            />
            <circle cx="240" cy="60" r="26" fill="#22c55e/20" stroke="#22c55e" strokeWidth="2" />
            <text x="240" y="67" textAnchor="middle" fill="#86efac" fontSize="20" fontWeight="bold">
              C
            </text>
            <text x="240" y="112" textAnchor="middle" fill="#a3a3a3" fontSize="12">
              1 · 위로 반음
            </text>

            {/* F → E (아래로 반음) */}
            <circle cx="100" cy="130" r="26" fill="#f97316/20" stroke="#f97316" strokeWidth="2" />
            <text x="100" y="137" textAnchor="middle" fill="#fdba74" fontSize="20" fontWeight="bold">
              F
            </text>
            <text x="100" y="167" textAnchor="middle" fill="#a3a3a3" fontSize="12">
              ♭7
            </text>
            <line
              x1="130"
              y1="130"
              x2="195"
              y2="130"
              stroke="#f97316"
              strokeWidth="3"
              markerEnd="url(#arrowOrange)"
            />
            <circle cx="240" cy="130" r="26" fill="#22c55e/20" stroke="#22c55e" strokeWidth="2" />
            <text x="240" y="137" textAnchor="middle" fill="#86efac" fontSize="20" fontWeight="bold">
              E
            </text>
            <text x="240" y="167" textAnchor="middle" fill="#a3a3a3" fontSize="12">
              3 · 아래로 반음
            </text>
          </svg>
        </div>

        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <h3 className="font-semibold mb-3">💡 왜 ♭7이 중요한가?</h3>
          <p className="text-sm text-neutral-400 mb-3">
            V7의 두 음(3rd와 ♭7)이 각각 반음 위·아래로 토닉 코드의 음으로 해결됩니다.
            이 <strong className="text-neutral-200">가이드 톤</strong>이 바로 도미넌트가 가진
            강한 해결력을 만듭니다.
          </p>
          <div className="text-xs text-neutral-500 font-mono">
            B(3rd) → C(1) &nbsp;·&nbsp; F(♭7) → E(3)
          </div>
        </div>
      </section>

      {/* 9. 긴장과 해결 */}
      <section id="tension" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">🌊 9. 긴장과 해결</h2>
        <p className="text-neutral-400 mb-6">
          코드 기능은 긴장의 크기로 이해할 수 있습니다. 음악은 긴장이 쌓이고 풀리면서 흐름을 만듭니다.
        </p>

        <div className="mb-6 p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <h3 className="font-semibold mb-4">긴장 곡선</h3>
          <svg viewBox="0 0 500 240" className="w-full max-w-2xl mx-auto">
            <line x1="50" y1="210" x2="470" y2="210" stroke="#404040" strokeWidth="2" />
            <polyline
              points="70,185 165,125 255,80 345,45 450,185"
              fill="none"
              stroke="#f97316"
              strokeWidth="3"
            />
            {[
              { label: "I", emoji: "🏠", tag: "집", x: 70, y: 185, color: "#22c55e" },
              { label: "IV", emoji: "🚶", tag: "집밖", x: 165, y: 125, color: "#38bdf8" },
              { label: "V", emoji: "😰", tag: "긴장", x: 255, y: 80, color: "#fb923c" },
              { label: "V7", emoji: "💥", tag: "극대화", x: 345, y: 45, color: "#ef4444" },
              { label: "I", emoji: "🏡", tag: "귀환", x: 450, y: 185, color: "#22c55e" },
            ].map((p) => (
              <g key={p.label}>
                <circle cx={p.x} cy={p.y} r="7" fill={p.color} />
                <text x={p.x} y={p.y - 14} textAnchor="middle" fill="#a3a3a3" fontSize="13">
                  {p.emoji} {p.tag}
                </text>
                <text x={p.x} y="232" textAnchor="middle" fill={p.color} fontSize="15" fontWeight="bold">
                  {p.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl border border-green-800/50 bg-green-900/20 text-center">
            <div className="text-2xl mb-1">🏠</div>
            <div className="font-bold text-green-300 mb-1">I · 집</div>
            <p className="text-xs text-neutral-400">가장 안정적인 상태</p>
          </div>
          <div className="p-4 rounded-xl border border-blue-800/50 bg-blue-900/20 text-center">
            <div className="text-2xl mb-1">🚶</div>
            <div className="font-bold text-blue-300 mb-1">IV · 집밖</div>
            <p className="text-xs text-neutral-400">이동을 시작하는 긴장</p>
          </div>
          <div className="p-4 rounded-xl border border-orange-800/50 bg-orange-900/20 text-center">
            <div className="text-2xl mb-1">😰</div>
            <div className="font-bold text-orange-300 mb-1">V · 긴장</div>
            <p className="text-xs text-neutral-400">해결을 요구하는 불안정</p>
          </div>
          <div className="p-4 rounded-xl border border-red-800/50 bg-red-900/20 text-center">
            <div className="text-2xl mb-1">💥</div>
            <div className="font-bold text-red-300 mb-1">V7 · 극대화</div>
            <p className="text-xs text-neutral-400">♭7이 긴장을 최고조로</p>
          </div>
          <div className="p-4 rounded-xl border border-green-800/50 bg-green-900/20 text-center">
            <div className="text-2xl mb-1">🏡</div>
            <div className="font-bold text-green-300 mb-1">I · 귀환</div>
            <p className="text-xs text-neutral-400">모든 긴장이 해소</p>
          </div>
        </div>
      </section>

      {/* 10. 나란한조 */}
      <section id="relative" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">🔗 10. 나란한조 (Relative Key)</h2>
        <p className="text-neutral-400 mb-6">
          나란한조는 같은 조표(샵·플랫)를 공유하는 메이저와 마이너 키입니다.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-xl border border-blue-800/50 bg-blue-900/20 text-center">
            <h3 className="font-semibold mb-2 text-blue-300">C 메이저</h3>
            <div className="text-3xl font-bold mb-1">C Major</div>
            <div className="text-xs text-neutral-500 mb-3">조표: 없음 (♯ 0 · ♭ 0)</div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {["C", "D", "E", "F", "G", "A", "B"].map((n) => (
                <span
                  key={n}
                  className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-300 text-xs font-bold"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-xl border border-green-800/50 bg-green-900/20 text-center">
            <h3 className="font-semibold mb-2 text-green-300">A 마이너</h3>
            <div className="text-3xl font-bold mb-1">A minor</div>
            <div className="text-xs text-neutral-500 mb-3">조표: 없음 (♯ 0 · ♭ 0)</div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {["A", "B", "C", "D", "E", "F", "G"].map((n) => (
                <span
                  key={n}
                  className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-300 text-xs font-bold"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <h3 className="font-semibold mb-4">같은 음을 다른 순서로</h3>
          <svg viewBox="0 0 460 125" className="w-full max-w-2xl mx-auto">
            {["C", "D", "E", "F", "G", "A", "B"].map((n, i) => (
              <g key={n}>
                <circle cx={40 + i * 60} cy="45" r="22" fill="#3b82f6/15" stroke="#3b82f6" strokeWidth="1.5" />
                <text x={40 + i * 60} y="51" textAnchor="middle" fill="#93c5fd" fontSize="14" fontWeight="bold">
                  {n}
                </text>
              </g>
            ))}
            {["A", "B", "C", "D", "E", "F", "G"].map((n, i) => (
              <g key={n}>
                <circle cx={40 + i * 60} cy="98" r="22" fill="#22c55e/15" stroke="#22c55e" strokeWidth="1.5" />
                <text x={40 + i * 60} y="104" textAnchor="middle" fill="#86efac" fontSize="14" fontWeight="bold">
                  {n}
                </text>
              </g>
            ))}
          </svg>
          <p className="text-sm text-neutral-400 text-center mt-3">
            윗줄 C 메이저 → 아랫줄 A 마이너 · 6도(A)에서 시작하면 나란한 마이너가 됩니다
          </p>
        </div>

        <div className="p-5 rounded-xl border border-yellow-800/50 bg-yellow-900/20">
          <h3 className="font-semibold mb-2 text-yellow-300">⭐ 나란한조 찾는 법</h3>
          <p className="text-sm text-neutral-300 mb-3">
            메이저 키의 <strong>6도</strong>(토닉에서 단3도 아래)가 나란한 마이너의 토닉입니다.
          </p>
          <div className="font-mono text-yellow-400 text-sm">C → (단3도 아래) → A minor</div>
        </div>
      </section>

      {/* 11. 5도권 */}
      <section id="circle" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">⭕ 11. 5도권 (Circle of Fifths)</h2>
        <p className="text-neutral-400 mb-6">
          5도 간격으로 나열된 키의 순환. 조표와 코드 진행의 관계를 한눈에 보여줍니다.
        </p>

        <div className="mb-6 p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <svg viewBox="0 0 520 520" className="w-full max-w-lg mx-auto">
            <circle cx="260" cy="260" r="218" fill="none" stroke="#262626" strokeWidth="2" />
            <circle cx="260" cy="260" r="168" fill="none" stroke="#262626" strokeWidth="2" />
            {circlePositions.map((k) => (
              <line key={k.major} x1={k.mx} y1={k.my} x2={k.ix} y2={k.iy} stroke="#333333" strokeWidth="1" />
            ))}
            {circlePositions.map((k) => (
              <g key={k.major}>
                <circle cx={k.mx} cy={k.my} r="34" fill="#fb923c/15" stroke="#f97316" strokeWidth="2" />
                <text x={k.mx} y={k.my + 6} textAnchor="middle" fill="#fdba74" fontSize="15" fontWeight="bold">
                  {k.major}
                </text>
                <text x={k.mx} y={k.my + 22} textAnchor="middle" fill="#737373" fontSize="10.5">
                  {k.sig}
                </text>
                <circle cx={k.ix} cy={k.iy} r="24" fill="#60a5fa/15" stroke="#3b82f6" strokeWidth="1.5" />
                <text x={k.ix} y={k.iy + 5} textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="bold">
                  {k.minor}
                </text>
              </g>
            ))}
            <text x="260" y="252" textAnchor="middle" fill="#e5e5e5" fontSize="18" fontWeight="bold">
              5도권
            </text>
            <text x="260" y="275" textAnchor="middle" fill="#737373" fontSize="12">
              Circle of Fifths
            </text>
          </svg>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-orange-800/50 bg-orange-900/20">
            <h3 className="font-semibold mb-2 text-orange-300">시계 방향</h3>
            <div className="text-sm text-neutral-300 mb-2 font-mono">C → G → D → A …</div>
            <p className="text-sm text-neutral-400">5도씩 올라가고 샵(♯)이 하나씩 증가</p>
          </div>
          <div className="p-5 rounded-xl border border-blue-800/50 bg-blue-900/20">
            <h3 className="font-semibold mb-2 text-blue-300">반시계 방향</h3>
            <div className="text-sm text-neutral-300 mb-2 font-mono">C → F → B♭ → E♭ …</div>
            <p className="text-sm text-neutral-400">4도씩 올라가고 플랫(♭)이 하나씩 증가</p>
          </div>
          <div className="p-5 rounded-xl border border-purple-800/50 bg-purple-900/20">
            <h3 className="font-semibold mb-2 text-purple-300">실용 포인트</h3>
            <p className="text-sm text-neutral-400">
              인접한 두 키는 코드가 하나만 다릅니다. 5도권을 따라가면 자연스러운 코드 진행과
              전조가 가능합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 12. 하모닉 마이너 */}
      <section id="harmonic-minor" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">🎭 12. 하모닉 마이너</h2>
        <p className="text-neutral-400 mb-6">
          하모닉 마이너는 내추럴 마이너에서 7도를 반음 올린 스케일입니다.
        </p>

        <div className="mb-6 p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <h3 className="font-semibold mb-3">A 내추럴 마이너</h3>
          <div className="flex flex-wrap gap-2">
            {["A", "B", "C", "D", "E", "F", "G"].map((n, i) => (
              <div key={n} className="text-center">
                <div className="w-11 h-11 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-300 font-bold text-sm mb-1">
                  {n}
                </div>
                <div className="text-[10px] text-neutral-500">{i + 1}도</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 p-5 rounded-xl border border-red-800/50 bg-red-900/20">
          <h3 className="font-semibold mb-3 text-red-300">A 하모닉 마이너</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {["A", "B", "C", "D", "E", "F", "G♯"].map((n, i) => (
              <div key={n} className="text-center">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm mb-1 ${
                    i === 6
                      ? "bg-red-500/30 border border-red-400 text-red-300"
                      : "bg-blue-500/20 border border-blue-500/50 text-blue-300"
                  }`}
                >
                  {n}
                </div>
                <div className="text-[10px] text-neutral-500">{i + 1}도</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-neutral-400">
            <span className="text-red-300 font-bold">7도 (G → G♯)</span>가 반음 올라갔습니다.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-yellow-800/50 bg-yellow-900/20">
          <h3 className="font-semibold mb-2 text-yellow-300">⭐ 왜 7도를 올릴까?</h3>
          <p className="text-sm text-neutral-400 mb-3">
            마이너 키에서 V 코드를 메이저로 만들어 토닉으로 강하게 해결되게 하기 위해서입니다.
            올라간 7도(G♯)가 토닉(A)으로 반음 해결되는 이끔음이 됩니다.
          </p>
          <div className="font-mono text-yellow-400 text-sm">
            A minor → E7 (V7) → Am &nbsp;·&nbsp; G♯ → A 해결
          </div>
        </div>
      </section>

      {/* 13. 마이너 ii-V-i */}
      <section id="minor-251" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">🌙 13. 마이너 ii-V-i</h2>
        <p className="text-neutral-400 mb-6">
          마이너 키의 기본 진행. ii는 반감7(ø), V는 도미넌트7, i는 마이너로 구성됩니다.
        </p>

        <div className="mb-6 p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            {["Bm7♭5", "E7", "Am"].map((chord, i) => (
              <span key={chord} className="flex items-center gap-3">
                {i > 0 && <span className="text-red-400 font-bold text-xl">→</span>}
                <div className="text-center">
                  <div
                    className={`px-4 py-2 rounded-lg font-mono font-bold text-lg ${
                      i === 0
                        ? "bg-purple-500/20 border border-purple-500/40 text-purple-200"
                        : i === 1
                        ? "bg-red-500/20 border border-red-500/40 text-red-200"
                        : "bg-green-500/20 border border-green-500/40 text-green-200"
                    }`}
                  >
                    {chord}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">{["iiø", "V7", "i"][i]}</div>
                </div>
              </span>
            ))}
          </div>
          <p className="text-center text-sm text-neutral-400">
            A 마이너 키에서 &nbsp;iiø = Bm7♭5 · V7 = E7 · i = Am
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-xl border border-purple-800/50 bg-purple-900/20">
            <h3 className="font-semibold mb-2 text-purple-300">iiø · Bm7♭5</h3>
            <div className="text-purple-400 font-mono mb-2">B - D - F - A</div>
            <p className="text-sm text-neutral-400">감5도(♭5)가 긴장의 시작</p>
          </div>
          <div className="p-5 rounded-xl border border-red-800/50 bg-red-900/20">
            <h3 className="font-semibold mb-2 text-red-300">V7 · E7</h3>
            <div className="text-red-400 font-mono mb-2">E - G♯ - B - D</div>
            <p className="text-sm text-neutral-400">G♯이 Am으로 반음 해결</p>
          </div>
          <div className="p-5 rounded-xl border border-green-800/50 bg-green-900/20">
            <h3 className="font-semibold mb-2 text-green-300">i · Am</h3>
            <div className="text-green-400 font-mono mb-2">A - C - E</div>
            <p className="text-sm text-neutral-400">마이너 토닉 · 해결 지점</p>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-blue-800/50 bg-blue-900/20">
          <h3 className="font-semibold mb-3 text-blue-300">메이저 ii-V-I와 비교</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-neutral-400 text-left">
                  <th className="pb-2 pr-4 font-semibold">진행</th>
                  <th className="pb-2 pr-4 font-semibold">ii</th>
                  <th className="pb-2 pr-4 font-semibold">V</th>
                  <th className="pb-2 font-semibold">I</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                <tr className="border-t border-neutral-800">
                  <td className="py-2 pr-4 text-blue-300">메이저</td>
                  <td className="py-2 pr-4 font-mono">Dm7</td>
                  <td className="py-2 pr-4 font-mono">G7</td>
                  <td className="py-2 font-mono">Cmaj7</td>
                </tr>
                <tr className="border-t border-neutral-800">
                  <td className="py-2 pr-4 text-red-300">마이너</td>
                  <td className="py-2 pr-4 font-mono">Bm7♭5</td>
                  <td className="py-2 pr-4 font-mono">E7</td>
                  <td className="py-2 font-mono">Am</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 14. CAGED 시스템 */}
      <section id="caged" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">🔤 14. CAGED 시스템</h2>
        <p className="text-neutral-400 mb-6">
          기타 지판을 5개의 코드 모양(C·A·G·E·D)으로 나눠서 파악하는 방법.
          이 모양들을 이동시키면 모든 키의 코드를 연주할 수 있습니다.
        </p>

        <div className="mb-6 p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {fretShapes.map((shape) => (
              <div key={shape.name}>
                <div className="text-center font-bold text-lg mb-1">{shape.name}</div>
                <div className="text-center text-[10px] text-neutral-500 mb-2">{shape.root}</div>
                <svg viewBox="0 0 140 200" className="w-full">
                  {/* 너트 (왼쪽 세로선) */}
                  <line x1="20" y1="30" x2="20" y2="190" stroke="#a3a3a3" strokeWidth="4" />

                  {/* 프렛 와이어 (세로선 - 1~5프렛) */}
                  {[45, 70, 95, 120].map((x, i) => (
                    <line key={x} x1={x} y1="30" x2={x} y2="190" stroke="#525252" strokeWidth="1.5" />
                  ))}

                  {/* 6개 줄 (가로선 - E B G D A E) */}
                  {[0, 1, 2, 3, 4, 5].map((s) => (
                    <line
                      key={s}
                      x1="20"
                      y1={40 + s * 30}
                      x2="130"
                      y2={40 + s * 30}
                      stroke={s === 0 || s === 5 ? "#737373" : "#525252"}
                      strokeWidth={s === 0 || s === 5 ? 2 : 1.2}
                    />
                  ))}

                  {/* 프렛 번호 */}
                  {[1, 2, 3, 4].map((n, i) => (
                    <text key={n} x={32 + i * 25} y="20" textAnchor="middle" fill="#525252" fontSize="10">
                      {n}
                    </text>
                  ))}

                  {/* 줄 이름 */}
                  {["E", "B", "G", "D", "A", "E"].map((name, i) => (
                    <text key={`str${i}`} x="10" y={40 + i * 30 + 4} textAnchor="middle" fill="#737373" fontSize="9">
                      {name}
                    </text>
                  ))}

                  {/* 뮤트 표시 (X) */}
                  {shape.muted.map((stringNum) => (
                    <text
                      key={`m${stringNum}`}
                      x="10"
                      y={40 + stringNum * 30 + 4}
                      textAnchor="middle"
                      fill="#ef4444"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      ✕
                    </text>
                  ))}

                  {/* 코드톤 원 */}
                  {shape.notes.map((n, i) => {
                    const x = n.f === 0 ? 10 : 32 + (n.f - 1) * 25;
                    const y = 40 + n.s * 30;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={n.root ? 11 : 9}
                        fill={n.root ? "#f97316" : "#3b82f6"}
                        opacity="0.9"
                      />
                    );
                  })}
                </svg>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> 루트
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> 코드톤
            </span>
            <span className="text-neutral-500">✕ = 뮤트</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-yellow-800/50 bg-yellow-900/20">
          <h3 className="font-semibold mb-2 text-yellow-300">⭐ 활용법</h3>
          <p className="text-sm text-neutral-400 mb-3">
            배레(바레)로 모양을 옮기면 루트가 이동합니다. 예: E 모양을 1프렛으로 → F,
            A 모양을 3프렛으로 → C. 다섯 모양을 모두 익히면 지판 전체가 보입니다.
          </p>
          <div className="text-sm font-mono text-yellow-400">E(0) → F(1프렛) → G(3프렛) → A(5프렛)</div>
        </div>
      </section>

      {/* 15. 코드톤 학습 순서 */}
      <section id="learning-order" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">📚 15. 코드톤 학습 순서</h2>
        <p className="text-neutral-400 mb-6">
          코드를 소리로 이해하기 위한 10단계. 한 단계씩 차근차근 익혀보세요.
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900">
              <div className="w-10 h-10 shrink-0 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-bold text-orange-400">
                {s.n}
              </div>
              <div>
                <div className="font-semibold mb-1">
                  {s.emoji} {s.title}
                </div>
                <p className="text-sm text-neutral-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-5 rounded-xl border border-neutral-800 bg-neutral-900">
          <h3 className="font-semibold mb-2">💡 학습 팁</h3>
          <p className="text-sm text-neutral-400">
            1~5단계(코드의 뼈대)를 먼저 완벽히 익히고, 그 후 7도·텐션을 추가하세요.
            매일 5분씩 각 코드의 코드톤을 소리 내어 부르는 습관이 가장 효과적입니다.
          </p>
        </div>
      </section>
    </div>
  );
}
