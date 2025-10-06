"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { encryptVaultItem, decryptVaultItem, VaultPlain } from "@/lib/client/crypto";
import { useClipboardAutoClear } from "@/lib/client/useClipboard";
import VaultItemRow from "@/components/VaultItemRow";
import SearchBar from "@/components/SearchBar";

type Item = { _id: string; encrypted: string; iv: string; createdAt: string; updatedAt: string };

export default function VaultPage() {
  const { user, cryptoKey } = useContext(AuthContext);
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [newItem, setNewItem] = useState<VaultPlain>({ title: "", username: "", password: "" });
  const { copied, copy } = useClipboardAutoClear();

  const load = async () => {
    const res = await fetch("/api/vault/list");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const add = async () => {
    if (!cryptoKey) return alert("Login first");
    const payload = await encryptVaultItem(cryptoKey, newItem);
    const res = await fetch("/api/vault/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      setNewItem({ title: "", username: "", password: "" });
      load();
    }
  };

  const [decryptedIndex, setDecryptedIndex] = useState<Map<string, VaultPlain>>(new Map());

  // attempt to decrypt items when cryptoKey is available and cache them in decryptedIndex
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cryptoKey) return;
      for (const it of items) {
        if (decryptedIndex.has(it._id)) continue;
        try {
          const p = await decryptVaultItem(cryptoKey, it.encrypted, it.iv);
          if (cancelled) return;
          setDecryptedIndex((prev) => {
            const m = new Map(prev);
            m.set(it._id, p);
            return m;
          });
        } catch (e) {
          // skip items that cannot be decrypted
        }
      }
    })();
    return () => { cancelled = true; };
  }, [items, cryptoKey, decryptedIndex]);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((it) => {
      const p = decryptedIndex.get(it._id);
      if (p) {
        return (p.title || "").toLowerCase().includes(q)
          || (p.username || "").toLowerCase().includes(q)
          || (p.url || "").toLowerCase().includes(q)
          || (p.notes || "").toLowerCase().includes(q);
      }
      // fall back to matching against ciphertext (rare but better than nothing)
      return it.encrypted.toLowerCase().includes(q) || it.iv.toLowerCase().includes(q);
    });
  }, [items, query, decryptedIndex]);

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto card p-5 space-y-3">
        <SearchBar value={query} onChange={setQuery} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Enter URL" value={newItem.url ?? ""} onChange={(e)=>setNewItem((p)=>({...p, url:e.target.value}))} />
          <input className="input" placeholder="Username" value={newItem.username} onChange={(e)=>setNewItem((p)=>({...p, username:e.target.value}))} />
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Password" value={newItem.password} onChange={(e)=>setNewItem((p)=>({...p, password:e.target.value}))} />
            <button className="btn btn-secondary" onClick={() => copy(newItem.password)}>{copied ? "Copied" : "Copy"}</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input" placeholder="Title" value={newItem.title} onChange={(e)=>setNewItem((p)=>({...p, title:e.target.value}))} />
          <input className="input" placeholder="Notes (optional)" value={newItem.notes ?? ""} onChange={(e)=>setNewItem((p)=>({...p, notes:e.target.value}))} />
        </div>
        <div className="flex justify-center">
          <button className="btn btn-primary" onClick={add}>Save</button>
        </div>
        <div className="flex justify-center gap-2 mt-2">
          <button className="btn btn-ghost" onClick={async () => {
            const res = await fetch('/api/vault/list');
            if (!res.ok) return alert('Failed to fetch');
            const data = await res.json();
            const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), items: data.items })], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `vaultpass-export-${Date.now()}.json`; a.click();
            URL.revokeObjectURL(url);
          }}>Export (encrypted)</button>
          <label className="btn btn-ghost">
            Import
            <input type="file" accept="application/json" className="hidden" onChange={async (e)=>{
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const text = await f.text();
                const parsed = JSON.parse(text);
                if (!parsed.items || !Array.isArray(parsed.items)) return alert('Invalid file');
                for (const it of parsed.items) {
                  if (!it.encrypted || !it.iv) continue;
                  await fetch('/api/vault/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ encrypted: it.encrypted, iv: it.iv }) });
                }
                alert('Import complete');
                load();
              } catch (err) { alert('Import failed'); }
            }} />
          </label>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-center mb-3">Your Passwords</h2>
        <div className="space-y-3">
          {filtered.map((it) => (
            <VaultItemRow key={it._id} item={it} refresh={load} />
          ))}
        </div>
      </div>
    </div>
  );
}


