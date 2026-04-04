"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  FileText,
  FileSpreadsheet,
  RefreshCcw,
  ChevronUp,
} from "lucide-react";
import { BaseModalForm } from "@/app/components/dashboard/BaseModalForm";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/redux/api/baseApi";
import { useTranslation } from "@/lib/i18n/useTranslation";

// ------------------ Types ------------------
type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  status: "active" | "inactive" | string;
  createdAt?: string;
};

type CategoryListResponse = {
  success?: boolean;
  data?: Category[];
  meta?: { page: number; limit: number; total: number };
  message?: string;
};

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

export default function CategoryPage() {
  const { t } = useTranslation();
  const [page] = useState(1);
  const [limit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteItem, setDeleteItem] = useState<Category | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCategoriesQuery({
    page,
    limit,
    search,
    status: statusFilter,
  });

  const listPayload = data as CategoryListResponse | undefined;

  const categories: Category[] = useMemo(() => {
    const raw = listPayload?.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [listPayload]);

  const total = listPayload?.meta?.total;

  const loadErr = isError ? getQueryErrorMessage(error) ?? t("dash.category.failedLoad") : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0b0b0b] to-black text-slate-200 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{t("dash.category.title")}</h1>
          <p className="text-sm text-slate-400">{t("dash.category.manage")}</p>
        </div>

        <div className="flex items-center gap-2">
          <IconButton icon={<FileText size={16} />} />
          <IconButton icon={<FileSpreadsheet size={16} />} />
          <IconButton
            icon={<RefreshCcw size={16} />}
            loading={isFetching}
            onClick={() => void refetch()}
          />
          <IconButton icon={<ChevronUp size={16} />} />
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-medium text-black shadow-lg hover:opacity-90"
          >
            <Plus size={16} /> {t("dash.category.add")}
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
        {loadErr ? (
          <div className="mx-4 mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {loadErr}
          </div>
        ) : null}
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="relative w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("dash.common.search")}
              className="w-full rounded-lg border border-white/10 bg-black/70 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-sm outline-none"
          >
            <option value="">{t("dash.common.allStatus")}</option>
            <option value="active">{t("dash.common.active")}</option>
            <option value="inactive">{t("dash.common.inactive")}</option>
          </select>
          {typeof total === "number" && (
            <span className="text-xs text-slate-500">
              {t("dash.category.totalShown", { count: total })}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white/5 text-slate-300">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left">{t("dash.category.colCategory")}</th>
                <th className="px-4 py-3 text-left">{t("dash.category.colCategorySlug")}</th>
                <th className="px-4 py-3 text-left">{t("dash.category.colCreatedOn")}</th>
                <th className="px-4 py-3 text-left">{t("dash.category.colStatus")}</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    {t("dash.category.loadingCategories")}
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    {t("dash.category.noCategoriesFound")}
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-100">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{c.slug}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                        {c.status === "active" ? t("dash.common.active") : t("dash.common.inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <ActionButton
                          onClick={() => setEditItem(c)}
                          icon={<Pencil size={14} />}
                        />
                        <ActionButton
                          danger
                          onClick={() => setDeleteItem(c)}
                          icon={<Trash2 size={14} />}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {addOpen && (
        <CategoryFormModal
          title={t("dash.category.addTitle")}
          submitText={t("dash.category.add")}
          onClose={() => setAddOpen(false)}
        />
      )}

      {editItem && (
        <CategoryFormModal
          title={t("dash.category.editTitle")}
          submitText={t("dash.common.saveChanges")}
          initialData={editItem}
          onClose={() => setEditItem(null)}
        />
      )}

      {deleteItem && (
        <DeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} />
      )}
    </div>
  );
}

// ------------------ Components ------------------
function IconButton({
  icon,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-white/10 bg-black/60 p-2 text-slate-300 hover:bg-white/10"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent inline-block" />
      ) : (
        icon
      )}
    </button>
  );
}

function StatusToggle({
  enabled,
  setEnabled,
}: {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        enabled ? "bg-emerald-500" : "bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function ActionButton({
  icon,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-2 transition ${
        danger
          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
      }`}
    >
      {icon}
    </button>
  );
}

function EditModal({ item, onClose }: { item: Category; onClose: () => void }) {
  return (
    <Modal title="Edit Category" onClose={onClose}>
      <input
        defaultValue={item.name}
        className="input"
        placeholder="Category name"
      />
      <input
        defaultValue={item.slug}
        className="input"
        placeholder="Category slug"
      />
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button className="btn-primary">Save</button>
      </div>
    </Modal>
  );
}

function DeleteModal({
  item,
  onClose,
}: {
  item: Category;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [deleteCategory, { isLoading }] = useDeleteCategoryMutation();

  const handleDelete = async () => {
    try {
      await deleteCategory(item._id).unwrap();
      onClose();
    } catch (e) {
      // optionally handle error (toast, etc.)
      console.error("Failed to delete category", e);
    }
  };

  return (
    <Modal title={t("dash.category.deleteTitle")} onClose={onClose}>
      <p className="text-sm text-slate-300">
        {t("dash.category.deleteIntro")}{" "}
        <span className="font-semibold">{item.name}</span>?
      </p>
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="btn-secondary">
          {t("dash.common.cancel")}
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? t("dash.common.deleting") : t("dash.common.delete")}
        </button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0b0b0b] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function CategoryFormModal({
  title,
  submitText,
  initialData,
  onClose,
}: {
  title: string;
  submitText: string;
  initialData?: Category;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = Boolean(initialData);

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [status, setStatus] = useState(initialData?.status !== "inactive");

  const [createCategory, { isLoading: creating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] =
    useUpdateCategoryMutation();

  const submitting = creating || updating;

  const handleSubmit = async () => {
    const body = {
      name,
      slug,
      status: status ? "active" : "inactive",
    };

    try {
      if (isEdit && initialData?._id) {
        await updateCategory({ id: initialData._id, body }).unwrap();
      } else {
        await createCategory(body).unwrap();
      }
      onClose();
    } catch (e) {
      console.error("Failed to save category", e);
    }
  };

  return (
    <BaseModalForm
      title={title}
      submitText={submitText}
      status={status}
      setStatus={setStatus}
      submitting={submitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <label className="label">{t("dash.category.fieldCategoryStar")}</label>
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (!isEdit && !slugTouched) {
            setSlug(generateSlug(e.target.value));
          }
        }}
        className="input"
      />

      <label className="label">{t("dash.category.fieldCategorySlugStar")}</label>
      <input
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(generateSlug(e.target.value));
        }}
        className="input"
      />
    </BaseModalForm>
  );
}


function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ------------------ Tailwind Utilities ------------------
// Add to globals.css if desired:
// .input { @apply w-full rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-sm outline-none focus:border-orange-500; }
// .btn-primary { @apply rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black; }
// .btn-secondary { @apply rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300; }
