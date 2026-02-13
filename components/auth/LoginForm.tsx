"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { loginSchema } from "@/schemas/auth";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <motion.form
      onSubmit={handleSubmit(console.log)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
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

      {/* CTA */}
      <button className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition">
        Sign in
      </button>

      <p className="text-center text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer">
        Forgot password?
      </p>
    </motion.form>
  );
}
