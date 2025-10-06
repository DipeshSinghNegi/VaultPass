export type VaultPlain = {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
};

export async function deriveAesKey(password: string, emailSalt: string) {
  const enc = new TextEncoder();
  const salt = enc.encode(emailSalt);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptVaultItem(key: CryptoKey, data: VaultPlain) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return {
    encrypted: arrayBufferToBase64(cipher),
    iv: arrayBufferToBase64(iv.buffer)
  };
}

export async function decryptVaultItem(key: CryptoKey, encrypted: string, ivB64: string): Promise<VaultPlain> {
  const iv = new Uint8Array(base64ToArrayBuffer(ivB64));
  const data = base64ToArrayBuffer(encrypted);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return JSON.parse(new TextDecoder().decode(plain));
}

export function arrayBufferToBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function base64ToArrayBuffer(b64: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}


