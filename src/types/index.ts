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
  name: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

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
  total: number;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
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
