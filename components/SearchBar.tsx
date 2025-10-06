"use client";

import React from "react";

export default function SearchBar({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search Password..."
        className="input rounded-full"
      />
      {value && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}


