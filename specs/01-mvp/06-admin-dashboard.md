# Spec 06: Admin Dashboard — Committee Tools & Oversight

**Phase**: MVP
**Priority**: 6
**Estimated Time**: 12 hours
**Dependencies**: Specs 03–05 (Auth, Members, Orders)

## Feature

Create a committee admin dashboard with tools to manage members, orders, products, and view key club statistics. Role-based access ensures only authorized users can manage sensitive data.

## Goals

- Committee has a central place to manage all club operations
- Dashboard displays key metrics at a glance
- Quick access to member management, order processing, and content management
- Admin can assign roles and manage committee access
- Activity logs track important actions
- Responsive design works on mobile for on-the-go access

## User Stories

1. **As a committee member**, I want to see a dashboard with key metrics (member count, pending orders, upcoming events).
2. **As a committee member**, I want to quickly access member management, order management, and product catalog.
3. **As a committee member**, I want to see pending orders and be able to mark them as shipped.
4. **As an admin**, I want to assign committee roles to members.
5. **As an admin**, I want to view activity logs to see who did what and when.
6. **As a committee member**, I want to view member statistics (active, inactive, revenue).

## Acceptance Criteria

- [ ] Admin dashboard accessible at `/admin/dashboard`
- [ ] Role check: only COMMITTEE and ADMIN roles can access
- [ ] Dashboard displays:
  - [ ] Total active members
  - [ ] Total pending membership renewals (due in 30 days)
  - [ ] Total pending orders
  - [ ] Upcoming events (next 7 days)
  - [ ] Recent registrations (last 7 days)
- [ ] Quick action cards:
  - [ ] "View pending orders" (links to orders list)
  - [ ] "Manage members" (links to members list)
  - [ ] "Manage products" (links to products list)
  - [ ] "View events" (links to events)
- [ ] Member management quick access:
  - [ ] Search member by name/email
  - [ ] View member status
  - [ ] Send renewal reminder (quick action)
- [ ] Order management quick access:
  - [ ] List pending orders
  - [ ] Mark as shipped (quick action)
  - [ ] View order details
- [ ] Statistics page:
  - [ ] Member breakdown by status (pie chart)
  - [ ] Revenue trend (monthly) (bar chart, if dues tracked)
  - [ ] Order trend (monthly)
  - [ ] Top products (sales count)
- [ ] Activity log page:
  - [ ] List recent actions (user, action, date, target)
  - [ ] Filter by action type (member added, order updated, etc.)
  - [ ] Filter by date range
- [ ] Admin-only features:
  - [ ] User role management
  - [ ] View all activity logs
  - [ ] View system info (database size, etc.)
- [ ] Tests: Access control, dashboard data loads, role assignments

## Technical Details

### Database Schema

```prisma
// prisma/schema.prisma (add)

model ActivityLog {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: SetNull)

  action    String    // "MEMBER_ADDED", "ORDER_SHIPPED", "PRODUCT_CREATED", etc.
  target    String?   // "member", "order", "product", etc.
  targetId  String?   // ID of the target entity
  changes   Json?     // JSON diff of what changed

  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

// Update User model to include activity logs
model User {
  // ... existing fields
  activityLogs ActivityLog[]
}
```

### Dashboard Data Structure

```typescript
// src/types/index.ts (add)

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingRenewals: number;
  pendingOrders: number;
  upcomingEvents: Event[];
  recentRegistrations: User[];
  memberTrend: Array<{ date: string; count: number }>;
  orderTrend: Array<{ date: string; count: number }>;
  memberStatusBreakdown: {
    ACTIVE: number;
    PENDING: number;
    INACTIVE: number;
    EXPIRED: number;
  };
  topProducts: Array<{
    productId: string;
    name: string;
    salesCount: number;
  }>;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  user: User;
  action: string;
  target?: string;
  targetId?: string;
  createdAt: Date;
}
```

### API Endpoints

```
GET /api/admin/dashboard
  Response: { stats: DashboardStats }

GET /api/admin/statistics
  Response: {
    memberBreakdown,
    memberTrend,
    orderTrend,
    topProducts
  }

GET /api/admin/activity-logs
  Query: ?action=&startDate=&endDate=&skip=0&take=50
  Response: { logs: ActivityLog[], total: number }

PATCH /api/admin/users/[id]/role (admin only)
  Body: { role: UserRole }
  Response: { user: User }

GET /api/admin/system (admin only)
  Response: { dbSize, userCount, orderCount, ... }
```

### Dashboard Layout

```
Admin Dashboard (/admin/dashboard):
  ├── Header
  │   ├── Welcome message ("Welcome back, Jean")
  │   └── Last login date
  ├── KPI Cards (4 columns on desktop, 1 on mobile)
  │   ├── Total Members
  │   ├── Active Members
  │   ├── Pending Orders
  │   └── Upcoming Events
  ├── Quick Actions (2 columns)
  │   ├── View pending orders
  │   └── Manage members
  ├── Recent Activity (latest 5 actions)
  │   ├── "Jean marked order #123 as shipped" (today)
  │   ├── "Marie added member Pierre" (yesterday)
  │   └── ...
  ├── Pending Orders (latest 5)
  │   ├── Order ID, member name, status
  │   └── Quick "Mark as shipped" button
  └── Upcoming Events (next 5)
      └── Event name, date, registrations
```

### Statistics Page Layout

