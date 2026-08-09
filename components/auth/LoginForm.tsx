"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { createLoginSchema, type LoginIdentifierType } from "@/schemas/auth";
import { loginUser } from "@/services/actions/auth.services";
import { setCredentials } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store";
import { useTranslation } from "@/lib/i18n/useTranslation";
import PasswordInput from "@/components/auth/PasswordInput";
import PhoneInput from "@/components/auth/PhoneInput";
import { cn } from "@/app/lib/cn";
import { normalizeBdPhone } from "@/lib/phone";

type LoginData = {
  identifier: string;
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
  const [identifierType, setIdentifierType] = useState<LoginIdentifierType>("phone");

  const loginSchema = useMemo(
    () => createLoginSchema(t, identifierType),
    [t, identifierType]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  useEffect(() => {
    reset({ identifier: "", password: "" });
    setServerError(null);
  }, [identifierType, reset]);

  const onSubmit = async (data: LoginData) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const identifier =
        identifierType === "phone"
          ? normalizeBdPhone(data.identifier)
          : identifierType === "username"
            ? data.identifier.trim().toLowerCase()
            : data.identifier.trim();

      const { accessToken, user } = await loginUser(
        identifier,
        data.password,
        identifierType
      );
      dispatch(setCredentials({ accessToken, user }));
      router.replace("/dashboard");
    } catch (error: unknown) {
      setServerError(error instanceof Error ? error.message : t("auth.loginForm.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const identifierLabel =
    identifierType === "email"
      ? t("auth.loginForm.emailLabel")
      : identifierType === "phone"
        ? t("auth.loginForm.phoneLabel")
        : t("auth.loginForm.usernameLabel");

  const identifierPlaceholder =
    identifierType === "email"
      ? t("auth.loginForm.emailPlaceholder")
      : identifierType === "phone"
        ? t("auth.loginForm.phonePlaceholder")
        : t("auth.loginForm.usernamePlaceholder");

  const alternateOptions = (
    [
      { type: "phone" as const, label: t("auth.loginForm.usePhoneInstead") },
      { type: "email" as const, label: t("auth.loginForm.useEmailInstead") },
      { type: "username" as const, label: t("auth.loginForm.useUsernameInstead") },
    ] as const
  ).filter((opt) => opt.type !== identifierType);

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={identifierType}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">
              {identifierLabel}
            </label>

            {identifierType === "phone" ? (
              <Controller
                name="identifier"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    placeholder={identifierPlaceholder}
                    error={!!errors.identifier}
                  />
                )}
              />
            ) : (
              <input
                {...register("identifier")}
                type={identifierType === "email" ? "email" : "text"}
                autoComplete={identifierType === "email" ? "email" : "username"}
                placeholder={identifierPlaceholder}
                className={cn(
                  inputClass,
                  errors.identifier && "border-red-400 dark:border-red-500"
                )}
              />
            )}

            {errors.identifier && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.identifier.message as string}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
          {t("auth.loginForm.orUse")}{" "}
          {alternateOptions.map((opt, index) => (
            <span key={opt.type}>
              {index > 0 && (
                <span className="text-gray-400 dark:text-neutral-500"> · </span>
              )}
              <button
                type="button"
                onClick={() => setIdentifierType(opt.type)}
                className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
              >
                {opt.type === "email"
                  ? t("auth.loginForm.emailLabel").toLowerCase()
                  : opt.type === "phone"
                    ? t("auth.loginForm.phoneLabel").toLowerCase()
                    : t("auth.loginForm.usernameLabel").toLowerCase()}
              </button>
            </span>
          ))}
        </p>
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
