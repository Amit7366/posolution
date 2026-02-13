import AuthTabs from "@/components/auth/AuthTabs";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <div className="w-full max-w-lg bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Login or create a new account
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Tabs */}
        <AuthTabs />

        {/* Form */}
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
