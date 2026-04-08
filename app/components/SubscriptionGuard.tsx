"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";

interface Props {
  children: React.ReactNode;
  daysLeft: number;
  status: string;
  role: "admin" | "user";
}

const BILLING_PATHS = ["/dashboard/billing", "/dashboard/payments"];

export default function SubscriptionGuard({ children, daysLeft, status, role }: Props) {
  const pathname = usePathname();

  // Admins and superAdmins are never blocked
  if (role === "admin") return <>{children}</>;

  const isExpired = status === "expired" || status === "none";
  const onBillingPage = BILLING_PATHS.some((p) => pathname.startsWith(p));

  if (isExpired && !onBillingPage) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Lock size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscription Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your subscription has expired or is not active. Please submit a renewal payment to
            regain access to all features.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-block rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600 transition"
          >
            Go to Billing &amp; Payment
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
