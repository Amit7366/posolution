"use client";

import { useState } from "react";
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

// ------------------ Types ------------------
type Category = {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  status: "Active" | "Inactive";
};

// ------------------ Mock Data ------------------
const CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Computers",
    slug: "computers",
    createdAt: "24 Dec 2024",
    status: "Active",
  },
  {
    id: 2,
    name: "Electronics",
    slug: "electronics",
    createdAt: "10 Dec 2024",
    status: "Active",
  },
  {
    id: 3,
    name: "Shoe",
    slug: "shoe",
    createdAt: "27 Nov 2024",
    status: "Active",
  },
  {
    id: 4,
    name: "Cosmetics",
    slug: "cosmetics",
    createdAt: "18 Nov 2024",
    status: "Active",
  },
  {
    id: 5,
    name: "Groceries",
    slug: "groceries",
    createdAt: "06 Nov 2024",
    status: "Active",
  },
  {
    id: 6,
    name: "Furniture",
    slug: "furniture",
    createdAt: "25 Oct 2024",
    status: "Active",
  },
];

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteItem, setDeleteItem] = useState<Category | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0b0b0b] to-black text-slate-200 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Category</h1>
          <p className="text-sm text-slate-400">Manage your categories</p>
        </div>

        <div className="flex items-center gap-2">
          <IconButton icon={<FileText size={16} />} />
          <IconButton icon={<FileSpreadsheet size={16} />} />
          <IconButton icon={<RefreshCcw size={16} />} />
          <IconButton icon={<ChevronUp size={16} />} />
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-medium text-black shadow-lg hover:opacity-90"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="relative w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full rounded-lg border border-white/10 bg-black/70 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <select className="rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-sm outline-none">
            <option>Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white/5 text-slate-300">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Category slug</th>
                <th className="px-4 py-3 text-left">Created On</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-white/10 hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-100">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{c.slug}</td>
                  <td className="px-4 py-3 text-slate-400">{c.createdAt}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                      Active
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {addOpen && (
        <CategoryFormModal
          title="Add Category"
          submitText="Add Category"
          onClose={() => setAddOpen(false)}
        />
      )}

      {editItem && (
        <CategoryFormModal
          title="Edit Category"
          submitText="Save Changes"
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
function IconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="rounded-lg border border-white/10 bg-black/60 p-2 text-slate-300 hover:bg-white/10">
      {icon}
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
  return (
    <Modal title="Delete Category" onClose={onClose}>
      <p className="text-sm text-slate-300">
        Are you sure you want to delete{" "}
        <span className="font-semibold">{item.name}</span>?
      </p>
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white">
          Delete
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
  const isEdit = Boolean(initialData);

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [status, setStatus] = useState(initialData?.status !== "Inactive");

  return (
    <BaseModalForm
      title={title}
      submitText={submitText}
      status={status}
      setStatus={setStatus}
      onClose={onClose}
    >
      <label className="label">Category *</label>
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

      <label className="label">Category Slug *</label>
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
