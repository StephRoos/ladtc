# LADTC Website — Project Conventions

## Project Overview

LADTC (Les Amis Du Trail des Collines) is a modern Next.js website for a Belgian trail running club. It consumes the existing WordPress REST API for editorial content (blog, events, photos) while maintaining a PostgreSQL database for member management, authentication, and equipment orders.

The project is part of an ecosystem with HillsRun and RecettesApp, sharing the same design system, theme, and technical conventions.

## Stack & Tools

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | 20+ |
| **Package Manager** | pnpm | Latest (NEVER npm) |
| **Frontend Framework** | Next.js | 16 (App Router) |
| **Language** | TypeScript | 5.7+ |
| **Styling** | Tailwind CSS | v4 |
| **UI Components** | shadcn/ui | Latest |
| **Themes** | next-themes | 1.1+ |
| **Data Fetching** | TanStack Query | 5.60+ |
| **Forms** | React Hook Form | 7.54+ |
| **Validation** | Zod | 3.24+ |
| **CMS** | WordPress REST API | (external) |
| **Database** | PostgreSQL | 15+ |
| **ORM** | Prisma | (not yet installed) |
| **Auth** | BetterAuth | (not yet installed) |
| **Tests** | Vitest | 3+ |

## Language Rules

- **Conversation**: French
- **Code**: English (variables, functions, comments)
- **Docstrings**: Google-style English on public functions
- **UI Text**: French (localization files, string constants)
- **Commits**: English, conventional format (feat:, fix:, docs:, test:, refactor:)
- **Documentation**: French headers, English code samples

## Directory Structure

```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/           # Auth routes (login, register)
│   ├── (public)/         # Public pages (layout shared)
│   ├── (member)/         # Member-only routes
│   ├── (admin)/          # Admin-only routes
│   ├── api/              # API routes
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/           # React components
│   ├── common/
│   ├── forms/
│   ├── cards/
│   ├── layout/
│   └── admin/
├── lib/                  # Utilities & helpers
│   ├── api.ts
│   ├── wordpress.ts
│   ├── auth.ts
│   ├── hooks.ts
│   └── utils.ts
├── hooks/               # Custom React hooks
├── types/              # TypeScript types
├── context/            # React context
├── styles/             # Global styles
└── config/             # Configuration files
```

## Code Style

### TypeScript

- Explicit return types on exported functions
- Type annotations on function parameters
- Use `function` keyword for named exports (not arrow functions)
- Use `const` for arrow functions in exports (hooks, components)
- No `any` type — use `unknown` and narrow
- Google-style JSDoc comments on public functions

Example:
```typescript
/**
 * Fetch blog posts from WordPress API
 * @param page - Page number
 * @param perPage - Items per page
 * @returns Blog posts with pagination info
 */
export async function fetchBlogPosts(
  page: number = 1,
  perPage: number = 10
): Promise<{ posts: BlogPost[]; total: number }> {
  // Implementation
}
```

### React Components

- Functional components only (no class components)
- `function` keyword for component exports
- Explicit `React.ReactNode` return types
- Props as interface/type
- Separate presentational from container components
- Use shadcn/ui for UI components

