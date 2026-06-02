import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";
import { QaForm } from "./QaForm";

// 인증의 주 게이트는 proxy.ts. 이 페이지의 requireUser 는 보조 가드로,
// 미인증 직접 접근 시 /login 으로 유도한다(UX). 실제 데이터 보호는
// askQuestion server action 자체의 인증 재검증이 담당한다.
export default async function QaPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">성경 Q&amp;A</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            한국어로 질문하면 성경 구절을 근거로 답변합니다.
          </p>
        </header>
        <QaForm />
      </div>
    </main>
  );
}
