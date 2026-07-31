import { apiFetch } from './http';
import type { EventCategoryKey } from '@/components/category-badge';
import type { Paginated } from './venues';

export interface EventSummaryVenue {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  capacity: number;
}

export interface EventSummaryCreator {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface EventRecent {
  id: string;
  name: string;
  description?: string | null;
  category: EventCategoryKey;
  venueId: string;
  startDate: string;
  endDate: string;
  coverImage?: string | null;
  venue: EventSummaryVenue;
  createdBy: EventSummaryCreator;
  _count?: { tickets: number };
}

export async function getEventsRecent(limit = 3) {
  return apiFetch<EventRecent[]>('/events/recent', { params: { limit } });
}

export async function getEventsUpcoming(limit = 3) {
  return apiFetch<EventRecent[]>('/events/upcoming', { params: { limit } });
}

export async function getEventsStatsCount() {
  return apiFetch<{ total: number }>('/events/stats/count');
}

export async function getEventsStatsTickets() {
  return apiFetch<{ total: number }>('/events/stats/tickets');
}

export async function listEvents(params?: {
  page?: number;
  perPage?: number;
  search?: string;
  venueId?: string;
  category?: EventCategoryKey;
  upcomingOnly?: boolean;
}) {
  const query = {
    ...params,
    upcomingOnly: params?.upcomingOnly ? 'true' : undefined,
  };
  return apiFetch<Paginated<EventRecent>>('/events', { params: query });
}

export async function getEventById(id: string) {
  return apiFetch<EventRecent>(`/events/${id}`);
}

export interface CreateEventPayload {
  name: string;
  description?: string;
  category: EventCategoryKey;
  venueId: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
}

export async function createEvent(payload: CreateEventPayload) {
  return apiFetch<EventRecent>('/events', { method: 'POST', body: payload });
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export async function updateEvent(id: string, payload: UpdateEventPayload) {
  return apiFetch<EventRecent>(`/events/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteEvent(id: string) {
  return apiFetch<void>(`/events/${id}`, { method: 'DELETE' });
}

export interface AvailabilityConflict {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface AvailabilityResponse {
  available: boolean;
  conflicts: AvailabilityConflict[];
}

export async function checkEventAvailability(params: {
  venueId: string;
  startDate: string;
  endDate: string;
  excludeEventId?: string;
}) {
  return apiFetch<AvailabilityResponse>('/events/availability/conflict', {
    params,
    skipAuth: true,
  });
}

export interface ConflictErrorDetail {
  error: 'ScheduleConflict';
  message: string;
  conflict: {
    id: string;
    name: string;
    start: string;
    end: string;
    startDate: string;
    endDate: string;
  };
}
