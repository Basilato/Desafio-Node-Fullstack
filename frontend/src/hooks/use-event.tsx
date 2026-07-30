'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEvent,
  deleteEvent,
  getEventById,
  updateEvent,
  type ConflictErrorDetail,
  type CreateEventPayload,
  type EventRecent,
  type UpdateEventPayload,
} from '@/lib/api/events';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ApiError, ApiErrorPayload } from '@/lib/api/http';

type ConflictPayload = ApiErrorPayload & ConflictErrorDetail;

function getConflictPayload(
  e: ApiError,
): { isConflict: true; detail: ConflictPayload } | { isConflict: false; payload: ApiErrorPayload | null } {
  const p = e.payload;
  if (p && e.status === 409 && typeof (p as ApiErrorPayload).error === 'string' && (p as ApiErrorPayload).error === 'ScheduleConflict') {
    return { isConflict: true, detail: p as ConflictPayload };
  }
  return { isConflict: false, payload: p };
}

function messageFromPayload(p: ApiErrorPayload | null | undefined): string {
  if (!p) return '';
  return Array.isArray(p.message)
    ? p.message.join(' · ')
    : (p.message as string | undefined) ?? '';
}

function formatBRDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
      .format(new Date(iso))
      .replace('.', '');
  } catch {
    return iso;
  }
}

export function useEvent(id: string | null | undefined, enabled = true) {
  const queryKey = ['events', 'detail', id] as const;
  const q = useQuery({
    queryKey,
    queryFn: () => getEventById(id!),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    enabled: enabled && !!id,
  });
  return q;
}

export function useCreateEventMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: async (evt) => {
      await qc.invalidateQueries({ queryKey: ['events'] });
      await qc.invalidateQueries({ queryKey: ['venues'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-rose-400 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Evento criado!
          </span>
        ),
        description: (
          <>
            <strong>{evt.name}</strong> em {evt.venue?.name} — {formatBRDateTime(evt.startDate)}.
          </>
        ),
        duration: 5500,
      });
    },
    onError: (e: ApiError) => {
      const conflict = getConflictPayload(e);
      if (conflict.isConflict) {
        const detail = conflict.detail;
        toast({
          variant: 'destructive',
          title: '⚠️ Conflito de agenda',
          description: (
            <>
              Já existe{' '}
              <strong className="underline decoration-rose-500/60 underline-offset-2">
                {detail.conflict.name}
              </strong>{' '}
              no mesmo local e horário
              <br />
              <span className="text-xs opacity-90">
                {formatBRDateTime(detail.conflict.start)} →{' '}
                {formatBRDateTime(detail.conflict.end)}
              </span>
            </>
          ),
          duration: 8000,
        });
      } else {
        const msg = messageFromPayload(conflict.payload) || 'Tente novamente.';
        toast({
          variant: 'destructive',
          title: 'Não foi possível criar o evento',
          description: msg,
          duration: 6000,
        });
      }
    },
  });
}

export function useUpdateEventMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEventPayload }) =>
      updateEvent(id, payload),
    onSuccess: async (evt) => {
      await qc.invalidateQueries({ queryKey: ['events'] });
      await qc.invalidateQueries({ queryKey: ['events', 'detail', evt.id] });
      await qc.invalidateQueries({ queryKey: ['venues'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-rose-400 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Evento atualizado!
          </span>
        ),
        description: `${evt.name} teve seus dados atualizados com sucesso.`,
        duration: 5500,
      });
    },
    onError: (e: ApiError) => {
      const conflict = getConflictPayload(e);
      if (conflict.isConflict) {
        const detail = conflict.detail;
        toast({
          variant: 'destructive',
          title: '⚠️ Conflito de agenda',
          description: (
            <>
              Já existe{' '}
              <strong className="underline decoration-rose-500/60 underline-offset-2">
                {detail.conflict.name}
              </strong>{' '}
              no mesmo local e horário
              <br />
              <span className="text-xs opacity-90">
                {formatBRDateTime(detail.conflict.start)} →{' '}
                {formatBRDateTime(detail.conflict.end)}
              </span>
            </>
          ),
          duration: 8000,
        });
      } else {
        const msg = messageFromPayload(conflict.payload) || 'Verifique os campos e tente novamente.';
        toast({
          variant: 'destructive',
          title: 'Não foi possível atualizar o evento',
          description: msg,
          duration: 6000,
        });
      }
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: async (_, id) => {
      await qc.invalidateQueries({ queryKey: ['events'] });
      await qc.invalidateQueries({ queryKey: ['events', 'detail', id] });
      await qc.invalidateQueries({ queryKey: ['venues'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-rose-400 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Evento excluído
          </span>
        ),
        description: 'O evento foi removido da agenda.',
        duration: 5000,
      });
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/eventos/')) {
        router.push('/eventos');
      }
    },
    onError: (e: ApiError) => {
      const msg = messageFromPayload(e.payload) || 'Tente novamente mais tarde.';
      toast({
        variant: 'destructive',
        title: (
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Não foi possível excluir
          </span>
        ),
        description: msg,
        duration: 7000,
      });
      throw e;
    },
  });
}

export type { CreateEventPayload, UpdateEventPayload, EventRecent, ConflictErrorDetail };
