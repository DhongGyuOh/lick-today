"use client";

import { useState, useCallback, Fragment } from "react";
import { KEYS, getScale, type KeyRoot } from "@/components/ScaleFretboard";

type QuestionType =
  | "scale-note"
  | "scale-degree"
  | "chord-tone"
  | "not-chord-tone"
  | "fretboard-note"
  | "fretboard-degree"
  | "fretboard-click"
  | "find-root";

interface Question {
  type: QuestionType;
  question: string;
  correctAnswer: string;
  options: string[];
  degree?: number;
  note?: string;
  fret?: number;
  string?: number;
  showFretboard?: boolean;
  highlightedFret?: number;
  highlightedString?: number;
}

const KEY_NAMES: Record<KeyRoot, string> = {
  C: "C", Db: "D♭", D: "D", Eb: "E♭", E: "E", F: "F",
  "F#": "F#", G: "G", Ab: "A♭", A: "A", Bb: "B♭", B: "B",
};

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const STRING_NOTES = [
  [4, 9, 2, 7, 11, 4], // 6번줄~1번줄 개방현 반음
];

const DIATONIC_CHORDS = ["Major", "minor", "minor", "Major", "Major", "minor", "dim"];
const DEGREE_NAMES = ["1", "2", "3", "4", "5", "6", "7"];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getNoteAtFret(string: number, fret: number): string {
  const openNotes = [4, 9, 2, 7, 11, 4]; // E A D G B E
  return CHROMATIC[(openNotes[string] + fret) % 12];
}

function generateQuestion(root: KeyRoot): Question {
  const scale = getScale(root, "major");
  const rand = Math.random();

  if (rand < 0.15) return generateScaleNoteQuestion(root, scale);
  if (rand < 0.30) return generateScaleDegreeQuestion(root, scale);
  if (rand < 0.45) return generateChordToneQuestion(root, scale);
  if (rand < 0.55) return generateNotChordToneQuestion(root, scale);
  if (rand < 0.65) return generateFretboardNoteQuestion(root, scale);
  if (rand < 0.75) return generateFretboardDegreeQuestion(root, scale);
  if (rand < 0.85) return generateFretboardClickQuestion(root, scale);
  return generateFindRootQuestion(root, scale);
}

function generateScaleNoteQuestion(root: KeyRoot, scale: string[]): Question {
  const degreeIndex = Math.floor(Math.random() * 7);
  const degree = degreeIndex + 1;
  const correctNote = scale[degreeIndex];
  const wrongNotes = shuffleArray(CHROMATIC.filter((n) => n !== correctNote)).slice(0, 3);
  return {
    type: "scale-note",
    question: `${KEY_NAMES[root]} 메이저 스케일의 ${degree}도 음은?`,
    correctAnswer: correctNote,
    options: shuffleArray([correctNote, ...wrongNotes]),
    degree,
    note: correctNote,
  };
}

function generateScaleDegreeQuestion(root: KeyRoot, scale: string[]): Question {
  const degreeIndex = Math.floor(Math.random() * 7);
  const degree = degreeIndex + 1;
  const note = scale[degreeIndex];
  const wrongDegrees = shuffleArray(["1", "2", "3", "4", "5", "6", "7"].filter((d) => d !== String(degree))).slice(0, 3);
  return {
    type: "scale-degree",
    question: `${KEY_NAMES[root]} 메이저 스케일에서 ${note}의 도수는?`,
    correctAnswer: String(degree),
    options: shuffleArray([String(degree), ...wrongDegrees]),
    degree,
    note,
  };
}

function generateChordToneQuestion(root: KeyRoot, scale: string[]): Question {
  const chordIndex = Math.floor(Math.random() * 7);
  const chordRoot = scale[chordIndex];
  const chordQuality = DIATONIC_CHORDS[chordIndex];
  const chordName = chordQuality === "dim" ? `${chordRoot}dim` : chordQuality === "minor" ? `${chordRoot}m` : chordRoot;

  const chordTones = [
    chordRoot,
    scale[(chordIndex + 2) % 7],
    scale[(chordIndex + 4) % 7],
  ];

  const toneIndex = Math.floor(Math.random() * 3);
  const correctTone = chordTones[toneIndex];
  const wrongNotes = shuffleArray(CHROMATIC.filter((n) => !chordTones.includes(n))).slice(0, 3);

  return {
    type: "chord-tone",
    question: `${chordName} 코드의 구성음 중 하나는?`,
    correctAnswer: correctTone,
    options: shuffleArray([correctTone, ...wrongNotes]),
  };
}

