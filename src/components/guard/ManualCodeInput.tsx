"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ManualCodeInputProps {
  onLookup: (code: string) => void;
  loading: boolean;
}

export function ManualCodeInput({ onLookup, loading }: ManualCodeInputProps) {
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed) onLookup(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Enter access code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="font-mono uppercase tracking-widest"
        autoCapitalize="characters"
      />
      <Button type="submit" disabled={loading || !code.trim()}>
        {loading ? "Looking up…" : "Verify"}
      </Button>
    </form>
  );
}
