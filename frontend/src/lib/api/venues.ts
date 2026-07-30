import { apiFetch } from './http';

export interface VenueGate {
  id: string;
  name: string;
  identifier: string;
  description?: string | null;
  ticketTypes?: Array<{
    ticketType: { id: string; name: string; category: string };
  }>;
}

export interface VenueRecent {
  id: string;
  name: string;
  capacity: number;
  address: string;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  email?: string | null;
  phone?: string | null;
  description?: string | null;
  gates: VenueGate[];
  _count?: { events: number };
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
}

export async function getVenuesRecent(limit = 3) {
  return apiFetch<VenueRecent[]>('/venues/recent', { params: { limit } });
}

export async function getVenuesStatsCount() {
  return apiFetch<{ total: number }>('/venues/stats/count');
}

export async function listVenues(params?: {
  page?: number;
  perPage?: number;
  search?: string;
}) {
  return apiFetch<Paginated<VenueRecent>>('/venues', { params });
}

export async function getVenueById(id: string) {
  return apiFetch<VenueRecent>(`/venues/${id}`);
}

export interface CreateVenuePayload {
  name: string;
  capacity: number;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  email?: string;
  phone?: string;
  description?: string;
  gates?: { name: string; identifier: string; description?: string }[];
}

export async function createVenue(payload: CreateVenuePayload) {
  return apiFetch<VenueRecent>('/venues', { method: 'POST', body: payload });
}

export type UpdateVenuePayload = Partial<Omit<CreateVenuePayload, 'gates'>> & {
  gates?: CreateVenuePayload['gates'];
};

export async function updateVenue(id: string, payload: UpdateVenuePayload) {
  return apiFetch<VenueRecent>(`/venues/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteVenue(id: string) {
  return apiFetch<void>(`/venues/${id}`, { method: 'DELETE' });
}
