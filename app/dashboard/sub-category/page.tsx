"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCcw,
  ChevronUp,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import StatusToggle from "@/app/components/dashboard/StatusToggle";
import {
  useCreateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useUpdateSubCategoryMutation,
} from "@/redux/api/baseApi";
import { uploadImageToCloudinary } from "@/lib/upload-image";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/useTranslation";

type PopulatedCategory = { _id: string; name?: string; slug?: string };

type SubCategoryRow = {
  _id: string;
  categoryId: string | PopulatedCategory;
  subCategoryName: string;
  slug: string;
  code: string;
  description?: string;
  imageUrl?: string;
  status: string;
  createdAt?: string;
};

type ListResponse = {
  success?: boolean;
  data?: SubCategoryRow[];
  meta?: { page: number; limit: number; total: number };
  message?: string;
};

function getCategoryIdString(row: SubCategoryRow): string {
  const c = row.categoryId;
  if (typeof c === "object" && c !== null && "_id" in c) {
    return String((c as PopulatedCategory)._id);
  }
  return String(c);
}

function categoryDisplayName(row: SubCategoryRow): string {
  const c = row.categoryId;
  if (typeof c === "object" && c !== null && "name" in c) {
    return String((c as PopulatedCategory).name ?? "—");
  }
  return "—";
}

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

