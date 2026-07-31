import { apiFetch } from './http';
import type { TicketTypeSummary } from './ticket-types';

export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED' | 'REFUNDED';

export interface TicketItem {
  id: string;
  status: TicketStatus;
  qrCode: string;
  holderName: string;
  holderEmail?: string | null;
  holderDoc?: string | null;
  seat?: string | null;
  pricePaid: number;
  eventId: string;
  ticketTypeId: string;
  ticketType?: TicketTypeSummary;
  createdAt: string;
  updatedAt?: string;
}

export interface SoldByTypeRow {
  ticketType: TicketTypeSummary;
  totals: Record<string, number>;
}

export interface EventCapacity {
  eventId: string;
  eventName: string;
  venueName: string;
  venueCapacity: number;
  emittedCount: number;
  remaining: number;
  soldByType: SoldByTypeRow[];
}

export interface TicketsListResult {
  items: TicketItem[];
  total: number;
}

export async function getTicketsStatsCount() {
  return apiFetch<{ total: number }>('/tickets/stats/count');
}

export async function getEventCapacity(eventId: string) {
  return apiFetch<EventCapacity>(`/tickets/event/${eventId}/capacity`);
}

export async function listTicketsByEvent(eventId: string) {
  return apiFetch<TicketsListResult>(`/tickets/event/${eventId}`);
}

export async function getEventTicketsBreakdown(eventId: string) {
  return apiFetch<Record<TicketStatus, number>>(
    `/tickets/event/${eventId}/breakdown`,
  );
}

export async function getTicketById(id: string) {
  return apiFetch<TicketItem & { event?: any }>(`/tickets/${id}`);
}

export interface CreateTicketPayload {
  eventId: string;
  ticketTypeId: string;
  holderName: string;
  holderEmail?: string;
  holderDoc?: string;
  seat?: string;
  pricePaid?: number;
}

export async function createTicket(payload: CreateTicketPayload) {
  return apiFetch<TicketItem>('/tickets', { method: 'POST', body: payload });
}

export interface UpdateTicketPayload {
  status?: TicketStatus;
  seat?: string;
  holderName?: string;
  holderEmail?: string;
  holderDoc?: string;
  pricePaid?: number;
}

export async function updateTicket(id: string, payload: UpdateTicketPayload) {
  return apiFetch<TicketItem>(`/tickets/${id}`, { method: 'PATCH', body: payload });
}

export async function cancelTicket(id: string) {
  return apiFetch<void>(`/tickets/${id}`, { method: 'DELETE' });
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  ACTIVE: 'Ativo',
  USED: 'Usado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};
