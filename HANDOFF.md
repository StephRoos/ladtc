# HANDOFF — LADTC Website

> AI-handoff document. Lets a fresh agent (or future Stéphane) resume work with zero prior context.
> Last updated: 2026-07-07. Complements (does not duplicate) `README.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `PRD.md`.

## 1. What this is

Production website for **LADTC**, a trail running club (~100 members) in Ellezelles, Belgium: **https://ladtc.be**.
Full-stack Next.js app: public site + blog + photo gallery, member accounts with annual membership dues (Stripe/Bancontact), equipment orders (jerseys etc.), events, committee document space, admin dashboard, and the public **UTC 4 race page** (`/utc`, race on 2026-10-24).

Real users: club members and the 8-person committee (all have COMMITTEE accounts in prod; ADMIN = stephaneroos@gmail.com). This is Stéphane's most "in production with real stakeholders" project — it doubles as a portfolio/case-study piece for Anthemion (see `Documents/case-study-metrics.md`) and shares the design system with HillsRun and RecettesApp.

## 2. Current state (2026-07-07)

- **Maturity: production.** Live, healthy (HTTP 200, ~200 ms), Stripe payments real (membership flow validated end-to-end on 2026-06-11 with a real Bancontact payment). 315 tests green across 16 suites (verified locally 2026-07-07).
- **Last real work**: 2026-06-22/23 — sponsor carousel (homepage + `/utc`); 2026-06-28 — infra fix (`2d571f1`, published port `127.0.0.1:3000` for direct Cloudflare Tunnel access after the homelab Traefik→tunnel-direct migration).
- **Working tree**: clean (only this `HANDOFF.md` is untracked), `master` up to date with `origin/master`. Local branch `feat/utc4-page` is fully merged into master (safe to delete).
- **Half-done / pending**:
  - Issue **#32** (open): final polish of the sponsor carousel (speed tuning, mobile responsive check, seamless loop, test with real sponsor data).
  - **UTC 4 page**: committee decisions of 2026-06-12 applied (venue "Salle CACS", two distinct courses 9/18 km, prices 15/25 €/binôme, règlement moved to a placeholder page `/utc/reglement`). Still waiting on externals: Ultratiming registration link, règlement content (photo), registration opening date (~early September 2026).
  - Unmerged remote branch `origin/feat/api-stats-endpoint` (1 commit: `/api/stats` endpoint) — decide to merge or drop.
- **Known bug (infra-level, fixed)**: the 2026-06-28 `ladtc.be` outage was a Cloudflare Tunnel → Caddy redirect loop during the homelab proxy migration; the fix is the loopback port publish in `docker-compose.coolify.yml`. See SecondBrain `Daily/2026-06-28.md`.

## 3. Architecture & stack

See `ARCHITECTURE.md` for full detail. Summary:

- Next.js 16 (App Router, standalone output) + TypeScript 5.7 + Tailwind CSS v4 + shadcn/ui, React 19
- PostgreSQL 15 (Docker) + Prisma 7 (client generated to `src/generated/prisma`, driver adapter `@prisma/adapter-pg`)
- BetterAuth 1.4 (email + roles MEMBER / COMMITTEE / ADMIN — COACH role was removed), route protection via `src/proxy.ts` (Next 16 proxy, not middleware)
- Stripe (memberships + equipment orders; currently on the personal Anthemion Stripe account — migration to a club-owned account planned, `Documents/stripe-migration-plan.md`)
- Resend (transactional email, OVH MX, SPF/DKIM/DMARC `p=quarantine`), Sentry v10 (org anthemion / project ladtc), TanStack Query 5

Key paths:

- `src/app/(public)/` — homepage, blog, gallery, events, equipment, team, contact, sponsors, `utc/` (UTC 4 page + `reglement/` placeholder)
- `src/app/(member)/`, `(admin)/`, `(auth)/`, `api/` — member area, admin dashboard, auth, API routes
- `src/config/site.ts` — **single source of truth for UTC 4 content** (date, venue, prices, IBAN, sponsor tiers, registration link). Update this file when the committee confirms items.
- `src/components/sponsors/` — the carousel from issue #32
- `prisma/schema.prisma` — 18 models (User, Membership, Order, Product/Stock, Sponsor, Event, BlogPost, Document, Gallery*, …); `prisma/seed.ts`; `scripts/seed-test-accounts.ts`
- `src/__tests__/` — 16 Vitest suites
- `public/uploads/` — user uploads (Docker volume in prod), served via `src/app/uploads/[...path]`
- `src/app/chrono/` + `public/chrono-backyard.html` — standalone backyard-ultra chronometer page (self-contained HTML, used for club events)

## 4. How to run

```bash
pnpm install                 # pnpm ONLY (10.33.2 pinned in package.json)
cp .env.example .env.local   # then fill values (DATABASE_URL must target port 5433 locally)
docker compose up -d         # dev Postgres from docker-compose.yml, exposed on host port 5433
pnpm exec prisma generate
pnpm exec prisma migrate dev # apply migrations to the local DB
pnpm dev                     # http://localhost:3000
pnpm test --run              # Vitest (16 suites, 315 tests; jsdom + mocks, no DB needed)
pnpm lint && pnpm tsc --noEmit && pnpm build
pnpm db:seed                 # seed data; pnpm seed:test for test accounts
```

Local Stripe webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook` (Stripe CLI; setup details in `Documents/guide-complet-ladtc.md` and `Documents/stripe-migration-plan.md`).

