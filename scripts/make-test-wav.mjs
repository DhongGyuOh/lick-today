// 테스트용 WAV 생성 — Chrome 의 가상 마이크 입력으로 사용할 기타 6줄 기준음.
//
// 사용법: node scripts/make-test-wav.mjs <out.wav> <주파수Hz> [길이초]
//
// Chrome 은 --use-file-for-fake-audio-capture=<파일> 로 이 WAV 를 마이크 입력으로
// 재생하므로, 실제 마이크 없이 튜너 동작을 검증할 수 있습니다.

import fs from "fs";

const out = process.argv[2] ?? "test-tone.wav";
const frequency = Number(process.argv[3] ?? 82.41);
const seconds = Number(process.argv[4] ?? 10);
const sampleRate = 44100;

const samples = Math.floor(sampleRate * seconds);
const data = Buffer.alloc(samples * 2); // 16-bit mono

for (let i = 0; i < samples; i++) {
  const t = i / sampleRate;
  // 기타처럼 배음을 섞습니다 (기본음 + 2/3/4/5차 배음).
  let v = 0;
  const harmonics = [1, 0.5, 0.25, 0.12, 0.06];
  for (let h = 0; h < harmonics.length; h++) {
    v += harmonics[h] * Math.sin(2 * Math.PI * frequency * (h + 1) * t);
  }
  const value = Math.max(-1, Math.min(1, v * 0.3));
  data.writeInt16LE(Math.round(value * 32767), i * 2);
}

// WAV 헤더 (PCM 16-bit mono)
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16); // PCM 헤더 크기
header.writeUInt16LE(1, 20); // 오디오 포맷: PCM
header.writeUInt16LE(1, 22); // 채널 수
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * 2, 28); // 바이트 레이트
header.writeUInt16LE(2, 32); // 블록 정렬
header.writeUInt16LE(16, 34); // 비트 깊이
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

fs.writeFileSync(out, Buffer.concat([header, data]));
console.log(`${out} 생성 완료 — ${frequency}Hz, ${seconds}초, ${sampleRate}Hz 16bit mono`);
