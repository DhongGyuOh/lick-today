# Lick Today로 배우는 Next.js App Router

지금 알고 있는 내용부터 짚어보면:

> "use client는 하이드레이션할 때 쓴다, 없으면 SSR로 동작한다, 폴더 기반으로 라우트가 정해진다,
> layout에서 자식 컴포넌트를 보여준다"

**전반적으로 맞는 방향이고, 딱 하나만 정확히 고치면 됩니다:**
우리 프로젝트는 `output: "export"` (정적 export)라서, "use client가 없는 컴포넌트"는
**SSR(매 요청마다 서버가 렌더링)이 아니라 SSG(빌드할 때 딱 한 번 미리 렌더링)**로 동작합니다.
서버가 아예 없는 사이트(Vercel이 그냥 정적 파일을 서빙)라서, "요청마다 렌더링"이라는 게
성립하지 않아요. 이 차이가 왜 중요한지는 아래에서 실제 코드로 설명합니다.

---

## 1. 전체 그림: 페이지 하나가 만들어지는 과정

`/lick/2026-07-04-01` 페이지를 예로 들면:

```
npm run build 시점 (한 번만 실행됨)
─────────────────────────────────
1. licks.ts가 data/licks/2026-07-04.json을 읽음 (Node.js fs API)
2. lick/[id]/page.tsx의 generateStaticParams()가
   "존재하는 모든 id 목록"을 알려줌 → Next.js가 그만큼 HTML을 미리 생성
3. page.tsx(서버 컴포넌트)가 해당 lick 데이터로 HTML을 그려냄
4. AlphaTabPlayer.tsx(클라이언트 컴포넌트)는 여기선 "껍데기"만 그려지고,
   실제 동작(JS)은 아직 실행 안 됨
5. 결과: out/lick/2026-07-04-01/index.html (완성된 정적 파일)

사용자가 브라우저에서 접속하는 시점
─────────────────────────────────
6. Vercel이 미리 만들어둔 index.html을 그냥 그대로 내려줌 (서버 로직 없음)
7. 브라우저가 HTML을 먼저 보여줌 (이 시점엔 재생 버튼이 아직 안 눌림)
8. AlphaTabPlayer.tsx의 JS 코드가 로드되면서 "하이드레이션" 발생
   → 이제부터 버튼 클릭, useState, useEffect 등이 실제로 동작함
```

**핵심**: 6~8번은 "요청마다" 일어나는 게 아니라, 1~5번에서 이미 만들어둔 HTML을
그냥 재사용하는 것뿐입니다. 이게 SSR과 SSG의 차이입니다.

| | SSR (서버가 있을 때) | SSG (지금 우리) |
|---|---|---|
| 렌더링 시점 | 사용자가 요청할 때마다 | `npm run build` 할 때 딱 한 번 |
| 필요한 서버 | Node.js 서버가 항상 켜져 있어야 함 | 없음. 그냥 파일 서빙 (Vercel이 정적 호스팅처럼 처리) |
| 데이터가 바뀌면? | 다음 요청에 바로 반영 | 다시 build/deploy 해야 반영 (그래서 릭 추가 → git push → 재배포 흐름) |

---

## 2. 폴더 기반 라우팅 — 우리 프로젝트에 그대로 적용해보기

```
src/app/
├── layout.tsx              ← 모든 페이지를 감싸는 최상위 레이아웃
├── page.tsx                 → "/"                (오늘의 릭 5개)
├── archive/
│   ├── page.tsx              → "/archive"          (날짜 목록)
│   └── [date]/
│       └── page.tsx          → "/archive/2026-07-04" (동적 라우트)
└── lick/
    └── [id]/
        └── page.tsx          → "/lick/2026-07-04-01" (동적 라우트)
```

- 폴더 = URL 경로. `page.tsx`가 있어야 실제로 그 경로가 "페이지"로 인식됨.
- `[id]`, `[date]`처럼 대괄호 폴더 = 동적 라우트. URL의 그 부분이 `params.id`, `params.date`로 코드에 전달됨.
- `layout.tsx`는 페이지가 아니라 **그 폴더 아래의 모든 페이지를 감싸는 틀**. 이게 3번에서 자세히 다룰 부분.

---

## 3. layout 개념 제대로 잡기

### 3-1. 가장 헷갈리는 부분: "레이아웃은 중첩(nesting)된다"

Next.js App Router는 폴더 구조를 그대로 **레이아웃 트리**로 씁니다. 지금 우리는
`src/app/layout.tsx` 하나뿐이라 이게 안 보이는데, 만약 `archive/layout.tsx`를
새로 만든다면:

