# Spec 04: Member Management — Profiles, Membership Status, Annual Dues

**Phase**: MVP
**Priority**: 4
**Estimated Time**: 14 hours
**Dependencies**: Spec 03 (Authentication) required first

## Feature

Enable members to view and edit their profiles, display membership status (active/inactive/pending), and track annual dues (payment status and renewal dates).

## Goals

- Members can view and edit their profile information
- Membership status clearly displayed (active, pending payment, expired)
- Annual dues tracked with renewal dates
- Committee can view all members and manage dues status
- Admin dashboard shows membership stats (total active, pending, revenue)
- Email notifications sent for upcoming renewals

## User Stories

1. **As a member**, I want to update my profile (name, phone, emergency contact) so my info is current.
2. **As a member**, I want to see my membership status and when my dues are due so I don't miss payment.
3. **As a member**, I want to receive a reminder when my dues are about to expire.
4. **As a committee member**, I want to view all members and see who has paid their dues.
5. **As a committee member**, I want to mark a member as paid when I receive their payment.
6. **As an admin**, I want to see membership statistics on the dashboard.

## Acceptance Criteria

- [ ] Member profile page (`/profile`) displays: name, email, phone, emergency contact, membership status, renewal date
- [ ] Member can edit their profile information
- [ ] Member sees clear indicator: "Active", "Pending Payment", "Expired"
- [ ] Member can download their membership certificate (PDF)
- [ ] Committee member page (`/admin/members`) lists all members with:
  - Name, email, join date, status, payment status
  - Sortable by status, join date, last payment
  - Filterable by status
  - Bulk actions: mark as paid, send reminder email
- [ ] Committee can click member to view full details and edit status/renewal date
- [ ] Admin dashboard shows:
  - Total active members
  - Total pending payment
  - Total revenue (if dues tracked)
  - Upcoming renewals (next 30 days)
  - New registrations (last 7 days)
- [ ] Email reminder sent 14 days before renewal date
- [ ] Email reminder sent on renewal date
- [ ] Tests: Profile CRUD, status transitions, due date calculations

## Technical Details

### Database Schema

```prisma
// prisma/schema.prisma (update User model from Spec 03)

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  role          UserRole  @default(MEMBER)
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  membership    Membership?
  orders        Order[]
  sessions      Session[]
}

model Membership {
  id            String              @id @default(cuid())
  userId        String              @unique
  user          User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  status        MembershipStatus    @default(PENDING)
  joinedAt      DateTime            @default(now())
  renewalDate   DateTime            // Next annual dues renewal
  paidAt        DateTime?           // Last payment date
  amount        Float               @default(50.0) // Annual dues amount (EUR)
  notes         String?             // Internal notes from committee
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@index([status])
  @@index([renewalDate])
}

enum MembershipStatus {
  PENDING        // New registration, not yet paid
  ACTIVE         // Current, dues paid
  INACTIVE       // Inactive but not expired
  EXPIRED        // Renewal date passed
}
```

### API Endpoints

```
GET /api/members/me
  Response: { user: User, membership: Membership }

PATCH /api/members/me
  Body: { name, phone, emergencyContact, ... }
  Response: { user: User, membership: Membership }

GET /api/members (admin/committee only)
  Query: ?status=ACTIVE&sort=joinDate&page=1
  Response: { members: Member[], total, pages }

GET /api/members/[id] (admin/committee only)
  Response: { user: User, membership: Membership }

PATCH /api/members/[id] (admin/committee only)
  Body: { status, renewalDate, paidAt, notes }
  Response: { user: User, membership: Membership }

POST /api/members/[id]/send-reminder (admin/committee only)
  Response: { success, message }

GET /api/admin/members/stats (admin only)
  Response: { total, active, pending, expired, revenue }
```

### Profile Page Structure

```
Profile Page (/profile):
  ├── Member Info Card
  │   ├── Name
  │   ├── Email (read-only)
  │   ├── Phone (editable)
  │   ├── Emergency contact (editable)
  │   └── Edit button
  ├── Membership Card
  │   ├── Status badge (Active/Pending/Expired)
  │   ├── Join date
  │   ├── Next renewal date
  │   ├── Last payment date (if paid)
  │   └── Days until renewal (if relevant)
  └── Actions
      ├── Download certificate (if active)
      └── Contact support
```

### Member Management Page Structure

