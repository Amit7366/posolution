// app/dashboard/layout.tsx
import DashboardNavbar from "../components/DashboardNavbar";
import MobileSidebar from "../components/MobileSidebar";
import Sidebar from "../components/Sidebar";
import SubscriptionBanner from "../components/SubscriptionBanner";
import SubscriptionGuard from "../components/SubscriptionGuard";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { getApiBaseUrl } from "@/lib/api-base-url";

async function fetchSubscriptionStatus(token: string) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/payment/subscription/status`, {
      headers: {
        Authorization: token,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  let role: "admin" | "user" = "admin";
  if (accessToken) {
    try {
      const decoded: any = jwtDecode(accessToken);
      if (decoded?.role === "user") role = "user";
    } catch {
      // Default to admin if the token is malformed.
    }
  }

  // Fetch subscription status for user role only
  let subscriptionData: {
    status: string;
    daysLeft: number;
    hasPendingPayment: boolean;
  } | null = null;

  if (role === "user" && accessToken) {
    subscriptionData = await fetchSubscriptionStatus(accessToken);
  }

  const status = subscriptionData?.status ?? "none";
  const daysLeft = subscriptionData?.daysLeft ?? 0;
  const hasPendingPayment = subscriptionData?.hasPendingPayment ?? false;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar role={role} />
      <MobileSidebar role={role} />

      <main className="min-w-0 flex-1 md:ml-64">
        <DashboardNavbar />

        {role === "user" && (
          <SubscriptionBanner
            daysLeft={daysLeft}
            status={status}
            hasPendingPayment={hasPendingPayment}
          />
        )}

        <SubscriptionGuard daysLeft={daysLeft} status={status} role={role}>
          <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 dark:bg-gray-950">
            {children}
          </div>
        </SubscriptionGuard>
      </main>
    </div>
  );
}
