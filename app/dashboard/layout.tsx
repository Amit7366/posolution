// app/(dashboard)/layout.tsx
import DashboardNavbar from "../components/DashboardNavbar";
import MobileSidebar from "../components/MobileSidebar";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role: "admin" | "user" = "admin";

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      <Sidebar role={role} />
      <MobileSidebar role={role} />

      <main className="flex-1">
        <DashboardNavbar />
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
