#!/usr/bin/env node
/**
 * Render Circle of Fifths theory video to MP4 using Remotion CLI.
 * Uses tts_5.wav (56.9s) for narration.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const remotionDir = path.join(root, "remotion");
const propsDir = path.join(remotionDir, "props");
const outputPath = path.join(root, "public", "circle-of-fifths.mp4");
const audioPath = path.join(root, "public", "tts_5.wav");

function main() {
  // Verify audio file exists
  if (!fs.existsSync(audioPath)) {
    console.error(`❌ Audio file not found: ${audioPath}`);
    process.exit(1);
  }

  const audioStats = fs.statSync(audioPath);
  console.log(`🎵 Audio file: ${audioPath} (${(audioStats.size / 1024 / 1024).toFixed(2)} MB)`);

  // Ensure public directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // Duration: 56.9s * 30fps = 1707 frames
  const durationFrames = 1707;

  // Write props to file (avoids Windows quote escaping issues)
  fs.mkdirSync(propsDir, { recursive: true });
  const propsPath = path.join(propsDir, "circle-of-fifths-props.json");
  fs.writeFileSync(propsPath, JSON.stringify({ durationFrames }));

  // Remotion render command
  const args = [
    "remotion",
    "render",
    path.join(remotionDir, "index.ts"),
    "CircleOfFifths",
    outputPath,
    "--props",
    propsPath,
    "--codec",
    "h264",
    "--audio-codec",
    "aac",
    "--crf",
    "23",
    "--overwrite",
  ];

  console.log("🎬 Starting Circle of Fifths render...");
  console.log(`   Output: ${outputPath}`);
  console.log(`   Duration: ${durationFrames} frames (${(durationFrames / 30).toFixed(1)}s)`);
  console.log(`   Command: npx ${args.join(" ")}`);

  try {
    execFileSync("npx", args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      cwd: root,
    });

    // Verify output
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`✅ Render complete! Output: ${outputPath} (${sizeMB} MB)`);
  } catch (error) {
    console.error("❌ Render failed:", error.message);
    process.exit(1);
  }
}

main();