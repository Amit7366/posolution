"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  FileText,
  Loader2,
  Search,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { sidebarMenus, type MenuItem } from "@/app/lib/menus";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useAuth } from "@/redux/hook/useAuth";
import {
  useLazyGetCustomersQuery,
  useLazyGetProductsQuery,
  useLazyGetSuppliersQuery,
} from "@/redux/api/baseApi";

type SearchHit = {
  id: string;
  group: "Pages" | "Products" | "Suppliers" | "Customers";
  title: string;
  subtitle?: string;
  href: string;
  Icon: LucideIcon;
};

function flattenMenus(
  items: MenuItem[],
  role: "admin" | "user",
  t: (key: string) => string
): SearchHit[] {
  const hits: SearchHit[] = [];

  const visible = (itemRole: MenuItem["role"]) => {
    if (itemRole === "all" || itemRole === undefined) return true;
    return itemRole === role;
  };

  for (const item of items) {
    if (!visible(item.role)) continue;
    if (item.link && !item.children) {
      hits.push({
        id: `page-${item.link}`,
        group: "Pages",
        title: t(item.titleKey),
        subtitle: item.link,
        href: item.link,
        Icon: item.icon,
      });
    }
    if (item.children) {
      if (item.link) {
        hits.push({
          id: `page-${item.link}`,
          group: "Pages",
          title: t(item.titleKey),
          subtitle: item.link,
          href: item.link,
          Icon: item.icon,
        });
      }
      for (const child of item.children) {
        if (!visible(child.role) || !child.link) continue;
        hits.push({
          id: `page-${child.link}`,
          group: "Pages",
          title: t(child.titleKey),
          subtitle: `${t(item.titleKey)} · ${child.link}`,
          href: child.link,
          Icon: child.icon,
        });
      }
    }
  }

  // Always include profile
  hits.push({
    id: "page-/dashboard/profile",
    group: "Pages",
    title: t("nav.myProfile"),
    subtitle: "/dashboard/profile",
    href: "/dashboard/profile",
    Icon: Users,
  });

  return hits;
}

