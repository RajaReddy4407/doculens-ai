import {
  AnalysisMode,
  AnalysisResult,
  ChatMessage,
  PersonalityMode,
  UploadedFilePayload,
} from "@/types/analysis";

/**
 * Recents are stored on this device only, in IndexedDB.
 * IndexedDB (not localStorage) because image data URLs easily exceed localStorage's ~5 MB cap.
 */

export interface RecentEntry {
  id: string; // same as file.id
  file: UploadedFilePayload;
  analysis: AnalysisResult;
  mode: AnalysisMode;
  personality: PersonalityMode;
  chat: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export type RecentSummary = Omit<RecentEntry, "file" | "analysis" | "chat"> & {
  name: string;
  mimeType: string;
  category: string;
  thumbnail?: string;
};

const DB_NAME = "doculens";
const STORE = "recents";
const MAX_RECENTS = 15;
const THUMB_SIZE = 96;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const req = fn(store);
    let result: T | undefined;
    if (req) req.onsuccess = () => (result = req.result);
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** Small JPEG thumbnail so the list renders fast without decoding full images. */
async function makeThumbnail(file: UploadedFilePayload): Promise<string | undefined> {
  if (!file.dataUrl || !file.mimeType.startsWith("image/")) return undefined;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = THUMB_SIZE / Math.max(img.naturalWidth, img.naturalHeight, 1);
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(undefined);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve(undefined);
    img.src = file.dataUrl!;
  });
}

type StoredEntry = RecentEntry & { thumbnail?: string };

export async function listRecents(): Promise<RecentSummary[]> {
  try {
    const all = ((await withStore<StoredEntry[]>("readonly", (s) => s.getAll())) ?? []).sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
    return all.map((e) => ({
      id: e.id,
      name: e.file.name,
      mimeType: e.file.mimeType,
      category: e.analysis.detectedCategory,
      thumbnail: e.thumbnail,
      mode: e.mode,
      personality: e.personality,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
  } catch {
    return [];
  }
}

export async function getRecent(id: string): Promise<RecentEntry | undefined> {
  try {
    return await withStore<StoredEntry>("readonly", (s) => s.get(id));
  } catch {
    return undefined;
  }
}

export async function saveRecent(
  entry: Omit<RecentEntry, "createdAt" | "updatedAt" | "chat"> & { chat?: ChatMessage[] }
): Promise<void> {
  try {
    const existing = await withStore<StoredEntry>("readonly", (s) => s.get(entry.id));
    const thumbnail = existing?.thumbnail ?? (await makeThumbnail(entry.file));
    const now = Date.now();
    const record: StoredEntry = {
      ...entry,
      chat: entry.chat ?? existing?.chat ?? [],
      thumbnail,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await withStore("readwrite", (s) => s.put(record));
    await pruneRecents();
  } catch {
    // Storage full or blocked (e.g. private mode): recents are a convenience, never break the scan.
  }
}

export async function updateRecentChat(id: string, chat: ChatMessage[]): Promise<void> {
  try {
    const existing = await withStore<StoredEntry>("readonly", (s) => s.get(id));
    if (!existing) return;
    await withStore("readwrite", (s) => s.put({ ...existing, chat, updatedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export async function deleteRecent(id: string): Promise<void> {
  try {
    await withStore("readwrite", (s) => s.delete(id));
  } catch {
    /* ignore */
  }
}

export async function clearRecents(): Promise<void> {
  try {
    await withStore("readwrite", (s) => s.clear());
  } catch {
    /* ignore */
  }
}

async function pruneRecents() {
  const all = (await withStore<StoredEntry[]>("readonly", (s) => s.getAll())) ?? [];
  if (all.length <= MAX_RECENTS) return;
  const stale = all.sort((a, b) => b.updatedAt - a.updatedAt).slice(MAX_RECENTS);
  await withStore("readwrite", (s) => {
    stale.forEach((e) => s.delete(e.id));
  });
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return "Yesterday";
  if (day < 7) return `${day} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
