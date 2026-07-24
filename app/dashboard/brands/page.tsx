"use client";

import { AddEditBrandModal } from "@/app/components/dashboard/brands/AddEditBrandModal";
import { BrandTable } from "@/app/components/dashboard/brands/BrandTable";
import { BrandToolbar, SortOrder, StatusFilter } from "@/app/components/dashboard/brands/BrandToolbar";
import { cn } from "@/app/lib/cn";
import { exportBrandsToCSV, exportBrandsToXLS } from "@/app/lib/export";
import { Brand } from "@/app/types/brand";
import { uploadImageToCloudinary } from "@/lib/upload-image";
import {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useGetBrandsQuery,
  useUpdateBrandMutation,
} from "@/redux/api/baseApi";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/useTranslation";

function getQueryErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "object" && error !== null && "data" in error) {
    const d = (error as { data?: { message?: string } }).data;
    if (d?.message) return String(d.message);
  }
  if (typeof error === "object" && error !== null && "error" in error) {
    return String((error as { error: string }).error);
  }
  return null;
}

function toastMutationError(e: unknown, fallback: string) {
  const data = (e as { data?: { message?: string; errorSources?: { path: string; message: string }[] } })
    ?.data;
  const msg = data?.message;
  const details = data?.errorSources?.length
    ? data.errorSources.map((s) => `${s.path}: ${s.message}`).join(", ")
    : undefined;
  toast.error(details ? `${msg ?? fallback} (${details})` : msg ?? fallback);
}

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mapApiRow(row: Record<string, unknown>): Brand {
  const rawId = row._id;
  const id =
    typeof rawId === "object" && rawId !== null && "toString" in rawId
      ? String((rawId as { toString(): string }).toString())
      : String(rawId ?? "");
  const status: Brand["status"] = row.status === "inactive" ? "Inactive" : "Active";
  let createdAt = "";
  if (typeof row.createdAt === "string") createdAt = row.createdAt;
  else if (row.createdAt instanceof Date) createdAt = row.createdAt.toISOString();
  return {
    id,
    slug: typeof row.slug === "string" ? row.slug : undefined,
    name: String(row.name ?? ""),
    createdAt,
    status,
    logoUrl:
      typeof row.imageUrl === "string" && row.imageUrl.trim()
        ? String(row.imageUrl)
        : undefined,
  };
}

async function dataUrlToUploadedUrl(dataUrl?: string): Promise<string | undefined> {
  if (!dataUrl) return undefined;
  if (!dataUrl.startsWith("data:")) return dataUrl;
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type.includes("png") ? "png" : "jpg";
  const file = new File([blob], `brand.${ext}`, { type: blob.type || "image/jpeg" });
  return uploadImageToCloudinary(file);
}

