"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createRegisterSchema } from "@/schemas/auth";
import { registerUser } from "@/services/actions/auth.services";
import { useTranslation } from "@/lib/i18n/useTranslation";
import PasswordInput from "@/components/auth/PasswordInput";
import { cn } from "@/app/lib/cn";

type RegisterData = {
  name: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export default function RegisterForm() {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterData) => {
    setSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      await registerUser({
        name: data.name,
        userName: data.userName,
        email: data.email,
        password: data.password,
      });
      setSuccessMessage(t("auth.registerForm.successMessage"));
      reset({ acceptTerms: false });
    } catch (error: unknown) {
      setServerError(
        error instanceof Error ? error.message : t("auth.registerForm.failed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">
          {t("auth.registerForm.fullNameLabel")}
        </label>
        <input
          {...register("name")}
          autoComplete="name"
          placeholder={t("auth.registerForm.fullNamePlaceholder")}
          className={cn(inputClass, errors.name && "border-red-400")}
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          {t("auth.registerForm.usernameLabel")}
        </label>
        <input
          {...register("userName")}
          autoComplete="username"
          placeholder={t("auth.registerForm.usernamePlaceholder")}
          className={cn(inputClass, errors.userName && "border-red-400")}
        />
        {errors.userName && (
          <p className="mt-1.5 text-xs text-red-500">{errors.userName.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          {t("auth.registerForm.emailLabel")}
        </label>
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          placeholder={t("auth.registerForm.emailPlaceholder")}
          className={cn(inputClass, errors.email && "border-red-400")}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          {t("auth.registerForm.passwordLabel")}
        </label>
        <PasswordInput
          {...register("password")}
          autoComplete="new-password"
          placeholder="••••••••"
          error={!!errors.password}
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          {t("auth.registerForm.confirmPasswordLabel")}
        </label>
        <PasswordInput
          {...register("confirmPassword")}
          autoComplete="new-password"
          placeholder="••••••••"
          error={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            {...register("acceptTerms")}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            {t("auth.registerForm.termsPrefix")}{" "}
            <span className="font-medium text-blue-600 underline underline-offset-2">
              {t("auth.registerForm.termsLink")}
            </span>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="mt-1.5 text-xs text-red-500">{errors.acceptTerms.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-sm text-red-600">{serverError}</p>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? t("auth.registerForm.creatingAccount")
          : t("auth.registerForm.createAccount")}
      </button>

      <p className="text-center text-sm text-gray-500">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          {t("auth.logIn")}
        </Link>
      </p>
    </form>
  );
}
