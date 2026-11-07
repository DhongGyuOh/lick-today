
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - 페이지를 찾을 수 없음</h1>
      <p className="text-neutral-400 text-lg">
        요청하신 페이지를 찾을 수 없습니다. URL을 확인하거나 홈으로 돌아가세요.
      </p>
    </div>
  );
}