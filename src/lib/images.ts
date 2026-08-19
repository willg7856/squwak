const DB_NAME = "squwak.images.v1";
const STORE = "blobs";
const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.78;
const MAX_BYTES = 1_400_000;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function putImage(id: string, blob: Blob) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(blob, id);
  });
  db.close();
}

export async function getImageBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(id);
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return blob;
}

export async function deleteImages(ids: string[]) {
  if (ids.length === 0) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(STORE);
    for (const id of ids) store.delete(id);
  });
  db.close();
}

export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("type");
  }
  if (file.size <= MAX_BYTES && (file.type === "image/gif" || file.type === "image/webp")) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      throw new Error("compress");
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });
    if (!blob || blob.size > MAX_BYTES) {
      throw new Error("size");
    }
    return blob;
  } catch (error) {
    if (file.size <= MAX_BYTES) return file;
    throw error instanceof Error ? error : new Error("compress");
  }
}

const AVATAR_EDGE = 512;
const AVATAR_QUALITY = 0.84;

export async function compressAvatar(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("type");
  }
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height);
  const sx = Math.max(0, (bitmap.width - size) / 2);
  const sy = Math.max(0, (bitmap.height - size) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_EDGE;
  canvas.height = AVATAR_EDGE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("compress");
  }
  ctx.drawImage(bitmap, sx, sy, size, size, 0, 0, AVATAR_EDGE, AVATAR_EDGE);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", AVATAR_QUALITY);
  });
  if (!blob || blob.size > MAX_BYTES) {
    throw new Error("size");
  }
  return blob;
}
