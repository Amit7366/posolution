import PosSidebar from "../components/PosSidebar";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      <PosSidebar />

      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