```
src/app/layout.tsx            ← 모든 페이지 감쌈 (헤더/푸터/폰트 등)
  └── src/app/archive/layout.tsx   ← /archive/* 페이지만 추가로 감쌈
        └── src/app/archive/page.tsx       ("/archive")
        └── src/app/archive/[date]/page.tsx ("/archive/2026-07-04")
```

이렇게 되면 `/archive`에 접속했을 때 실제로 렌더링되는 건:

```tsx
<RootLayout>          {/* src/app/layout.tsx */}
  <ArchiveLayout>      {/* src/app/archive/layout.tsx (있다면) */}
    <ArchivePage />    {/* src/app/archive/page.tsx */}
  </ArchiveLayout>
</RootLayout>
```

**지금 우리는 `archive/layout.tsx`가 없기 때문에, 그냥 `RootLayout`만 적용됩니다.**
즉 지금은 레이아웃이 "중첩"될 일이 없어서 개념이 잘 안 보였던 것뿐이에요.

### 3-2. 우리 `layout.tsx`를 한 줄씩

```tsx
export default function RootLayout({
  children,   // ← 여기로 실제 페이지 내용(page.tsx)이 들어옴
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="...">
        <Script .../>          {/* 모든 페이지에 공통으로 필요한 것 */}
        <header>...</header>    {/* 모든 페이지에 공통으로 보이는 것 */}
        <main>
          {children}             {/* 페이지마다 달라지는 부분이 여기 꽂힘 */}
        </main>
        <footer>...</footer>
        <SpeedInsights />
      </body>
    </html>
  );
}
```

`/lick/2026-07-04-01`에 접속하면 `children` 자리에 `lick/[id]/page.tsx`의 반환값이
들어가고, `/archive`에 접속하면 그 자리에 `archive/page.tsx`의 반환값이 들어갑니다.
**헤더/푸터/`<Script>`는 안 바뀌고 그대로 유지되는 게 layout의 핵심 존재 이유**입니다
— 페이지를 이동해도 저 부분들이 다시 로딩되지 않고 유지됨 (헤더 클릭해서 페이지
이동해봐도 헤더 자체가 깜빡이지 않는 게 이 덕분).

### 3-3. layout은 왜 항상 서버 컴포넌트인가

우리 `layout.tsx`엔 `"use client"`가 없습니다. 레이아웃은 대부분 정적인 뼈대(헤더,
네비게이션 링크)라서 서버 컴포넌트로 두는 게 자연스럽고, 그 안에 실제로 상호작용이
필요한 부분만 클라이언트 컴포넌트로 쪼개 넣는 게 App Router의 기본 패턴입니다.
(우리 프로젝트에는 그런 상호작용 부분이 없어서 layout이 순수 서버 컴포넌트로 끝남.)

---

## 4. Server Component vs Client Component — 우리 파일로 정리

| 파일 | `"use client"` | 왜? |
|---|---|---|
| `layout.tsx` | ❌ | 그냥 뼈대. 상호작용 없음 |
| `page.tsx` (홈) | ❌ | JSON 읽어서 목록 그리기만 함. 버튼도 `<Link>`뿐(Next가 처리) |
| `archive/page.tsx`, `archive/[date]/page.tsx` | ❌ | 동일 |
| `lick/[id]/page.tsx` | ❌ | 데이터 가져와서 `<AlphaTabPlayer />`에 넘겨주기만 함 |
| **`AlphaTabPlayer.tsx`** | ✅ | `useState`, `useEffect`, `useRef`, DOM 접근, `Worker`, 오디오 재생 — **브라우저에서만 가능한 것들**을 씀 |

**`"use client"`가 필요한 진짜 이유**는 "하이드레이션을 위해서"라기보다,
**브라우저 API(state, effect, ref, event handler, Worker, AudioContext 등)를 쓰려면
그 컴포넌트가 브라우저에서 실행돼야 하기 때문**입니다. 하이드레이션은 그 결과로
자동으로 따라오는 것이고요.

거꾸로 말하면: 서버 컴포넌트(`"use client"` 없는 것들)는 `useState`, `onClick` 같은 걸
**아예 쓸 수 없습니다.** 우리 `page.tsx`들이 전부 `"use client"`가 없는 이유는
"버튼 클릭에 반응할 일"이 없고 그냥 데이터를 HTML로 그리기만 하기 때문이에요.

### 4-1. `licks.ts`가 "use client" 없이도 fs를 쓸 수 있는 이유

```ts
// src/lib/licks.ts
import fs from "fs";
// ...
fs.readFileSync(filePath, "utf-8");
```

