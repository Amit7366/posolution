"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Printer,
  Receipt,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetCustomerSummaryQuery,
  useGetInvoicesQuery,
  useUpdateCustomerMutation,
} from "@/redux/api/baseApi";
import CollectDueModal, { type CollectDueTarget } from "@/app/components/dues/CollectDueModal";
import Modal from "@/app/components/ui/Modal";

type InvoiceRow = {
  _id: string;
  invoiceNo: string;
  customerName?: string;
  totalAmount: number;
  paid: number;
  status: string;
  hold?: boolean;
  dueDate?: string;
  createdAt?: string;
};

function money(n: number) {
  return `৳${Number(n || 0).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

function amountDueOf(inv: InvoiceRow) {
  return Math.round((Number(inv.totalAmount) - Number(inv.paid)) * 100) / 100;
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const [page, setPage] = useState(1);
  const [collectTarget, setCollectTarget] = useState<CollectDueTarget | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const {
    data: summaryPayload,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useGetCustomerSummaryQuery(id, { skip: !id });

  const summary = (summaryPayload as { data?: { customer?: any; stats?: any } } | undefined)?.data;
  const customer = summary?.customer;
  const stats = summary?.stats;

  const {
    data: invPayload,
    isLoading: invLoading,
    isFetching: invFetching,
    refetch: refetchInvoices,
  } = useGetInvoicesQuery(
    { page, limit: 15, customerId: id },
    { skip: !id }
  );

  const invoices: InvoiceRow[] = useMemo(() => {
    const raw = (invPayload as { data?: InvoiceRow[] } | undefined)?.data;
    return Array.isArray(raw) ? raw : [];
  }, [invPayload]);

  const invMeta = (invPayload as { meta?: { total: number; limit: number; page: number } } | undefined)
    ?.meta;
  const invTotal = invMeta?.total ?? invoices.length;
  const invPages = Math.max(1, Math.ceil(invTotal / (invMeta?.limit || 15)));

  const [updateCustomer, { isLoading: saving }] = useUpdateCustomerMutation();

  function openEdit() {
    if (!customer) return;
    setEditName(customer.name || "");
    setEditPhone(customer.phone || "");
    setEditEmail(customer.email || "");
    setEditAddress(customer.address || "");
    setEditOpen(true);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await updateCustomer({
        id,
        body: {
          name: editName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim(),
          address: editAddress.trim(),
        },
      }).unwrap();
      toast.success("Customer updated");
      setEditOpen(false);
      refetchSummary();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message || "Update failed";
      toast.error(msg);
    }
  }

  if (!id) {
    return <p className="p-6 text-sm text-gray-500">Invalid customer</p>;
  }

  if (summaryLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Customer not found</p>
        <Link href="/dashboard/customers" className="mt-2 inline-block text-orange-600 hover:underline">
          Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/customers")}
            className="mt-1 rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {customer.name}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  customer.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {customer.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Customer details & invoices</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openEdit}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <Pencil size={16} /> Edit contact
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<ShoppingBag className="text-orange-500" size={18} />}
          label="Total Purchase"
          value={money(stats?.totalPurchase ?? 0)}
        />
        <StatCard
          icon={<Wallet className="text-emerald-500" size={18} />}
          label="Total Paid"
          value={money(stats?.totalPaid ?? 0)}
        />
        <StatCard
          icon={<Banknote className="text-red-500" size={18} />}
          label="Total Due"
          value={money(stats?.totalDue ?? 0)}
          highlight={Number(stats?.totalDue ?? 0) > 0}
        />
        <StatCard
          icon={<Receipt className="text-blue-500" size={18} />}
          label="Invoices"
          value={String(stats?.invoiceCount ?? 0)}
          sub={`${stats?.paidCount ?? 0} paid · ${stats?.unpaidCount ?? 0} unpaid`}
        />
        <StatCard
          icon={<Calendar className="text-violet-500" size={18} />}
          label="Last Purchase"
          value={formatDate(stats?.lastPurchaseAt)}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Profile
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Info icon={<Phone size={16} />} label="Phone" value={customer.phone || "—"} />
          <Info icon={<Mail size={16} />} label="Email" value={customer.email || "—"} />
          <Info icon={<MapPin size={16} />} label="Address" value={customer.address || "—"} />
          <Info
            icon={<Calendar size={16} />}
            label="Joined"
            value={formatDate(customer.createdAt)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Invoices</h2>
          <button
            type="button"
            onClick={() => {
              refetchInvoices();
              refetchSummary();
            }}
            className="text-sm text-orange-600 hover:underline"
          >
            {invFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {invLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4" colSpan={7}>
                      <div className="h-8 rounded bg-gray-100 dark:bg-gray-800" />
                    </td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No invoices for this customer
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const due = amountDueOf(inv);
                  return (
                    <tr key={inv._id}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {inv.invoiceNo}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {formatDate(inv.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            inv.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : inv.hold
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {inv.hold ? "Hold" : inv.status === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{money(inv.totalAmount)}</td>
                      <td className="px-4 py-3 text-right">{money(inv.paid)}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {money(Math.max(0, due))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/dashboard/sales/invoices/${inv._id}`}
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Details"
                          >
                            <Eye size={16} />
                          </Link>
                          {due > 0 && inv.status === "unpaid" && !inv.hold ? (
                            <button
                              type="button"
                              onClick={() =>
                                setCollectTarget({
                                  id: inv._id,
                                  invoiceNo: inv.invoiceNo,
                                  customerName: customer.name,
                                  amountDue: due,
                                })
                              }
                              className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                              title="Pay due"
                            >
                              <Banknote size={16} />
                            </button>
                          ) : null}
                          <Link
                            href={`/dashboard/sales/invoices/${inv._id}?print=1`}
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Print"
                          >
                            <Printer size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {invPages > 1 && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-gray-500">
              {page} / {invPages}
            </span>
            <button
              type="button"
              disabled={page >= invPages}
              onClick={() => setPage((p) => Math.min(invPages, p + 1))}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <CollectDueModal
        open={!!collectTarget}
        target={collectTarget}
        onClose={() => setCollectTarget(null)}
        onCollected={() => {
          setCollectTarget(null);
          refetchInvoices();
          refetchSummary();
        }}
      />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Customer" widthClassName="max-w-md">
        <form onSubmit={saveEdit} className="space-y-3 p-1">
          <Field label="Name *" value={editName} onChange={setEditName} required />
          <Field label="Phone" value={editPhone} onChange={setEditPhone} />
          <Field label="Email" value={editEmail} onChange={setEditEmail} />
          <Field label="Address" value={editAddress} onChange={setEditAddress} />
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 ${
        highlight ? "border-red-200 dark:border-red-900/50" : "border-gray-200"
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="truncate text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-gray-400">{sub}</p> : null}
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-medium text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-600">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800"
      />
    </label>
  );
}
