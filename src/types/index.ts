/**
 * Type definitions for LADTC application
 */

export type UserRole = "MEMBER" | "COMMITTEE" | "ADMIN";


export type MembershipStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "EXPIRED";

export type OrderStatus = "PENDING" | "BATCHED" | "ORDERED" | "RECEIVED" | "DELIVERED" | "CANCELLED";

export type DeliveryMethod = "HOME_DELIVERY" | "CLUB_PICKUP";

export type EventType = "TRAINING" | "RACE" | "CAMP" | "SOCIAL";

export type RegistrationStatus = "REGISTERED" | "ATTENDED" | "CANCELLED";

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  role: UserRole;
  committeeRole: string | null;
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
  season: string | null;
  paidAt: Date | null;
  amount: number;
  phone: string | null;
  emergencyContact: string | null;
  emergencyContactPhone: string | null;
  stripeSessionId: string | null;
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
  unpaidCurrentSeason: number;
  newThisWeek: number;
}

/** @deprecated Use Membership instead */
export interface Member {
  id: string;
  userId: string;
  user: User;
  status: MembershipStatus;
  joinedAt: Date;
  season: string | null;
  paidAt: Date | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  sizes: string[];
  sku: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  productStock?: ProductStock[];
}

export interface ProductStock {
  id: string;
  productId: string;
  size: string;
  quantity: number;
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
  deliveryMethod: DeliveryMethod;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingName: string | null;
  shippingEmail: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  notes: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  paidAt: Date | null;
  trackingNumber: string | null;
  shippedAt: Date | null;
  batchedAt: Date | null;
  orderedAt: Date | null;
  receivedAt: Date | null;
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
  endDate: Date | null;
  image: string | null;
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
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  authorId: string;
  author: {
    id: string;
    name: string | null;
  };
  category: string | null;
  tags: string[];
  published: boolean;
  publishedAt: string | null;
  eventDate: string | null;
  eventLocation: string | null;
  createdAt: string;
  updatedAt: string;
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
  unpaidCurrentSeason: number;
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

export interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  description: string | null;
  category: string | null;
  mediaType: "IMAGE" | "VIDEO";
  uploadedById: string;
  uploadedBy: { id: string; name: string | null };
  createdAt: string;
  updatedAt: string;
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
