"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthProvider";

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="w-full site-header backdrop-blur sticky top-0 z-40 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span>
            <span style={{ color: 'var(--text)', fontWeight: 600, letterSpacing: '-0.02em' }}>Vault</span>
            <span className="text-brand font-extrabold">Pass</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/vault" className="px-3 py-1.5 rounded-full btn-secondary text-sm">Vault</Link>
          <Link href="https://github.com/DipeshSinghNegi/VaultPass" className="px-3 py-1.5 rounded-full bg-green-500 text-white text-sm">Github</Link>
          <Link href="/generator" className="px-3 py-1.5 rounded-full btn-secondary text-sm">Generate</Link>
          <DarkToggle />
          {user ? (
            <button onClick={logout} className="px-3 py-1.5 rounded-full btn-primary text-sm">Logout</button>
          ) : (
            <Link href="/login" className="px-3 py-1.5 rounded-full btn-primary text-sm">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}

function DarkToggle() {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    const pref = localStorage.getItem('vaultpass_dark');
    const v = pref === '1' || (!pref && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(v);
    document.documentElement.classList.toggle('dark', v);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('vaultpass_dark', next ? '1' : '0'); } catch {}
  };

  return (
    <button onClick={toggle} className="px-3 py-1.5 rounded-full bg-gray-200 text-sm">{dark ? '🌙' : '☀️'}</button>
  );
}