export default function SubCategoryPage() {
  const { t } = useTranslation();
  const [page] = useState(1);
  const [limit] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<SubCategoryRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<SubCategoryRow | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data: catListRes,
    isError: isCatError,
    error: catError,
  } = useGetCategoriesQuery({
    page: 1,
    // backend validation: limit must be <= 200
    limit: 200,
    search: "",
    status: "",
  });

  const categories = useMemo(() => {
    const raw = (catListRes as { data?: { _id: string; name: string }[] })?.data;
    return Array.isArray(raw) ? raw : [];
  }, [catListRes]);

  const {
    data: subRes,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSubCategoriesQuery({
    page,
    limit,
    search,
    status: statusFilter,
    categoryId: categoryFilter,
  });

  const listPayload = subRes as ListResponse | undefined;
  const items: SubCategoryRow[] = useMemo(() => {
    const raw = listPayload?.data;
    return Array.isArray(raw) ? raw : [];
  }, [listPayload]);

  const total = listPayload?.meta?.total;

  const subErr = isError ? getQueryErrorMessage(error) ?? t("dash.subCategory.failedLoad") : null;
  const catErrMsg =
    isCatError && catError && typeof catError === "object" && "data" in catError
      ? (catError as { data?: { message?: string } })?.data?.message
      : null;
  const catErr = isCatError ? (catErrMsg ?? t("dash.category.failedLoad")) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0b0b0b] to-black text-slate-200 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("dash.subCategory.title")}</h1>
          <p className="text-sm text-slate-400">{t("dash.subCategory.manage")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <IconButton icon={<FileText size={16} />} />
          <IconButton icon={<FileSpreadsheet size={16} />} />
          <IconButton
            icon={<RefreshCcw size={16} />}
            loading={isFetching}
            onClick={() => void refetch()}
          />
          <IconButton icon={<ChevronUp size={16} />} />
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-medium text-black shadow-lg hover:opacity-90"
          >
            <Plus size={16} /> {t("dash.subCategory.add")}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
        {subErr ? (
          <div className="mx-4 mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {subErr}
          </div>
        ) : null}
        {catErr ? (
          <div className="mx-4 mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {catErr}
          </div>
        ) : null}

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
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-sm outline-none"
            >
              <option value="">{t("dash.subCategory.allCategories")}</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
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
                {t("dash.subCategory.totalItems", { count: total })}
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white/5 text-slate-300">
                <th className="px-4 py-3 text-left">{t("dash.subCategory.colImage")}</th>
                <th className="px-4 py-3 text-left">{t("dash.subCategory.colCategory")}</th>
                <th className="px-4 py-3 text-left">{t("dash.subCategory.colSubCategory")}</th>
                <th className="px-4 py-3 text-left">{t("dash.category.colSlug")}</th>
                <th className="px-4 py-3 text-left">{t("dash.common.status")}</th>
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
                    {t("dash.common.loading")}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    {t("dash.subCategory.empty")}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3">
                      <img
                        src={item.imageUrl || "/images/placeholder.png"}
                        alt=""
                        className="h-10 w-10 rounded object-cover bg-white/10"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {categoryDisplayName(item)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-100">
                        {item.subCategoryName}
                      </div>
                      <div className="text-xs text-slate-400">{item.code}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{item.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-3 py-1 text-xs font-medium ${
                          item.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {item.status === "active" ? t("dash.common.active") : t("dash.common.inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditItem(item)}
                        className="mr-2 rounded-lg bg-blue-500/10 p-2 text-blue-400 hover:bg-blue-500/20"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteItem(item)}
                        className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && (
        <SubCategoryModal
          title={t("dash.subCategory.addModal")}
          submitText={t("dash.subCategory.addModal")}
          categories={categories}
          onClose={() => setAddOpen(false)}
        />
      )}

      {editItem && (
        <SubCategoryModal
          title={t("dash.subCategory.editModal")}
          submitText={t("dash.common.saveChanges")}
          initialData={editItem}
          categories={categories}
          onClose={() => setEditItem(null)}
        />
      )}

      {deleteItem && (
        <DeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} />
      )}
    </div>
  );
}

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
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      ) : (
        icon
      )}
    </button>
  );
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn">
      <div className="w-full max-w-xl rounded-xl border border-white/10 bg-[#0b0b0b] p-5 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-6 w-6 rounded-full bg-red-600 text-white"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SubCategoryModal({
  title,
  submitText,
  initialData,
  categories,
  onClose,
}: {
  title: string;
  submitText: string;
  initialData?: SubCategoryRow;
  categories: { _id: string; name: string }[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = Boolean(initialData);

  const [categoryId, setCategoryId] = useState(
    initialData ? getCategoryIdString(initialData) : ""
  );
  const [name, setName] = useState(initialData?.subCategoryName ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [code, setCode] = useState(initialData?.code ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [status, setStatus] = useState(
    initialData?.status !== "inactive"
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [createSub, { isLoading: creating }] = useCreateSubCategoryMutation();
  const [updateSub, { isLoading: updating }] = useUpdateSubCategoryMutation();
  const submitting = creating || updating;

  const previewSrc = preview || imageUrl || null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!categoryId) {
      toast.error(t("dash.subCategory.toastSelectCategory"));
      return;
    }
    if (!name.trim() || !slug.trim() || !code.trim()) {
      toast.error(t("dash.subCategory.toastNameSlugCodeRequired"));
      return;
    }

    const cleanCategoryId = categoryId.trim();

    let finalImageUrl = imageUrl.trim();
    if (file) {
      try {
        finalImageUrl = await uploadImageToCloudinary(file);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t("dash.subCategory.toastImageUploadFailed"));
        return;
      }
    }

    const body: Record<string, unknown> = {
      categoryId: cleanCategoryId,
      subCategoryName: name.trim(),
      slug: slug.trim(),
      code: code.trim(),
      description: description.trim(),
      status: status ? "active" : "inactive",
    };

    if (finalImageUrl) {
      body.imageUrl = finalImageUrl;
    }

    try {
      if (isEdit && initialData?._id) {
        await updateSub({ id: initialData._id, body }).unwrap();
      } else {
        await createSub(body).unwrap();
      }
      toast.success(isEdit ? t("dash.subCategory.toastUpdated") : t("dash.subCategory.toastCreated"));
      onClose();
    } catch (e) {
      const data = (e as any)?.data as
        | { message?: string; errorSources?: { path: string; message: string }[] }
        | undefined;
      const msg = data?.message;
      const details = data?.errorSources?.length
        ? data.errorSources.map((s) => `${s.path}: ${s.message}`).join(", ")
        : undefined;
      const fb = t("dash.subCategory.toastSaveFailed");
      toast.error(details ? `${msg ?? fb} (${details})` : msg ?? fb);
    }
  };

  return (
    <ModalShell title={title} onClose={onClose}>
      <div className="flex gap-4 mb-4">
        <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/20 text-xs text-slate-400">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              <span className="text-xl text-slate-300">＋</span>
              {t("dash.common.addImage")}
            </>
          )}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFile}
          />
        </label>
        <div className="flex flex-col justify-center">
          <p className="text-xs text-slate-400">{t("dash.common.uploadHint")}</p>
        </div>
      </div>

      <label className="mb-1 block text-xs text-slate-400">{t("dash.subCategory.catLabel")}</label>
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="mb-3 w-full rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-sm outline-none focus:border-orange-500"
      >
        <option value="">{t("dash.common.selectCategory")}</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <label className="mb-1 block text-xs text-slate-400">{t("dash.subCategory.nameLabel")}</label>
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (!isEdit && !slugTouched) {
            setSlug(generateSlug(e.target.value));
          }
        }}
        className="mb-3 w-full rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-sm outline-none focus:border-orange-500"
      />

      <label className="mb-1 block text-xs text-slate-400">{t("dash.subCategory.slugLabel")}</label>
      <input
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(generateSlug(e.target.value));
        }}
        className="mb-3 w-full rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-sm outline-none focus:border-orange-500"
      />

      <label className="mb-1 block text-xs text-slate-400">{t("dash.subCategory.codeLabel")}</label>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="mb-3 w-full rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-sm outline-none focus:border-orange-500"
      />

      <label className="mb-1 block text-xs text-slate-400">{t("dash.common.description")}</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-3 min-h-[88px] w-full resize-none rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-sm outline-none focus:border-orange-500"
      />

      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm">{t("dash.common.status")}</span>
        <StatusToggle enabled={status} setEnabled={setStatus} />
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          {t("dash.common.cancel")}
        </button>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
        >
          {submitting ? t("dash.common.saving") : submitText}
        </button>
      </div>
    </ModalShell>
  );
}

function DeleteModal({
  item,
  onClose,
}: {
  item: SubCategoryRow;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [deleteSub, { isLoading }] = useDeleteSubCategoryMutation();

  const handleDelete = async () => {
    try {
      await deleteSub(item._id).unwrap();
      toast.success(t("dash.subCategory.toastDeleted"));
      onClose();
    } catch (e) {
      const msg =
        e && typeof e === "object" && "data" in e
          ? (e as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(msg || t("dash.subCategory.toastDeleteFailed"));
    }
  };

  return (
    <ModalShell title={t("dash.subCategory.deleteModal")} onClose={onClose}>
      <p className="text-sm text-slate-300">
        {t("dash.subCategory.deleteConfirm")}{" "}
        <span className="font-semibold">{item.subCategoryName}</span>?
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"
        >
          {t("dash.common.cancel")}
        </button>
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={isLoading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {isLoading ? t("dash.common.deleting") : t("dash.common.delete")}
        </button>
      </div>
    </ModalShell>
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
