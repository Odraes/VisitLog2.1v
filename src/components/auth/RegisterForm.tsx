"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Role } from "@/types/user.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const ROLE_OPTIONS: { value: Role; label: string; hint: string }[] = [
  { value: Role.RESIDENT, label: "Resident (Owner)", hint: "Register visitors" },
  { value: Role.GUARD, label: "Guard", hint: "Verify & log entries" },
  { value: Role.ADMIN, label: "Admin", hint: "Manage all records" },
];

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  RESIDENT: "/dashboard/resident",
  GUARD: "/dashboard/guard",
};

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.RESIDENT);
  const [unitNumber, setUnitNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        password,
        role,
        unitNumber: role === Role.RESIDENT ? unitNumber : undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }

    // Auto sign-in after successful registration.
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      router.replace("/auth/signin");
      return;
    }

    router.replace(ROLE_HOME[role]);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <Label>Role</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ROLE_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setRole(opt.value)}
              className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                role === opt.value
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400"
                  : "border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500"
              }`}
            >
              <span className="block font-semibold text-slate-900 dark:text-white">
                {opt.label}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{opt.hint}</span>
            </button>
          ))}
        </div>
      </div>
      {role === Role.RESIDENT && (
        <div>
          <Label htmlFor="unitNumber">Unit / Room Number</Label>
          <Input
            id="unitNumber"
            required
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
          />
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating account…" : "Register"}
      </Button>
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-medium text-indigo-600 dark:text-indigo-400">
          Sign in
        </Link>
      </p>
    </form>
  );
}
