import type { NextConfig } from "next";

// GitHub Pages project 사이트(https://<user>.github.io/<repo>/)로 배포할 경우
// basePath/assetPrefix가 필요합니다. 리포지토리 이름이 다르면 아래 값을 수정하세요.
// 커스텀 도메인이나 <user>.github.io(유저 페이지)로 배포한다면 ""로 비워두면 됩니다.
const repoName = "lick-today";
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export", // 정적 export -> out/ 폴더 생성, GitHub Pages에 그대로 업로드
  images: {
    unoptimized: true, // GH Pages엔 이미지 최적화 서버가 없음
  },
  basePath: isGithubPages ? `/${repoName}` : "",
  assetPrefix: isGithubPages ? `/${repoName}/` : "",
  trailingSlash: true, // GH Pages 라우팅 이슈 방지
  env: {
    // 클라이언트 컴포넌트(AlphaTabPlayer)에서 정적 에셋 경로를 만들 때 사용
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? `/${repoName}` : "",
  },
};


export default nextConfig;

