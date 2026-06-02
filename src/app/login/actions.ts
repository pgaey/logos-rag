"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
  info: string | null;
};

const schema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

export async function authAction(
  _: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const mode = formData.get("mode") as "login" | "signup";

  const result = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message, info: null };
  }

  const { email, password } = result.data;
  const supabase = await createClient();

  if (mode === "login") {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, info: null };
    revalidatePath("/", "layout");
    redirect("/qa");
  } else {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });
    if (error) return { error: error.message, info: null };
    return {
      error: null,
      info: "이메일로 전송된 인증 링크를 클릭하여 계정을 활성화하세요.",
    };
  }
}
