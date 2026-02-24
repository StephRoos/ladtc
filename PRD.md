# Product Requirements Document — LADTC Website

## Overview

LADTC (Les Amis Du Trail des Collines) is a Belgian trail running club based in Ellezelles, "Pays des Collines" region. The club has ~70 members and currently operates through a WordPress site at ladtc.be. This project creates a modern Next.js frontend that consumes the existing WordPress REST API while adding custom features for member management and equipment orders.

The new website will be part of a larger ecosystem alongside HillsRun (Garmin dashboard) and RecettesApp (recipe management), sharing the same design system, theme, and technical stack.

## Goals

- Modernize the club website with a responsive, fast Next.js frontend
- Maintain WordPress as the CMS for editorial content (blog, events, photos)
- Add member management features not available in WordPress
- Enable online equipment orders and order tracking
- Provide admin tools for the committee to manage the club
- Establish a foundation for future integrations (HillsRun leaderboards, collective stats)
- Create a cohesive experience across the LADTC ecosystem

## User Personas

### 1. Club Member (Primary User)
- Typical user: Regular trail runner (25–65 years old)
- Goals:
  - View upcoming training schedule (mercredi + dimanche)
  - Register for races and camps
  - Update their profile and membership status
  - Order club gear and track orders
  - Read club blog and view photos
- Frequency: 2–3 visits per week

### 2. Committee Member / Coach (Secondary User)
- Typical user: Club organizer or coach
- Goals:
  - Manage member registrations and membership dues
  - Create and edit training schedules
  - Create race events and manage registrations
  - Handle equipment order management
  - Add club content (blog posts, galleries, announcements)
  - View club statistics
- Frequency: Daily

### 3. Visitor / Prospective Member (Tertiary User)
- Typical user: Someone discovering the club online
- Goals:
  - Learn about the club and its activities
  - View upcoming events
  - Read blog posts
  - Find contact information
  - Register as a new member
- Frequency: First-time visit, occasional returns

## Must-Have Features (MVP)

### 1. Homepage
- Hero section with club name, tagline, member count
- Quick access to upcoming events
- Latest blog posts (3–4 recent articles)
- Call-to-action buttons (register, join, contact)
- Featured sponsors
- Responsive design

### 2. Blog (WordPress Integration)
- Display articles from WordPress REST API
- List view with pagination
- Individual article pages
- Author and publication date
- Featured images
- Categories and tags
- Search functionality

### 3. Events Calendar
- Training schedule (regular weekly sessions: mercredi + dimanche)
- Race calendar (regional trail running events)
- Camp registrations
- Event details (date, time, location, difficulty, max participants)
- Member registration / sign-up
- Past events archive

### 4. Team Page
- Committee members (president, treasurer, secretary, event coordinators)
- Coaches (names, specialties, training focus)
- Photo and brief bio for each member
- Contact information for coordinators

### 5. Contact Page
- Contact form (name, email, subject, message)
- Email notifications to club address
- Club location map (Ellezelles, Belgium)
- Social media links
- Office hours (if applicable)

### 6. Member Management
- Member registration (email, password, personal info)
- Member profile pages (view own, edit own)
- Membership status (active, inactive, pending payment)
- Annual dues tracking (payment status, next renewal date)
- Member directory (visible to logged-in members only)
- Dashboard showing member stats to admin

### 7. Equipment Orders
- Product catalog with descriptions, images, sizes, prices
- Shopping cart
- Order form with shipping address
- Order confirmation and tracking
- Admin panel to manage products and view orders
- Order status notifications to member

### 8. Admin Area
- Member management (view all, edit, delete, manage dues)
- Order management (view all, update status, mark shipped)
- Event management (create, edit, delete events)
- Content management dashboard
- Committee role assignment
- Basic reporting (member count, revenue, orders)

### 9. Authentication & Authorization
- Email-based registration and login
- Role-based access control:
  - Visitor (no login)
  - Member (can view schedule, order gear, manage profile)
  - Committee (can manage members, orders, events, content)
  - Admin (full access)
- Session management
- Password reset functionality

## Should-Have Features (Post-MVP)

### 1. Photo Gallery
- Integration with WordPress media library
- Lightbox/modal view
- Albums and categories
- Member uploads (after approval)

### 2. HillsRun Integration
- Club leaderboards (members' recent activities)
- Collective club statistics (total km, elevation, activities)
- Links to individual member HillsRun profiles

### 3. Sponsors Section
- Sponsor logos and links
- Sponsor tiers (gold, silver, bronze)
- Partner discounts or special offers

### 4. Race Results Archive
- Historical race results
- Member rankings and achievements
- Filters by year, distance, location

### 5. Newsletter Integration
- Email signup (newsletter)
- Automated event notifications

### 6. Advanced Member Features
- Training plan downloads
- Community forum or discussion board
- Gear reviews and recommendations

## Non-Functional Requirements

### Performance
- Homepage load time < 2 seconds (LCP)
- Blog articles < 1 second
- All pages cached appropriately
- Image optimization
- API response caching (TanStack Query)

### Security
- HTTPS only
- Email verification for new members
- Password hashing (BetterAuth)
- CSRF protection
- SQL injection prevention (Prisma ORM)
- Rate limiting on forms (contact, registration)

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Alt text on all images

### Responsiveness
- Mobile-first design
- Tablet and desktop optimization
- Touch-friendly buttons (min 48px)

### Internationalization
- French language default
- Potential for English translation (future)

## Data Flow

### WordPress Integration
```
WordPress REST API (ladtc.be)
  ↓
Next.js server components / TanStack Query
  ↓
Cached in browser (staleTime + revalidation)
  ↓
Display in Next.js frontend
```

### Member & Order Data
```
User Registration/Login
  ↓
BetterAuth (email verification)
  ↓
PostgreSQL (via Prisma)
  ↓
Next.js API routes / server actions
  ↓
Display in frontend components
```

## Success Metrics

- Homepage load time < 2 seconds
- Member registration completion rate > 70%
- Average time on site > 3 minutes
- Equipment order conversion rate > 15% of members
- Committee satisfaction with admin tools (NPS > 8)
- Zero critical security issues
- 99% uptime

## Timeline & Phases

### Phase 1: MVP (Weeks 1–4)
- Static pages (home, team, contact)
- WordPress integration (blog, events)
- Member registration & profiles
- Equipment orders (basic)

### Phase 2: Polish & Deploy (Weeks 5–6)
- Admin dashboard improvements
- Testing and bug fixes
- Performance optimization
- Launch to production

### Phase 3: Post-MVP (Weeks 7+)
- Photo gallery
- HillsRun integration
- Race results archive
- Advanced features

## Technical Stack Summary

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **CMS**: WordPress REST API (existing)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: BetterAuth (email-based)
- **Data Fetching**: TanStack Query (client), Server Components (WP API)
- **Deployment**: Vercel
- **Design System**: Shared theme with HillsRun & RecettesApp

## Constraints & Assumptions

- WordPress site at ladtc.be remains active (API source of truth for editorial content)
- Committee members are trusted users (no advanced permission system needed initially)
- Members pay annual dues (tracking feature required)
- Club operates in French (UI/docs)
- Budget: Standard Vercel + Supabase/PostgreSQL costs
- No offline functionality required