Example:
```typescript
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps): React.ReactNode {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

### CSS & Tailwind

- No inline styles — use Tailwind classes
- Extend theme colors in `tailwind.config.ts` (not in component styles)
- Use CSS custom properties for dynamic theming
- Reusable component classes defined in `globals.css` (@layer components)
- Color palette:
  - Dark mode (default): Orange primary (#FF8C00), Cyan accent (#0891B2)
  - Light mode: Deep blue primary, white background

### Files & Naming

- Components: PascalCase (`Card.tsx`, `BlogPost.tsx`)
- Utilities/functions: camelCase (`fetchBlogPosts.ts`, `useAuth.ts`)
- Types/interfaces: PascalCase (`User.ts`, `BlogPost.ts`)
- File extensions: `.ts` (utilities), `.tsx` (components)
- Constants: UPPER_SNAKE_CASE

## Testing

- Framework: Vitest (frontend), pytest (Python, future)
- Run tests: `pnpm test` or `pnpm test:watch`
- Test files: `__tests__/` directory or `*.test.ts(x)`
- Focus: Integration tests over unit tests
- Run tests after every code change

## Development Workflow

1. **Create feature branch**: `git checkout -b feat/feature-name`
2. **Make changes**: Follow code style rules
3. **Run tests**: `pnpm test` (all must pass)
4. **Run build**: `pnpm build` (no errors)
5. **Commit**: Use conventional format `feat: description`
6. **Push & PR**: Create PR with description of changes

## Database (PostgreSQL + Prisma)

**Note**: Not set up yet — documented for future use.

- Prisma ORM for type-safe queries
- Migrations: `prisma migrate dev`
- Schema file: `prisma/schema.prisma`
- Types auto-generated from schema
- Never commit `.env` or `.env.local`

## Authentication (BetterAuth)

**Note**: Not set up yet — documented for future use.

- Email-based registration and login
- Session stored in PostgreSQL
- Role-based access control (MEMBER, COACH, COMMITTEE, ADMIN)
- Password hashing handled by BetterAuth
- CSRF protection on forms

## WordPress Integration

- Base URL: `process.env.NEXT_PUBLIC_WP_API_URL` (default: `https://ladtc.be`)
- Endpoints: `/wp-json/wp/v2/posts`, `/wp-json/wp/v2/media`, etc.
- Caching: `revalidate: 3600` (1 hour server-side) + TanStack Query client-side
- Error handling: Graceful fallback UI on API failures

## TanStack Query Best Practices

- **No polling** — Use `staleTime` + manual `invalidateQueries` after mutations
- Default `staleTime`: 5 minutes
- Default `gcTime`: 10 minutes (formerly `cacheTime`)
- Use `useQuery` for reads, `useMutation` for writes
- Invalidate related queries after mutations:

```typescript
const mutation = useMutation({
  mutationFn: createOrder,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  },
});
```

## Environment Variables

See `.env.example` for required variables. Never commit `.env` or `.env.local`.

Template:
```
NEXT_PUBLIC_APP_URL=...
NEXT_PUBLIC_WP_API_URL=...
DATABASE_URL=...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=...
```

## Deployment

- **Hosting**: Vercel
- **Database**: PostgreSQL (Vercel or Supabase)
- **Auto-deploy**: On `git push` to main
- **Env vars**: Set in Vercel dashboard or via CLI

## Security

- NEVER read, modify, or create `.env` files in code
- NEVER commit secrets or tokens
- HTTPS only
- Input validation with Zod
- CSRF protection on forms
- API key as server-side header only
- SQL injection prevention via Prisma ORM

## Performance Targets

- LCP: < 2.5 seconds
- FID: < 100 ms
- CLS: < 0.1
- Image optimization via `next/image`
- CSS: Tailwind JIT (no unused classes in bundle)

## Monitoring

- Error tracking: Sentry (not yet configured)
- Analytics: Vercel Analytics (not yet configured)
- Web Vitals: Automatic via Next.js

## References

- **PRD.md** — Product requirements and features
- **ARCHITECTURE.md** — Technical architecture and data models
- **specs/** — Detailed implementation tasks
- **NEXT_PUBLIC_WP_API_URL** — WordPress API docs at `https://ladtc.be/wp-json/wp/v2`

## Known Constraints

- WordPress site remains at `ladtc.be` (source of truth for editorial)
- Committee members are trusted users (simple auth, no advanced permissions initially)
- No offline functionality
- French language for UI/docs, English for code

## Help & Questions

- Review ARCHITECTURE.md for system design
- Check specs/ for task details
- Consult HillsRun or RecettesApp CLAUDE.md for shared patterns
