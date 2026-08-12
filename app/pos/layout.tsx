import { PosCartProvider } from "../components/pos/PosCartContext";
import { PosOfflineProvider } from "../components/pos/offline/PosOfflineProvider";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <PosOfflineProvider>
      <PosCartProvider>
        <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
          {children}
        </div>
      </PosCartProvider>
    </PosOfflineProvider>
  );
}
