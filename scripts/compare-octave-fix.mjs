// 옥타브 보정(오버톤 오류 방지) 단계가 실제로 도움이 되는지 비교 (개발용)
// 실제 기타처럼 약한 기본음 + 강한 저주파 배음인 경우에서 특히 중요합니다.

const MIN_FREQUENCY = 40;
const MAX_FREQUENCY = 1000;
const YIN_THRESHOLD = 0.15;
const MIN_RMS = 0.01;

function detect(buffer, sampleRate, opts = {}) {
  const { innerWidth = 2048, octaveFix = true } = opts;
  const size = buffer.length;
  if (size < 256) return null;

  let rms = 0;
  for (let i = 0; i < size; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / size);
  if (rms < MIN_RMS) return null;

  const minLag = Math.max(2, Math.floor(sampleRate / MAX_FREQUENCY));
  let maxLag = Math.floor(sampleRate / MIN_FREQUENCY);
  if (maxLag > Math.floor(size / 2)) maxLag = Math.floor(size / 2);
  if (maxLag <= minLag + 2) return null;

  const diff = new Float32Array(maxLag);
  for (let lag = 1; lag < maxLag; lag++) {
    const n = Math.min(size - lag, innerWidth);
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const d = buffer[i] - buffer[i + lag];
      sum += d * d;
    }
    diff[lag] = sum;
  }

  const cmnd = new Float32Array(maxLag);
  cmnd[0] = 1;
  let rs = 0;
  for (let lag = 1; lag < maxLag; lag++) {
    rs += diff[lag];
    cmnd[lag] = rs === 0 ? 1 : (diff[lag] * lag) / rs;
  }

  let tau = -1;
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (cmnd[lag] < YIN_THRESHOLD) {
      while (lag + 1 < maxLag && cmnd[lag + 1] < cmnd[lag]) lag++;
      tau = lag;
      break;
    }
  }
  if (tau === -1) {
    let b = minLag + 1;
    for (let l = minLag + 1; l < maxLag; l++) if (cmnd[l] < cmnd[b]) b = l;
    if (cmnd[b] > 0.5) return null;
    tau = b;
  }

  if (octaveFix) {
    for (const d of [3, 2]) {
      const c = Math.round(tau / d);
      if (c <= minLag + 1 || c >= tau) continue;
      let l = c;
      while (l + 1 < tau && cmnd[l + 1] < cmnd[l]) l++;
      if (cmnd[l] < YIN_THRESHOLD) {
        tau = l;
        break;
      }
    }
  }

  const x0 = tau > 1 ? tau - 1 : tau;
  const x2 = tau + 1 < maxLag ? tau + 1 : tau;
  let rt;
  if (x0 === tau) rt = cmnd[tau] <= cmnd[x2] ? tau : x2;
  else if (x2 === tau) rt = cmnd[tau] <= cmnd[x0] ? tau : x0;
  else {
    const s0 = cmnd[x0], s1 = cmnd[tau], s2 = cmnd[x2];
    const den = 2 * (2 * s1 - s2 - s0);
    rt = den === 0 ? tau : tau + (s2 - s0) / den;
  }
  if (!(rt > 0)) return null;
  const f = sampleRate / rt;
  if (!isFinite(f) || f < MIN_FREQUENCY || f > MAX_FREQUENCY) return null;
  return { frequency: f, confidence: Math.max(0, Math.min(1, 1 - cmnd[tau])) };
}

function makeSignal(freq, sr, size, harmonics = [1, 0.5, 0.25, 0.12]) {
  const b = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const t = i / sr;
    let v = 0;
    for (let h = 0; h < harmonics.length; h++) v += harmonics[h] * Math.sin(2 * Math.PI * freq * (h + 1) * t);
    b[i] = v * 0.3;
  }
  return b;
}

// 약한 기본음 + 강한 저주파 배음 (저음줄 E2 의 실제 특성)
function makeWeakFundamental(freq, sr, size) {
  const b = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const t = i / sr;
    b[i] =
      0.05 * Math.sin(2 * Math.PI * freq * t) +
      0.3 * Math.sin(2 * Math.PI * freq * 2 * t) +
      0.2 * Math.sin(2 * Math.PI * freq * 3 * t) +
      0.1 * Math.sin(2 * Math.PI * freq * 4 * t);
  }
  return b;
}

function addNoise(b, lv, seed = 12345) {
  let s = seed;
  for (let i = 0; i < b.length; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    b[i] += ((s / 0x7fffffff) * 2 - 1) * lv;
  }
}

const cents = (f, t) => 1200 * Math.log2(f / t);
const ST = [82.41, 110, 146.83, 196, 246.94, 329.63];

for (const octaveFix of [true, false]) {
  console.log(`\n--- octaveFix=${octaveFix} ---`);

  for (const noise of [0, 0.05, 0.1, 0.15, 0.2]) {
    let errs = [], oct = 0, fail = 0;
    for (const f of ST) {
      for (const c of [-25, 0, 25]) {
        const target = f * Math.pow(2, c / 1200);
        const b = makeSignal(target, 44100, 4096);
        if (noise) addNoise(b, noise);
        const g = detect(b, 44100, { octaveFix });
        if (!g) { fail++; continue; }
        const e = cents(g.frequency, target);
        errs.push(Math.abs(e));
        if (Math.abs(e) > 600) oct++;
      }
    }
    const mae = errs.reduce((a, b) => a + b, 0) / errs.length;
    console.log(
      `  노이즈 ${noise}: MAE ${mae.toFixed(2)}, max ${Math.max(...errs).toFixed(1)}, 옥타브오류 ${oct}, 실패 ${fail}`
    );
  }

  const weakErr = [];
  for (const f of ST) {
    const b = makeWeakFundamental(f, 44100, 4096);
    const g = detect(b, 44100, { octaveFix });
    weakErr.push(g ? cents(g.frequency, f).toFixed(1) : "FAIL");
  }
  console.log(`  약한 기본음 오차(cents): ${weakErr.join(", ")}`);
}
