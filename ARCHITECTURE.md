# Technical Architecture — LADTC Website

## High-Level Overview

The LADTC website is a modern Next.js fullstack application with an integrated Prisma/PostgreSQL blog, member management, authentication, and equipment orders. All data lives in a single Neon PostgreSQL database.

The architecture follows the design patterns and conventions established in HillsRun and RecettesApp, ensuring consistency across the ecosystem.

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│        (Next.js Components, TypeScript, Tailwind CSS)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App Router                            │
│  (API Routes, Server Components, Client Components)             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              ┌──────────────────────────────┐
              │   Neon PostgreSQL (cloud)     │
              │   Blog, Members, Orders,     │
              │   Auth, Products             │
              └──────────────────────────────┘
                              ↓
              ┌──────────────────────────────┐
              │   Prisma ORM (type-safe)     │
              │   + TanStack Query (cache)   │
              └──────────────────────────────┘
```

## Technology Stack

### Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Server & client-side rendering |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **UI Components** | shadcn/ui | Accessible, customizable components |
| **Themes** | next-themes | Light/dark mode with persistence |
| **Data Fetching** | TanStack Query (React Query) | Client-side data fetching, caching, synchronization |
| **Forms** | React Hook Form | Efficient form state management |
| **Validation** | Zod | Runtime schema validation |

### Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **API** | Next.js API Routes | REST endpoints for auth, members, orders |
| **Database** | PostgreSQL 15+ | Primary data store (members, orders, etc.) |
| **ORM** | Prisma | Type-safe database queries and migrations |
| **Authentication** | BetterAuth | Email-based auth, sessions, roles |
| **Blog** | Integrated (Prisma + marked) | Markdown blog posts managed via admin |
| **Email** | Resend | Transactional emails (welcome, orders, reminders) |

### DevOps & Deployment

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Hosting** | Vercel | Edge deployment, serverless functions |
| **Database Hosting** | Neon PostgreSQL | Managed serverless PostgreSQL |
| **Environment** | Node.js 20+ | Runtime environment |
| **Package Manager** | pnpm | Fast, efficient dependency management |
| **Version Control** | Git + GitHub | Code repository |

## Directory Structure

```
ladtc/
├── public/                      # Static assets (images, fonts, favicons)
│   └── images/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Auth pages (login, register, reset password)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── (public)/            # Public pages (layout shared)
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx     # Blog list
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx # Article detail
│   │   │   ├── events/
│   │   │   │   ├── page.tsx     # Events calendar
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Event detail
│   │   │   ├── team/
│   │   │   │   └── page.tsx     # Team page
│   │   │   ├── contact/
│   │   │   │   └── page.tsx     # Contact page
│   │   │   └── gallery/         # Photo gallery (future)
│   │   │       └── page.tsx
│   │   ├── (member)/            # Protected member routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     # Member dashboard
│   │   │   ├── profile/
│   │   │   │   └── page.tsx     # Edit profile
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx     # My orders
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Order detail
│   │   │   └── equipment/
│   │   │       ├── page.tsx     # Equipment catalog
│   │   │       └── [id]/
│   │   │           └── page.tsx # Product detail
│   │   ├── (admin)/             # Protected admin routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     # Admin dashboard
│   │   │   ├── members/
│   │   │   │   ├── page.tsx     # Member management
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Edit member
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx     # Order management
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Order detail
│   │   │   ├── events/
│   │   │   │   ├── page.tsx     # Event management
│   │   │   │   └── new/
│   │   │   │       └── page.tsx # Create event
│   │   │   └── products/
│   │   │       ├── page.tsx     # Product management
│   │   │       └── new/
│   │   │           └── page.tsx # Create product
│   │   ├── api/                 # API routes
│   │   │   ├── auth/
│   │   │   │   ├── [...routes].ts  # BetterAuth endpoints
│   │   │   │   └── register/
│   │   │   ├── members/
│   │   │   │   ├── route.ts     # List/create members
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # Get/update/delete member
│   │   │   ├── orders/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── products/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── events/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── blog/             # Public blog API
│   │   │   │   ├── posts/
│   │   │   │   │   └── route.ts
│   │   │   │   └── posts/[slug]/
│   │   │   │       └── route.ts
│   │   │   └── admin/            # Admin API (blog, etc.)
│   │   │       └── blog/posts/
│   │   │           ├── route.ts
│   │   │           └── [id]/route.ts
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles (theme, tailwind config)
│   │   └── error.tsx            # Error boundary
│   ├── components/
│   │   ├── common/              # Reusable components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   └── OrderForm.tsx
│   │   ├── cards/
│   │   │   ├── BlogCard.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── MemberCard.tsx
│   │   │   └── OrderCard.tsx
│   │   ├── layout/
│   │   │   ├── PublicLayout.tsx
│   │   │   ├── MemberLayout.tsx
│   │   │   └── AdminLayout.tsx
│   │   ├── admin/               # Admin-specific components
│   │   │   ├── MemberTable.tsx
│   │   │   ├── OrderTable.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── ProductForm.tsx
│   │   └── Theme.tsx            # Theme provider/switcher
│   ├── lib/
│   │   ├── api.ts               # API client helpers
│   │   ├── auth.ts              # BetterAuth server config
│   │   ├── auth-client.ts       # BetterAuth client
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── email.ts             # Resend email helpers
│   │   ├── email-templates.ts   # HTML email templates
│   │   ├── schemas.ts           # Zod validation schemas
│   │   └── utils.ts             # Utility functions
│   ├── hooks/
│   │   ├── useAuth.ts           # Auth context hook
│   │   ├── useUser.ts           # User context hook
│   │   └── useSession.ts        # Session management
│   ├── types/
│   │   ├── index.ts             # TypeScript types
│   │   ├── blog.ts              # Blog post types
│   │   ├── member.ts            # Member types
│   │   └── order.ts             # Order types
│   ├── context/
│   │   ├── AuthContext.tsx      # Auth provider
│   │   └── ThemeContext.tsx     # Theme provider
│   ├── styles/
│   │   ├── globals.css          # Global styles + theme
│   │   ├── variables.css        # CSS custom properties
│   │   └── animations.css       # Animations
│   └── config/
│       ├── site.ts              # Site metadata
│       └── team.ts              # Team members data
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
├── specs/                       # Implementation specs
│   ├── README.md
│   └── 01-mvp/
│       ├── 01-blog-integration.md
│       ├── 02-static-pages.md
│       ├── 03-auth-setup.md
│       ├── 04-member-management.md
│       ├── 05-equipment-orders.md
│       └── 06-admin-dashboard.md
├── .env.example                 # Environment variables template
├── .eslintrc.json               # ESLint config
├── .gitignore                   # Git ignore rules
├── next.config.ts               # Next.js config
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind CSS config
├── package.json                 # Dependencies
├── pnpm-lock.yaml              # Lock file
├── PRD.md                       # Product requirements
├── ARCHITECTURE.md              # This file
├── CLAUDE.md                    # Project conventions
└── README.md                    # Project overview
```

## Data Models (Prisma Schema)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String    (hashed by BetterAuth)
  role          UserRole  @default(MEMBER)
  membership    Membership?
  orders        Order[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  MEMBER
  COACH
  COMMITTEE
  ADMIN
}

model Membership {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  status        MembershipStatus
  joinedAt      DateTime  @default(now())
  renewalDate   DateTime  // Next annual dues date
  paidAt        DateTime?
}

enum MembershipStatus {
  PENDING
  ACTIVE
  INACTIVE
  EXPIRED
}

model Product {
  id            String    @id @default(cuid())
  name          String
  description   String?
  price         Float
  image         String?
  sizes         String[]  // JSON array (S, M, L, XL, etc.)
  stock         Int
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  orderItems    OrderItem[]
}

model Order {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  items         OrderItem[]
  status        OrderStatus @default(PENDING)
  total         Float
  shippingAddress String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id            String    @id @default(cuid())
  orderId       String
  order         Order     @relation(fields: [orderId], references: [id])
  productId     String
  product       Product   @relation(fields: [productId], references: [id])
  quantity      Int
  size          String?
  price         Float     // Price at time of order
}

model Event {
  id            String    @id @default(cuid())
  title         String
  description   String?
  date          DateTime
  location      String
  type          EventType // training, race, camp
  difficulty    String?   // easy, medium, hard
  maxParticipants Int?
  registrations EventRegistration[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum EventType {
  TRAINING
  RACE
  CAMP
  SOCIAL
}

model EventRegistration {
  id            String    @id @default(cuid())
  userId        String
  eventId       String
  event         Event     @relation(fields: [eventId], references: [id])
  status        RegistrationStatus
  createdAt     DateTime  @default(now())

  @@unique([userId, eventId])
}

enum RegistrationStatus {
  REGISTERED
  ATTENDED
  CANCELLED
}
```