function generateNotChordToneQuestion(root: KeyRoot, scale: string[]): Question {
  const chordIndex = Math.floor(Math.random() * 7);
  const chordRoot = scale[chordIndex];
  const chordQuality = DIATONIC_CHORDS[chordIndex];
  const chordName = chordQuality === "dim" ? `${chordRoot}dim` : chordQuality === "minor" ? `${chordRoot}m` : chordRoot;

  const chordTones = [
    chordRoot,
    scale[(chordIndex + 2) % 7],
    scale[(chordIndex + 4) % 7],
  ];

  // 구성음이 아닌 음 선택
  const nonChordTones = CHROMATIC.filter((n) => !chordTones.includes(n));
  const correctAnswer = nonChordTones[Math.floor(Math.random() * nonChordTones.length)];

  // 3개의 구성음 + 1개의 비구성음
  const wrongOptions = shuffleArray(chordTones).slice(0, 3);

  return {
    type: "not-chord-tone",
    question: `${chordName} 코드의 구성음이 아닌 것은?`,
    correctAnswer,
    options: shuffleArray([correctAnswer, ...wrongOptions]),
  };
}

function generateFretboardNoteQuestion(root: KeyRoot, scale: string[]): Question {
  const string = Math.floor(Math.random() * 6);
  const fret = Math.floor(Math.random() * 24) + 1; // 1~24
  const note = getNoteAtFret(string, fret);
  const wrongNotes = shuffleArray(CHROMATIC.filter((n) => n !== note)).slice(0, 3);
  const stringNames = ["E", "A", "D", "G", "B", "e"];

  return {
    type: "fretboard-note",
    question: `${fret}번 프렛 ${stringNames[string]}줄의 음은?`,
    correctAnswer: note,
    options: shuffleArray([note, ...wrongNotes]),
    fret,
    string,
    showFretboard: true,
    highlightedFret: fret,
    highlightedString: string,
  };
}

function generateFretboardDegreeQuestion(root: KeyRoot, scale: string[]): Question {
  const scaleIndex = Math.floor(Math.random() * 7);
  const note = scale[scaleIndex];
  const degree = scaleIndex + 1;
  const stringNames = ["E", "A", "D", "G", "B", "e"];

  // 해당 음이 있는 프렛 찾기 (1~24)
  const positions: { string: number; fret: number }[] = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 1; f <= 24; f++) {
      if (getNoteAtFret(s, f) === note) {
        positions.push({ string: s, fret: f });
      }
    }
  }
  const pos = positions[Math.floor(Math.random() * positions.length)];

  const wrongDegrees = shuffleArray(["1", "2", "3", "4", "5", "6", "7"].filter((d) => d !== String(degree))).slice(0, 3);

  return {
    type: "fretboard-degree",
    question: `${pos.fret}번 프렛 ${stringNames[pos.string]}줄의 도수는?`,
    correctAnswer: String(degree),
    options: shuffleArray([String(degree), ...wrongDegrees]),
    fret: pos.fret,
    string: pos.string,
    showFretboard: true,
    highlightedFret: pos.fret,
    highlightedString: pos.string,
  };
}

function generateFretboardClickQuestion(root: KeyRoot, scale: string[]): Question {
  const scaleIndex = Math.floor(Math.random() * 7);
  const note = scale[scaleIndex];
  const degree = scaleIndex + 1;

  // 해당 음이 있는 모든 프렛 위치 (1~24)
  const positions: { string: number; fret: number }[] = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 1; f <= 24; f++) {
      if (getNoteAtFret(s, f) === note) {
        positions.push({ string: s, fret: f });
      }
    }
  }

  return {
    type: "fretboard-click",
    question: `${KEY_NAMES[root]} 메이저 스케일의 ${degree}도(${note})를 프렛보드에서 찾아주세요`,
    correctAnswer: `${positions[0].string}-${positions[0].fret}`,
    options: [],
    fret: positions[0].fret,
    string: positions[0].string,
    showFretboard: true,
  };
}

function generateFindRootQuestion(root: KeyRoot, scale: string[]): Question {
  const rootNote = KEY_NAMES[root];

  // 루트가 있는 모든 프렛 위치 (1~24)
  const positions: { string: number; fret: number }[] = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 1; f <= 24; f++) {
      if (getNoteAtFret(s, f) === rootNote) {
        positions.push({ string: s, fret: f });
      }
    }
  }

  return {
    type: "find-root",
    question: `${KEY_NAMES[root]} 메이저 스케일의 루트(${rootNote})를 프렛보드에서 찾아주세요`,
    correctAnswer: `${positions[0].string}-${positions[0].fret}`,
    options: [],
    fret: positions[0].fret,
    string: positions[0].string,
    showFretboard: true,
  };
}

