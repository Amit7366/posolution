"use client";

import { AddEditWarrantyModal } from "@/app/components/warranties/AddEditWarrantyModal";
import { DeleteWarrantyModal } from "@/app/components/warranties/DeleteWarrantyModal";
import { ViewWarrantyModal } from "@/app/components/warranties/ViewWarrantyModal";
import { WarrantyTable } from "@/app/components/warranties/WarrantyTable";
import { WarrantyStatusFilter, WarrantyToolbar } from "@/app/components/warranties/WarrantyToolbar";
import { cn } from "@/app/lib/cn";
import { exportWarrantiesToCSV, exportWarrantiesToXLS } from "@/app/lib/export-warranties";
import { apiDocToWarranty, uiPeriodToApi } from "@/app/lib/warranty-api";
import type { Warranty } from "@/app/types/warranty";
import {
  useCreateWarrantyMutation,
  useDeleteWarrantyMutation,
  useGetWarrantiesQuery,
  useUpdateWarrantyMutation,
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

function listFromPayload(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as { data?: unknown };
  const d = p.data;
  if (Array.isArray(d)) return d as Record<string, unknown>[];
  if (d && typeof d === "object" && "data" in (d as object)) {
    const inner = (d as { data?: unknown }).data;
    if (Array.isArray(inner)) return inner as Record<string, unknown>[];
  }
  return [];
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

export default function WarrantiesPage() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WarrantyStatusFilter>("All");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<Warranty | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Warranty | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Warranty | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const statusParam =
    statusFilter === "Active" ? "active" : statusFilter === "Inactive" ? "inactive" : "";

  const {
    data: listPayload,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetWarrantiesQuery({
    page,
    limit: rowsPerPage,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusParam ? { status: statusParam } : {}),
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const total = (listPayload as { meta?: { total?: number } } | undefined)?.meta?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / rowsPerPage));

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  const rows = useMemo(() => {
    return listFromPayload(listPayload).map((doc) => apiDocToWarranty(doc));
  }, [listPayload]);

  const [createWarranty] = useCreateWarrantyMutation();
  const [updateWarranty] = useUpdateWarrantyMutation();
  const [deleteWarranty] = useDeleteWarrantyMutation();

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selected[r.id]);
  const someOnPageSelected = rows.some((r) => selected[r.id]) && !allOnPageSelected;

  function toggleAllOnPage() {
    const next = { ...selected };
    const target = !allOnPageSelected;
    for (const r of rows) next[r.id] = target;
    setSelected(next);
  }

  function toggleOne(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function openAdd() {
    setModalMode("add");
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(r: Warranty) {
    setModalMode("edit");
    setEditing(r);
    setModalOpen(true);
  }

  function openView(r: Warranty) {
    setViewing(r);
    setViewOpen(true);
  }

  async function handleSubmitModal(payload: {
    name: string;
    duration: number;
    period: Warranty["period"];
    description: string;
    status: boolean;
  }) {
    const status = payload.status ? "active" : "inactive";
    const period = uiPeriodToApi(payload.period);
    try {
      if (modalMode === "add") {
        await createWarranty({
          name: payload.name,
          duration: payload.duration,
          period,
          description: payload.description,
          status,
        }).unwrap();
        toast.success(t("dash.warranties.warrantyCreated"));
      } else if (editing) {
        await updateWarranty({
          id: editing.id,
          body: {
            name: payload.name,
            duration: payload.duration,
            period,
            description: payload.description,
            status,
          },
        }).unwrap();
        toast.success(t("dash.warranties.warrantyUpdated"));
      }
      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      toastMutationError(e, t("dash.warranties.saveFailed"));
    }
  }

  function askDelete(r: Warranty) {
    setDeleting(r);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteWarranty(deleting.id).unwrap();
      toast.success(t("dash.warranties.warrantyDeleted"));
      setDeleteOpen(false);
      setDeleting(null);
      setSelected((prev) => {
        const copy = { ...prev };
        delete copy[deleting.id];
        return copy;
      });
    } catch (e) {
      toastMutationError(e, t("dash.warranties.deleteFailed"));
    } finally {
      setDeleteBusy(false);
    }
  }

  function exportPDF() {
    window.print();
  }
  function exportXLS() {
    exportWarrantiesToXLS(rows, "warranties.xls");
  }
  function exportCSV() {
    exportWarrantiesToCSV(rows, "warranties.csv");
  }
  function refresh() {
    void refetch();
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setRowsPerPage(10);
    setPage(1);
    setSelected({});
  }

  const errMsg = isError ? getQueryErrorMessage(error) ?? t("dash.warranties.failedLoad") : null;

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t("dash.warranties.pageTitle")}</h1>
            <p className="mt-1 text-sm text-slate-400">{t("dash.warranties.manage")}</p>
          </div>

          <div className="flex items-center gap-2">
            <TopIconButton title={t("dash.common.exportPdf")} onClick={exportPDF}>
              <PdfIcon />
            </TopIconButton>
            <TopIconButton title={t("dash.common.exportXls")} onClick={exportXLS}>
              <XlsIcon />
            </TopIconButton>
            <TopIconButton title={t("dash.common.exportCsv")} onClick={exportCSV}>
              <CsvIcon />
            </TopIconButton>
            <TopIconButton title={t("dash.common.refresh")} onClick={refresh}>
              <RefreshIcon />
            </TopIconButton>
            <TopIconButton title={t("dash.common.collapse")} onClick={() => setCollapsed((s) => !s)}>
              <ChevronUpIcon />
            </TopIconButton>

            <button
              type="button"
              onClick={openAdd}
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_-12px_rgba(249,115,22,0.8)] transition hover:bg-orange-400 active:translate-y-[1px]"
            >
              <PlusIcon />
              {t("dash.warranties.add")}
            </button>
          </div>
        </div>

        {errMsg ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errMsg}</div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          <WarrantyToolbar
            query={searchInput}
            onQueryChange={(v) => {
              setSearchInput(v);
              setPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            t={t}
          />

          {(isLoading || isFetching) && (
            <div className="px-5 py-3 text-sm text-slate-400 border-b border-white/10">{t("dash.common.loading")}</div>
          )}

          {!collapsed && (
            <>
              <WarrantyTable
                rows={rows}
                selected={selected}
                allSelected={allOnPageSelected}
                someSelected={someOnPageSelected}
                onToggleAll={toggleAllOnPage}
                onToggleOne={toggleOne}
                onView={openView}
                onEdit={openEdit}
                onAskDelete={askDelete}
                t={t}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
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
                  <span className="ml-2 text-slate-500">
                    {t("dash.common.rangePage", {
                      start: total === 0 ? 0 : (page - 1) * rowsPerPage + 1,
                      end: Math.min(page * rowsPerPage, total),
                      total,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <PageNavButton
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    title={t("dash.common.previous")}
                  >
                    <ChevronLeftIcon />
                  </PageNavButton>

                  <span className="grid h-8 min-w-8 px-2 place-items-center rounded-full bg-orange-500 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(249,115,22,0.9)]">
                    {page}
                  </span>

                  <PageNavButton
                    disabled={page >= pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    title={t("dash.common.next")}
                  >
                    <ChevronRightIcon />
                  </PageNavButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AddEditWarrantyModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmitModal}
      />

      <ViewWarrantyModal
        open={viewOpen}
        row={viewing}
        onClose={() => {
          setViewOpen(false);
          setViewing(null);
        }}
        onEdit={(r) => openEdit(r)}
      />

      <DeleteWarrantyModal
        open={deleteOpen}
        isDeleting={deleteBusy}
        itemName={deleting?.name}
        onClose={() => {
          if (deleteBusy) return;
          setDeleteOpen(false);
          setDeleting(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function TopIconButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
    >
      {children}
    </button>
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
function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
