"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { createLoginSchema } from "@/schemas/auth";
import { loginUser } from "@/services/actions/auth.services";
import { setCredentials } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store";
import { useTranslation } from "@/lib/i18n/useTranslation";
import PasswordInput from "@/components/auth/PasswordInput";
import { cn } from "@/app/lib/cn";

type LoginData = {
  email: string;
  password: string;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

export default function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const loginSchema = useMemo(() => createLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const { accessToken, user } = await loginUser(data.email, data.password);
      dispatch(setCredentials({ accessToken, user }));
      router.replace("/dashboard");
    } catch (error: unknown) {
      setServerError(error instanceof Error ? error.message : t("auth.loginForm.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">
          {t("auth.loginForm.emailLabel")}
        </label>
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          placeholder={t("auth.loginForm.emailPlaceholder")}
          className={cn(inputClass, errors.email && "border-red-400 dark:border-red-500")}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-500">{errors.email.message as string}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">
          {t("auth.loginForm.passwordLabel")}
        </label>
        <PasswordInput
          {...register("password")}
          autoComplete="current-password"
          placeholder="••••••••"
          error={!!errors.password}
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-500">{errors.password.message as string}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs font-medium text-gray-500 transition hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
        >
          {t("auth.loginForm.forgotPassword")}
        </button>
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
      >
        {submitting ? t("auth.loginForm.signingIn") : t("auth.loginForm.signIn")}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-neutral-400">
        {t("auth.noAccount")}{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("auth.signUp")}
        </Link>
      </p>
    </form>
  );
}
