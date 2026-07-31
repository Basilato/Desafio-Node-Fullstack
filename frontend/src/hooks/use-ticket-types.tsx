'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTicketType,
  deleteTicketType,
  listTicketTypes,
  getTicketTypeById,
  updateTicketType,
  type CreateTicketTypePayload,
  type TicketTypeDetail,
  type TicketTypeListResult,
  type UpdateTicketTypePayload,
} from '@/lib/api/ticket-types';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ApiError, ApiErrorPayload } from '@/lib/api/http';

function messageFromPayload(p: ApiErrorPayload | null | undefined): string {
  if (!p) return '';
  return Array.isArray(p.message)
    ? p.message.join(' · ')
    : (p.message as string | undefined) ?? '';
}

export function useTicketTypesList(enabled = true) {
  return useQuery<TicketTypeListResult>({
    queryKey: ['ticket-types', 'list'],
    queryFn: listTicketTypes,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useTicketTypeById(id: string | null | undefined, enabled = true) {
  return useQuery<TicketTypeDetail>({
    queryKey: ['ticket-types', 'detail', id] as const,
    queryFn: () => getTicketTypeById(id!),
    staleTime: 1000 * 60,
    enabled: enabled && !!id,
  });
}

export function useCreateTicketTypeMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (p: CreateTicketTypePayload) => createTicketType(p),
    onSuccess: async (tt) => {
      await qc.invalidateQueries({ queryKey: ['ticket-types'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-rose-400 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Tipo criado
          </span>
        ),
        description: `Tipo de ingresso "${tt.name}" cadastrado com sucesso.`,
        duration: 5000,
      });
    },
    onError: (e: ApiError) => {
      toast({
        variant: 'destructive',
        title: (
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Não foi possível criar
          </span>
        ),
        description: messageFromPayload(e.payload) || 'Tente novamente.',
        duration: 6000,
      });
    },
  });
}

export function useUpdateTicketTypeMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTicketTypePayload;
    }) => updateTicketType(id, payload),
    onSuccess: async (tt) => {
      await qc.invalidateQueries({ queryKey: ['ticket-types'] });
      await qc.invalidateQueries({ queryKey: ['ticket-types', 'detail', tt.id] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-rose-400 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Tipo atualizado
          </span>
        ),
        description: `"${tt.name}" teve seus dados atualizados.`,
        duration: 4500,
      });
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

export function useDeleteTicketTypeMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => deleteTicketType(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['ticket-types'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: 'Tipo excluído',
        description: 'O tipo de ingresso foi removido.',
        duration: 4000,
      });
    },
    onError: (e: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Não foi possível excluir',
        description: messageFromPayload(e.payload) || 'Verifique se não há ingressos emitidos.',
        duration: 6000,
      });
    },
  });
}