export default function BrandsPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sort, setSort] = useState<SortOrder>("Latest");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<Brand | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const statusParam =
    statusFilter === "All" ? undefined : statusFilter === "Active" ? "active" : "inactive";

  const {
    data: listPayload,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetBrandsQuery({
    page,
    limit: rowsPerPage,
    search: debouncedQuery,
    ...(statusParam ? { status: statusParam } : {}),
    sortBy: "createdAt",
    sortOrder: sort === "Latest" ? "desc" : "asc",
  });

  const total = listPayload?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const brands = useMemo(() => {
    const raw = listPayload?.data;
    if (!Array.isArray(raw)) return [];
    return raw.map((r) => mapApiRow(r as Record<string, unknown>));
  }, [listPayload]);

  const [createBrand, { isLoading: creating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: updating }] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();
  const submitting = creating || updating;

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const allOnPageSelected = brands.length > 0 && brands.every((b) => selected[b.id]);
  const someOnPageSelected = brands.some((b) => selected[b.id]) && !allOnPageSelected;

  function toggleAllOnPage() {
    const next = { ...selected };
    const target = !allOnPageSelected;
    for (const b of brands) next[b.id] = target;
    setSelected(next);
  }

  function toggleOne(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function deleteOne(id: string) {
    if (!confirm(t("dash.brands.deleteOne"))) return;
    try {
      await deleteBrand(id).unwrap();
      toast.success(t("dash.brands.deleted"));
      setSelected((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      refetch();
    } catch (e) {
      toastMutationError(e, t("dash.brands.deleteFailed"));
    }
  }

  async function bulkDelete() {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (ids.length === 0) return;
    if (!confirm(t("dash.brands.bulkDelete", { count: ids.length }))) return;
    try {
      await Promise.all(ids.map((id) => deleteBrand(id).unwrap()));
      toast.success(t("dash.brands.deletedMany"));
      setSelected({});
      refetch();
    } catch (e) {
      toastMutationError(e, t("dash.brands.bulkDeleteFailed"));
    }
  }

  function openAdd() {
    setModalMode("add");
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(brand: Brand) {
    setModalMode("edit");
    setEditing(brand);
    setModalOpen(true);
  }

  async function submitModal(payload: { name: string; status: boolean; logoDataUrl?: string }) {
    const slug = generateSlug(payload.name);
    if (slug.length < 2) {
      toast.error(t("dash.brands.slugError"));
      return;
    }

    let imageUrl: string | undefined;
    try {
      imageUrl = await dataUrlToUploadedUrl(payload.logoDataUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dash.brands.imageUploadFailed"));
      return;
    }

    const body: Record<string, unknown> = {
      name: payload.name.trim(),
      slug,
      status: payload.status ? "active" : "inactive",
    };
    if (imageUrl) body.imageUrl = imageUrl;

    try {
      if (modalMode === "add") {
        await createBrand(body).unwrap();
        toast.success(t("dash.brands.created"));
      } else if (editing) {
        await updateBrand({ id: editing.id, body }).unwrap();
        toast.success(t("dash.brands.updated"));
      }
      setModalOpen(false);
      refetch();
    } catch (e) {
      toastMutationError(e, modalMode === "add" ? t("dash.brands.createFailed") : t("dash.brands.updateFailed"));
    }
  }

  function refresh() {
    setQuery("");
    setStatusFilter("All");
    setSort("Latest");
    setRowsPerPage(10);
    setPage(1);
    setSelected({});
    void refetch();
  }

  function exportPDF() {
    window.print();
  }

  function exportXLS() {
    exportBrandsToXLS(brands, "brands.xls");
  }

  function exportCSV() {
    exportBrandsToCSV(brands, "brands.csv");
  }

  const errMsg = isError ? (getQueryErrorMessage(error) ?? t("dash.brands.failedLoad")) : null;

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t("dash.brands.title")}</h1>
            <p className="mt-1 text-sm text-slate-400">{t("dash.brands.manage")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportPDF}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
              title={t("dash.common.exportPdf")}
              type="button"
            >
              <PdfIcon />
            </button>
            <button
              onClick={exportXLS}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
              title={t("dash.common.exportXls")}
              type="button"
            >
              <XlsIcon />
            </button>
            <button
              onClick={exportCSV}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
              title={t("dash.common.exportCsv")}
              type="button"
            >
              <CsvIcon />
            </button>

            <button
              onClick={refresh}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
              title={t("dash.common.refresh")}
              type="button"
            >
              <RefreshIcon />
            </button>

            <button
              onClick={openAdd}
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_-12px_rgba(249,115,22,0.8)] transition hover:bg-orange-400 active:translate-y-[1px]"
              type="button"
            >
              <PlusIcon />
              {t("dash.brands.add")}
            </button>
          </div>
        </div>

        {errMsg ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errMsg}
          </div>
        ) : null}

        <div className="relative mt-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          {isLoading || isFetching ? (
            <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-[#0b0f14]/40" />
          ) : null}

          <BrandToolbar
            query={query}
            onQueryChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            sort={sort}
            onSortChange={(v) => {
              setSort(v);
              setPage(1);
            }}
            onExportPDF={exportPDF}
            onExportXLS={exportXLS}
            onRefresh={refresh}
            onAdd={openAdd}
            selectedCount={selectedCount}
            onBulkDelete={bulkDelete}
          />

          <BrandTable
            brands={brands}
            selected={selected}
            onToggleAll={toggleAllOnPage}
            allSelected={allOnPageSelected}
            someSelected={someOnPageSelected}
            onToggleOne={toggleOne}
            onEdit={openEdit}
            onDelete={deleteOne}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <span>{t("dash.common.rowPerPage")}</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="rounded-lg border border-white/10 bg-[#0b0f14] px-2 py-1.5 text-slate-200 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/20"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span>{t("dash.common.entries")}</span>
              <span className="text-slate-500">{total > 0 ? t("dash.common.totalCount", { count: total }) : ""}</span>
            </div>

            <div className="flex items-center gap-2">
              <PageNavButton
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                title={t("dash.common.previous")}
              >
                <ChevronLeftIcon />
              </PageNavButton>

              <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(249,115,22,0.9)]">
                {page}
              </span>

              <PageNavButton
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                title={t("dash.common.next")}
              >
                <ChevronRightIcon />
              </PageNavButton>
            </div>
          </div>
        </div>
      </div>

      <AddEditBrandModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={submitModal}
        submitting={submitting}
      />
    </div>
  );
}

function PageNavButton({
  children,
  disabled,
  onClick,
  title,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.02] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]",
        disabled && "cursor-not-allowed opacity-40 hover:bg-white/[0.02] active:translate-y-0"
      )}
    >
      {children}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PdfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" />
      <path d="M7.5 16.8v-4h1.6a1.4 1.4 0 0 1 0 2.8H7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16.8v-4h1.4a2 2 0 0 1 0 4H12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 16.8v-4h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function XlsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" />
      <path d="M8 17l3-4M11 17l-3-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 13h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function CsvIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" />
      <path d="M8 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 13h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
