// Small helper to persist a wrapped CryptoKey in IndexedDB
const DB_NAME = "vaultpass_keys";
const STORE_NAME = "keys";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function storeWrappedKey(name: string, wrapped: ArrayBuffer, iv: ArrayBuffer, algo: JsonWebKey) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const st = tx.objectStore(STORE_NAME);
    st.put({ wrapped: arrayBufferToBase64(wrapped), iv: arrayBufferToBase64(iv), algo }, name);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getWrappedKey(name: string): Promise<{ wrapped: ArrayBuffer; iv: ArrayBuffer; algo: JsonWebKey } | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const st = tx.objectStore(STORE_NAME);
    const r = st.get(name);
    r.onsuccess = () => {
      const v = r.result;
      if (!v) return resolve(null);
      resolve({ wrapped: base64ToArrayBuffer(v.wrapped), iv: base64ToArrayBuffer(v.iv), algo: v.algo });
    };
    r.onerror = () => reject(r.error);
  });
}

export async function removeWrappedKey(name: string) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const st = tx.objectStore(STORE_NAME);
    st.delete(name);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function arrayBufferToBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToArrayBuffer(b64: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
