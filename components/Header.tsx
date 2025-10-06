"use client";

import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="w-full bg-white/70 backdrop-blur sticky top-0 z-40 border-b border-black/5">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span>
            <span className="text-gray-900">Vault</span>
            <span className="text-brand font-bold">Pass</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/vault"
            className="px-3 py-1.5 rounded-full bg-gray-200 text-sm"
          >
            Vault
          </Link>
          <Link
            href="https://github.com"
            className="px-3 py-1.5 rounded-full bg-green-500 text-white text-sm"
          >
            Github
          </Link>
          <Link
            href="/generator"
            className="px-3 py-1.5 rounded-full bg-gray-200 text-sm"
          >
            Generate
          </Link>
          {user ? (
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-sm"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


