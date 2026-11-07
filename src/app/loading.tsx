export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">로딩 중...</h1>
      <p className="text-neutral-400 text-lg">
        페이지를 불러오는 중입니다. 잠시만 기다려주세요.
      </p>
    </div>
  );
}