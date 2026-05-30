"use client";

import { Input } from "@/components/ui/Input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <Input
      type="search"
      placeholder="Search by name, email, unit, or code…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-md"
    />
  );
}
