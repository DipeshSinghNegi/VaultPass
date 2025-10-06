"use client";

import { useCallback, useRef, useState } from "react";

export function useClipboardAutoClear() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  const copy = useCallback(async (text: string, clearMs = 20000) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      try { await navigator.clipboard.writeText(""); } catch {}
      setCopied(false);
      timer.current = null;
    }, clearMs);
  }, []);

  return { copied, copy };
}