```
Admin Members Page (/admin/members):
  ├── Filters
  │   ├── Status dropdown (All/Active/Pending/Expired)
  │   └── Search by name/email
  ├── Sort options (Name/JoinDate/RenewalDate)
  ├── Members table
  │   ├── Name
  │   ├── Email
  │   ├── Status
  │   ├── Joined
  │   ├── Renewal date
  │   ├── Last paid
  │   └── Actions (view, edit, send reminder)
  └── Bulk actions (mark as paid, send reminders)
```

### Member Status Transitions

```
PENDING
  ├─(payment received)─> ACTIVE
  └─(no payment after 30 days)─> EXPIRED

ACTIVE
  ├─(renewal date passed)─> EXPIRED
  └─(member requests)─> INACTIVE

INACTIVE
  ├─(payment received)─> ACTIVE
  └─(renewal date passed)─> EXPIRED

EXPIRED
  └─(payment received)─> ACTIVE
```

### Email Notifications

**Renewal Reminder (14 days before)**
```
Subject: LADTC membership renewal reminder

Hello {name},

Your LADTC membership renews on {date}.
Annual dues: {amount} EUR

To renew, please contact {committee_email} or visit your dashboard.

Best regards,
LADTC Team
```

**Renewal Due (on renewal date)**
```
Subject: Your LADTC membership needs renewal

Hello {name},

Your membership renewal is due today.
Annual dues: {amount} EUR

Please contact {committee_email} to renew.

Best regards,
LADTC Team
```

## Implementation Files

1. **`src/app/(member)/profile/page.tsx`** (new) — Profile view
2. **`src/app/(member)/profile/edit/page.tsx`** (new) — Profile edit
3. **`src/components/forms/ProfileForm.tsx`** (new) — Profile edit form
4. **`src/app/(admin)/members/page.tsx`** (new) — Member management list
5. **`src/app/(admin)/members/[id]/page.tsx`** (new) — Member detail/edit
6. **`src/components/admin/MemberTable.tsx`** (new) — Member table
7. **`src/components/admin/MemberForm.tsx`** (new) — Member edit form
8. **`src/hooks/useMember.ts`** (new) — Member data hooks
9. **`src/hooks/useMembers.ts`** (new) — Member list hooks
10. **`src/app/api/members/me/route.ts`** (new) — Get/update current user
11. **`src/app/api/members/route.ts`** (new) — List members (admin)
12. **`src/app/api/members/[id]/route.ts`** (new) — Get/update member (admin)
13. **`src/lib/email.ts`** (new) — Email sending utilities
14. **`src/jobs/renewal-reminders.ts`** (new) — Cron job for renewal emails
15. **Tests**: `__tests__/member.test.ts`, `__tests__/ProfileForm.test.tsx`

## Validation Schemas (Zod)

```typescript
// src/lib/schemas.ts (update)

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().min(2).optional(),
  emergencyContactPhone: z.string().optional(),
});

export const memberUpdateSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE", "EXPIRED"]),
  renewalDate: z.date(),
  paidAt: z.date().optional(),
  amount: z.number().positive(),
  notes: z.string().optional(),
});
```

## Testing

### Unit Tests
- Status transition logic
- Renewal date calculations
- Email notification formatting
- Payment status validation

### Integration Tests
- User can view and edit profile
- Committee can view all members
- Status changes update correctly
- Email reminders sent at correct times
- Filtering and sorting work

### Manual Testing
- Register new member, check status is PENDING
- Committee marks as paid, status changes to ACTIVE
- Renewal date approaches, email sent
- Member views profile, sees renewal date
- Bulk actions work (mark multiple as paid)
- Filter by status works
- Search by name/email works

## Dependencies

- Spec 03: Authentication (User and Session models)
- PostgreSQL database with Prisma ORM
- Email service (SMTP) for renewal reminders
- TanStack Query for client-side data fetching

## Blockers

- Prisma migrations must be run: `pnpm prisma migrate dev`
- SMTP credentials required

## Notes

- Annual dues amount can be configured in `.env`
- Renewal reminders are scheduled jobs (can use Vercel Cron or external service)
- Consider adding payment tracking (e.g., integration with Stripe in future)
- Export members list to CSV for committee (future feature)
- Membership certificate is a simple PDF with member name and active status
- Consider automating dues invoicing (currently manual process)
