"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import PosHeader from "../components/pos/PosHeader";
import PosProductPanel from "../components/pos/PosProductPanel";
import PosCartPanel from "../components/pos/PosCartPanel";
import PosPaymentSheet from "../components/pos/PosPaymentSheet";
import PosTransactionsSheet from "../components/pos/PosTransactionsSheet";
import { usePosCart, isCustomerSelected } from "../components/pos/PosCartContext";
import { formatTaka } from "../components/pos/formatTaka";

export default function PosPage() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const { productCount, grandTotal, items, customer } = usePosCart();

  function tryOpenPayment() {
    if (!isCustomerSelected(customer)) {
      toast.error("Please select a customer");
      return;
    }
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setPaymentOpen(true);
  }

  return (
    <>
      <PosHeader onOpenTransactions={() => setTxOpen(true)} />

      <div className="flex min-h-0 flex-1 gap-3 p-3 sm:p-4">
        <div className="min-h-0 min-w-0 flex-1">
          <PosProductPanel />
        </div>

        {/* Desktop cart */}
        <div className="hidden w-[360px] shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:flex lg:flex-col">
          <PosCartPanel onPlaceOrder={() => setPaymentOpen(true)} />
        </div>
      </div>

      {/* Mobile sticky cart bar */}
      <div className="shrink-0 border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileCartOpen(true)}
          className="flex w-full items-center justify-between rounded-xl bg-gray-900 px-4 py-3 text-white dark:bg-black"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <ShoppingCart size={18} />
            {productCount} items
          </span>
          <span className="font-bold">{formatTaka(grandTotal)}</span>
        </button>
        {items.length > 0 && (
          <button
            type="button"
            disabled={!isCustomerSelected(customer)}
            onClick={tryOpenPayment}
            className="mt-2 w-full rounded-xl bg-orange-500 py-3 text-sm font-bold uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Place Order
          </button>
        )}
      </div>

      {/* Mobile cart drawer */}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close cart"
            onClick={() => setMobileCartOpen(false)}
          />
          <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-gray-900">
            <PosCartPanel
              compact
              onPlaceOrder={() => {
                setMobileCartOpen(false);
                setPaymentOpen(true);
              }}
            />
          </div>
        </div>
      )}

      <PosPaymentSheet open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <PosTransactionsSheet open={txOpen} onClose={() => setTxOpen(false)} />
    </>
  );
}
