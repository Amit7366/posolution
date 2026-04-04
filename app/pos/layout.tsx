import PosSidebar from "../components/PosSidebar";
import { PosLanguageSlot } from "../components/PosLanguageSlot";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-white dark:bg-gray-900">
      <PosLanguageSlot />
      <PosSidebar />

      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
