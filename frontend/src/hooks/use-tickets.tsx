'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelTicket,
  createTicket,
  getEventCapacity,
  listTicketsByEvent,
  updateTicket,
  type CreateTicketPayload,
  type EventCapacity,
  type TicketItem,
  type TicketsListResult,
  type UpdateTicketPayload,
} from '@/lib/api/tickets';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, CheckCircle2, Ban } from 'lucide-react';
import type { ApiError, ApiErrorPayload } from '@/lib/api/http';

function messageFromPayload(p: ApiErrorPayload | null | undefined): string {
  if (!p) return '';
  return Array.isArray(p.message)
    ? p.message.join(' · ')
    : (p.message as string | undefined) ?? '';
}

export function useEventCapacity(eventId: string | null | undefined, enabled = true) {
  return useQuery<EventCapacity>({
    queryKey: ['tickets', 'capacity', eventId] as const,
    queryFn: () => getEventCapacity(eventId!),
    staleTime: 1000 * 15,
    refetchOnMount: true,
    enabled: enabled && !!eventId,
  });
}

export function useTicketsByEvent(eventId: string | null | undefined, enabled = true) {
  return useQuery<TicketsListResult>({
    queryKey: ['tickets', 'list', eventId] as const,
    queryFn: () => listTicketsByEvent(eventId!),
    staleTime: 1000 * 30,
    enabled: enabled && !!eventId,
  });
}

export function useCreateTicketMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation<TicketItem, ApiError, CreateTicketPayload>({
    mutationFn: createTicket,
    onSuccess: async (tik, payload) => {
      await qc.invalidateQueries({ queryKey: ['tickets'] });
      await qc.invalidateQueries({ queryKey: ['events', 'detail', payload.eventId] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-rose-400 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Ingresso emitido
          </span>
        ),
        description: (
          <span className="block">
            <strong>{tik.holderName}</strong> · assento <span className="font-mono">{tik.seat || '—'}</span>
          </span>
        ),
        duration: 5500,
      });
    },
    onError: (e: ApiError) => {
      const msg = messageFromPayload(e.payload);
      const title =
        e.status === 409
          ? '⚠️ Capacidade esgotada'
          : 'Não foi possível emitir o ingresso';
      toast({
        variant: 'destructive',
        title,
        description: msg || 'Verifique os dados e tente novamente.',
        duration: e.status === 409 ? 9000 : 6000,
      });
    },
  });
}

export function useUpdateTicketMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTicketPayload;
    }) => updateTicket(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tickets'] });
      await qc.invalidateQueries({ queryKey: ['events'] });
      toast({
        variant: 'default',
        title: 'Ingresso atualizado',
        description: 'Dados ou status do ingresso alterados.',
        duration: 4500,
      });
    },
    onError: (e: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Não foi possível atualizar',
        description: messageFromPayload(e.payload) || 'Tente novamente.',
        duration: 5500,
      });
    },
  });
}

export function useCancelTicketMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => cancelTicket(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tickets'] });
      await qc.invalidateQueries({ queryKey: ['events'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2">
            <Ban className="h-4 w-4" /> Ingresso cancelado
          </span>
        ),
        description: 'O status do ingresso foi marcado como CANCELLED.',
        duration: 4500,
      });
    },
    onError: (e: ApiError) => {
      toast({
        variant: 'destructive',
        title: (
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Não foi possível cancelar
          </span>
        ),
        description: messageFromPayload(e.payload) || 'Tente novamente.',
        duration: 5500,
      });
    },
  });
}
