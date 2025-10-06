"use client";

import { useContext, useState } from "react";
import { AuthContext } from "./AuthProvider";
import { decryptVaultItem, encryptVaultItem, VaultPlain } from "@/lib/client/crypto";
import { useClipboardAutoClear } from "@/lib/client/useClipboard";

export default function VaultItemRow({ item, refresh }: { item: { _id: string; encrypted: string; iv: string }; refresh: () => void }) {
  const { cryptoKey } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [plain, setPlain] = useState<VaultPlain | null>(null);
  const { copied, copy } = useClipboardAutoClear();

  const ensureDecrypted = async () => {
    if (!cryptoKey) return;
    if (!plain) {
      const p = await decryptVaultItem(cryptoKey, item.encrypted, item.iv);
      setPlain(p);
    }
  };

  const save = async () => {
    if (!cryptoKey || !plain) return;
  const payload = await encryptVaultItem(cryptoKey, plain);
  await fetch(`/api/vault/${item._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ encrypted: payload.encrypted, iv: payload.iv }) });
    setEditing(false);
    refresh();
  };

  const remove = async () => {
    await fetch("/api/vault/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item._id }) });
    refresh();
  };

  return (
    <details className="rounded-2xl border overflow-hidden bg-white shadow-card">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-green-50" onClick={ensureDecrypted}>
        <div>
          <div className="font-semibold">{plain?.title || "(encrypted)"}</div>
          <div className="text-sm text-gray-600">{plain?.username ?? ""}</div>
        </div>
      </summary>
      <div className="bg-white px-4 py-3 space-y-2">
        {plain ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input" placeholder="Title" value={plain.title} onChange={(e)=>setPlain({ ...plain, title: e.target.value })} disabled={!editing} />
              <input className="input" placeholder="URL" value={plain.url ?? ""} onChange={(e)=>setPlain({ ...plain, url: e.target.value })} disabled={!editing} />
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Username" value={plain.username} onChange={(e)=>setPlain({ ...plain, username: e.target.value })} disabled={!editing} />
                <button className="btn btn-secondary" onClick={() => copy(plain.username)}>{copied ? "Copied" : "Copy"}</button>
              </div>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Password" value={plain.password} onChange={(e)=>setPlain({ ...plain, password: e.target.value })} disabled={!editing} />
                <button className="btn btn-secondary" onClick={() => copy(plain.password)}>{copied ? "Copied" : "Copy"}</button>
              </div>
              <input className="input md:col-span-2" placeholder="Notes" value={plain.notes ?? ""} onChange={(e)=>setPlain({ ...plain, notes: e.target.value })} disabled={!editing} />
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit</button>
                  <button className="btn btn-secondary" onClick={remove}>Delete</button>
                  <button className="btn btn-ghost" onClick={() => copy(plain?.password ?? "")}>{copied ? "Copied" : "Copy"}</button>
                </>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={save}>Save</button>
                  <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">Decrypting...</div>
        )}
      </div>
    </details>
  );
}


