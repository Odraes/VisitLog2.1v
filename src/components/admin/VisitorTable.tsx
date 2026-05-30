"use client";

import { useCallback, useEffect, useState } from "react";
import { VisitorRecord } from "@/types/visitor.types";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "./SearchBar";
import { EditVisitorModal } from "./EditVisitorModal";

export function VisitorTable() {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<VisitorRecord | null>(null);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = query
        ? `/api/visitors?search=${encodeURIComponent(query)}`
        : "/api/visitors";
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load visitors");
      setVisitors(json.visitors as VisitorRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search.
  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this visitor record? This cannot be undone.")) return;
    const res = await fetch(`/api/visitors/${id}`, { method: "DELETE" });
    if (res.ok) {
      setVisitors((prev) => prev.filter((v) => v.id !== id));
    } else {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? "Delete failed");
    }
  }

  function handleSaved(updated: VisitorRecord) {
    setVisitors((prev) =>
      prev.map((v) => (v.id === updated.id ? updated : v))
    );
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : visitors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No visitor records found.
                </td>
              </tr>
            ) : (
              visitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {v.fullName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{v.targetUnit}</td>
                  <td className="px-4 py-3 text-slate-600">{v.purpose}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {v.accessCode}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(v.expectedArrival).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => setEditing(v)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => handleDelete(v.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditVisitorModal
          visitor={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
