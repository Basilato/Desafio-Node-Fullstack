'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  assignGateAllowedTicketTypes,
  createGate,
  deleteGate,
  getGateById,
  listGatesByVenue,
  updateGate,
  type CreateGatePayload,
  type GateSummary,
  type UpdateGatePayload,
} from '@/lib/api/gates';
import type { ApiError, ApiErrorPayload } from '@/lib/api/http';

function messageFromPayload(p: ApiErrorPayload | null | undefined): string {
  if (!p) return '';
  return Array.isArray(p.message)
    ? p.message.join(' · ')
    : ((p.message as string | undefined) ?? '');
}

export const GATES_QUERY_KEY = 'gates' as const;
export const GATES_BY_VENUE_KEY = (venueId?: string | null) =>
  [GATES_QUERY_KEY, 'byVenue', venueId ?? 'all'] as const;
export const GATE_BY_ID_KEY = (id?: string | null) =>
  [GATES_QUERY_KEY, 'byId', id ?? ''] as const;
export const GATES_STATS_KEY = [GATES_QUERY_KEY, 'stats'] as const;

export function useGatesByVenue(venueId?: string | null, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!venueId;
  return useQuery({
    queryKey: GATES_BY_VENUE_KEY(venueId),
    queryFn: () => listGatesByVenue(venueId!),
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export function useGateById(id?: string | null, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;
  return useQuery({
    queryKey: GATE_BY_ID_KEY(id),
    queryFn: () => getGateById(id!),
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useCreateGateMutation({
  venueId,
  onSuccess,
}: {
  venueId?: string | null;
  onSuccess?: (g: GateSummary) => void;
} = {}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ venueId: vid, payload }: { venueId: string; payload: CreateGatePayload }) =>
      createGate(vid, payload),
    onSuccess: async (g) => {
      await qc.invalidateQueries({ queryKey: GATES_BY_VENUE_KEY(g.venueId ?? venueId) });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-rose-400 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Portão criado
          </span>
        ),
        description: `${g.identifier} · ${g.name}`,
        duration: 4000,
      });
      onSuccess?.(g);
    },
    onError: (e: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Não foi possível criar',
        description: messageFromPayload(e.payload) || 'Tente novamente.',
        duration: 5000,
      });
    },
  });
}

export function useUpdateGateMutation({
  onSuccess,
}: { onSuccess?: (g: GateSummary) => void } = {}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGatePayload }) =>
      updateGate(id, payload),
    onSuccess: async (g) => {
      await qc.invalidateQueries({ queryKey: GATES_BY_VENUE_KEY(g.venueId) });
      await qc.invalidateQueries({ queryKey: GATE_BY_ID_KEY(g.id) });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-rose-400 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Portão atualizado
          </span>
        ),
        description: `${g.identifier} · ${g.name}`,
        duration: 4000,
      });
      onSuccess?.(g);
    },
    onError: (e: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Não foi possível atualizar',
        description: messageFromPayload(e.payload) || 'Tente novamente.',
        duration: 5000,
      });
    },
  });
}

export function useDeleteGateMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, venueId }: { id: string; venueId: string }) => deleteGate(id),
    onSuccess: async (_, { venueId }) => {
      await qc.invalidateQueries({ queryKey: GATES_BY_VENUE_KEY(venueId) });
      toast({
        variant: 'default',
        title: 'Portão excluído',
        description: 'As liberações foram removidas junto.',
        duration: 4000,
      });
    },
    onError: (e: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Não foi possível excluir',
        description: messageFromPayload(e.payload) || 'Verifique dependências.',
        duration: 5500,
      });
    },
  });
}

export function useAssignGateAllowedTicketTypesMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({
      venueId,
      gateId,
      ticketTypeIds,
    }: {
      venueId: string;
      gateId: string;
      ticketTypeIds: string[];
    }) => assignGateAllowedTicketTypes(venueId, gateId, ticketTypeIds),
    onSuccess: async (_, { venueId, gateId }) => {
      await qc.invalidateQueries({ queryKey: GATES_BY_VENUE_KEY(venueId) });
      await qc.invalidateQueries({ queryKey: GATE_BY_ID_KEY(gateId) });
      await qc.invalidateQueries({ queryKey: ['ticket-types'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-rose-400 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Liberações salvas
          </span>
        ),
        description: 'Catraca do portão atualizada.',
        duration: 4000,
      });
    },
    onError: (e: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar liberações',
        description: messageFromPayload(e.payload) || 'Tente novamente.',
        duration: 5500,
      });
    },
  });
}

export function useGateInvalidator() {
  const qc = useQueryClient();
  return useCallback((venueId?: string) => {
    void qc.invalidateQueries({ queryKey: GATES_BY_VENUE_KEY(venueId) });
  }, [qc]);
}
