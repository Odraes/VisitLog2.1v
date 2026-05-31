// One-off backfill: copy each RESIDENT's unitNumber from the Profile table
// into their Supabase auth user_metadata, so getUserFromHeaders() (which reads
// metadata via middleware) returns the correct unit for accounts created before
// unitNumber was stored in metadata.
//
//   Dry run (default):  node scripts/backfill-unit-numbers.mjs
//   Apply changes:      APPLY=1 node scripts/backfill-unit-numbers.mjs
//
// updateUserById merges user_metadata shallowly, so fullName/role are preserved.

import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

// Load .env.local into process.env (without overriding already-set vars).
const envPath = path.resolve(process.cwd(), ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  let v = m[2].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  if (!(m[1] in process.env)) process.env[m[1]] = v;
}

const APPLY = process.env.APPLY === "1";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const prisma = new PrismaClient();
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(APPLY ? "=== APPLYING changes ===" : "=== DRY RUN (set APPLY=1 to apply) ===");

const residents = await prisma.profile.findMany({
  where: { role: "RESIDENT", NOT: { unitNumber: null } },
  select: { id: true, email: true, unitNumber: true },
});
console.log(`Found ${residents.length} resident(s) with a unit number in the DB.\n`);

let changed = 0;
let alreadyCorrect = 0;
let failed = 0;

for (const r of residents) {
  const { data, error: getErr } = await admin.auth.admin.getUserById(r.id);
  if (getErr || !data?.user) {
    console.warn(`  ! ${r.email}: auth user not found (${getErr?.message ?? "no user"})`);
    failed++;
    continue;
  }

  const current = data.user.user_metadata?.unitNumber ?? null;
  if (current === r.unitNumber) {
    alreadyCorrect++;
    continue;
  }

  if (!APPLY) {
    console.log(`  [dry] ${r.email}: ${JSON.stringify(current)} -> ${JSON.stringify(r.unitNumber)}`);
    changed++;
    continue;
  }

  const { error } = await admin.auth.admin.updateUserById(r.id, {
    user_metadata: { unitNumber: r.unitNumber },
  });
  if (error) {
    console.warn(`  ! ${r.email}: ${error.message}`);
    failed++;
  } else {
    console.log(`  ✓ ${r.email}: set unit ${r.unitNumber}`);
    changed++;
  }
}

console.log(
  `\n${APPLY ? "Updated" : "[DRY RUN] would update"}: ${changed} | already-correct: ${alreadyCorrect} | failed: ${failed}`
);

await prisma.$disconnect();