**Deploy**: push to `master` → GitHub webhook → **Coolify** on the UM880 Pro homelab (192.168.129.10) builds `docker-compose.coolify.yml` (multi-stage `Dockerfile`, migrations auto-applied by `docker-entrypoint.sh` on start). Ingress: **Cloudflare Tunnel → http://localhost:3000 directly** (host-published loopback port; Traefik labels in the compose file are legacy — `coolify-proxy` is intentionally stopped since June 2026). Env vars live in Coolify's UI.

## 5. Dependencies & credentials

Env var **names** (see `.env.example`, `.env.docker.example` — never read `.env*` values):
`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `ADMIN_EMAIL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `POSTGRES_USER/PASSWORD/DB`, legacy `NEXT_PUBLIC_WP_API_URL`.

External services: Cloudflare (DNS `ladtc.be` + tunnel `6b5cb58d…`), OVH (registrar + club mailbox `ladtc2021@gmail.com` for sponsoring contact; note: `anthemion.dev` OVH mailbox is tied to ladtc.be operations and its Infomaniak migration is pending — see Daily 2026-07-01), Stripe, Resend, Sentry, Uptime Kuma (`uptime.anthemion.dev`), Ultratiming (external race registration/chrono provider), GitHub `StephRoos/ladtc` (private).

## 6. Open work (ordered)

1. **Close issue #32** — sponsor carousel polish + test with real sponsor logos (small, unblocks the last open issue).
2. **UTC 4 completion as info arrives** (deadline-driven: race 2026-10-24, registrations ~Sept): add Ultratiming registration link + opening date in `src/config/site.ts`; fill `/utc/reglement` with the règlement (photo); confirm remaining "à confirmer" badges. See `docs/utc4-decisions-2026-06-12.md` for the decision log.
3. **Fix CI trigger mismatch**: `.github/workflows/ci.yml` triggers on `main`/`develop`, but the default branch is **`master`** — CI does not run on pushes to master. One-line fix.
4. **Stripe migration to a club account** (`Documents/stripe-migration-plan.md`) — blocked on committee providing club legal/bank info; code needs no change.
5. **Branch hygiene**: ~18 stale merged remote branches; decide on `origin/feat/api-stats-endpoint` (stats endpoint, likely meant for the Anthemion case study metrics).
6. Backlog ideas: HillsRun integration (club leaderboards — README "Planned"), Nextcloud media gallery (`Documents/nextcloud-galerie-medias.md`), Bioracer equipment supplier follow-up (`Documents/draft-reponse-matthieu-bioracer.md`).

## 7. Pitfalls & gotchas

- **Ingress is tunnel-direct, not Traefik.** Despite the Traefik labels in `docker-compose.coolify.yml`, prod traffic is Cloudflare Tunnel → `localhost:3000` (loopback host port). Don't "fix" routing by resurrecting `coolify-proxy` — that caused the 2026-06-28 redirect-loop outage pattern. Keep `ports: 127.0.0.1:3000:3000`.
- **Port 3000 on the UM880 belongs to ladtc**; HillsRun uses 3001. Don't collide.
- `NEXT_PUBLIC_APP_URL` must be a **build arg** (inlined into the client bundle), not just a runtime env — otherwise CSP blocks requests (documented in the compose file).
- Prisma client is generated to `src/generated/prisma` (not `node_modules`) — run `pnpm exec prisma generate` after schema changes and after fresh clone; `src/generated/` is committed noise in searches (exclude it).
- Next.js 16: route protection lives in `src/proxy.ts` (proxy replaces middleware). Auth cookie name differs dev vs prod (`__Secure-` prefix).
- `.vercel/` and `vercel.json` are **legacy** (pre-April 2026 Vercel era); prod has been Coolify-only since the 2026-04-21 cutover. Same for `NEXT_PUBLIC_WP_API_URL` (WordPress legacy).
- Real prod accounts exist (8 committee members + admin). Never seed/test against prod DB; demo protocol (alias emails, cleanup steps) is in `Documents/reunion-comite-2026-06-12.md`.
- pnpm is pinned (10.33.2) because an unpinned package manager broke a Docker build once (`fix(docker): pin pnpm`).
- `Documents/` is a French project-history archive (audits, committee meeting notes, guides) — read `Documents/audit-2026-05-15.md` and `Documents/guide-complet-ladtc.md` first for deep context; `docs/` holds the live UTC 4 decision docs.

## 8. Pointers

- Repo: `git@github.com:StephRoos/ladtc.git` (private, default branch `master`)
- Prod: https://ladtc.be · health: `/api/health` · UTC 4: https://ladtc.be/utc
- In-repo docs: `PRD.md`, `ARCHITECTURE.md`, `CLAUDE.md`, `PLAN-ECOSYSTEME.md` (LADTC/HillsRun/RecettesApp roadmap), `specs/01-mvp/`
- SecondBrain (source of truth for cross-project context — note: no `01-Projects/` folder exists currently; project notes live in-repo under `Documents/`):
  - `~/SecondBrain/Daily/2026-06-28.md` — ladtc.be outage root cause + tunnel-direct architecture
  - `~/SecondBrain/Daily/2026-06-29.md` — homelab proxy model (port publish + CF tunnel, Traefik retired)
  - `~/SecondBrain/Daily/2026-07-01.md` — pending OVH→Infomaniak mailbox migration touching ladtc.be mail
- **Server/ops access**: SSH to the UM880 via `ssh homelab` (alias for `steph@192.168.129.10`, key-based; alias lives in `~/.ssh/config`). Coolify runs there and holds the prod env vars — full server runbook in `~/Projects/homelab/HANDOFF.md`.
- Related projects: `~/Projects/hills-run` (main project, shared theme), `~/Projects/homelab` (Caddy/tunnel configs + server ops), RecettesApp (planned)
