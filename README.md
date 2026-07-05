# Lick Today 🎸

AI(Dify 워크플로우)가 매일 생성한 기타 릭 5개 + 이론 설명을 탭악보와 사운드로 보여주는
정적 사이트. Next.js + alphaTab, Vercel 호스팅.

## 아키텍처

```
Dify 워크플로우 (릭 5개 + 이론 생성)
        │  결과를 JSON으로 저장
        ▼
data/licks/YYYY-MM-DD.json   ← 매일 이 파일 하나만 추가
        │  node scripts/validate-alphatex.mjs 로 문법 검증
        ▼
git add & commit & push
        │
        ▼
Vercel이 자동으로 빌드 & 배포
```

- **Next.js**: `output: "export"` 정적 export 모드 (서버 없이 완전 정적)
- **AI 생성물 저장**: `data/licks/*.json` (날짜별 파일, 릭 5개 배열)
- **탭악보 + 재생**: [alphaTab](https://www.alphatab.net/) — AlphaTex 텍스트만으로
  탭악보 렌더링과 사운드 재생(신디사이저)까지 처리. 별도 오디오 파일 불필요.
  기타 단독 트랙뿐 아니라 드럼 백킹 트랙(멀티트랙)도 지원.
- **재생 UI**: 재생 위치 시크바 + alphaTab 기본 커서(현재 마디/박자 하이라이트)
  + 트랙이 2개 이상(드럼 포함)일 때 자동으로 뜨는 Mute/Solo/Volume 믹서 패널
- **호스팅**: Vercel (GitHub 연동, push하면 자동 배포)

## 매일 하는 작업

1. Dify 워크플로우 실행 → 릭 5개(제목/키/스타일/난이도/BPM/이론/태그/AlphaTex) 결과 받기
2. 결과를 `data/licks/YYYY-MM-DD.json` 형식으로 저장 (아래 스키마 참고)
3. **커밋 전 필수**: 실제 alphaTab 파서로 문법 검증
   ```bash
   node scripts/validate-alphatex.mjs data/licks/YYYY-MM-DD.json
   ```
   모든 릭이 `OK`로 나와야 함. `FAIL`이 뜨면 `create_lick.md`의 문법 규칙 참고해서 수정.
4. `git add data/licks/YYYY-MM-DD.json && git commit -m "add licks YYYY-MM-DD" && git push`

→ push하면 Vercel이 자동으로 빌드하고 배포합니다. 별도 수동 배포 단계 없음.

## JSON 스키마 (`data/licks/YYYY-MM-DD.json`)

```json
{
  "date": "2026-07-04",
  "licks": [
    {
      "id": "2026-07-04-01",
      "title": "릭 제목",
      "key": "A minor",
      "style": "Blues",
      "difficulty": "Beginner | Intermediate | Advanced",
      "bpm": 90,
      "theory": "이론 설명 텍스트",
      "tags": ["pentatonic", "blues"],
      "hasDrums": false,
      "alphaTex": "\\title \"...\"\n\\tempo 90\n.\n0.6.4 3.6.4 ..."
    }
  ]
}
```

- `id`는 전체 사이트에서 유일해야 함 (상세 페이지 URL로 사용됨: `/lick/{id}`)
- `hasDrums`: `alphaTex`에 드럼 트랙이 포함되어 있으면 `true`. UI 배지 표시용
  메타데이터일 뿐이라 빼먹어도 재생 자체는 정상 동작하지만, 명시적으로 넣는 걸 권장.
- `alphaTex` 문법 상세 규칙(이펙트 표기, 드럼 트랙 작성법, GM 퍼커션 번호표 등)은
  **`create_lick.md` 참고**. Dify 프롬프트에 그대로 포함시켜서 AI가 처음부터
  유효한 문법으로 생성하도록 유도하는 용도.

### 드럼 트랙(멀티트랙) 추가하기

`alphaTex` 한 문자열 안에 기타 트랙과 드럼 트랙을 같이 작성할 수 있습니다:

```
\title "제목"
\tempo 120
.
\track "Guitar"
:8 0.6 3.6 0.5 2.5 0.6 3.6 0.5 2.5 |
\track "Drums" \instrument percussion \clef neutral
:8 36 42 38 42 36 42 38 42 |
```

- 드럼 노트는 GM(General MIDI) 퍼커션 번호를 그대로 씀 (예: 36=킥, 38=스네어, 42=하이햇 클로즈).
- 두 트랙의 마디 개수(`|` 개수)는 같아야 함.
- 자세한 표기 규칙과 GM 번호표는 `create_lick.md` 7번 섹션 참고.
- 드럼 트랙이 있으면 재생 화면에 트랙별 **Mute/Solo/Volume 믹서 패널**이 자동으로 나타남
  (트랙이 1개뿐이면 패널 자체가 숨겨짐 — 별도 설정 필요 없음).

## 재생 커서 (현재 위치 표시)

재생 중일 때 악보 위에 다음 두 가지가 표시됩니다:
- **마디 하이라이트**: 현재 재생 중인 마디 전체를 옅은 노란색으로 표시
- **박자 커서**: 현재 재생 위치를 나타내는 파란 세로선

이 스타일은 `src/app/globals.css`의 `.at-cursor-bar` / `.at-cursor-beat` 클래스로 정의되어 있습니다
(alphaTab이 기본으로 만들어주는 DOM에 CSS만 입힌 것). 색상/두께를 바꾸고 싶으면 이 CSS만 수정하면 됩니다.

**커서를 완전히 끄고 싶다면** `src/components/AlphaTabPlayer.tsx`에서 `enableCursor: true`를
`false`로 바꾸면 됩니다:

```ts
player: {
  enablePlayer: true,
  enableCursor: false, // 커서(마디 하이라이트 + 박자 라인) 비활성화
  ...
}
```

지금은 항상 켜진 상태(하드코딩)이며, 사용자가 화면에서 직접 켜고 끄는 토글 버튼은
아직 없습니다. 필요해지면 별도로 요청해서 추가하면 됩니다.

## 로컬 개발

```bash
npm install
npm run dev        # http://localhost:3000
```

파일을 덮어쓴 뒤 화면이 이상하면 캐시 문제일 수 있음:
```bash
rm -rf .next        # PowerShell: Remove-Item .next -Recurse -Force
npm run dev
```

## 배포

이 프로젝트는 **Vercel**을 통해 자동 배포됩니다.

### 최초 설정
1. GitHub 저장소를 Vercel에 Import
2. Framework를 **Next.js**로 선택 (자동 감지)
3. Deploy

### 이후 배포
```bash
git push
```
만 하면 Vercel이 자동으로 최신 버전을 빌드하고 배포합니다.

## 폴더 구조

```
src/app/                 # 페이지 (App Router)
  page.tsx               # 오늘의 릭 5개 (최신 날짜)
  lick/[id]/page.tsx      # 릭 상세 (탭악보+재생+이론)
  archive/page.tsx        # 전체 날짜 목록
  archive/[date]/page.tsx # 특정 날짜의 릭 5개
src/components/AlphaTabPlayer.tsx  # alphaTab 렌더링/재생 클라이언트 컴포넌트 (시크바, 믹서 패널 포함)
src/lib/licks.ts          # data/licks/*.json 읽는 유틸 (build 타임 실행)
src/types/lick.ts          # Lick 타입 정의
data/licks/*.json         # 매일 추가하는 데이터 (여기가 핵심!)
public/alphatab/          # alphaTab 런타임 에셋 (폰트/사운드폰트/워커/워클릿)
scripts/validate-alphatex.mjs  # AlphaTex 문법 검증 스크립트 (커밋 전 필수)
create_lick.md             # AlphaTex 작성 규칙 문서 (Dify 프롬프트용)
```
