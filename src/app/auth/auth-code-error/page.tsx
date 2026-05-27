import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            인증 링크가 유효하지 않습니다
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            링크가 만료되었거나 이미 사용된 링크입니다.
            <br />
            다시 시도하거나 새 링크를 요청해 주세요.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 text-center"
          >
            로그인으로 돌아가기
          </Link>
          <Link
            href="/"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 text-center"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
