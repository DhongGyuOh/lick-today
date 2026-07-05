import * as alphaTab from "@coderline/alphatab";
import fs from "fs";

const { AlphaTexImporter } = alphaTab.importer;

// data 인자로 JSON 파일 경로들을 받아 licks[].alphaTex 를 모두 파싱해봄
const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("사용법: node scripts/validate-alphatex.mjs data/licks/2026-07-05.json [...]");
  process.exit(1);
}

let hasError = false;

for (const file of files) {
  const json = JSON.parse(fs.readFileSync(file, "utf-8"));
  for (const lick of json.licks) {
    try {
      const importer = new AlphaTexImporter();
      const settings = new alphaTab.Settings();
      importer.initFromString(lick.alphaTex, settings);
      const score = importer.readScore();
      const barCount = score.tracks[0].staves[0].bars.length;
      const trackNames = score.tracks.map((t) => (t.isPercussion ? `${t.name}(드럼)` : t.name));
      console.log(
        `OK  [${json.date}] ${lick.id} - "${lick.title}" (${barCount}마디, 트랙: ${trackNames.join(", ")})`
      );
    } catch (e) {
      hasError = true;
      console.error(`FAIL [${json.date}] ${lick.id} - "${lick.title}"`);
      console.error("  " + (e?.message ?? e));
      if (e?.diagnostics) {
        for (const d of e.diagnostics) {
          console.error("   -", d.message ?? d);
        }
      }
    }
  }
}

process.exit(hasError ? 1 : 0);
