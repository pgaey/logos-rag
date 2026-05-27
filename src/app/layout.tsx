import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Logos RAG",
  description: "Bible Q&A grounded in scripture.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO(spec-03-02): 로그인 상태를 Supabase 에서 조회해 헤더 렌더링에 사용.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userEmail = data?.claims?.email ?? null;
  if (data) {
    console.log("User claims:", data);
    console.log("userEmail:", userEmail);
  }

  const signOutAction = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-black">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Logos RAG
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {userEmail ? (
              <>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {userEmail}
                </span>
                {/* TODO(spec-03-02): 로그아웃 form action 또는 client handler 연결
                    예: <form action={signOutAction}><button>로그아웃</button></form>
                       (signOutAction 은 server action 으로 supabase.auth.signOut() 호출 후 redirect) */}

                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                로그인
              </Link>
            )}
          </nav>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
