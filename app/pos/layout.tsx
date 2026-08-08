import { PosCartProvider } from "../components/pos/PosCartContext";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <PosCartProvider>
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-gray-100 text-gray-900">
        {children}
      </div>
    </PosCartProvider>
  );
}
