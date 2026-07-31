import { apiFetch } from './http';

export interface GateSummary {
  id: string;
  venueId: string;
  name: string;
  identifier: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  venue?: { id: string; name: string; capacity?: number } | null;
  _count?: { ticketTypes: number };
  ticketTypes?: Array<{ ticketType: { id: string; name: string; category: string } }>;
}

export interface GateListResponse {
  items: GateSummary[];
  total: number;
}

export interface CreateGatePayload {
  name: string;
  identifier: string;
  description?: string;
}

export interface UpdateGatePayload extends Partial<CreateGatePayload> {}

export async function getGateStatsCount() {
  return apiFetch<{ total: number }>(`/gates/stats/count`);
}

export async function listGatesByVenue(venueId: string) {
  return apiFetch<GateListResponse>(`/gates/venue/${venueId}`);
}

export async function getGateById(id: string) {
  return apiFetch<GateSummary>(`/gates/${id}`);
}

export async function createGate(venueId: string, payload: CreateGatePayload) {
  return apiFetch<GateSummary>(`/gates/venue/${venueId}`, {
    method: 'POST',
    body: payload,
  });
}

export async function updateGate(id: string, payload: UpdateGatePayload) {
  return apiFetch<GateSummary>(`/gates/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteGate(id: string) {
  return apiFetch<void>(`/gates/${id}`, { method: 'DELETE' });
}

export async function assignGateAllowedTicketTypes(
  venueId: string,
  gateId: string,
  ticketTypeIds: string[],
) {
  await apiFetch<void>(
    `/venues/${venueId}/gates/${gateId}/allowed-ticket-types`,
    {
      method: 'PUT',
      body: { ticketTypeIds },
    },
  );
}
