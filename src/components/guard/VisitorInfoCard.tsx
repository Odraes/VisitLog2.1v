"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { VisitorRecord } from "@/types/visitor.types";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";

interface VisitorInfoCardProps {
  visitor: VisitorRecord;
  onUpdated: (visitor: VisitorRecord) => void;
}

export function VisitorInfoCard({ visitor, onUpdated }: VisitorInfoCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function logTime(kind: "timein" | "timeout") {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/visitors/${visitor.id}/${kind}`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Action failed");
      onUpdated(json.visitor as VisitorRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start gap-4">
        <img
          src={visitor.idPictureUrl}
          alt={`ID of ${visitor.fullName}`}
          className="h-24 w-24 rounded-lg object-cover ring-1 ring-slate-200"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {visitor.fullName}
            </h2>
            <StatusBadge status={visitor.status} />
          </div>
          <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <Detail label="Purpose" value={visitor.purpose} />
            <Detail label="Target Unit" value={visitor.targetUnit} />
            <Detail label="Email" value={visitor.email} />
            <Detail
              label="Expected"
              value={new Date(visitor.expectedArrival).toLocaleString()}
            />
            <Detail label="Access Code" value={visitor.accessCode} mono />
            {visitor.timeIn && (
              <Detail
                label="Time In"
                value={new Date(visitor.timeIn).toLocaleString()}
              />
            )}
            {visitor.timeOut && (
              <Detail
                label="Time Out"
                value={new Date(visitor.timeOut).toLocaleString()}
              />
            )}
          </dl>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <Button
          variant="success"
          disabled={loading || visitor.status !== "PENDING"}
          onClick={() => logTime("timein")}
        >
          Log Time In
        </Button>
        <Button
          variant="danger"
          disabled={loading || visitor.status !== "TIMED_IN"}
          onClick={() => logTime("timeout")}
        >
          Log Time Out
        </Button>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className={`text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
