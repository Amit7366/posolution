"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { registerSchema } from "@/schemas/auth";
import { registerUser } from "@/services/actions/auth.services";

type RegisterData = {
  name: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
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
      setSuccessMessage("Account created successfully. You can now log in.");
      reset();
    } catch (error: any) {
      setServerError(error?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Full Name */}
      <div>
        <label className="text-xs font-medium text-neutral-400">
          Full name
        </label>
        <input
          {...register("name")}
          placeholder="John Doe"
          className="mt-2 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
        {errors.name && (
          <p className="mt-2 text-xs text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Username */}
      <div>
        <label className="text-xs font-medium text-neutral-400">
          Username
        </label>
        <input
          {...register("userName")}
          placeholder="sohojuser1"
          className="mt-2 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
        {errors.userName && (
          <p className="mt-2 text-xs text-red-400">
            {errors.userName.message}
          </p>
        )}
      </div>

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
            {errors.email.message}
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
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="text-xs font-medium text-neutral-400">
          Confirm password
        </label>
        <input
          type="password"
          {...register("confirmPassword")}
          placeholder="••••••••"
          className="mt-2 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
        {errors.confirmPassword && (
          <p className="mt-2 text-xs text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-xs text-red-400">{serverError}</p>
      )}

      {successMessage && (
        <p className="text-xs text-green-400">{successMessage}</p>
      )}

      {/* CTA */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-xs text-neutral-500">
        By signing up, you agree to our{" "}
        <span className="underline hover:text-neutral-300 cursor-pointer">
          Terms & Privacy Policy
        </span>
      </p>
    </motion.form>
  );
}
