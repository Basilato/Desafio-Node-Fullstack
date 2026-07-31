import { apiFetch } from './http';

export type TicketCategoryKey = 'INTEIRA' | 'MEIA' | 'VIP' | 'CORTESIA';

export interface TicketTypeSummary {
  id: string;
  name: string;
  category: TicketCategoryKey;
  price: number;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { tickets?: number; allowedGates?: number };
}

export interface AllowedGateRef {
  id: string;
  ticketTypeId: string;
  gateId: string;
  gate: { id: string; name: string; identifier: string; venueId: string };
}

export interface TicketTypeDetail extends TicketTypeSummary {
  allowedGates?: AllowedGateRef[];
}

export interface TicketTypeListResult {
  items: TicketTypeSummary[];
  total: number;
}

export async function getTicketTypesStatsCount() {
  return apiFetch<{ total: number }>('/ticket-types/stats/count');
}

export async function listTicketTypes() {
  return apiFetch<TicketTypeListResult>('/ticket-types');
}

export async function getTicketTypeById(id: string) {
  return apiFetch<TicketTypeDetail>(`/ticket-types/${id}`);
}

export interface CreateTicketTypePayload {
  name: string;
  category: TicketCategoryKey;
  price: number;
  description?: string;
}

export async function createTicketType(payload: CreateTicketTypePayload) {
  return apiFetch<TicketTypeSummary>('/ticket-types', { method: 'POST', body: payload });
}

export type UpdateTicketTypePayload = Partial<CreateTicketTypePayload>;

export async function updateTicketType(id: string, payload: UpdateTicketTypePayload) {
  return apiFetch<TicketTypeSummary>(`/ticket-types/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteTicketType(id: string) {
  return apiFetch<void>(`/ticket-types/${id}`, { method: 'DELETE' });
}

export async function assignTicketTypeGates(id: string, gateIds: string[]) {
  return apiFetch<AllowedGateRef[]>(`/ticket-types/${id}/gates`, {
    method: 'PUT',
    body: { gateIds },
  });
}

export const TICKET_CATEGORY_LABELS: Record<TicketCategoryKey, string> = {
  INTEIRA: 'Inteira',
  MEIA: 'Meia',
  VIP: 'VIP',
  CORTESIA: 'Cortesia',
};
