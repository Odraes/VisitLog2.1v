# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Next.js dev server (http://localhost:3000)
npm run build        # production build
npm run lint         # ESLint via next lint

npx prisma migrate dev --name <name>   # create + apply a migration
npx prisma migrate deploy              # apply migrations (production)
npx prisma studio                      # browse the database visually
npx prisma generate                    # regenerate the Prisma client after schema changes
```

No test suite exists yet.

## Environment

Copy `.env.example` to `.env.local`. Required variables:

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (server-only) |
| `DATABASE_URL` | Pooled connection, port 6543, `?pgbouncer=true` |
| `DIRECT_URL` | Direct connection, port 5432 (used by migrations) |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | `id-pictures` (public bucket) |

## Architecture

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Supabase Auth + Storage · Prisma (PostgreSQL)

### Domain layer (`src/lib/domain/`)

Strict OOP service layer sitting between route handlers and the database:

- **Entities** (`entities/`) — `User` is an abstract base class with private fields and getters. `AdminUser`, `ResidentUser`, `GuardUser` extend it and implement `getPermissions()`, `getDashboardPath()`, `canPerform(action)`.
- **Interfaces** (`interfaces/`) — `IUserRepository`, `IVisitorRepository`, `IAuthService`, `IVisitorService` decouple services from concrete implementations.
- **Repositories** (`repositories/`) — `UserRepository` and `VisitorRepository` are the only places that touch Prisma.
- **Services** (`services/`) — `AuthService` wraps Supabase auth + `UserRepository`; `VisitorService` wraps `VisitorRepository` and business logic (access code generation, status transitions).
- **Factories** (`factories/`) — `UserFactory.create(profile)` returns the correct `User` subclass; `DashboardFactory.create(user)` returns role-specific dashboard data.
- **Composition root** — `src/lib/container.ts` wires concrete repositories into services. Route handlers call `buildVisitorService()` or `buildAuthService(supabase)` rather than constructing the graph directly.

### Auth & session

Supabase handles authentication. Role is stored in `user.user_metadata.role` (set at registration via the admin API so it is auto-confirmed). The Prisma `Profile` table mirrors `auth.users` and holds `fullName`, `role`, `unitNumber`.

- `src/middleware.ts` — edge-compatible; refreshes the session cookie on every request and enforces role-based routing for `/dashboard/*` and `/api/*`.
- `src/lib/auth/session.ts` — `getCurrentUserOrRedirect(requiredRole?)` is used at the top of server page components to guard each dashboard page.
- `src/lib/supabase/server.ts` / `client.ts` — SSR-aware Supabase client helpers.

### Data model (Prisma)

Two models: `Profile` (mirrors Supabase user, has `Role` enum: `ADMIN | RESIDENT | GUARD`) and `Visitor` (has `VisitorStatus` enum: `PENDING | TIMED_IN | TIMED_OUT`, stores `accessCode`, `idPictureUrl`, time-in/time-out timestamps).

### API routes (`src/app/api/`)

| Route | Purpose |
|---|---|
| `POST /api/auth/register` | Create Supabase user + Prisma profile |
| `GET /api/auth/session` | Return current user profile |
| `GET/POST /api/visitors` | List (resident: own; admin: all) / create visitor |
| `GET/PUT/DELETE /api/visitors/[id]` | Single visitor CRUD |
| `POST /api/visitors/[id]/timein` | Guard logs time-in |
| `POST /api/visitors/[id]/timeout` | Guard logs time-out |
| `GET /api/visitors/lookup` | Guard lookup by access code or QR scan |
| `POST /api/upload` | Upload visitor ID photo to Supabase Storage |

### Frontend structure

- `src/app/` — Next.js App Router pages (`/auth/signin`, `/auth/register`, `/dashboard/admin`, `/dashboard/resident`, `/dashboard/guard`).
- `src/components/` — role-scoped component folders (`admin/`, `guard/`, `resident/`) plus `auth/`, `layout/`, and `ui/` (primitive components: `Button`, `Input`, `Label`, `Modal`, `Badge`).
- `src/lib/api/guard.ts` — client-side fetch helpers used by guard components.
- `src/lib/utils/` — `codeGenerator.ts` (access code), `qrGenerator.ts` (QR data URL via `qrcode`), `validators.ts` (Zod schemas).
