# LADTC Website

Modern Next.js website for LADTC (Les Amis Du Trail des Collines), a trail running club in Ellezelles, Belgium.

The website consumes the existing WordPress REST API for editorial content (blog, events, photos) while providing custom features for member management and equipment orders.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- **CMS**: WordPress REST API (existing site at ladtc.be)
- **Database**: PostgreSQL + Prisma ORM (not yet configured)
- **Auth**: BetterAuth (email-based, not yet installed)
- **Data Fetching**: TanStack Query (client) + Server Components (WordPress)
- **Deployment**: Vercel
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

## Features (MVP Phase)

### Must-Have (Weeks 1–4)

- [x] **Documentation**: PRD, Architecture, Project conventions
- [ ] **WordPress Integration**: Fetch blog posts and events from WP API
- [ ] **Static Pages**: Homepage, team, contact
- [ ] **Authentication**: BetterAuth email registration and login
- [ ] **Member Management**: Profiles, membership status, annual dues
- [ ] **Equipment Orders**: Product catalog, shopping cart, checkout
- [ ] **Admin Dashboard**: Committee tools for managing members, orders, content

### Should-Have (Post-MVP)

- Photo gallery (from WordPress media)
- HillsRun integration (club leaderboards, stats)
- Sponsors section
- Race results archive
- Newsletter integration
- Advanced admin features (reports, bulk actions)

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

- `NEXT_PUBLIC_APP_URL`: Base URL of the application
- `NEXT_PUBLIC_WP_API_URL`: WordPress API URL (default: https://ladtc.be)
- `DATABASE_URL`: PostgreSQL connection string (future)
- `BETTER_AUTH_SECRET`: BetterAuth session encryption key (future)
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`: Email service (future)

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

The website is deployed on **Vercel**:

```bash
# Vercel auto-deploys on git push to main
git push origin main
```

Environment variables are set in the Vercel dashboard (see `.env.example`).

## Project Team

- **Project Lead**: Stéphane Roos
- **Committee**: LADTC leadership (manages members, orders, content)

## Support

- Review documentation first (PRD.md, ARCHITECTURE.md, CLAUDE.md)
- Check existing specs for detailed implementation guidance
- Refer to HillsRun or RecettesApp for shared pattern examples

## License

Private project for LADTC. All rights reserved.

## Next Steps

1. Set up PostgreSQL database (future spec)
2. Install Prisma ORM (future spec)
3. Install BetterAuth (future spec)
4. Implement Spec 01: WordPress Integration
5. Implement Spec 02: Static Pages
6. Continue with remaining MVP specs

---

**Last Updated**: 2026-02-24
