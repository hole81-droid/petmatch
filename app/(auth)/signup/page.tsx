"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const signupSchema = z
  .object({
    email: z.string().email("올바른 이메일을 입력해주세요"),
    password: z.string().min(6, "비밀번호는 6자 이상이어야 해요"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않아요",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupForm) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setServerError(error.message === "User already registered"
        ? "이미 가입된 이메일이에요"
        : "회원가입에 실패했어요. 다시 시도해주세요");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div
        className="rounded-3xl p-8 border text-center"
        style={{ background: "rgba(255,255,255,0.72)", borderColor: "var(--line)" }}
      >
        <div className="text-4xl mb-3">📬</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--ink)" }}>
          이메일을 확인해주세요
        </h2>
        <p className="text-sm" style={{ color: "var(--pm-muted)" }}>
          입력하신 이메일로 확인 링크를 보냈어요.<br />
          링크를 클릭하면 PetMatch가 시작돼요!
        </p>
      </div>
    );
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            {...register("email")}
            type="email"
            placeholder="이메일"
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
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
            placeholder="비밀번호 (6자 이상)"
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{ borderColor: errors.password ? "var(--coral)" : "var(--line)", background: "#fff", color: "var(--ink)" }}
          />
          {errors.password && (
            <p className="text-xs mt-1 ml-1" style={{ color: "var(--coral)" }}>{errors.password.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("confirmPassword")}
            type="password"
            placeholder="비밀번호 확인"
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{ borderColor: errors.confirmPassword ? "var(--coral)" : "var(--line)", background: "#fff", color: "var(--ink)" }}
          />
          {errors.confirmPassword && (
            <p className="text-xs mt-1 ml-1" style={{ color: "var(--coral)" }}>{errors.confirmPassword.message}</p>
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
          {isSubmitting ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <p className="text-center text-xs mt-4" style={{ color: "var(--pm-muted)" }}>
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-bold" style={{ color: "var(--coral)" }}>
          로그인
        </Link>
      </p>
    </div>
  );
}
