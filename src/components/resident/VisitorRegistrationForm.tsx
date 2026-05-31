"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { VisitorResult } from "@/types/visitor.types";

interface FormState {
  fullName: string;
  email: string;
  purpose: string;
  targetUnit: string;
  expectedArrival: string;
}

const EMPTY: FormState = {
  fullName: "",
  email: "",
  purpose: "",
  targetUnit: "",
  expectedArrival: "",
};

export function VisitorRegistrationForm({
  defaultUnit,
}: {
  defaultUnit?: string | null;
}) {
  const [form, setForm] = useState<FormState>({
    ...EMPTY,
    targetUnit: defaultUnit ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisitorResult | null>(null);

  function update(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setForm({ ...EMPTY, targetUnit: defaultUnit ?? "" });
    setFile(null);
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please attach the visitor's ID picture");
      return;
    }
    setLoading(true);

    try {
      // 1. Upload the ID picture.
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error ?? "Upload failed");

      // 2. Create the visitor record + QR code.
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          idPictureUrl: uploadJson.url,
          expectedArrival: new Date(form.expectedArrival).toISOString(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Registration failed");

      setResult(json as VisitorResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <QRCodeDisplay
        accessCode={result.accessCode}
        qrCodeDataUrl={result.qrCodeDataUrl}
        visitorName={result.visitor.fullName}
        onRegisterAnother={reset}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <div>
        <Label htmlFor="fullName">Visitor Name</Label>
        <Input
          id="fullName"
          required
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="idPicture">ID Picture</Label>
        <Input
          id="idPicture"
          type="file"
          accept="image/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <div>
        <Label htmlFor="email">Visitor Gmail</Label>
        <Input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="purpose">Purpose of Visit</Label>
        <Input
          id="purpose"
          required
          value={form.purpose}
          onChange={(e) => update("purpose", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="targetUnit">Target Unit / Room</Label>
        <Input
          id="targetUnit"
          required
          value={form.targetUnit}
          onChange={(e) => update("targetUnit", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="expectedArrival">Expected Date / Time of Arrival</Label>
        <Input
          id="expectedArrival"
          type="datetime-local"
          required
          value={form.expectedArrival}
          onChange={(e) => update("expectedArrival", e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Generating pass…" : "Generate Visitor Pass"}
      </Button>
    </form>
  );
}
