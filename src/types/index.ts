/**
 * Type definitions for LADTC application
 */

export type UserRole = "MEMBER" | "COACH" | "COMMITTEE" | "ADMIN";

export type MembershipStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "EXPIRED";

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type EventType = "TRAINING" | "RACE" | "CAMP" | "SOCIAL";

export type RegistrationStatus = "REGISTERED" | "ATTENDED" | "CANCELLED";

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  id: string;
  userId: string;
  status: MembershipStatus;
  joinedAt: Date;
  renewalDate: Date;
  paidAt: Date | null;
  amount: number;
  phone: string | null;
  emergencyContact: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberWithMembership extends User {
  membership: Membership | null;
}

export interface MemberStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  expired: number;
  revenue: number;
  upcomingRenewals: number;
  newThisWeek: number;
}

/** @deprecated Use Membership instead */
export interface Member {
  id: string;
  userId: string;
  user: User;
  status: MembershipStatus;
  joinedAt: Date;
  renewalDate: Date;
  paidAt: Date | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  sizes: string[];
  stock: number;
  sku: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  size: string | null;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  user: User;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
  notes: string | null;
  trackingNumber: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  size?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  location: string;
  type: EventType;
  difficulty: string | null;
  maxParticipants: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  event: Event;
  status: RegistrationStatus;
  createdAt: Date;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImageUrl: string | null;
  author: {
    id: number;
    name: string;
  };
  publishedDate: string;
  categories: Array<{
    id: number;
    name: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
  }>;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
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

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingRenewals: number;
  pendingOrders: number;
  recentRegistrations: number;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  action: string;
  target: string | null;
  targetId: string | null;
  changes: Record<string, unknown> | null;
  createdAt: Date | string;
}

export interface StatisticsData {
  memberBreakdown: {
    ACTIVE: number;
    PENDING: number;
    INACTIVE: number;
    EXPIRED: number;
  };
  memberTrend: Array<{ month: string; count: number }>;
  orderTrend: Array<{ month: string; count: number }>;
  topProducts: Array<{ productId: string; name: string; salesCount: number }>;
  totalRevenue: number;
  totalOrders: number;
}
