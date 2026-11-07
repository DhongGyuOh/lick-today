# 인증 마일스톤 (Supabase + JWT + HttpOnly 쿠키)

이 마일스톤은 Supabase를 데이터베이스로 사용하고, 세션 관리를 위해 HttpOnly 쿠키에 저장된 JWT 토큰을 사용하는 커스텀 인증 시스템 구현 단계를 설명합니다.

## 1. 환경 설정
- [ ] `.env.local` 파일 생성 (Git에 커밋하지 말 것)
- [ ] `SUPABASE_URL` 및 `SUPABASE_ANON_KEY` 추가
- [ ] 토큰 서명을 위한 `JWT_SECRET` 추가

## 2. 데이터베이스 스키마 (Supabase)
- [ ] `users` 테이블 생성:
    - `Id`: int8 (Primary Key, Identity)
    - `Email`: varchar (Unique)
    - `Password`: varchar (해시화된 비밀번호)
    - `IsActivated`: int2 (Default: 0)
    - `CreatedDate`: date (Default: now())

## 3. API 엔드포인트 (Next.js Route Handlers)
- [ ] **사용자 생성/회원가입**: 사용자 생성을 위한 헬퍼 (내부용 또는 별도 API)
- [ ] **로그인 (`POST /api/auth/login`)**:
    - Supabase에서 사용자 자격 증명 검증
    - JWT 토큰 생성 (페이로드: `{ Id, Email }`)
    - `Set-Cookie` 헤더 설정: `token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/`
- [ ] **로그아웃 (`POST /api/auth/logout`)**:
    - `token` 쿠키 제거
- [ ] **세션 확인 (`GET /api/auth/me`)**:
    - 쿠키에서 JWT 추출
    - JWT 검증
    - 유효한 경우 사용자 데이터 반환

## 4. 미들웨어 및 보호
- [ ] Next.js 미들웨어 (`middleware.ts`) 구현:
    - 쿠키의 JWT 확인
    - 인증되지 않은 사용자를 보호된 경로(예: `/dashboard`, `/profile`)에서 리다이렉트
    - 로그인한 사용자가 `/login` 페이지에 접근하는 것을 방지

## 5. UI 컴포넌트
- [ ] **로그인 페이지 (`/login`)**:
    - 단순 폼 (이메일/비밀번호)
    - 잘못된 정보 입력 시 에러 처리
    - 로딩 상태 표시
- [ ] **인증 컨텍스트 (Auth Provider/Context)**:
    - `user` 및 `isAuthenticated` 전역 상태 관리
    - 마운트 시 초기 세션 확인 처리

## 6. 보안 고려사항
- [ ] **HttpOnly**: XSS 공격으로부터 토큰 접근 방지
- [ ] **Secure 플래그**: HTTPS를 통해서만 쿠키 전송 (localhost 제외)
- [ ] **SameSite=Strict/Lax**: CSRF 공격 방지
- [ ] **CORS**: 신뢰할 수 있는 오리진의 요청만 허용하도록 설정
- [ ] **비밀번호 해싱**: Supabase 저장 전 `bcrypt` 또는 `argon2` 사용

## 7. CRUD 작업 (인증 이후)
- [ ] 사용자 프로필 업데이트: `name` 또는 기타 메타데이터 수정을 위한 보호된 API
- [ ] 사용자 테이블 조회: 관리자 또는 본인 정보 조회를 위한 유틸리티