function matchText(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export default function NavbarSearch() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const role = (user?.role === "admin" ? "admin" : "user") as "admin" | "user";

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [searchProducts, { data: productsRes, isFetching: productsLoading }] =
    useLazyGetProductsQuery();
  const [searchCustomers, { data: customersRes, isFetching: customersLoading }] =
    useLazyGetCustomersQuery();
  const [searchSuppliers, { data: suppliersRes, isFetching: suppliersLoading }] =
    useLazyGetSuppliersQuery();

  const pageHits = useMemo(
    () => flattenMenus(sidebarMenus, role, t),
    [role, t]
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 280);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debounced.length < 2) return;
    void searchProducts({ page: 1, limit: 6, search: debounced });
    void searchCustomers({ page: 1, limit: 5, search: debounced });
    void searchSuppliers({ search: debounced });
  }, [debounced, searchProducts, searchCustomers, searchSuppliers]);

  const results = useMemo(() => {
    const q = debounced;
    if (!q) return [] as SearchHit[];

    const hits: SearchHit[] = [];

    for (const page of pageHits) {
      if (matchText(page.title, q) || matchText(page.subtitle || "", q)) {
        hits.push(page);
      }
    }

    const products = Array.isArray((productsRes as { data?: unknown[] })?.data)
      ? ((productsRes as { data: Record<string, unknown>[] }).data)
      : [];
    for (const p of products.slice(0, 6)) {
      const id = String(p._id ?? "");
      if (!id) continue;
      hits.push({
        id: `product-${id}`,
        group: "Products",
        title: String(p.name ?? "Product"),
        subtitle: [p.sku ? `SKU ${p.sku}` : null, p.quantity != null ? `Stock ${p.quantity}` : null]
          .filter(Boolean)
          .join(" · "),
        href: `/dashboard/products?search=${encodeURIComponent(String(p.name ?? ""))}`,
        Icon: Boxes,
      });
    }

    const suppliersRaw = (suppliersRes as { data?: unknown[] } | undefined)?.data;
    const suppliers = Array.isArray(suppliersRaw) ? suppliersRaw : [];
    for (const s of suppliers.slice(0, 5) as Record<string, unknown>[]) {
      const supplierId = String(s.supplierId ?? "");
      const id = String(s._id ?? supplierId);
      if (!id && !supplierId) continue;
      const name = String(s.name ?? "Supplier");
      if (q.length >= 2 && !matchText(name, q) && !matchText(String(s.phone ?? ""), q) && !matchText(supplierId, q)) {
        // API may return full list; filter client-side when needed
        continue;
      }
      hits.push({
        id: `supplier-${id}`,
        group: "Suppliers",
        title: name,
        subtitle: [supplierId, s.phone].filter(Boolean).map(String).join(" · "),
        href: `/dashboard/suppliers/${encodeURIComponent(supplierId || id)}`,
        Icon: Truck,
      });
    }

    const customers = Array.isArray((customersRes as { data?: unknown[] })?.data)
      ? ((customersRes as { data: Record<string, unknown>[] }).data)
      : [];
    for (const c of customers.slice(0, 5)) {
      const id = String(c._id ?? "");
      if (!id) continue;
      hits.push({
        id: `customer-${id}`,
        group: "Customers",
        title: String(c.name ?? "Customer"),
        subtitle: [c.phone, c.email].filter(Boolean).map(String).join(" · "),
        href: `/dashboard/customers/${id}`,
        Icon: Users,
      });
    }

    // Prefer pages first, then entities
    const order: SearchHit["group"][] = ["Pages", "Products", "Suppliers", "Customers"];
    hits.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
    return hits.slice(0, 20);
  }, [debounced, pageHits, productsRes, suppliersRes, customersRes]);

  const loading =
    debounced.length >= 2 &&
    (productsLoading || customersLoading || suppliersLoading);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      setDebounced("");
      setActiveIndex(0);
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) {
      if (e.key === "Enter" && query.trim()) {
        // Fallback: search products page
        go(`/dashboard/products?search=${encodeURIComponent(query.trim())}`);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[activeIndex];
      if (hit) go(hit.href);
    }
  };

  const showDropdown = open && (query.trim().length > 0 || loading);

  let lastGroup: SearchHit["group"] | null = null;

  return (
    <div ref={wrapRef} className="relative hidden w-full max-w-sm md:block">
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
        <Search size={18} className="shrink-0 text-gray-500 dark:text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          placeholder={t("nav.searchPlaceholder")}
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500 dark:text-gray-100 dark:placeholder:text-gray-500"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="navbar-search-results"
        />
        {loading ? (
          <Loader2 size={14} className="animate-spin text-orange-500" />
        ) : (
          <kbd className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {t("nav.shortcutHint")}
          </kbd>
        )}
      </div>

      {showDropdown ? (
        <div
          id="navbar-search-results"
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 max-h-[min(70vh,420px)] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        >
          {!results.length && !loading ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              {debounced.length < 2
                ? "Type at least 2 characters to search products, suppliers & customers"
                : "No results found"}
            </div>
          ) : null}

          {results.map((hit, index) => {
            const showGroup = hit.group !== lastGroup;
            lastGroup = hit.group;
            const Icon = hit.Icon;
            return (
              <div key={hit.id}>
                {showGroup ? (
                  <div className="sticky top-0 bg-gray-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {hit.group === "Pages" ? (
                      <span className="inline-flex items-center gap-1">
                        <FileText size={12} /> {hit.group}
                      </span>
                    ) : (
                      hit.group
                    )}
                  </div>
                ) : null}
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => go(hit.href)}
                  className={`flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition ${
                    index === activeIndex
                      ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                      : "text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon
                    size={16}
                    className={`mt-0.5 shrink-0 ${
                      index === activeIndex
                        ? "text-orange-500"
                        : "text-gray-400"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{hit.title}</span>
                    {hit.subtitle ? (
                      <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                        {hit.subtitle}
                      </span>
                    ) : null}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
