"use client";

import { AddEditUnitModal } from "@/app/components/dashboard/units/AddEditUnitModal";
import { DeleteUnitModal } from "@/app/components/dashboard/units/DeleteUnitModal";
import { UnitTable } from "@/app/components/dashboard/units/UnitTable";
import { UnitStatusFilter, UnitToolbar } from "@/app/components/dashboard/units/UnitToolbar";
import { cn } from "@/app/lib/cn";
import { exportUnitsToCSV, exportUnitsToXLS } from "@/app/lib/export";
import { Unit } from "@/app/types/unit";
import {
  useCreateUnitMutation,
  useDeleteUnitMutation,
  useGetUnitsQuery,
  useUpdateUnitMutation,
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

function toastMutationError(e: unknown, fallback: string): void {
  const data = (e as { data?: { message?: string; errorSources?: { path: string; message: string }[] } })
    ?.data;
  const msg = data?.message;
  const details = data?.errorSources?.length
    ? data.errorSources.map((s) => `${s.path}: ${s.message}`).join(", ")
    : undefined;
  toast.error(details ? `${msg ?? fallback} (${details})` : msg ?? fallback);
}

function mapApiRow(row: Record<string, unknown>): Unit {
  const rawId = row._id;
  const id =
    typeof rawId === "object" && rawId !== null && "toString" in rawId
      ? String((rawId as { toString(): string }).toString())
      : String(rawId ?? "");
  const status: Unit["status"] = row.status === "inactive" ? "Inactive" : "Active";
  let createdAt = "";
  if (typeof row.createdAt === "string") createdAt = row.createdAt;
  else if (row.createdAt instanceof Date) createdAt = row.createdAt.toISOString();

  const noOf = row.noOfProducts;
  const productsCount =
    typeof noOf === "number" && Number.isFinite(noOf) ? noOf : 0;

  return {
    id,
    unit: String(row.name ?? ""),
    shortName: String(row.shortName ?? ""),
    productsCount,
    createdAt,
    status,
  };
}

export default function UnitsPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UnitStatusFilter>("All");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<Unit | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Unit | null>(null);

  const [collapsed, setCollapsed] = useState(false);

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
  } = useGetUnitsQuery({
    page,
    limit: rowsPerPage,
    search: debouncedQuery,
    ...(statusParam ? { status: statusParam } : {}),
    sortBy: "createdAt",
    sortOrder: "desc",
    withCounts: true,
  });

  const total = listPayload?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const units = useMemo(() => {
    const raw = listPayload?.data;
    if (!Array.isArray(raw)) return [];
    return raw.map((r) => mapApiRow(r as Record<string, unknown>));
  }, [listPayload]);

  const [createUnit, { isLoading: creating }] = useCreateUnitMutation();
  const [updateUnit, { isLoading: updating }] = useUpdateUnitMutation();
  const [deleteUnit, { isLoading: isDeleting }] = useDeleteUnitMutation();
  const submitting = creating || updating;

  const allOnPageSelected = units.length > 0 && units.every((u) => selected[u.id]);
  const someOnPageSelected = units.some((u) => selected[u.id]) && !allOnPageSelected;

  function toggleAllOnPage() {
    const next = { ...selected };
    const target = !allOnPageSelected;
    for (const u of units) next[u.id] = target;
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

  function openEdit(u: Unit) {
    setModalMode("edit");
    setEditing(u);
    setModalOpen(true);
  }

  async function submitModal(payload: { unit: string; shortName: string; status: boolean }) {
    const body: Record<string, unknown> = {
      name: payload.unit.trim(),
      shortName: payload.shortName.trim(),
      status: payload.status ? "active" : "inactive",
    };

    try {
      if (modalMode === "add") {
        await createUnit(body).unwrap();
        toast.success(t("dash.units.unitCreated"));
      } else if (editing) {
        await updateUnit({ id: editing.id, body }).unwrap();
        toast.success(t("dash.units.unitUpdated"));
      }
      setModalOpen(false);
      refetch();
    } catch (e) {
      toastMutationError(
        e,
        modalMode === "add" ? t("dash.units.createFailed") : t("dash.units.updateFailed")
      );
    }
  }

  function askDelete(u: Unit) {
    setDeleting(u);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteUnit(deleting.id).unwrap();
      toast.success(t("dash.units.unitDeleted"));
      setSelected((prev) => {
        const copy = { ...prev };
        delete copy[deleting.id];
        return copy;
      });
      setDeleteOpen(false);
      setDeleting(null);
      refetch();
    } catch (e) {
      toastMutationError(e, t("dash.units.deleteFailed"));
    }
  }

  function refresh() {
    setQuery("");
    setStatusFilter("All");
    setRowsPerPage(10);
    setPage(1);
    setSelected({});
    void refetch();
  }

  function exportPDF() {
    window.print();
  }

  function exportXLS() {
    exportUnitsToXLS(units, "units.xls");
  }

  function exportCSV() {
    exportUnitsToCSV(units, "units.csv");
  }

  const errMsg = isError ? getQueryErrorMessage(error) ?? t("dash.units.failedLoad") : null;

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t("dash.units.pageTitle")}</h1>
            <p className="mt-1 text-sm text-slate-400">{t("dash.units.manage")}</p>
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
              {t("dash.units.add")}
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

          <UnitToolbar
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
            onAdd={openAdd}
            onExportPDF={exportPDF}
            onExportXLS={exportXLS}
            onRefresh={refresh}
            onCollapse={() => setCollapsed((s) => !s)}
            t={t}
          />

          {!collapsed && (
            <>
              <UnitTable
                units={units}
                selected={selected}
                allSelected={allOnPageSelected}
                someSelected={someOnPageSelected}
                onToggleAll={toggleAllOnPage}
                onToggleOne={toggleOne}
                onEdit={openEdit}
                onAskDelete={askDelete}
                onOpenSettings={() => alert(t("dash.units.settingsToast"))}
                t={t}
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
                  <span className="text-slate-500">
                    {total > 0 ? t("dash.common.totalCount", { count: total }) : ""}
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
            </>
          )}
        </div>
      </div>

      <AddEditUnitModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={submitModal}
        submitting={submitting}
      />

      <DeleteUnitModal
        open={deleteOpen}
        unitName={deleting?.unit}
        onClose={() => {
          setDeleteOpen(false);
          setDeleting(null);
        }}
        onConfirm={confirmDelete}
        deleting={isDeleting}
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
