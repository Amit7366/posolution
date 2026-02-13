import { RootState } from "@/redux/store";
import { encryptPayload } from "@/utils/encryption";
import { useSelector } from "react-redux";

/** Helper for POST requests with JSON body */
async function postJson(url: string, data: any, timeoutSec = 15): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutSec * 1000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function fetchVendorTransactions() {
  const agency = "7d343533d514abb11a9afe12b3cd38b6";
  const aesKey = "4107b4a060fd8533b77ce95fcc9e27ec";
  const vendorBase = "https://jsgame.live"; // replace with actual base URL
// Current date in UTC
const nowMs = new Date();

// Get today's date parts in UTC
const year = nowMs.getUTCFullYear();
const month = nowMs.getUTCMonth(); // 0–11
const date = nowMs.getUTCDate();
const hours = nowMs.getUTCHours();
const minutes = nowMs.getUTCMinutes();
const seconds = nowMs.getUTCSeconds();
// const sessionStart = useSelector((state: RootState) => state.session.startTime);
// console.log(sessionStart);
// Start of today in UTC (00:00:00)
// Start of today in UTC (00:00:00)
// const sessionStart =
//   typeof window !== "undefined" ? localStorage.getItem("sessionBeginning") : null;

// const from_date = sessionStart
//   ? Number(sessionStart)
//   : Date.UTC(year, month, date, 0, 0, 0);


// const from_date =  Date.UTC(year, month, date, 0, 0, 0);
// const prevDate = (date - 1)
// console.log(typeof(prevDate),typeof(date));
// 🕐 From: Yesterday 00:00:00 UTC
const from_date = Date.UTC(year, month, date, 0, 0, 0);
// console.log(from_date)
// const from_date = Number(localStorage.getItem('sessionBeginning')) || Date.UTC(year, month, date, 0, 0, 0);
// End of today in UTC (23:59:59)
const to_date = Date.UTC(year, month, date, 23, 59, 59);
console.log(from_date,to_date)

  // Inner payload — the one that gets AES encrypted
  const inner = {
    timestamp: nowMs,
    agency_uid: agency,
    from_date,
    to_date,
    page_no: 1,
    page_size: 2000,
  };

  // Encrypt using AES-256-ECB (matches PHP)
  const payload = encryptPayload(inner, aesKey);

  // Outer wrapper — plain JSON
  const outer = {
    agency_uid: agency,
    timestamp: nowMs,
    payload,
  };

  try {
    const resp = await postJson(`${vendorBase}/game/transaction/list`, outer, 15);
    // console.log("✅ Vendor Response:", resp);
    return resp;
  } catch (err: any) {
    console.error("❌ Vendor fetch failed:", err.message);
    throw err;
  }
}
