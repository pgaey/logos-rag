"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { authAction, type AuthState } from "./actions";

type Tab = "login" | "signup";

const initialState: AuthState = { error: null, info: null };

function SubmitButton({ tab }: { tab: Tab }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {pending ? "처리 중…" : tab === "login" ? "로그인" : "회원가입"}
    </button>
  );
}

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [state, formAction] = useActionState(authAction, initialState);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Logos RAG</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            계정에 로그인하거나 새 계정을 만들어 주세요.
          </p>
        </header>

        {/* 탭 */}
        <div className="flex rounded-md border border-zinc-200 p-1 text-sm dark:border-zinc-800">
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`flex-1 rounded px-3 py-1.5 transition ${
                tab === t
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
              onClick={() => setTab(t)}
            >
              {t === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        {/* 폼 */}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="mode" value={tab} />

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-200 dark:focus:ring-zinc-200"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-200 dark:focus:ring-zinc-200"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <div
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              {state.error}
            </div>
          )}

          {state.info && (
            <div
              role="status"
              className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {state.info}
            </div>
          )}

          <SubmitButton tab={tab} />
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-zinc-500 dark:bg-black dark:text-zinc-500">
              또는
            </span>
          </div>
        </div>

        <button
          type="button"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Google 로 계속
        </button>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
          <Link href="/" className="underline-offset-2 hover:underline">
            홈으로
          </Link>
        </p>
      </div>
    </main>
  );
}