## Blog (Integrated Prisma)

### Strategy

- Blog posts are stored in PostgreSQL via the BlogPost Prisma model
- Content is written in Markdown and rendered to HTML with `marked`
- Admin CRUD at `/admin/blog` (create, edit, publish, delete)
- Public pages at `/blog` (list) and `/blog/[slug]` (detail)
- No external CMS dependency — all content managed via the admin panel

### BlogPost Model

```prisma
model BlogPost {
  id               String    @id @default(cuid())
  title            String
  slug             String    @unique
  content          String    // Markdown
  excerpt          String?
  featuredImageUrl  String?
  authorId         String
  author           User      @relation(fields: [authorId], references: [id])
  category         String?
  tags             String[]
  published        Boolean   @default(false)
  publishedAt      DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

## Authentication & Authorization

### BetterAuth Setup

- Email-based registration and login
- Password hashing and verification
- Session tokens stored in HTTP-only cookies
- CSRF protection

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Visitor** | View homepage, blog, events, team, contact |
| **Member** | View all member features + dashboard, profile, orders, equipment catalog |
| **Coach** | All member permissions + manage events, view team stats |
| **Committee** | All member + Coach + manage members, orders, products |
| **Admin** | Full access to all features and data |

### Session Management

- Session stored in database (BetterAuth default)
- Cookie-based sessions with 30-day expiry
- Server-side session validation on protected routes
- Automatic logout on session expiry

## API Design

### REST Endpoints

**Members**
- `POST /api/members` — Register new member
- `GET /api/members` — List members (admin only)
- `GET /api/members/{id}` — Get member profile
- `PATCH /api/members/{id}` — Update profile
- `DELETE /api/members/{id}` — Delete member (admin)

**Orders**
- `GET /api/orders` — List user's orders
- `POST /api/orders` — Create new order
- `GET /api/orders/{id}` — Get order details
- `PATCH /api/orders/{id}` — Update order status (admin)

**Products**
- `GET /api/products` — List products
- `GET /api/products/{id}` — Get product details
- `POST /api/products` — Create product (admin)
- `PATCH /api/products/{id}` — Update product (admin)
- `DELETE /api/products/{id}` — Delete product (admin)

**Events**
- `GET /api/events` — List events
- `GET /api/events/{id}` — Get event details
- `POST /api/events` — Create event (committee)
- `PATCH /api/events/{id}` — Update event (committee)
- `POST /api/events/{id}/register` — Register for event
- `DELETE /api/events/{id}/register` — Unregister from event

**Blog (Public)**
- `GET /api/blog/posts` — List published blog posts (paginated)
- `GET /api/blog/posts/{slug}` — Get single published blog post

**Blog (Admin)**
- `GET /api/admin/blog/posts` — List all blog posts (including drafts)
- `POST /api/admin/blog/posts` — Create blog post
- `PATCH /api/admin/blog/posts/{id}` — Update blog post
- `DELETE /api/admin/blog/posts/{id}` — Delete blog post

## State Management

### Frontend

- **Server State**: TanStack Query (React Query)
  - Manages API responses, caching, sync, refetching
  - Automatic background refetching
  - Optimistic updates for mutations

- **UI State**: React State (useState, useReducer)
  - Form inputs, modals, dropdowns
  - Local component state

- **Auth State**: BetterAuth sessions + React Context
  - User info, roles, authentication status
  - Custom hooks: `useAuth()`, `useUser()`, `useSession()`

### No polling — use `staleTime` + manual invalidation after mutations

```typescript
// Example: Refetch after creating an order
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: createOrder,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  }
});
```

## Caching Strategy

### Server-side (Next.js)
- ISR (Incremental Static Regeneration) for blog posts
- Revalidate tag-based caching for API routes
- `revalidatePath()` and `revalidateTag()` after mutations

### Client-side (TanStack Query)
- Default `staleTime: 5 minutes` for most queries
- `gcTime: 10 minutes` (formerly `cacheTime`)
- Manual invalidation after mutations
- Network-only refetch on error

### Blog
- Server-side rendering for SEO (generateMetadata)
- `staleTime: 5 minutes` on client for blog list

## Error Handling

1. **Network Errors**: Retry with exponential backoff (TanStack Query)
2. **Validation Errors**: Display form field errors (React Hook Form + Zod)
3. **Authorization Errors**: Redirect to login
4. **Server Errors**: Display user-friendly message + log to Sentry
5. **API Errors**: Graceful degradation with fallback UI

## Performance Optimization

- **Code Splitting**: Route-based automatic splitting
- **Image Optimization**: `next/image` with WebP, lazy loading
- **CSS**: Tailwind CSS v4 with JIT compilation
- **Fonts**: System fonts (no custom font files)
- **Caching**: Aggressive caching for static assets (1 year)
- **Compression**: Gzip + Brotli
- **Analytics**: Web Vitals (CLS, FID, LCP)

### Target Metrics
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## Security Measures

1. **Authentication**: BetterAuth with email verification
2. **Authorization**: Role-based access control
3. **Data Protection**:
   - HTTPS only
   - SQL injection prevention (Prisma ORM)
   - CSRF tokens on forms
   - Secure cookies (HttpOnly, Secure, SameSite)
4. **Input Validation**: Zod schema validation
5. **Rate Limiting**: Next.js middleware for API routes
6. **Secrets**: Environment variables (.env.local, never committed)
7. **CORS**: Restricted to trusted domains
8. **Logging**: Server-side logging for security events

## Deployment (Vercel)

### Environment Setup

```
NEXT_PUBLIC_APP_URL=https://ladtc.be
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://ladtc.be
RESEND_API_KEY=re_xxx
ADMIN_EMAIL=admin@ladtc.be
```

### CI/CD Pipeline

1. **Push to main**: Automated tests, build, deploy to preview
2. **Merge to main**: Automated tests, build, deploy to production
3. **Monitoring**: Sentry for error tracking, Vercel Analytics

### Database Migrations

- Prisma CLI for migrations
- Managed through version control
- Automatic on deployment (CI/CD step)

## Monitoring & Observability

- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics, Vercel Web Vitals
- **Logs**: Vercel logs, structured server-side logging
- **Uptime**: Vercel uptime monitoring
- **Database**: Neon PostgreSQL dashboard monitoring

## Future Considerations

1. **HillsRun Integration**: API endpoints for leaderboards and collective stats
2. **Mobile App**: React Native sharing core types and hooks
3. **Advanced Admin Features**: Bulk imports, advanced reporting
4. **Email Notifications**: Transactional emails (events, orders, etc.)
5. **Search**: Full-text search for blog posts and events
6. **Internationalization**: i18n setup for French/English
7. **Comments**: Comments on blog posts or member forum
