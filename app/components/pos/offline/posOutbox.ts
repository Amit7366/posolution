import { idbDelete, idbGet, idbGetAll, idbPut, STORE } from "./posDb";

export type OutboxType = "createCustomer" | "createInvoice";

export type OutboxStatus = "pending" | "syncing" | "failed" | "synced";

export type OutboxCustomerPayload = {
  clientCustomerId: string;
  tempId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
};

export type OutboxInvoicePayload = {
  clientSaleId: string;
  localInvoiceId: string;
  tempCustomerId?: string;
  body: Record<string, unknown>;
  /** Snapshot for transactions UI */
  preview: {
    customerName: string;
    totalAmount: number;
    productCount: number;
    hold: boolean;
    status: string;
    createdAt: string;
    items: Array<{
      productId: string;
      productName?: string;
      qty: number;
      unitPrice: number;
      lineTotal?: number;
    }>;
  };
};

export type OutboxEntry = {
  id: string;
  type: OutboxType;
  status: OutboxStatus;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  lastError?: string;
  syncedAsHold?: boolean;
  payload: OutboxCustomerPayload | OutboxInvoicePayload;
};

function nowIso() {
  return new Date().toISOString();
}

export async function enqueueOutbox(
  entry: Omit<OutboxEntry, "status" | "createdAt" | "updatedAt" | "attempts"> & {
    status?: OutboxStatus;
  }
): Promise<OutboxEntry> {
  const row: OutboxEntry = {
    ...entry,
    status: entry.status ?? "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attempts: 0,
  };
  await idbPut(STORE.outbox, row);
  return row;
}

export async function updateOutbox(
  id: string,
  patch: Partial<OutboxEntry>
): Promise<OutboxEntry | undefined> {
  const existing = await idbGet<OutboxEntry>(STORE.outbox, id);
  if (!existing) return undefined;
  const next: OutboxEntry = {
    ...existing,
    ...patch,
    id: existing.id,
    updatedAt: nowIso(),
  };
  await idbPut(STORE.outbox, next);
  return next;
}

export async function removeOutbox(id: string) {
  await idbDelete(STORE.outbox, id);
}

export async function listOutbox(): Promise<OutboxEntry[]> {
  const all = await idbGetAll<OutboxEntry>(STORE.outbox);
  return all.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function listPendingOutbox(): Promise<OutboxEntry[]> {
  const all = await listOutbox();
  // Include "syncing" so interrupted runs are recoverable via recoverStuckSyncing + retry
  return all.filter(
    (e) => e.status === "pending" || e.status === "failed" || e.status === "syncing"
  );
}

export async function countPendingOutbox(): Promise<number> {
  const pending = await listPendingOutbox();
  return pending.length;
}

export async function remapTempCustomerOnInvoices(
  tempId: string,
  realId: string
): Promise<void> {
  const all = await listOutbox();
  for (const entry of all) {
    if (entry.type !== "createInvoice") continue;
    if (entry.status === "synced") continue;
    const payload = entry.payload as OutboxInvoicePayload;
    if (payload.tempCustomerId !== tempId) continue;
    const body = { ...payload.body, customerId: realId };
    delete (body as { tempCustomerId?: string }).tempCustomerId;
    await updateOutbox(entry.id, {
      payload: {
        ...payload,
        tempCustomerId: undefined,
        body,
      },
    });
  }
}
