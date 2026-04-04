// app/(dashboard)/layout.tsx
import DashboardNavbar from "../components/DashboardNavbar";
import MobileSidebar from "../components/MobileSidebar";
import Sidebar from "../components/Sidebar";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

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

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar role={role} />
      <MobileSidebar role={role} />

      <main className="min-w-0 flex-1 md:ml-64">
        <DashboardNavbar />
        <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 dark:bg-gray-950">{children}</div>
      </main>
    </div>
  );
}
