"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSchema } from "@/schemas/auth";
import { loginUser } from "@/services/actions/auth.services";
import { setCredentials } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store";

type LoginData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
      setServerError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Email */}
      <div>
        <label className="text-xs font-medium text-neutral-400">
          Email address
        </label>
        <input
          {...register("email")}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
        {errors.email && (
          <p className="mt-2 text-xs text-red-400">
            {errors.email.message as string}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="text-xs font-medium text-neutral-400">
          Password
        </label>
        <input
          type="password"
          {...register("password")}
          placeholder="••••••••"
          className="mt-2 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
        {errors.password && (
          <p className="mt-2 text-xs text-red-400">
            {errors.password.message as string}
          </p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2">
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* CTA */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer">
        Forgot password?
      </p>
    </form>
  );
}
