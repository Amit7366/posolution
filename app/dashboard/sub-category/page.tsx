"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import StatusToggle from "@/app/components/dashboard/StatusToggle";

type SubCategory = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  code: string;
  description: string;
  image?: string;
  status: "Active" | "Inactive";
};

const SUB_CATEGORIES: SubCategory[] = [
  {
    id: 1,
    categoryId: 1,
    categoryName: "Computers",
    name: "Laptops",
    code: "LAP-001",
    description: "Portable computers",
    image: "/images/demo/laptop.png",
    status: "Active",
  },
  {
    id: 2,
    categoryId: 1,
    categoryName: "Computers",
    name: "Desktops",
    code: "DESK-002",
    description: "Office & home desktop PCs",
    image: "/images/demo/desktop.png",
    status: "Active",
  },
  {
    id: 3,
    categoryId: 2,
    categoryName: "Electronics",
    name: "Headphones",
    code: "HEAD-003",
    description: "Wired & wireless headphones",
    image: "/images/demo/headphone.png",
    status: "Inactive",
  },
  {
    id: 4,
    categoryId: 2,
    categoryName: "Electronics",
    name: "Smart Watches",
    code: "WATCH-004",
    description: "Fitness & smart watches",
    image: "/images/demo/watch.png",
    status: "Active",
  },
];

export default function SubCategoryPage() {
  const [items, setItems] = useState<SubCategory[]>(SUB_CATEGORIES);

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<SubCategory | null>(null);
  const [deleteItem, setDeleteItem] = useState<SubCategory | null>(null);

  return (
    <div className="p-6 text-slate-200">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sub Category</h1>
          <p className="text-sm text-slate-400">Manage sub categories</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-medium text-black"
        >
          <Plus size={16} className="inline mr-1" />
          Add New
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-black/60">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Sub Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  <img
                    src={item.image || "/images/placeholder.png"}
                    className="h-10 w-10 rounded object-cover"
                    alt={item.name}
                  />
                </td>

                <td className="px-4 py-3">{item.categoryName}</td>

                <td className="px-4 py-3">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-slate-400">{item.code}</div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-3 py-1 text-xs font-medium
        ${
          item.status === "Active"
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-gray-500/20 text-gray-400"
        }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditItem(item)}
                    className="mr-2 rounded bg-blue-500/10 p-2 text-blue-400 hover:bg-blue-500/20"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteItem(item)}
                    className="rounded bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {addOpen && (
        <SubCategoryModal
          title="Add Sub Category"
          submitText="Add Sub Category"
          onClose={() => setAddOpen(false)}
        />
      )}

      {editItem && (
        <SubCategoryModal
          title="Edit Sub Category"
          submitText="Save Changes"
          initialData={editItem}
          onClose={() => setEditItem(null)}
        />
      )}

      {deleteItem && (
        <DeleteModal
          name={deleteItem.name}
          onClose={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}
function SubCategoryModal({
  title,
  submitText,
  initialData,
  onClose,
}: {
  title: string;
  submitText: string;
  initialData?: SubCategory;
  onClose: () => void;
}) {
  const isEdit = Boolean(initialData);

  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [name, setName] = useState(initialData?.name ?? "");
  const [code, setCode] = useState(initialData?.code ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [status, setStatus] = useState(initialData?.status !== "Inactive");
  const [image, setImage] = useState<string | null>(null);

  return (
    <ModalShell title={title} onClose={onClose}>
      {/* Image Upload */}
      <div className="flex gap-4 mb-4">
        <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 text-sm">
          {image ? (
            <img
              src={image}
              className="h-full w-full object-cover rounded-lg"
            />
          ) : (
            <>
              <span className="text-xl">＋</span>
              Add Image
            </>
          )}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) =>
              e.target.files && setImage(URL.createObjectURL(e.target.files[0]))
            }
          />
        </label>

        <div>
          <button className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-black">
            Upload Image
          </button>
          <p className="mt-2 text-xs text-slate-400">JPEG, PNG up to 2 MB</p>
        </div>
      </div>

      {/* Category Select */}
      <label className="label">Category *</label>
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(+e.target.value)}
        className="input"
      >
        <option value="">Select</option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label className="label">Sub Category *</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input"
      />

      <label className="label">Category Code *</label>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="input"
      />

      <label className="label">Description *</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="input h-24 resize-none"
      />

      <div className="mt-4 flex items-center justify-between">
        <span>Status</span>
        <StatusToggle enabled={status} setEnabled={setStatus} />
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button
          disabled={!status}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition
    ${
      status
        ? "bg-gradient-to-r from-orange-500 to-orange-400 text-black"
        : "cursor-not-allowed bg-gray-700 text-gray-400"
    }`}
        >
          {submitText}
        </button>
      </div>
    </ModalShell>
  );
}
function ModalShell({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn">
      <div className="w-full max-w-xl rounded-xl border border-white/10 bg-[#0b0b0b] p-5 animate-scaleIn">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
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

function DeleteModal({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <ModalShell title="Delete Sub Category" onClose={onClose}>
      <p className="text-sm">
        Are you sure you want to delete <b>{name}</b>?
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button className="rounded bg-red-600 px-4 py-2 text-sm text-white">
          Delete
        </button>
      </div>
    </ModalShell>
  );
}
