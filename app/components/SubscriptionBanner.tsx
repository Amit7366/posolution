"use client";

import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";

interface Props {
  daysLeft: number;
  status: string;
  hasPendingPayment: boolean;
}

export default function SubscriptionBanner({ daysLeft, status, hasPendingPayment }: Props) {
  if (status === "active" && daysLeft > 7) return null;

  if (status === "expired") {
    return (
      <div className="flex items-center gap-3 bg-red-600 px-4 py-2.5 text-sm text-white">
        <AlertTriangle size={16} className="shrink-0" />
        <span>
          Your subscription has <strong>expired</strong>.{" "}
          {hasPendingPayment ? (
            "Your payment is under review."
          ) : (
            <>
              Please{" "}
              <Link href="/dashboard/billing" className="underline font-semibold hover:text-red-100">
                renew now
              </Link>{" "}
              to regain full access.
            </>
          )}
        </span>
      </div>
    );
  }

  if (status === "active" && daysLeft <= 7) {
    return (
      <div className="flex items-center gap-3 bg-orange-500 px-4 py-2.5 text-sm text-white">
        <Clock size={16} className="shrink-0" />
        <span>
          Your subscription expires in <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>.{" "}
          {hasPendingPayment ? (
            "Your renewal payment is under review."
          ) : (
            <>
              <Link href="/dashboard/billing" className="underline font-semibold hover:text-orange-100">
                Renew now
              </Link>{" "}
              to avoid interruption.
            </>
          )}
        </span>
      </div>
    );
  }

  if (status === "none" || status === "pending") {
    return (
      <div className="flex items-center gap-3 bg-yellow-500 px-4 py-2.5 text-sm text-white">
        <AlertTriangle size={16} className="shrink-0" />
        <span>
          No active subscription.{" "}
          {hasPendingPayment ? (
            "Your payment is under review."
          ) : (
            <>
              <Link href="/dashboard/billing" className="underline font-semibold hover:text-yellow-100">
                Submit payment
              </Link>{" "}
              to activate your account.
            </>
          )}
        </span>
      </div>
    );
  }

  return null;
}