function MiniFretboard({
  highlightedFret,
  highlightedString,
  onFretClick,
  selectedPosition,
}: {
  highlightedFret?: number;
  highlightedString?: number;
  onFretClick?: (string: number, fret: number) => void;
  selectedPosition?: { string: number; fret: number } | null;
}) {
  // 위에서 아래로: 고음→저음 (1번줄→6번줄)
  const strings = ["e", "B", "G", "D", "A", "E"];
  const frets = 24;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="grid gap-0" style={{ gridTemplateColumns: `2rem repeat(${frets}, minmax(0, 1fr))` }}>
          {/* 프렛 번호 */}
          <div />
          {Array.from({ length: frets }, (_, f) => (
            <div key={f + 1} className="text-center text-[8px] text-neutral-600 min-w-[20px]">
              {f + 1}
            </div>
          ))}

          {/* 줄 */}
          {strings.map((s, si) => (
            <Fragment key={si}>
              <div className="text-[10px] text-neutral-500 text-center">{s}</div>
              {Array.from({ length: frets }, (_, f) => {
                const fret = f + 1; // 1번 프렛부터
                const isHighlighted = highlightedFret === fret && highlightedString === si;
                const isSelected = selectedPosition?.fret === fret && selectedPosition?.string === si;
                return (
                  <div
                    key={fret}
                    className={`h-6 flex items-center justify-center border-r border-neutral-700/30 ${
                      si < 5 ? "border-b border-neutral-700/50" : ""
                    } ${onFretClick ? "cursor-pointer hover:bg-neutral-800" : ""}`}
                    onClick={() => onFretClick?.(si, fret)}
                  >
                    {isHighlighted && (
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                    )}
                    {isSelected && (
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const [root, setRoot] = useState<KeyRoot>("C");
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ string: number; fret: number } | null>(null);

  const startQuiz = useCallback(() => {
    setQuizStarted(true);
    setScore({ correct: 0, wrong: 0 });
    setCurrentQuestion(generateQuestion(root));
    setSelectedAnswer(null);
    setShowResult(false);
    setSelectedPosition(null);
  }, [root]);

  const handleAnswer = useCallback((answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setIsCorrect(answer === currentQuestion?.correctAnswer);
    setShowResult(true);
  }, [showResult, currentQuestion]);

  const handleFretClick = useCallback((string: number, fret: number) => {
    if (showResult || !currentQuestion) return;
    setSelectedPosition({ string, fret });
    // 클릭한 위치의 음이 정답 음과 같은지 확인
    const clickedNote = getNoteAtFret(string, fret);
    setIsCorrect(clickedNote === currentQuestion.correctAnswer);
    setShowResult(true);
  }, [showResult, currentQuestion]);

  const nextQuestion = useCallback(() => {
    setCurrentQuestion(generateQuestion(root));
    setSelectedAnswer(null);
    setShowResult(false);
    setSelectedPosition(null);
  }, [root]);

  const handleCorrect = useCallback(() => {
    setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    nextQuestion();
  }, [nextQuestion]);

  const handleWrong = useCallback(() => {
    setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    nextQuestion();
  }, [nextQuestion]);

  const endQuiz = useCallback(() => {
    setQuizStarted(false);
    setCurrentQuestion(null);
  }, []);

  const totalQuestions = score.correct + score.wrong;
  const accuracy = totalQuestions > 0 ? Math.round((score.correct / totalQuestions) * 100) : 0;

  if (!quizStarted) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">퀴즈</h1>
          <p className="text-neutral-400 text-sm">
            스케일과 코드 구성음을 맞추는 퀴즈입니다. 키를 선택하고 시작하세요.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-300 mb-2">키 선택</label>
          <div className="flex flex-wrap gap-2">
            {KEYS.map((key) => (
              <button
                key={key}
                onClick={() => setRoot(key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  key === root
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/50"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {KEY_NAMES[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900 mb-6">
          <h2 className="text-lg font-semibold mb-3">퀴즈 안내</h2>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li>• <span className="text-orange-400">음계 맞추기</span>: 어떤 음이 몇 번째 도수?</li>
            <li>• <span className="text-orange-400">도수 맞추기</span>: 이 음의 도수는?</li>
            <li>• <span className="text-orange-400">코드 구성음</span>: 이 코드의 구성음은?</li>
            <li>• <span className="text-orange-400">비구성음 찾기</span>: 구성음이 아닌 것은?</li>
            <li>• <span className="text-orange-400">프렛보드 음계</span>: 이 프렛의 음은?</li>
            <li>• <span className="text-orange-400">프렛보드 도수</span>: 이 프렛의 도수는?</li>
            <li>• <span className="text-orange-400">프렛 클릭</span>: 해당 음을 프렛보드에서 클릭</li>
            <li>• <span className="text-orange-400">루트 찾기</span>: 루트 음을 프렛보드에서 클릭</li>
          </ul>
        </div>

        <button
          onClick={startQuiz}
          className="w-full py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
        >
          퀴즈 시작
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{KEY_NAMES[root]} 메이저 퀴즈</h1>
          <p className="text-sm text-neutral-400">문제 {totalQuestions + 1}번</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-green-400 font-bold">{score.correct}</span>
            <span className="text-neutral-500"> / </span>
            <span className="text-red-400 font-bold">{score.wrong}</span>
          </div>
          <button
            onClick={endQuiz}
            className="px-4 py-2 text-sm rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            그만하기
          </button>
        </div>
      </div>

      {currentQuestion && (
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="mb-2">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
              {currentQuestion.type === "scale-note" ? "음계 맞추기"
                : currentQuestion.type === "scale-degree" ? "도수 맞추기"
                : currentQuestion.type === "chord-tone" ? "코드 구성음"
                : currentQuestion.type === "not-chord-tone" ? "비구성음 찾기"
                : currentQuestion.type === "fretboard-note" ? "프렛보드 음계"
                : currentQuestion.type === "fretboard-degree" ? "프렛보드 도수"
                : currentQuestion.type === "fretboard-click" ? "프렛 클릭"
                : "루트 찾기"}
            </span>
          </div>

          <h2 className="text-xl font-bold mb-6">{currentQuestion.question}</h2>

          {/* 프렛보드 표시 */}
          {currentQuestion.showFretboard && (
            <div className="mb-6 p-4 rounded-lg bg-neutral-800">
              <MiniFretboard
                highlightedFret={currentQuestion.highlightedFret}
                highlightedString={currentQuestion.highlightedString}
                onFretClick={
                  (currentQuestion.type === "fretboard-click" || currentQuestion.type === "find-root") && !showResult
                    ? handleFretClick
                    : undefined
                }
                selectedPosition={selectedPosition}
              />
            </div>
          )}

          {/* 객관식 선택지 */}
          {currentQuestion.options.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQuestion.correctAnswer;
                const showCorrect = showResult && isCorrectOption;
                const showWrong = showResult && isSelected && !isCorrectOption;

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                    className={`p-4 rounded-lg text-lg font-bold transition-all ${
                      showCorrect
                        ? "bg-green-500/20 border-2 border-green-500 text-green-400"
                        : showWrong
                        ? "bg-red-500/20 border-2 border-red-500 text-red-400"
                        : isSelected
                        ? "bg-orange-500/20 border-2 border-orange-500 text-orange-400"
                        : "bg-neutral-800 border-2 border-transparent hover:border-neutral-600 text-neutral-300"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* 프렛 클릭 안내 */}
          {currentQuestion.options.length === 0 && !showResult && (
            <p className="text-center text-neutral-500 text-sm mt-4">
              프렛보드에서 해당 위치를 클릭하세요
            </p>
          )}

          {/* 결과 */}
          {showResult && (
            <div className="mt-6">
              <div className={`p-4 rounded-lg mb-4 ${isCorrect ? "bg-green-500/10 border border-green-500/50" : "bg-red-500/10 border border-red-500/50"}`}>
                <p className={`font-semibold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                  {isCorrect ? "정답입니다! 👏" : "틀렸습니다 😅"}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-neutral-400 mt-1">
                    정답: {currentQuestion.correctAnswer}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                {isCorrect ? (
                  <button onClick={handleCorrect} className="flex-1 py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors">
                    다음 문제
                  </button>
                ) : (
                  <>
                    <button onClick={handleWrong} className="flex-1 py-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 font-semibold hover:bg-red-500/30 transition-colors">
                      다시 풀기
                    </button>
                    <button onClick={handleCorrect} className="flex-1 py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors">
                      다음 문제
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 스케일 미니 뷰 */}
      <div className="mt-6 p-4 rounded-xl border border-neutral-800 bg-neutral-900">
        <h3 className="text-sm font-semibold text-neutral-300 mb-2">
          {KEY_NAMES[root]} 메이저 스케일
        </h3>
        <div className="flex flex-wrap gap-2">
          {getScale(root, "major").map((note, i) => (
            <span key={i} className="px-2 py-1 rounded-lg bg-neutral-800 text-sm font-mono">
              <span className="text-orange-400">{i + 1}</span>
              <span className="text-neutral-500">=</span>
              <span className="text-neutral-300">{note}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
