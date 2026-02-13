"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { registerSchema } from "@/schemas/auth";

type RegisterData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <motion.form
      onSubmit={handleSubmit(console.log)}
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

      {/* CTA */}
      <button className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition">
        Create account
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
