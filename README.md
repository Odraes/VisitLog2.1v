# VisitVault — Visitor Log System

A role-based visitor management app for residential/commercial buildings.
Residents register visitors and generate QR access passes, guards verify and
log entries/exits, and admins manage all records.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase ·
Prisma**, with an OOP service layer (encapsulated entities, an abstract `User`
hierarchy, repository + factory patterns).

## Architecture

The backend/service layer follows strict OOP:

- **Encapsulation** — `User` / `Visitor` entities expose private fields via getters (`src/lib/domain/entities/`).
- **Inheritance & polymorphism** — abstract `User` → `AdminUser`, `ResidentUser`, `GuardUser`, each implementing role-specific `getPermissions()`, `getDashboardPath()`, `canPerform()`.
- **Interfaces** — `IUserRepository`, `IVisitorRepository`, `IAuthService`, `IVisitorService` (`src/lib/domain/interfaces/`).
- **Repository pattern** — `UserRepository`, `VisitorRepository` wrap Prisma (`src/lib/domain/repositories/`).
- **Factory pattern** — `UserFactory.create(profile)` and `DashboardFactory.create(user)` (`src/lib/domain/factories/`).

Composition root: `src/lib/container.ts`. Route protection: `src/middleware.ts`.

## Setup

### 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. **Authentication → Providers** → enable **Email** (disable "Confirm email"
   for the quickest start, since registration uses the admin API to
   auto-confirm).
3. **Storage** → create a **public** bucket named `id-pictures`.
4. Add a Storage policy on the bucket allowing authenticated users to upload
   and read objects.

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — Settings → API (server-only secret)
- `DATABASE_URL` — Settings → Database → pooled connection (port 6543, `?pgbouncer=true`)
- `DIRECT_URL` — Settings → Database → direct connection (port 5432)

### 3. Initialize the database

```bash
npx prisma migrate dev --name init   # creates the profiles & visitors tables
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage flow

1. **Register** at `/auth/register` choosing a role (Resident / Guard / Admin).
2. **Resident** registers a visitor (with ID photo) → receives a QR code + access code.
3. **Guard** scans the QR or enters the code → views visitor info → logs Time In / Time Out.
4. **Admin** searches, edits, and deletes any visitor record.

## Deploy on Vercel

Push to GitHub, import the repo in Vercel, and set the same environment
variables in the Vercel project settings. The `postinstall` script runs
`prisma generate` automatically during the build.