```
Statistics (/admin/statistics):
  ├── Date range selector (last 30/90/365 days)
  ├── Member Statistics
  │   ├── Status breakdown pie chart
  │   ├── Member trend line chart
  │   └── Total / Active / Pending / Expired counts
  ├── Order Statistics
  │   ├── Order trend line chart
  │   ├── Total orders / Total revenue
  │   └── Average order value
  ├── Product Statistics
  │   ├── Top 5 products by sales (bar chart)
  │   └── Total products, in stock, out of stock
  └── Revenue Tracking (if dues tracked)
      └── Monthly revenue bar chart
```

### Activity Log Page Layout

```
Activity Logs (/admin/activity-logs):
  ├── Filters (sidebar)
  │   ├── Action type (dropdown)
  │   ├── Date range picker
  │   └── User filter
  ├── Activity table
  │   ├── Date/Time
  │   ├── User
  │   ├── Action
  │   ├── Target (link to entity)
  │   └── Details (expandable)
  └── Pagination
```

### Role Management Page Layout

```
Role Management (/admin/users):
  ├── Users table
  │   ├── Name
  │   ├── Email
  │   ├── Current role
  │   ├── Role dropdown (to change)
  │   ├── Last login
  │   └── Status
  └── Pagination
```

## Implementation Files

1. **`src/app/(admin)/dashboard/page.tsx`** (new) — Dashboard main page
2. **`src/app/(admin)/statistics/page.tsx`** (new) — Statistics page
3. **`src/app/(admin)/activity-logs/page.tsx`** (new) — Activity logs
4. **`src/app/(admin)/users/page.tsx`** (new) — User/role management (admin only)
5. **`src/app/(admin)/layout.tsx`** (new) — Admin layout with sidebar
6. **`src/components/admin/DashboardCard.tsx`** (new) — KPI card
7. **`src/components/admin/StatisticsChart.tsx`** (new) — Chart wrapper
8. **`src/components/admin/ActivityLogTable.tsx`** (new) — Activity log table
9. **`src/components/admin/Sidebar.tsx`** (new) — Admin sidebar navigation
10. **`src/components/admin/QuickActions.tsx`** (new) — Quick action cards
11. **`src/hooks/useDashboard.ts`** (new) — Dashboard data hook
12. **`src/hooks/useStatistics.ts`** (new) — Statistics data hook
13. **`src/hooks/useActivityLogs.ts`** (new) — Activity log hook
14. **`src/app/api/admin/dashboard/route.ts`** (new) — Dashboard stats endpoint
15. **`src/app/api/admin/statistics/route.ts`** (new) — Statistics endpoint
16. **`src/app/api/admin/activity-logs/route.ts`** (new) — Activity logs endpoint
17. **`src/app/api/admin/users/[id]/role/route.ts`** (new) — Role assignment endpoint
18. **`src/lib/admin.ts`** (new) — Admin utilities (role checks, calculations)
19. **`src/lib/activity-log.ts`** (new) — Activity logging helper
20. **Tests**: `__tests__/admin-dashboard.test.tsx`, `__tests__/activity-logs.test.ts`

## Charts Library

Use Plotly.js (dynamic import, no SSR) or lightweight alternative like Recharts:

```bash
pnpm add recharts
```

Example:
```typescript
import { LineChart, Line, XAxis, YAxis } from "recharts";

export function MemberTrendChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Line type="monotone" dataKey="count" stroke="#FF8C00" />
    </LineChart>
  );
}
```

## Middleware: Role Checks

```typescript
// src/lib/middleware.ts (update from Spec 03)

export async function requireRole(
  request: NextRequest,
  requiredRoles: UserRole[]
): Promise<User | null> {
  const user = await getSessionUser(request);
  if (!user || !requiredRoles.includes(user.role)) {
    return null;
  }
  return user;
}

// Usage in API route:
export async function GET(request: NextRequest) {
  const user = await requireRole(request, ["COMMITTEE", "ADMIN"]);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Admin logic here
}
```

## Activity Logging Utility

```typescript
// src/lib/activity-log.ts (to be created)

export async function logActivity(
  userId: string,
  action: string,
  target?: string,
  targetId?: string,
  changes?: any
): Promise<void> {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      target,
      targetId,
      changes: changes ? JSON.stringify(changes) : null,
    },
  });
}

// Usage in API route:
await logActivity(userId, "MEMBER_ADDED", "member", newMemberId);
```

## Validation Schemas (Zod)

```typescript
export const roleUpdateSchema = z.object({
  role: z.enum(["MEMBER", "COACH", "COMMITTEE", "ADMIN"]),
});

export const activityLogFilterSchema = z.object({
  action: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: z.string().optional(),
  skip: z.number().default(0),
  take: z.number().default(50),
});
```

## Testing

### Unit Tests
- Role checking function
- Activity log formatting
- Statistics calculations
- Permission checks

### Integration Tests
- Committee can access dashboard
- Admin can access all features
- Regular member cannot access admin dashboard
- Dashboard loads all statistics
- Activity logs track actions correctly
- Role assignment works

### Manual Testing
- Login as committee member, verify access to dashboard
- View statistics and charts
- Check activity logs show recent actions
- Admin assigns role to user
- Verify permissions are enforced
- Test on mobile (responsive layout)

## Dependencies

- Specs 03–05 (Auth, Members, Orders)
- PostgreSQL database with Prisma ORM
- Charts library (Recharts or similar)
- TanStack Query for data fetching

## Blockers

- Previous specs must be completed first
- Prisma migrations for ActivityLog table

## Notes

- Activity logs should be comprehensive but not bloat database
- Consider archiving old logs (older than 6 months) periodically
- Charts library kept lightweight (no D3)
- Dashboard loads quickly (cache statistics with TanStack Query)
- Export statistics to PDF/CSV (future feature)
- Email reports (weekly/monthly stats) (future feature)
