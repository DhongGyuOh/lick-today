/**
 * Generate Korean male TTS narration for Lick Today promo video
 * Uses local Qwen3-TTS Gradio API at http://127.0.0.1:7860
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const GRADIO_API = "http://127.0.0.1:7860";
const OUTPUT_DIR = path.join(process.cwd(), "remotion", "assets", "audio");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "promo-narration.wav");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Narration script for the promo video (approx 12 seconds total)
const NARRATION_TEXT = `안녕하세요! Lick Today에 오신 것을 환영합니다.
매일 새로운 5개의 기타 릭을 만나보세요.
오늘의 릭으로 실력을 키우고, 화성학 페이지에서 이론을 공부하세요.
스케일 시각화 도구로 프렛보드를 마스터하세요.
지금 바로 연습을 시작해보세요!`;

// Use Korean language with a male speaker (Uncle_fu or Ryan)
const TTS_PARAMS = {
  text: NARRATION_TEXT.trim(),
  language: "Korean",
  speaker: "Uncle_fu", // Korean male voice
  instruct: "", // Optional style instruction
  model_size: "1.7B",
  seed: -1,
};

async function generateTTS() {
  console.log("🎤 Generating Korean male TTS narration...");
  console.log(`   Text: ${NARRATION_TEXT.slice(0, 60)}...`);
  console.log(`   Speaker: ${TTS_PARAMS.speaker} (Korean)`);

  try {
    // Call Gradio API /generate_custom_voice
    const response = await fetch(`${GRADIO_API}/gradio_api/call/generate_custom_voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [
        TTS_PARAMS.text,
        TTS_PARAMS.language,
        TTS_PARAMS.speaker,
        TTS_PARAMS.instruct,
        TTS_PARAMS.model_size,
        TTS_PARAMS.seed,
      ] }),
    });

    if (!response.ok) {
      throw new Error(`Gradio call failed: ${response.status} ${response.statusText}`);
    }

    const { event_id } = await response.json();
    console.log(`   Event ID: ${event_id}`);

    // Poll for result
    let result = null;
    while (!result) {
      await new Promise((r) => setTimeout(r, 1000));
      const pollRes = await fetch(`${GRADIO_API}/gradio_api/call/generate_custom_voice/${event_id}`);
      const text = await pollRes.text();

      // Parse SSE stream
      const lines = text.split("\n").filter((l) => l.startsWith("data: "));
      for (const line of lines) {
        const data = JSON.parse(line.slice(6));
        if (data.msg === "process_completed") {
          result = data.output.data[0]; // { path, url, ... }
          break;
        }
      }
    }

    const audioUrl = `${GRADIO_API}${result.url}`;
    console.log(`   Audio URL: ${audioUrl}`);

    // Download the audio file
    const audioRes = await fetch(audioUrl);
    const audioBuffer = await audioRes.arrayBuffer();
    fs.writeFileSync(OUTPUT_FILE, Buffer.from(audioBuffer));

    console.log(`✅ TTS narration saved to: ${OUTPUT_FILE}`);
    console.log(`   Size: ${(audioBuffer.byteLength / 1024).toFixed(1)} KB`);

    return OUTPUT_FILE;
  } catch (error) {
    console.error("❌ TTS generation failed:", error.message);
    throw error;
  }
}

generateTTS().catch((e) => {
  console.error(e);
  process.exit(1);
});