"use client";

import { useEffect } from "react";

export default function ThemeEnforcer() {
  useEffect(() => {
    // Force light mode by removing any persisted dark class
    document.documentElement.classList.remove("dark");
    try {
      const key = "theme";
      const stored = localStorage.getItem(key);
      if (stored === "dark") localStorage.setItem(key, "light");
    } catch {}
  }, []);
  return null;
}


