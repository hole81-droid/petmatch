"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 해요"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setServerError("이메일 또는 비밀번호가 올바르지 않아요");
      return;
    }
    router.push("/discovery");
    router.refresh();
  }

  async function onGoogleLogin() {
    setIsGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div
      className="rounded-3xl p-6 border"
      style={{
        background: "rgba(255,255,255,0.72)",
        borderColor: "var(--line)",
        boxShadow: "0 12px 36px rgba(74,49,40,0.12)",
      }}
    >
      {/* Google 로그인 */}
      <button
        onClick={onGoogleLogin}
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border font-semibold text-sm transition-opacity disabled:opacity-60"
        style={{ borderColor: "var(--line)", color: "var(--brown)", background: "#fff" }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        {isGoogleLoading ? "연결 중..." : "Google로 시작하기"}
      </button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
        <span className="text-xs" style={{ color: "var(--muted)" }}>또는</span>
        <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
      </div>

      {/* 이메일 로그인 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            {...register("email")}
            type="email"
            placeholder="이메일"
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-colors"
            style={{ borderColor: errors.email ? "var(--coral)" : "var(--line)", background: "#fff", color: "var(--ink)" }}
          />
          {errors.email && (
            <p className="text-xs mt-1 ml-1" style={{ color: "var(--coral)" }}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="비밀번호"
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{ borderColor: errors.password ? "var(--coral)" : "var(--line)", background: "#fff", color: "var(--ink)" }}
          />
          {errors.password && (
            <p className="text-xs mt-1 ml-1" style={{ color: "var(--coral)" }}>{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-xs text-center py-2 rounded-xl" style={{ color: "var(--coral-dark)", background: "#fff0f0" }}>
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-2xl font-bold text-sm text-white transition-opacity disabled:opacity-60"
          style={{ background: "var(--coral)", boxShadow: "0 8px 20px rgba(244,111,117,0.3)" }}
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="text-center text-xs mt-4" style={{ color: "var(--muted)" }}>
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-bold" style={{ color: "var(--coral)" }}>
          회원가입
        </Link>
      </p>
    </div>
  );
}
