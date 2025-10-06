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
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search Password..."
      className="w-full rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand/60"
    />
  );
}


