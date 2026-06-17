# LADTC Website

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![License: Private](https://img.shields.io/badge/License-Private-red.svg)]()

Modern Next.js website for **LADTC**, a trail running club in Ellezelles, Belgium.

Full-stack application with integrated blog (Prisma + Markdown), member management, authentication, equipment orders, and event management. Self-hosted on a UM880 Pro homelab via Coolify.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL 15 + Prisma 7 ORM
- **Auth**: BetterAuth (email-based, role-based access control)
- **Blog**: Integrated (Prisma + Markdown, no external CMS)
- **Data Fetching**: TanStack Query (client) + Server Components
- **Email**: Resend (transactional) + OVH (MX)
- **Monitoring**: Sentry (errors) + Uptime Kuma (uptime)
- **Deployment**: Coolify (self-hosted Docker on UM880 Pro)
- **Package Manager**: pnpm (NEVER npm)

## Project Structure

```
src/
├── app/                   # Next.js App Router (pages and layouts)
├── components/            # React components
├── lib/                   # Utilities and API helpers
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
├── context/               # React context providers
├── config/                # Configuration files
└── styles/                # Global styles

specs/                     # Implementation task specifications
├── README.md
└── 01-mvp/               # MVP phase specs
    ├── 01-wordpress-integration.md
    ├── 02-static-pages.md
    ├── 03-auth-setup.md
    ├── 04-member-management.md
    ├── 05-equipment-orders.md
    └── 06-admin-dashboard.md

docs/                      # Documentation (future)
├── SCHEMA.md             # Database schema reference
├── SETUP.md              # Development setup guide
└── API.md                # API documentation
```

## Features

### Implemented

- [x] **Blog**: Integrated Prisma/Markdown blog with admin CRUD
- [x] **Authentication**: BetterAuth email registration/login, role-based access (MEMBER, COACH, COMMITTEE, ADMIN)
- [x] **Member Management**: Profiles, membership status, annual dues
- [x] **Equipment Orders**: Product catalog, shopping cart, checkout
- [x] **Events**: Event management with registrations
- [x] **Admin Dashboard**: Members, orders, events, blog, products, documents
- [x] **Photo Gallery**: Gallery with photo management
- [x] **Documents**: Internal document management (upload, notes, categories)
- [x] **Static Pages**: Homepage, team, contact
- [x] **Email**: Transactional emails via Resend (SPF/DKIM/DMARC configured)
- [x] **Monitoring**: Sentry error tracking (client + server)
- [x] **Stripe**: Payment integration for membership fees and equipment orders (issue #4)
- [x] **Video embeds**: YouTube, Vimeo, and Nextcloud video support in blog posts and gallery (issue #1)

### Planned

- [ ] HillsRun integration (club leaderboards, stats)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (see CLAUDE.md for conventions)
- PostgreSQL 15+ (for future database setup)

### Installation

```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Start development server
pnpm dev
```

Development server runs at [http://localhost:3000](http://localhost:3000).

### Environment Variables

See `.env.example` for required variables. Key vars:

- `NEXT_PUBLIC_APP_URL`: Base URL (https://ladtc.be in prod)
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Session encryption key
- `BETTER_AUTH_URL`: Auth callback URL
- `RESEND_API_KEY`: Transactional email service
- `ADMIN_EMAIL`: Admin notification recipient

## Development Workflow

1. **Choose a spec** from `specs/01-mvp/`
2. **Read the spec** carefully (acceptance criteria, technical details)
3. **Implement features** following code style in CLAUDE.md
4. **Run tests**: `pnpm test`
5. **Build to check for errors**: `pnpm build`
6. **Commit changes**: Use conventional format `feat:`, `fix:`, `docs:`, etc.

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run Vitest
pnpm test:watch   # Run Vitest in watch mode
```

## Code Style & Conventions

See **CLAUDE.md** for detailed conventions:

- **Language**: French for docs/conversation, English for code
- **Package Manager**: pnpm ONLY (never npm or yarn)
- **Type Safety**: TypeScript with explicit return types
- **Components**: Functional components only, no class components
- **Testing**: Run tests after every code change
- **Git**: Conventional commits (feat:, fix:, docs:, etc.)

## Documentation

- **PRD.md** — Product requirements and user personas
- **ARCHITECTURE.md** — System design, data models, API patterns
- **CLAUDE.md** — Project conventions, code style, development workflow
- **specs/** — Detailed implementation specifications for each feature

## Theme & Design

Shared theme with HillsRun and RecettesApp:

- **Dark mode** (default): Orange primary (#FF8C00), Cyan accent (#0891B2), Navy background (#0F1419)
- **Light mode**: Deep blue primary, white background
- **UI Components**: shadcn/ui + custom Tailwind classes
- **Fonts**: System fonts (no custom font files)

## Deployment

Self-hosted on **Coolify** (UM880 Pro homelab). Auto-deploys on push to master:

```bash
git push origin master  # Coolify webhook triggers build + deploy
```

Infrastructure:
- **Docker**: Multi-stage build (`docker-compose.coolify.yml`)
- **Reverse proxy**: Cloudflare Tunnel → Traefik → app container (zero open ports)
- **Database**: PostgreSQL 15 container (same host)
- **Migrations**: Auto-applied via `docker-entrypoint.sh` on container start
- **Uploads**: Docker volume at `/app/public/uploads`
- **DNS**: Cloudflare (ladtc.be zone), registrar OVH

Environment variables are set in Coolify project settings.

## Project Team

- **Project Lead**: Stéphane Roos
- **Committee**: LADTC leadership (manages members, orders, content)

## Support

- Review documentation first (PRD.md, ARCHITECTURE.md, CLAUDE.md)
- Check existing specs for detailed implementation guidance
- Refer to HillsRun or RecettesApp for shared pattern examples

## License

Private project for LADTC. All rights reserved.

---

**Last Updated**: 2026-04-21
