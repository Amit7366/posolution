import {
  decrementLocalStock,
  searchCachedInvoices,
  upsertCustomers,
  upsertInvoice,
  type CachedCustomer,
  type CachedInvoice,
} from "./posCache";
import { idbDelete, STORE } from "./posDb";
import {
  countPendingOutbox,
  listOutbox,
  listPendingOutbox,
  remapTempCustomerOnInvoices,
  removeOutbox,
  updateOutbox,
  type OutboxCustomerPayload,
  type OutboxEntry,
  type OutboxInvoicePayload,
} from "./posOutbox";

export type SyncResult = {
  synced: number;
  held: number;
  failed: number;
  pendingLeft: number;
};

export const POS_SYNC_EVENT = "pos-offline-synced";

let syncing = false;

function authToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function isOnline() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function extractErrorMessage(json: unknown, fallback: string) {
  if (!json || typeof json !== "object") return fallback;
  const j = json as {
    message?: string;
    errorMessages?: string[];
    errorSources?: { message?: string }[];
  };
  if (typeof j.message === "string" && j.message.trim()) return j.message;
  if (Array.isArray(j.errorMessages) && j.errorMessages[0]) return String(j.errorMessages[0]);
  if (Array.isArray(j.errorSources) && j.errorSources[0]?.message) {
    return String(j.errorSources[0].message);
  }
  return fallback;
}

async function apiPost(path: string, body: Record<string, unknown>) {
  const token = authToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = extractErrorMessage(json, `Request failed (${res.status})`);
    const err = new Error(message) as Error & { status?: number; data?: unknown };
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json as { data?: Record<string, unknown>; message?: string };
}

function isInsufficientStock(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return /insufficient stock/i.test(msg);
}

function isNetworkError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const e = err as {
    status?: number | string;
    error?: string;
    message?: string;
    name?: string;
  };
  if (e.status === "FETCH_ERROR" || e.status === "TIMEOUT_ERROR") return true;
  if (typeof e.status === "number" && e.status >= 400) return false;
  const msg = e.message || e.error || "";
  return (
    msg === "Failed to fetch" ||
    e.name === "TypeError" ||
    /network|offline|fetch/i.test(String(msg))
  );
}

function notifySynced() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(POS_SYNC_EVENT));
}

/** Recover entries left as "syncing" after a crash / tab close */
async function recoverStuckSyncing() {
  const all = await listOutbox();
  for (const entry of all) {
    if (entry.status === "syncing") {
      await updateOutbox(entry.id, {
        status: "pending",
        lastError: "Interrupted — retrying",
      });
    }
  }
}

/**
 * Remove local OFFLINE-* rows that are no longer in the outbox
 * (already synced under a previous bug that left ghost pending rows).
 */
async function cleanupOrphanPendingInvoices() {
  const outbox = await listOutbox();
  const activeSaleIds = new Set(
    outbox
      .filter((e) => e.type === "createInvoice")
      .map((e) => (e.payload as OutboxInvoicePayload).clientSaleId)
      .filter(Boolean)
  );
  const invoices = await searchCachedInvoices({ limit: 200 });
  for (const inv of invoices) {
    if (!inv.pendingSync) continue;
    if (inv.clientSaleId && activeSaleIds.has(inv.clientSaleId)) continue;
    // No matching outbox entry → safe to drop the ghost pending row
    await idbDelete(STORE.invoices, inv.id);
  }
}

async function syncCustomer(entry: OutboxEntry) {
  const payload = entry.payload as OutboxCustomerPayload;
  await updateOutbox(entry.id, { status: "syncing", attempts: entry.attempts + 1 });
  try {
    const res = await apiPost("/customer", {
      clientCustomerId: payload.clientCustomerId,
      name: payload.name,
      phone: payload.phone ?? "",
      email: payload.email ?? "",
      address: payload.address ?? "",
      status: payload.status ?? "active",
    });
    const doc = (res.data ?? res) as {
      _id?: string;
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      status?: string;
      clientCustomerId?: string;
    };
    const realId = String(doc._id ?? "");
    if (realId) {
      const cached: CachedCustomer = {
        id: realId,
        name: doc.name ?? payload.name,
        phone: doc.phone ?? payload.phone,
        email: doc.email ?? payload.email,
        address: doc.address ?? payload.address,
        status: doc.status ?? "active",
        clientCustomerId: payload.clientCustomerId,
        isTemp: false,
      };
      await upsertCustomers([cached]);
      if (payload.tempId && payload.tempId !== realId) {
        await idbDelete(STORE.customers, payload.tempId);
      }
      await remapTempCustomerOnInvoices(payload.tempId, realId);
    }
    await removeOutbox(entry.id);
    return { ok: true as const, held: false };
  } catch (err) {
    if (isNetworkError(err)) {
      await updateOutbox(entry.id, { status: "pending", lastError: "Network error" });
      return { ok: false as const, held: false, network: true as const };
    }
    const msg = err instanceof Error ? err.message : "Customer sync failed";
    await updateOutbox(entry.id, { status: "failed", lastError: msg });
    return { ok: false as const, held: false };
  }
}

