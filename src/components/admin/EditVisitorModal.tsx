"use client";

import { useState } from "react";
import { VisitorRecord, VisitorStatus } from "@/types/visitor.types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface EditVisitorModalProps {
  visitor: VisitorRecord;
  onClose: () => void;
  onSaved: (visitor: VisitorRecord) => void;
}

const STATUSES: VisitorStatus[] = ["PENDING", "TIMED_IN", "TIMED_OUT"];

export function EditVisitorModal({
  visitor,
  onClose,
  onSaved,
}: EditVisitorModalProps) {
  const [fullName, setFullName] = useState(visitor.fullName);
  const [email, setEmail] = useState(visitor.email);
  const [purpose, setPurpose] = useState(visitor.purpose);
  const [targetUnit, setTargetUnit] = useState(visitor.targetUnit);
  const [status, setStatus] = useState<VisitorStatus>(visitor.status);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/visitors/${visitor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, purpose, targetUnit, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      onSaved(json.visitor as VisitorRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Edit Visitor">
      <form onSubmit={handleSave} className="space-y-3">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}
        <div>
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="edit-purpose">Purpose</Label>
          <Input
            id="edit-purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="edit-unit">Target Unit</Label>
          <Input
            id="edit-unit"
            value={targetUnit}
            onChange={(e) => setTargetUnit(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="edit-status">Status</Label>
          <select
            id="edit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as VisitorStatus)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
