import { UsersRound, ShoppingCart, Truck } from "lucide-react";
import CustomersOverviewCard from "./CustomersOverviewCard";

export default function OverallInformationCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 w-full">
      <h2 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-200">
        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full">i</span>
        Overall Information
      </h2>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="border p-4 rounded-xl text-center">
          <Truck className="mx-auto text-blue-500" />
          <p>Suppliers</p>
          <h3 className="font-bold text-xl">6987</h3>
        </div>
        <div className="border p-4 rounded-xl text-center">
          <UsersRound className="mx-auto text-orange-500" />
          <p>Customer</p>
          <h3 className="font-bold text-xl">4896</h3>
        </div>
        <div className="border p-4 rounded-xl text-center">
          <ShoppingCart className="mx-auto text-green-600" />
          <p>Orders</p>
          <h3 className="font-bold text-xl">487</h3>
        </div>
      </div>
      <CustomersOverviewCard/>
    </div>
  );
}
