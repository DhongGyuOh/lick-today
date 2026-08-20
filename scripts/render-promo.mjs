#!/usr/bin/env node
/**
 * Render Lick Today promo video to MP4 using Remotion CLI.
 * Reads latest lick data from data/licks/ and generates composition props.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const dataDir = path.join(root, "data", "licks");
const remotionDir = path.join(root, "remotion");
const propsDir = path.join(remotionDir, "props");
const propsPath = path.join(propsDir, "promo-props.json");
const outputPath = path.join(root, "public", "promo.mp4");

function main() {
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    console.error(`❌ Data directory not found: ${dataDir}`);
    process.exit(1);
  }

  // Find latest date
  const dates = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort((a, b) => (a < b ? 1 : -1));

  if (dates.length === 0) {
    console.error("❌ No lick data files found in data/licks/");
    process.exit(1);
  }

  const latestDate = dates[0];
  console.log(`📅 Using latest date: ${latestDate}`);

  // Parse latest daily data
  const dailyPath = path.join(dataDir, `${latestDate}.json`);
  const daily = JSON.parse(fs.readFileSync(dailyPath, "utf8"));

  // Build props for Remotion composition
  const props = {
    date: daily.date,
    licks: daily.licks.slice(0, 5).map((lick, index) => ({
      index: index + 1,
      title: lick.title,
      key: lick.key,
      style: lick.style,
      difficulty: lick.difficulty,
      bpm: lick.bpm,
      hasDrums: Boolean(lick.hasDrums),
    })),
  };

  // Ensure props directory exists
  fs.mkdirSync(propsDir, { recursive: true });
  fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));
  console.log(`📝 Props written to: ${propsPath}`);

  // Ensure public directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // Remotion render command
  const args = [
    "remotion",
    "render",
    path.join(remotionDir, "index.ts"),
    "LickTodayPromo",
    outputPath,
    "--props",
    propsPath,
    "--codec",
    "h264",
    "--crf",
    "23",
    "--overwrite",
  ];

  console.log("🎬 Starting Remotion render...");
  console.log(`   Output: ${outputPath}`);
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