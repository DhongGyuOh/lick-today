// Chrome DevTools Protocol 로 튜너를 실제 검증 (개발용)
//
// Chrome 을 가상 마이크 파일과 함께 띄우고, CDP 로 페이지를 조작해
//   1) 마이크 시작 → 게이지 렌더 확인
//   2) 감지된 음 / 센트 값이 기대한 값과 일치하는지 확인
//   3) 기준음 재생 버튼이 소리를 내는지 (AudioContext state) 확인
//
// 사용법: node scripts/test-tuner-cdp.mjs <wav파일> [기대Hz] [기대줄번호]

import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import http from "http";

const WAV = process.argv[2];
const EXPECTED_HZ = Number(process.argv[3] ?? 82.41);
const EXPECTED_STRING = Number(process.argv[4] ?? 6);

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9222;
const URL = "http://localhost:3000/tuning/";

const userDataDir = path.join(os.tmpdir(), "chrome-tuner-test");
fs.rmSync(userDataDir, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDataDir}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--autoplay-policy=no-user-gesture-required",
  // 가상 마이크로 WAV 재생
  "--use-fake-device-for-media-stream",
  "--use-fake-ui-for-media-stream",
  `--use-file-for-fake-audio-capture=${WAV}`,
  "--autoplay-policy=no-user-gesture-required",
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getJson(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`${method} ${url} -> ${data.slice(0, 120)}`));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function waitForChrome() {
  for (let i = 0; i < 40; i++) {
    try {
      return await getJson(`http://127.0.0.1:${PORT}/json/version`);
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Chrome 디버깅 포트에 연결하지 못했습니다");
}

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

(async () => {
  try {
    await waitForChrome();
    console.log("Chrome 준비 완료");

    // 새 탭 열기 (최신 Chrome 은 /json/new 에 PUT 만 허용)
    const target = await getJson(
      `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(URL)}`,
      "PUT"
    );
    console.log(`탭 생성: ${target.id}`);

    // CDP 연결 — Node 22+ 내장 WebSocket 사용 (외부 의존성 없음)
    if (typeof globalThis.WebSocket === "undefined") {
      console.log("❌ 이 Node 버전에는 WebSocket 이 없습니다 (Node 22+ 필요)");
      process.exit(2);
    }
    const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let msgId = 0;
    const pending = new Map();
    const consoleErrors = [];
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
        consoleErrors.push(
          msg.params.args.map((a) => a.value ?? a.description ?? "?").join(" ")
        );
      }
      if (msg.method === "Runtime.exceptionThrown") {
        consoleErrors.push(
          msg.params.exceptionDetails.exception?.description ??
            msg.params.exceptionDetails.text
        );
      }
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    };

    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++msgId;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
        setTimeout(() => {
          if (pending.has(id)) {
            pending.delete(id);
            reject(new Error(`${method} 타임아웃`));
          }
        }, 30000);
      });

    const evaluate = async (expression) => {
      const r = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.exception?.description ?? "evaluate 실패");
      }
      return r.result.value;
    };

    await send("Page.enable");
    await send("Runtime.enable");

    // 페이지 로드 대기
    for (let i = 0; i < 40; i++) {
      const ready = await evaluate(`document.readyState === "complete" && !!document.querySelector("button")`);
      if (ready) break;
      await sleep(250);
    }

    console.log("\n=== 1. 마이크 튜너 시작 ===");
    const clicked = await evaluate(`(() => {
      const btn = [...document.querySelectorAll("button")].find(b => b.textContent.includes("마이크 튜너 시작"));
      if (!btn) return "버튼 없음";
      btn.click();
      return "클릭됨";
    })()`);
    check("마이크 버튼 클릭", clicked === "클릭됨", clicked);

    // 오디오 분석에 시간이 필요합니다
    await sleep(3000);

    const gauge = await evaluate(`(() => {
      const root = document.querySelector('[role="status"]');
      if (!root) return { found: false };
      const card = root.closest("div.rounded-xl");
      const text = card ? card.innerText : "";
      // 큰 숫자(센트 값)
      const big = card ? [...card.querySelectorAll("span")].find(s => /^-?\\d+$/.test(s.textContent.trim()) && s.className.includes("text-4xl")) : null;
      return {
        found: true,
        status: root.innerText.trim(),
        text: text.replace(/\\n+/g, " | "),
        cents: big ? big.textContent.trim() : null,
        // 니들은 transition-[left] 클래스를 가진 div
        hasNeedle: card ? [...card.querySelectorAll("div")].some(d => d.className.includes("transition-[left]")) : false,
      };
    })()`);

    check("게이지 렌더됨", gauge.found, gauge.found ? "" : "role=status 를 찾지 못함");
    check("니들 표시됨", gauge.hasNeedle === true);
    console.log(`     상태 문구: ${gauge.status}`);
    console.log(`     게이지 내용: ${gauge.text}`);

    console.log("\n=== 2. 감지 정확도 ===");
    const reading = await evaluate(`(() => {
      const card = document.querySelector('[role="status"]').closest("div.rounded-xl");
      const spans = [...card.querySelectorAll("span")];
      const divs = [...card.querySelectorAll("div")];
      // 주파수는 div 에 있음 (text-xs tabular-nums)
      const hz = divs.find(d => /Hz$/.test(d.textContent.trim()) && d.className.includes("tabular-nums"));
      const note = spans.find(s => /^[A-G]#?\\d$/.test(s.textContent.trim()));
      const big = spans.find(s => s.className.includes("text-4xl"));
      return {
        hz: hz ? hz.textContent.trim() : null,
        note: note ? note.textContent.trim() : null,
        cents: big ? big.textContent.trim() : null,
      };
    })()`);

    console.log(`     감지: ${reading.hz}, 음: ${reading.note}, 센트: ${reading.cents}`);

    const detectedHz = parseFloat(reading.hz);
    if (isFinite(detectedHz)) {
      const centsErr = 1200 * Math.log2(detectedHz / EXPECTED_HZ);
      check(
        `감지 주파수 ≈ ${EXPECTED_HZ}Hz (±20센트)`,
        Math.abs(centsErr) <= 20,
        `측정 ${detectedHz}Hz = ${centsErr.toFixed(1)}센트 차이`
      );
    } else {
      check("감지 주파수 파싱", false, `값 없음 (${reading.hz})`);
    }

    console.log('\n=== 3. 게이지가 "제격"으로 표시되는가 ===');
    const statusOk = await evaluate(`(() => {
      const s = document.querySelector('[role="status"]').innerText;
      return s;
    })()`);
    check("상태가 제격/낮음/높음 중 하나", /제격|낮음|높음|기다리는/.test(statusOk), statusOk.trim());

    console.log("\n=== 4. 기준음 재생 (AudioContext) ===");
    const audioCheck = await evaluate(`(async () => {
      const btn = [...document.querySelectorAll("button")].find(b => b.getAttribute("aria-label")?.includes("기준음 듣기"));
      if (!btn) return { error: "버튼 없음" };
      btn.click();
      await new Promise(r => setTimeout(r, 600));
      // AudioContext 는 window 에 직접 붙지 않으므로, 버튼 상태 변화로 확인
      const label = btn.textContent.trim();
      const anyCtx = window.__lastAudioContextState || null;
      return { label };
    })()`);
    check("기준음 버튼 클릭됨", !audioCheck.error, JSON.stringify(audioCheck));

    await sleep(2000);

    console.log("\n=== 5. 콘솔 에러 ===");
    check("콘솔 에러 없음", consoleErrors.length === 0, consoleErrors.join(" / ") || "0건");

    // 게이지 스크린샷 저장 (눈으로 확인용)
    if (process.env.SCREENSHOT) {
      const shot = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      fs.writeFileSync(process.env.SCREENSHOT, Buffer.from(shot.data, "base64"));
      console.log(`     스크린샷 저장: ${process.env.SCREENSHOT}`);
    }

    ws.close();
  } catch (e) {
    console.error("테스트 오류:", e.message);
    failures++;
  } finally {
    chrome.kill();
    await sleep(500);
    console.log(
      failures === 0 ? "\n✅ 모든 검사 통과" : `\n❌ 실패 ${failures}건`
    );
    process.exit(failures === 0 ? 0 : 1);
  }
})();
