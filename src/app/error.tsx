"use client";

export default function ErrorPage({error, reset}: {error: Error, reset: () => void}) 
{
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">오류 발생</h1>
      <p className="text-neutral-400 text-lg">
        페이지를 불러오는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
        <button onClick={() => reset()}>
         다시 시도
        </button>
    </div>
  );
}