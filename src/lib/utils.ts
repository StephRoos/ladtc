import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date in French locale
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Format a currency amount in French locale
 */
export function formatCurrency(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate a string to a given length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

/**
 * Validate an email address format
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