async function syncInvoice(entry: OutboxEntry) {
  const payload = entry.payload as OutboxInvoicePayload;
  await updateOutbox(entry.id, { status: "syncing", attempts: entry.attempts + 1 });

  const tryPost = async (body: Record<string, unknown>) => apiPost("/invoice", body);

  try {
    const body = { ...payload.body, clientSaleId: payload.clientSaleId };
    if (
      payload.tempCustomerId ||
      (typeof body.customerId === "string" &&
        (body.customerId.startsWith("temp_") || body.customerId.startsWith("__")))
    ) {
      delete body.customerId;
    }

    let res: { data?: Record<string, unknown> };
    let syncedAsHold = false;
    try {
      res = await tryPost(body);
    } catch (err) {
      if (isInsufficientStock(err) && !body.hold) {
        res = await tryPost({
          ...body,
          hold: true,
          paid: 0,
          status: "unpaid",
          cashAmount: 0,
          changeAmount: 0,
        });
        syncedAsHold = true;
      } else {
        throw err;
      }
    }

    const doc = (res.data ?? {}) as {
      _id?: string;
      invoiceNo?: string;
      customerName?: string;
      customerPhone?: string;
      createdAt?: string;
      status?: string;
      totalAmount?: number;
      hold?: boolean;
      clientSaleId?: string;
    };

    const serverId = doc._id ? String(doc._id) : "";

    // Remove the local pending ghost row so UI doesn't keep "Pending sync"
    if (payload.localInvoiceId) {
      await idbDelete(STORE.invoices, payload.localInvoiceId);
    }

    const cached: CachedInvoice = {
      id: serverId || payload.localInvoiceId,
      invoiceNo: doc.invoiceNo || `INV-${payload.clientSaleId.slice(0, 8)}`,
      customerName: doc.customerName ?? payload.preview.customerName,
      customerPhone: doc.customerPhone,
      createdAt: doc.createdAt ?? payload.preview.createdAt,
      status: doc.status ?? payload.preview.status,
      totalAmount: Number(doc.totalAmount ?? payload.preview.totalAmount),
      hold: Boolean(doc.hold ?? syncedAsHold),
      pendingSync: false,
      failedSync: false,
      syncedAsHold,
      clientSaleId: payload.clientSaleId,
      detail: doc._id ? (doc as Record<string, unknown>) : undefined,
    };
    await upsertInvoice(cached);
    await removeOutbox(entry.id);
    return { ok: true as const, held: syncedAsHold };
  } catch (err) {
    if (isNetworkError(err)) {
      await updateOutbox(entry.id, { status: "pending", lastError: "Network error" });
      return { ok: false as const, held: false, network: true as const };
    }
    const msg = err instanceof Error ? err.message : "Invoice sync failed";
    await updateOutbox(entry.id, { status: "failed", lastError: msg });
    await upsertInvoice({
      id: payload.localInvoiceId,
      invoiceNo: `OFFLINE-${payload.clientSaleId.slice(0, 8)}`,
      customerName: payload.preview.customerName,
      createdAt: payload.preview.createdAt,
      status: payload.preview.status,
      totalAmount: payload.preview.totalAmount,
      hold: payload.preview.hold,
      pendingSync: true,
      failedSync: true,
      syncError: msg,
      clientSaleId: payload.clientSaleId,
      detail: {
        invoiceNo: `OFFLINE-${payload.clientSaleId.slice(0, 8)}`,
        customerName: payload.preview.customerName,
        items: payload.preview.items,
        totalAmount: payload.preview.totalAmount,
        status: payload.preview.status,
        hold: payload.preview.hold,
        createdAt: payload.preview.createdAt,
        pendingSync: true,
        syncError: msg,
      },
    });
    return { ok: false as const, held: false };
  }
}

export async function runPosSync(): Promise<SyncResult> {
  if (syncing) {
    return { synced: 0, held: 0, failed: 0, pendingLeft: await countPendingOutbox() };
  }
  if (!isOnline() || !authToken()) {
    return { synced: 0, held: 0, failed: 0, pendingLeft: await countPendingOutbox() };
  }

  syncing = true;
  let synced = 0;
  let held = 0;
  let failed = 0;

  try {
    await recoverStuckSyncing();
    await cleanupOrphanPendingInvoices();

    const pending = await listPendingOutbox();
    const customers = pending.filter((e) => e.type === "createCustomer");

    for (const entry of customers) {
      const r = await syncCustomer(entry);
      if (r.ok) synced += 1;
      else if (!(r as { network?: boolean }).network) failed += 1;
    }

    // Re-read after customer remap so invoice payloads get real customerIds
    const invoicePending = (await listPendingOutbox()).filter(
      (e) => e.type === "createInvoice"
    );

    for (const entry of invoicePending) {
      const r = await syncInvoice(entry);
      if (r.ok) {
        synced += 1;
        if (r.held) held += 1;
      } else if (!(r as { network?: boolean }).network) {
        failed += 1;
      }
    }

    await cleanupOrphanPendingInvoices();
    notifySynced();
  } finally {
    syncing = false;
  }

  return {
    synced,
    held,
    failed,
    pendingLeft: await countPendingOutbox(),
  };
}

export { isNetworkError, isOnline };

/** Helper used when queueing offline invoice — also adjust local stock. */
export async function applyLocalStockForQueuedSale(
  lines: { productId: string; qty: number }[],
  hold: boolean
) {
  if (hold) return;
  await decrementLocalStock(lines);
}