`fs`는 **Node.js API**라서 브라우저에는 존재하지 않습니다. 이게 동작하는 이유는
이 파일이 **오직 서버 컴포넌트(빌드 타임)에서만 import되기 때문**입니다.
`lick/[id]/page.tsx`가 `"use client"`였다면, 그 안에서 `licks.ts`를 import하는 순간
빌드 에러가 났을 거예요 (브라우저에서 실행될 코드에 Node.js API가 섞여버리니까).

---

## 5. `generateStaticParams` — 동적 라우트를 정적 페이지로 "미리 굽기"

```tsx
// src/app/lick/[id]/page.tsx
export function generateStaticParams() {
  return getAllLicksFlat().map(({ lick }) => ({ id: lick.id }));
}
```

`[id]`처럼 대괄호 폴더는 원래 "그 값이 뭐가 될지 미리 모르는" 라우트입니다.
서버가 있는 일반 Next.js라면 요청이 올 때마다 그 값(`2026-07-04-01` 등)으로
즉석에서 렌더링하면 되는데, **우리는 서버가 없는 정적 export**라서 그게 불가능합니다.

그래서 `generateStaticParams()`가 "지금 존재하는 릭 id를 전부 알려주는" 역할을 합니다.
Next.js는 이 함수가 반환한 배열(`[{id: "2026-07-04-01"}, {id: "2026-07-04-02"}, ...]`)을
보고, **그 개수만큼 실제 HTML 파일을 미리 다 만들어둡니다**:

```
out/lick/2026-07-04-01/index.html
out/lick/2026-07-04-02/index.html
out/lick/2026-07-04-03/index.html
...  (릭 30개 = HTML 파일 30개)
```

`data/licks/`에 새 JSON 파일을 추가하고 다시 build하면, `generateStaticParams()`가
새로 늘어난 id까지 포함해서 다시 목록을 만들어주고, 그만큼 새 HTML이 추가로 생성됩니다.
**이게 우리가 "릭 추가 → git push → 재배포"를 해야만 새 릭이 사이트에 뜨는 이유**입니다
(정적 export라 실시간으로 JSON을 읽는 서버가 없으니까).

---

## 6. 한 페이지 요청의 전체 데이터 흐름 (정리)

`/lick/2026-07-04-01` 빌드 과정을 함수 호출 순서로 보면:

```
generateStaticParams()
  └─ getAllLicksFlat()          [licks.ts]
       └─ getAllDates()          [licks.ts] → data/licks/*.json 파일명 목록
       └─ getLicksByDate(date)   [licks.ts] → 각 JSON 파일 내용 파싱

→ id="2026-07-04-01" 하나에 대해 LickDetailPage(page.tsx) 실행
  └─ getLickById(id)             [licks.ts] → 위에서 만든 배열 중 하나 찾기
  └─ <AlphaTabPlayer alphaTex={lick.alphaTex} />   ← 여기서 서버→클라 경계를 넘어감
                                                       (alphaTex 문자열이 props로 전달됨)
```

`AlphaTabPlayer`는 그 `alphaTex` 문자열을 **props로 받아서** 브라우저에서
`api.tex(alphaTex)`로 실제 렌더링/재생을 처리합니다. 즉, "무거운 데이터 읽기·검색"은
서버 컴포넌트(빌드 타임)가 다 처리하고, "화면에 그리고 재생하는" 무거운 작업만
클라이언트 컴포넌트에 맡기는 구조입니다. 이게 App Router에서 권장하는 기본 패턴이에요
— 클라이언트 컴포넌트는 되도록 작게, 필요한 최소한만.

---

## 7. 요약 체크리스트

- [ ] `output: "export"`라서 "서버가 없다" → SSR이 아니라 **빌드 타임 SSG**
- [ ] 폴더 = URL, `[대괄호]` = 동적 라우트, `page.tsx`가 있어야 진짜 페이지
- [ ] `layout.tsx`는 **중첩** 가능하고, `children`이 실제 페이지가 꽂히는 자리
- [ ] `"use client"`는 "하이드레이션용"이 아니라 **브라우저 API(state/effect/DOM)를
      쓰기 위한 표시** — 하이드레이션은 그 결과로 따라오는 것
- [ ] `generateStaticParams()`가 없으면 동적 라우트(`[id]`, `[date]`)는
      정적 export에서 아예 빌드가 안 됨
- [ ] 서버 컴포넌트(`fs` 쓰는 `licks.ts` 포함)와 클라이언트 컴포넌트
      (`AlphaTabPlayer.tsx`)는 props로만 데이터를 주고받음

### 첨언
- 작곡은 Gemini 모델이 넘사벽 수준... 단, 파싱 오류를 낼 때가 있음
- AlphaTab 파싱 검토는 클로드 코드가 잘해줌