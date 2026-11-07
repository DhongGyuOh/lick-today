# 인증 시스템 파일 체크리스트

이 문서는 Supabase와 JWT를 활용한 인증 시스템 구현을 위해 필요한 파일들의 목록과 역할을 정의합니다.

## 1. 데이터베이스 및 유틸리티 (`src/lib/`)

| 파일 경로 | 역할 |
| :--- | :--- |
| `src/lib/db/dbconn.ts` | Supabase 클라이언트 초기화 및 연결 설정 |
| `src/lib/auth.ts` | JWT 토큰 생성(sign), 검증(verify) 및 쿠키 처리 헬퍼 함수 |

## 2. API 라우트 (`src/app/api/auth/`)

| 파일 경로 | 역할 |
| :--- | :--- |
| `src/app/api/auth/login/route.ts` | 사용자 자격 증명 검증, JWT 발급 및 HttpOnly 쿠키 설정 |
| `src/app/api/auth/logout/route.ts` | 세션 쿠키 삭제 및 로그아웃 처리 |
| `src/app/api/auth/me/route.ts` | 현재 로그인된 사용자 정보 조회 (세션 확인) |

## 3. 미들웨어 및 전역 보호 (`/`)

| 파일 경로 | 역할 |
| :--- | :--- |
| `middleware.ts` | 보호된 경로 접근 시 JWT 유효성 검사 및 리다이렉트 처리 |

## 4. UI 및 상태 관리 (`src/app/`, `src/components/`)

| 파일 경로 | 역할 |
| :--- | :--- |
| `src/app/login/page.tsx` | 로그인 폼 UI 및 API 연동 |
| `src/components/AuthProvider.tsx` | (필요 시) 로그인 상태를 앱 전체에서 공유하기 위한 Context Provider |
| `src/app/layout.tsx` | AuthProvider 적용 |
