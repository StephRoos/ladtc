"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { EventFormData } from "@/lib/schemas";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

interface EventWithCount {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  type: "TRAINING" | "RACE" | "CAMP" | "SOCIAL";
  difficulty: string | null;
  maxParticipants: number | null;
  createdAt: string;
  updatedAt: string;
  _count: { registrations: number };
}

interface EventWithRegistrations extends EventWithCount {
  registrations: Array<{
    id: string;
    userId: string;
    user: { id: string; name: string | null };
    createdAt: string;
  }>;
}

interface EventsResponse {
  events: EventWithCount[];
  total: number;
  totalPages: number;
}

interface EventResponse {
  event: EventWithRegistrations;
}

interface AdminEventsResponse {
  events: EventWithCount[];
}

interface AdminEventResponse {
  event: EventWithCount;
}

/**
 * Fetch upcoming events from the public API
 * @param page - Page number
 * @param perPage - Events per page
 * @param type - Event type filter
 */
async function getEvents(
  page: number,
  perPage: number,
  type?: string
): Promise<EventsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (type) params.set("type", type);

  const res = await fetch(`/api/events?${params}`);
  if (!res.ok) {
    throw new Error("Impossible de charger les événements");
  }
  return res.json() as Promise<EventsResponse>;
}

/**
 * Fetch a single event by ID
 * @param id - Event ID
 */
async function getEvent(id: string): Promise<EventResponse> {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) {
    throw new Error("Événement introuvable");
  }
  return res.json() as Promise<EventResponse>;
}

/**
 * Fetch all events from the admin API
 */
async function getAdminEvents(): Promise<AdminEventsResponse> {
  const res = await fetch("/api/admin/events");
  if (!res.ok) {
    throw new Error("Impossible de charger les événements");
  }
  return res.json() as Promise<AdminEventsResponse>;
}

/**
 * Create a new event (admin only)
 */
async function createEvent(data: EventFormData): Promise<AdminEventResponse> {
  const res = await fetch("/api/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de créer l'événement");
  }
  return res.json() as Promise<AdminEventResponse>;
}

/**
 * Update an existing event (admin only)
 */
async function updateEvent(
  id: string,
  data: Partial<EventFormData>
): Promise<AdminEventResponse> {
  const res = await fetch(`/api/admin/events/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de mettre à jour l'événement");
  }
  return res.json() as Promise<AdminEventResponse>;
}

/**
 * Delete an event (admin only)
 */
async function deleteEvent(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de supprimer l'événement");
  }
  return res.json() as Promise<{ success: boolean }>;
}

/**
 * Register for an event
 */
async function registerEvent(
  eventId: string
): Promise<{ registration: { id: string } }> {
  const res = await fetch(`/api/events/${eventId}/register`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de s'inscrire");
  }
  return res.json() as Promise<{ registration: { id: string } }>;
}

/**
 * Unregister from an event
 */
async function unregisterEvent(
  eventId: string
): Promise<{ success: boolean }> {
  const res = await fetch(`/api/events/${eventId}/register`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de se désinscrire");
  }
  return res.json() as Promise<{ success: boolean }>;
}

/**
 * TanStack Query hook for paginated upcoming events
 * @param page - Page number (default: 1)
 * @param perPage - Events per page (default: 10)
 * @param type - Event type filter
 */
export function useEvents(
  page: number = 1,
  perPage: number = 10,
  type?: string
) {
  return useQuery({
    queryKey: ["events", page, perPage, type],
    queryFn: () => getEvents(page, perPage, type),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * TanStack Query hook for a single event
 * @param id - Event ID
 */
export function useEvent(id: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!id,
  });
}

/**
 * TanStack Query hook for all events (admin)
 */
export function useAdminEvents() {
  return useQuery({
    queryKey: ["admin-events"],
    queryFn: getAdminEvents,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation<AdminEventResponse, Error, EventFormData>({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation<
    AdminEventResponse,
    Error,
    { id: string; data: Partial<EventFormData> }
  >({
    mutationFn: ({ id, data }) => updateEvent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Hook to register for an event
 */
export function useRegisterEvent() {
  const queryClient = useQueryClient();
  return useMutation<{ registration: { id: string } }, Error, string>({
    mutationFn: registerEvent,
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Hook to unregister from an event
 */
export function useUnregisterEvent() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: unregisterEvent,
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
