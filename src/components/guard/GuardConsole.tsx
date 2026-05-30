"use client";

import { useState } from "react";
import { VisitorRecord } from "@/types/visitor.types";
import { QRScanner } from "./QRScanner";
import { ManualCodeInput } from "./ManualCodeInput";
import { VisitorInfoCard } from "./VisitorInfoCard";

type Tab = "scan" | "manual";

export function GuardConsole() {
  const [tab, setTab] = useState<Tab>("scan");
  const [visitor, setVisitor] = useState<VisitorRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(code: string) {
    setError(null);
    setLoading(true);
    setVisitor(null);
    try {
      const res = await fetch(
        `/api/visitors/lookup?code=${encodeURIComponent(code)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Lookup failed");
      setVisitor(json.visitor as VisitorRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex gap-2">
          <TabButton active={tab === "scan"} onClick={() => setTab("scan")}>
            Scan QR
          </TabButton>
          <TabButton active={tab === "manual"} onClick={() => setTab("manual")}>
            Enter Code
          </TabButton>
        </div>

        {tab === "scan" ? (
          <QRScanner onScan={lookup} />
        ) : (
          <ManualCodeInput onLookup={lookup} loading={loading} />
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      {visitor && (
        <VisitorInfoCard visitor={visitor} onUpdated={setVisitor} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
