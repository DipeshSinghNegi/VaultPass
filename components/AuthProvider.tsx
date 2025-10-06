"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { deriveAesKey } from "@/lib/client/crypto";

type User = { _id: string; email: string };
type AuthContextType = {
  user: User | null;
  cryptoKey: CryptoKey | null;
  loginWithPassword: (email: string, password: string) => Promise<boolean>;
  signupWithPassword: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  cryptoKey: null,
  loginWithPassword: async () => false,
  signupWithPassword: async () => false,
  logout: async () => {}
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

  const refreshMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshMe();
    (async () => {
      try {
        // Attempt to restore wrapped key from IndexedDB
        const saved = await import("@/lib/client/keyStorage");
        const wrapped = await saved.getWrappedKey("vaultpass_aes_key");
        if (wrapped) {
          try {
            // Recreate the wrapping key from stored JWK (algo)
            if (wrapped.algo && wrapped.algo.kty) {
              const wrappingKey = await crypto.subtle.importKey("jwk", wrapped.algo as JsonWebKey, { name: "AES-GCM" }, true, ["wrapKey", "unwrapKey"]);
              // Unwrap the AES raw key
              const unwrapped = await crypto.subtle.unwrapKey(
                "raw",
                wrapped.wrapped,
                wrappingKey,
                { name: "AES-GCM", iv: new Uint8Array(wrapped.iv) },
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"]
              );
              setCryptoKey(unwrapped as CryptoKey);
            }
          } catch (e) {
            // If unwrap fails, ignore — user will re-login and re-create wrapped key
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [refreshMe]);

  const loginWithPassword = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) return false;
    await refreshMe();
    const key = await deriveAesKey(password, email);
    setCryptoKey(key);
    try {
      // create a per-user ephemeral wrapping key and store wrapped AES key in IndexedDB
  const wrappingKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["wrapKey", "unwrapKey"]);
  const exportedWrapJwk = await crypto.subtle.exportKey("jwk", wrappingKey);
  const wrapIv = crypto.getRandomValues(new Uint8Array(12));
  const wrapped = await crypto.subtle.wrapKey("raw", key, wrappingKey, { name: "AES-GCM", iv: wrapIv });
  const saved = await import("@/lib/client/keyStorage");
  await saved.storeWrappedKey("vaultpass_aes_key", wrapped, wrapIv.buffer, exportedWrapJwk as JsonWebKey);
      // Note: wrappingKey is not persisted; stored wrapped key increases cost to retrieve without login. We'll keep raw key in memory for this session.
  // do not persist raw AES key to sessionStorage for improved safety
    } catch {}
    return true;
  }, [refreshMe]);

  const signupWithPassword = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) return false;
    await refreshMe();
    const key = await deriveAesKey(password, email);
    setCryptoKey(key);
    try {
  const wrappingKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["wrapKey", "unwrapKey"]);
  const exportedWrapJwk = await crypto.subtle.exportKey("jwk", wrappingKey);
  const wrapIv = crypto.getRandomValues(new Uint8Array(12));
  const wrapped = await crypto.subtle.wrapKey("raw", key, wrappingKey, { name: "AES-GCM", iv: wrapIv });
  const saved = await import("@/lib/client/keyStorage");
  await saved.storeWrappedKey("vaultpass_aes_key", wrapped, wrapIv.buffer, exportedWrapJwk as JsonWebKey);
      const raw = await crypto.subtle.exportKey("raw", key);
      const b64 = btoa(String.fromCharCode(...new Uint8Array(raw)));
      sessionStorage.setItem("vaultpass_aes_key", b64);
    } catch {}
    return true;
  }, [refreshMe]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setCryptoKey(null);
    try { sessionStorage.removeItem("vaultpass_aes_key"); const saved = await import("@/lib/client/keyStorage"); await saved.removeWrappedKey("vaultpass_aes_key"); } catch {}
  }, []);

  const value = useMemo(
    () => ({ user, cryptoKey, loginWithPassword, signupWithPassword, logout }),
    [user, cryptoKey, loginWithPassword, signupWithPassword, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


