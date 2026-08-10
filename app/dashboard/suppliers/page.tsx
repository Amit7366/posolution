"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, RefreshCcw, Search, Trash2, Truck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { AddEditSupplierModal, type SupplierFormValues } from "@/app/components/dashboard/suppliers/AddEditSupplierModal";
import { DeleteSupplierModal } from "@/app/components/dashboard/suppliers/DeleteSupplierModal";
import type { Supplier } from "@/app/types/supplier";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useGetSuppliersQuery,
  useUpdateSupplierMutation,
} from "@/redux/api/baseApi";

type ApiSupplier = {
  _id?: unknown;
  supplierId?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  address?: unknown;
  status?: unknown;
  balance?: unknown;
  createdAt?: unknown;
};

type StatusFilter = "all" | "active" | "inactive";

function mapSupplier(row: ApiSupplier): Supplier {
  return {
    id: String(row._id ?? ""),
    supplierId: String(row.supplierId ?? ""),
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    address: String(row.address ?? ""),
    status: String(row.status).toLowerCase() === "inactive" ? "Inactive" : "Active",
    balance: Number(row.balance ?? 0),
    createdAt: String(row.createdAt ?? ""),
  };
}

function rowsFromPayload(payload: unknown): ApiSupplier[] {
  if (Array.isArray(payload)) return payload as ApiSupplier[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    return Array.isArray(data) ? (data as ApiSupplier[]) : [];
  }
  return [];
}

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "data" in error) {
    const message = (error as { data?: { message?: string } }).data?.message;
    if (message) return message;
  }
  return fallback;
}

export default function SuppliersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const {
    data: payload,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSuppliersQuery();
  const [createSupplier, { isLoading: creating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: updating }] = useUpdateSupplierMutation();
  const [deleteSupplier, { isLoading: deletingSupplier }] = useDeleteSupplierMutation();

  const suppliers = useMemo(
    () => rowsFromPayload(payload).map(mapSupplier),
    [payload]
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      const statusMatches =
        status === "all" || supplier.status.toLowerCase() === status;
      const searchMatches =
        !needle ||
        [
          supplier.supplierId,
          supplier.name,
          supplier.phone,
          supplier.email,
          supplier.address,
        ].some((value) => value.toLowerCase().includes(needle));
      return statusMatches && searchMatches;
    });
  }, [search, status, suppliers]);

  function openAdd() {
    setMode("add");
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(supplier: Supplier) {
    setMode("edit");
    setEditing(supplier);
    setModalOpen(true);
  }

  async function submitSupplier(values: SupplierFormValues) {
    const body = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      address: values.address,
      status: values.status ? "active" : "inactive",
    };

    try {
      if (mode === "add") {
        await createSupplier(body).unwrap();
        toast.success("Supplier created");
      } else if (editing) {
        await updateSupplier({ supplierId: editing.supplierId, body }).unwrap();
        toast.success("Supplier updated");
      }
      setModalOpen(false);
      setEditing(null);
    } catch (mutationError) {
      toast.error(
        errorMessage(
          mutationError,
          mode === "add" ? "Failed to create supplier" : "Failed to update supplier"
        )
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteSupplier(deleting.supplierId).unwrap();
      toast.success("Supplier deleted");
      setDeleting(null);
    } catch (mutationError) {
      toast.error(errorMessage(mutationError, "Failed to delete supplier"));
    }
  }

  return (
    <div className="min-h-screen p-4 text-gray-900 dark:text-gray-200 md:p-6">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
      <div className="relative mx-auto w-full max-w-[1600px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-2.5 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Truck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Suppliers</h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
                Manage supplier contacts and status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
            >
              <RefreshCcw size={16} className={isFetching ? "animate-spin" : ""} />
              {t("dash.common.refresh")}
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white shadow-[0_10px_25px_-12px_rgba(249,115,22,0.8)] transition hover:bg-orange-400"
            >
              <Plus size={17} />
              Add Supplier
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID, name, phone or email…"
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {isError ? (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {errorMessage(error, "Failed to load suppliers")}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-9 rounded-lg bg-gray-100 dark:bg-gray-800" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center text-gray-500 dark:text-gray-400">
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  filtered.map((supplier) => (
                    <tr
                      key={supplier.id || supplier.supplierId}
                      className="transition hover:bg-orange-50/50 dark:hover:bg-orange-950/20"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {supplier.supplierId || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/suppliers/${encodeURIComponent(supplier.supplierId)}`}
                          className="font-semibold text-gray-900 hover:text-orange-600 hover:underline dark:text-white dark:hover:text-orange-400"
                        >
                          {supplier.name}
                        </Link>
                        {supplier.address ? (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-gray-400">
                            {supplier.address}
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                        {supplier.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {supplier.email || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            supplier.status === "Active"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {supplier.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/dashboard/suppliers/${encodeURIComponent(supplier.supplierId)}/purchases`}
                            title="View purchases"
                            className="rounded-lg p-2 text-gray-600 transition hover:bg-orange-100 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-900/30"
                          >
                            <ShoppingBag size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEdit(supplier)}
                            title="Edit supplier"
                            className="rounded-lg p-2 text-gray-600 transition hover:bg-orange-100 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-900/30"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(supplier)}
                            title="Delete supplier"
                            className="rounded-lg p-2 text-gray-600 transition hover:bg-red-100 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/30"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!isLoading ? (
            <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              Showing {filtered.length} of {suppliers.length} suppliers
            </div>
          ) : null}
        </div>
      </div>

      <AddEditSupplierModal
        open={modalOpen}
        mode={mode}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={submitSupplier}
        submitting={creating || updating}
      />

      <DeleteSupplierModal
        open={Boolean(deleting)}
        supplierName={deleting?.name}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        deleting={deletingSupplier}
      />
    </div>
  );
}
