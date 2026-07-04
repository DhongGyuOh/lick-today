# Lick Today 🎸

AI(Dify 워크플로우)가 매일 생성한 기타 릭 5개 + 이론 설명을 탭악보와 사운드로 보여주는
정적 사이트. Next.js + alphaTab, GitHub Pages 호스팅.

## 아키텍처

```
Dify 워크플로우 (릭 5개 + 이론 생성)
        │  결과를 JSON으로 저장
        ▼
data/licks/YYYY-MM-DD.json   ← 매일 이 파일 하나만 추가
        │  git add & commit & push (수동 배포)
        ▼
npm run build:gh  →  out/ 폴더 (정적 export)
        │
        ▼
GitHub Pages (gh-pages 브랜치 or Actions)
```

- **Next.js**: `output: "export"` 정적 export 모드 (서버 없이 완전 정적)
- **AI 생성물 저장**: `data/licks/*.json` (날짜별 파일, 릭 5개 배열)
- **탭악보 + 재생**: [alphaTab](https://www.alphatab.net/) — AlphaTex 텍스트만으로
  탭악보 렌더링과 사운드 재생(신디사이저)까지 처리. 별도 오디오 파일 불필요.
- **호스팅**: GitHub Pages

## 매일 하는 작업

1. Dify 워크플로우 실행 → 릭 5개(제목/키/스타일/난이도/BPM/이론/태그/AlphaTex) 결과 받기
2. 결과를 `data/licks/YYYY-MM-DD.json` 형식으로 저장 (아래 스키마 참고)
3. `npm run build:gh` 로 정적 빌드가 정상적으로 되는지 로컬 확인 (선택)
4. `git add data/licks/YYYY-MM-DD.json && git commit -m "add licks YYYY-MM-DD" && git push`

→ `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드 후
GitHub Pages에 배포합니다. (완전 수동으로 하고 싶다면 아래 "수동 배포" 참고)

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
      "alphaTex": "\\title \"...\"\n\\tempo 90\n.\n0.6.4 3.6.4 ..."
    }
  ]
}
```

- `id`는 전체 사이트에서 유일해야 함 (상세 페이지 URL로 사용됨: `/lick/{id}`)
- `alphaTex`는 [AlphaTex 문법](https://www.alphatab.net/docs/alphatex/introduction)을
  따르는 텍스트. Dify 프롬프트에서 이 문법으로 바로 출력하도록 지시하면 편합니다.
  (형식: `프렛.줄.박자` 예: `0.6.4` = 6번줄 개방, 4분음표)

## 로컬 개발

```bash
npm install
npm run dev        # http://localhost:3000
```

---
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
---

## 폴더 구조

```
src/app/                 # 페이지 (App Router)
  page.tsx               # 오늘의 릭 5개 (최신 날짜)
  lick/[id]/page.tsx      # 릭 상세 (탭악보+재생+이론)
  archive/page.tsx        # 전체 날짜 목록
  archive/[date]/page.tsx # 특정 날짜의 릭 5개
src/components/AlphaTabPlayer.tsx  # alphaTab 렌더링/재생 클라이언트 컴포넌트
src/lib/licks.ts          # data/licks/*.json 읽는 유틸 (build 타임 실행)
data/licks/*.json         # 매일 추가하는 데이터 (여기가 핵심!)
public/alphatab/          # alphaTab 런타임 에셋 (폰트/사운드폰트/워커)
```
