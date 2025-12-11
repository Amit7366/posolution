import PosCart from "../components/PosCart";
import PosProductGrid from "../components/PosProductGrid";


export default function PosPage() {
  return (
    <div className="flex flex-1">
      <div className="flex-1 p-4">
        <PosProductGrid />
      </div>

      <div className="w-[350px] border-l dark:border-gray-800">
        <PosCart />
      </div>
    </div>
  );
}
