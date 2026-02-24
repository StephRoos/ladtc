# Spec 02: Static Pages — Home, Team, Contact

**Phase**: MVP
**Priority**: 2
**Estimated Time**: 12 hours

## Feature

Create essential static pages: homepage with club overview and latest content, team page showcasing committee and coaches, and contact page with form and location.

## Goals

- Homepage attracts visitors and highlights club value proposition
- Team page builds trust and showcases leadership
- Contact page enables communication and newsletter signup
- All pages are SEO-friendly with proper metadata
- Responsive design optimized for mobile

## User Stories

1. **As a visitor**, I want to see who LADTC is, what they do, and when they meet so I can decide to join.
2. **As a member**, I want to find contact info for committee members so I can reach out with questions.
3. **As a visitor**, I want to send a message to the club with my interest in joining.
4. **As an admin**, I want to manage team member info from the admin dashboard.
5. **As a visitor**, I want to see upcoming training and race events prominently on the homepage.

## Acceptance Criteria

### Homepage
- [ ] Hero section with club name, tagline, and call-to-action buttons
- [ ] Quick stats: member count, training schedule, club founded year
- [ ] Upcoming events section (next 3 events from WordPress)
- [ ] Latest blog posts section (3 most recent from WordPress)
- [ ] "Join us" and "Get in touch" CTAs
- [ ] Club location map (embedded Google Maps)
- [ ] Featured sponsors section (if available)
- [ ] Mobile responsive (tested on mobile, tablet, desktop)
- [ ] Page loads in < 2.5 seconds (LCP)

### Team Page
- [ ] Committee members list (president, treasurer, secretary, event coordinators)
- [ ] Coaches list (names, specialties)
- [ ] Photo (or avatar placeholder) for each person
- [ ] Brief bio for each member
- [ ] Contact info (email or phone for key roles)
- [ ] Responsive grid layout (3 columns on desktop, 1 on mobile)

### Contact Page
- [ ] Contact form with fields: name, email, subject, message
- [ ] Form validation (email format, required fields)
- [ ] Success/error messages after submission
- [ ] Contact info sidebar: email, phone, address, office hours
- [ ] Google Maps embed showing club location
- [ ] Newsletter signup option
- [ ] Rate limiting on form (max 5 submissions per IP per hour)

### SEO & Metadata
- [ ] Proper `<title>` and meta description on all pages
- [ ] Open Graph tags for social sharing
- [ ] Canonical URLs
- [ ] Structured data (schema.org) for organization

## Technical Details

### Homepage Structure

```
Home Page (/):
  ├── Hero
  │   ├── Headline ("Welcome to LADTC")
  │   ├── Tagline
  │   ├── CTA buttons (Join, Learn more)
  │   └── Background image
  ├── Stats Section
  │   ├── Member count
  │   ├── Training days
  │   └── Years active
  ├── Events Section
  │   └── Next 3 events from WordPress
  ├── Blog Section
  │   └── Latest 3 posts from WordPress
  ├── About Section
  │   └── Club story, mission, values
  ├── Sponsors Section
  │   └── Partner logos
  └── CTA Section ("Ready to join?")
```

### Team Page Structure

```
Team Page (/team):
  ├── Intro text ("Meet the team")
  ├── Committee Section
  │   └── Grid of team members (president, treasurer, secretary, etc.)
  └── Coaches Section
      └── Grid of coaches
```

Each member card:
- Photo (with fallback avatar)
- Name
- Role
- Bio (short, 2–3 sentences)
- Contact email (optional, for key roles)

### Contact Page Structure

```
Contact Page (/contact):
  ├── Intro text ("Get in touch")
  ├── Two-column layout:
  │   ├── Left: Contact form
  │   │   ├── Name input
  │   │   ├── Email input
  │   │   ├── Subject dropdown
  │   │   ├── Message textarea
  │   │   ├── Newsletter checkbox
  │   │   └── Submit button
  │   └── Right: Contact info + map
  │       ├── Email
  │       ├── Phone
  │       ├── Address
  │       ├── Office hours
  │       └── Google Maps embed
```

### Contact Form Submission

Flow:
1. User fills form and clicks submit
2. Form validation (client-side with Zod)
3. Submit to `/api/contact` endpoint
4. Endpoint validates again (server-side)
5. Send email to admin
6. Return success message
7. (Optional) Add contact to mailing list

### Implementation Files

1. **`src/app/(public)/layout.tsx`** — Shared layout for public pages (header, footer, nav)
2. **`src/components/common/Header.tsx`** — Navigation header
3. **`src/components/common/Footer.tsx`** — Footer with links and info
4. **`src/components/Hero.tsx`** — Hero section component
5. **`src/app/(public)/page.tsx`** — Homepage (update existing)
6. **`src/app/(public)/team/page.tsx`** (new) — Team page
7. **`src/app/(public)/contact/page.tsx`** (new) — Contact page
8. **`src/components/forms/ContactForm.tsx`** (new) — Contact form
9. **`src/app/api/contact/route.ts`** (new) — Contact form submission endpoint
10. **`src/config/team.ts`** (new) — Team member data
11. **Tests**: `__tests__/pages.test.tsx`, `__tests__/ContactForm.test.tsx`

## Database Schema

No database needed — all data is hardcoded in config files or from WordPress.

### Team Members Config (`src/config/team.ts`)

```typescript
export interface TeamMember {
  id: string;
  name: string;
  role: string; // "President", "Treasurer", "Coach", etc.
  bio: string;
  email?: string;
  phone?: string;
  photo?: string; // URL or local path
  specialty?: string; // For coaches
}

export const teamMembers: TeamMember[] = [
  {
    id: "jean-dupont",
    name: "Jean Dupont",
    role: "President",
    bio: "Trail running enthusiast since 2010, organizing events and training sessions.",
    email: "jean@ladtc.be",
    photo: "/images/team/jean.jpg",
  },
  // ...more members
];
```

## API Endpoints

### Backend

```
POST /api/contact
  Body: { name, email, subject, message, newsletter: boolean }
  Response: { success: boolean, message: string }

POST /api/contact/subscribe
  Body: { email }
  Response: { success: boolean, message: string }
```

## Types

```typescript
// In src/types/index.ts

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  email?: string;
  phone?: string;
  photo?: string;
  specialty?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter?: boolean;
}
```

## Validation Schemas (Zod)

```typescript
// src/lib/schemas.ts

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  newsletter: z.boolean().optional(),
});
```

## Testing

### Unit Tests
- Contact form validation works
- Team data loads correctly
- Homepage renders hero section

### Integration Tests
- Homepage loads all sections
- Team page displays all members
- Contact form submission sends email
- Contact form validation shows errors
- Error handling if email fails

### Manual Testing
- Homepage responsive on mobile/tablet/desktop
- Team page responsive layout
- Contact form submits successfully
- Email received in admin inbox
- Form error messages display correctly
- Newsletter checkbox functional (if implemented)

## Dependencies

- Spec 01: WordPress Integration (for blog posts and events on homepage)
- Email service (SMTP) for contact form (see CLAUDE.md for env var)

## Blockers

- SMTP credentials needed for email sending
- Google Maps API key (optional, can use text location instead)

## Notes

- Can be done in parallel with Spec 01
- Team member photos should be optimized before upload
- Contact form email can be simple text email initially (no HTML)
- Consider adding FAQ section to homepage in future
- Rate limiting prevents spam (using IP address)
