import type { NextConfig } from "next";

// Vercel에 배포하므로 GitHub Pages용 basePath/서브패스 설정이 필요 없습니다.
// (과거 GitHub Pages로 배포할 때 쓰던 설정은 git 히스토리에 남아있습니다.)
const nextConfig: NextConfig = {
  output: "export", // 정적 export -> out/ 폴더 생성. Vercel도 정적 사이트로 그대로 서빙 가능.
  images: {
    unoptimized: true, // 정적 export에는 이미지 최적화 서버가 없음
  },
  trailingSlash: true, // 정적 export에서 디렉터리 index.html 라우팅 안정성을 위해 유지
  env: {
    // 클라이언트 컴포넌트(AlphaTabPlayer)에서 정적 에셋 경로를 만들 때 사용.
    // 서브패스 배포가 필요해지면 이 값을 바꾸면 됩니다.
    NEXT_PUBLIC_BASE_PATH: "",
  },
};

export default nextConfig;


