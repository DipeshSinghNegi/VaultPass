"use client";

import { useEffect, useMemo, useState } from "react";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude I O by default
const LOWER = "abcdefghijkmnopqrstuvwxyz"; // exclude l
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{};:,.?/";
const LOOKALIKES = new Set(["I","l","1","O","0"]) as Set<string>;

export default function GeneratorPage() {
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);

  const charset = useMemo(() => {
    let c = "";
    if (useUpper) c += UPPER;
    if (useLower) c += LOWER;
    if (useDigits) c += DIGITS;
    if (useSymbols) c += SYMBOLS;
    if (excludeSimilar) c = [...c].filter(ch => !LOOKALIKES.has(ch)).join("");
    return c || LOWER;
  }, [useUpper, useLower, useDigits, useSymbols, excludeSimilar]);

  const generate = () => {
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    const chars = Array.from({ length }, (_, i) => charset[arr[i] % charset.length]).join("");
    setValue(chars);
  };

  useEffect(() => { generate(); }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(async () => {
      try { await navigator.clipboard.writeText(""); } catch {}
      setCopied(false);
    }, 20000);
  };

  return (
    <div className="flex items-center justify-center py-10">
      <div className="card w-full max-w-xl p-6">
        <h1 className="text-xl font-bold mb-4 text-center">Password Generator</h1>
        <div className="relative">
          <input readOnly className="w-full h-12 rounded-xl bg-gray-100 px-4" value={value} />
          <button onClick={copy} className="absolute right-2 top-2 btn btn-secondary">{copied ? "Copied" : "Copy"}</button>
        </div>
        <div className="divide-y mt-4">
          <Row label="Password length">
            <div className="flex items-center gap-3">
              <input type="range" min={6} max={64} value={length} onChange={(e)=>setLength(parseInt(e.target.value))} />
              <span className="w-8 text-right">{length}</span>
            </div>
          </Row>
          <Row label="Include uppercase letters"><Checkbox checked={useUpper} onChange={setUseUpper} /></Row>
          <Row label="Include lowercase letters"><Checkbox checked={useLower} onChange={setUseLower} /></Row>
          <Row label="Include numbers"><Checkbox checked={useDigits} onChange={setUseDigits} /></Row>
          <Row label="Include symbols"><Checkbox checked={useSymbols} onChange={setUseSymbols} /></Row>
          <Row label="Exclude look-alike"><Checkbox checked={excludeSimilar} onChange={setExcludeSimilar} /></Row>
        </div>
        <div className="flex justify-center mt-4">
          <button className="btn btn-primary" onClick={generate}>Generate</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-sm text-gray-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v:boolean)=>void }) {
  return (
    <input type="checkbox" className="h-4 w-4" checked={checked} onChange={(e)=>onChange(e.target.checked)} />
  );
}


