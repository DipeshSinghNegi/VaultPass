"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { decryptVaultItem, encryptVaultItem, VaultPlain } from "@/lib/client/crypto";
import SearchBar from "@/components/SearchBar";

type Item = { _id: string; encrypted: string; iv: string; createdAt: string; updatedAt: string };

export default function Home() {
  const { user, cryptoKey } = useContext(AuthContext);
  const [items, setItems] = useState<Item[]>([]);
  const [plainItems, setPlainItems] = useState<(VaultPlain & { _id: string })[]>([]);
  const [query, setQuery] = useState("");
  const [newItem, setNewItem] = useState<VaultPlain>({ title: "", username: "", password: "" });

  const load = async () => {
    const res = await fetch("/api/vault");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  useEffect(() => {
    (async () => {
      if (!cryptoKey) return setPlainItems([]);
      const out: (VaultPlain & { _id: string })[] = [];
      for (const it of items) {
        try {
          const p = await decryptVaultItem(cryptoKey, it.encrypted, it.iv);
          out.push({ ...p, _id: it._id });
        } catch {}
      }
      setPlainItems(out);
    })();
  }, [items, cryptoKey]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return plainItems.filter((p) =>
      [p.title, p.username, p.url ?? ""].some((x) => x.toLowerCase().includes(q))
    );
  }, [plainItems, query]);

  const add = async () => {
    if (!cryptoKey) return alert("Login first");
    const payload = await encryptVaultItem(cryptoKey, newItem);
    const res = await fetch("/api/vault", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      setNewItem({ title: "", username: "", password: "" });
      load();
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/vault/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h1 className="text-4xl font-extrabold">
          <span className="text-gray-900">Vault</span>
          <span className="text-brand">Pass</span>
        </h1>
        <p className="text-gray-500">Password Manager</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        <SearchBar value={query} onChange={setQuery} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Enter URL" value={newItem.url ?? ""} onChange={(e)=>setNewItem((p)=>({...p, url:e.target.value}))} />
          <input className="input" placeholder="Username" value={newItem.username} onChange={(e)=>setNewItem((p)=>({...p, username:e.target.value}))} />
          <input className="input" placeholder="Password" value={newItem.password} onChange={(e)=>setNewItem((p)=>({...p, password:e.target.value}))} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input" placeholder="Title" value={newItem.title} onChange={(e)=>setNewItem((p)=>({...p, title:e.target.value}))} />
          <input className="input" placeholder="Notes (optional)" value={newItem.notes ?? ""} onChange={(e)=>setNewItem((p)=>({...p, notes:e.target.value}))} />
        </div>
        <div className="flex justify-center">
          <button className="btn btn-primary" onClick={add}>Save</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-center mb-3">Your Passwords</h2>
        <div className="space-y-3">
          {filtered.map((p) => (
            <details key={p._id} className="rounded-2xl border overflow-hidden" open>
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-green-50">
                <div>
                  <div className="font-semibold">{p.title || p.url}</div>
                  <div className="text-sm text-gray-600">{p.username}</div>
                </div>
              </summary>
              <div className="bg-white px-4 py-3 space-y-2">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><div className="font-semibold">Site:</div>{p.url}</div>
                  <div><div className="font-semibold">Username:</div>{p.username}</div>
                  <div><div className="font-semibold">Password:</div>{"***************"}</div>
                </div>
                <div className="pt-2">
                  <button className="btn btn-secondary" onClick={() => remove(p._id)}>Delete</button>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}


