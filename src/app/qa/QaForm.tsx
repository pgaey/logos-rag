"use client";

import { useState, useTransition } from "react";
import { askQuestion, type AskResult } from "./actions";
import { messageForReason } from "./messages";
import type { VerseMatch } from "@/lib/search/cosine";

// askQuestion 은 typed object 인자(`{ question, k? }`)라 useActionState
// (prevState, formData) 시그니처와 안 맞는다. useState + useTransition 으로
// 직접 호출하는 편이 어댑터 없이 자연스럽다. (login 은 FormData라 useActionState)

function VerseCard({ verse }: { verse: VerseMatch }) {
  return (
    <li className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">
        {verse.book} {verse.chapter}:{verse.verse}
      </div>
      <p className="text-zinc-600 dark:text-zinc-400">{verse.text}</p>
    </li>
  );
}

export function QaForm() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return; // 클라이언트 1차 가드. action 측 invalid-input 이 2차 방어.
    startTransition(async () => {
      setResult(await askQuestion({ question: q }));
    });
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="성경에 대해 한국어로 질문해 보세요. 예: 천지창조에 대해 알려줘"
          className="w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-200 dark:focus:ring-zinc-200"
        />
        <button
          type="submit"
          disabled={isPending || !question.trim()}
          className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? "답변 생성 중… (5~15초)" : "질문하기"}
        </button>

        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
          AI가 생성한 답변으로 부정확하거나 불완전할 수 있습니다. 중요한 판단은 성경 원문과 전문가를 통해 확인하세요.
        </p>
      </form>

      {result && !result.ok && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {messageForReason(result.reason)}
        </div>
      )}

      {result && result.ok && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              답변
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
              {result.answer}
            </p>
          </div>

          {result.verses.length > 0 ? (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                근거 구절
              </h2>
              <ul className="space-y-2">
                {result.verses.map((v) => (
                  <VerseCard key={v.id} verse={v} />
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              관련 구절을 찾지 못했습니다.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
