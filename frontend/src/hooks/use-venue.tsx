'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createVenue,
  deleteVenue,
  getVenueById,
  updateVenue,
  type CreateVenuePayload,
  type UpdateVenuePayload,
  type VenueRecent,
} from '@/lib/api/venues';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ApiError, ApiErrorPayload } from '@/lib/api/http';

function messageFromPayload(p: ApiErrorPayload | null | undefined): string {
  if (!p) return '';
  return Array.isArray(p.message)
    ? p.message.join(' · ')
    : (p.message as string | undefined) ?? '';
}

export function useVenue(id: string | null | undefined, enabled = true) {
  const queryKey = ['venues', 'detail', id] as const;
  const q = useQuery({
    queryKey,
    queryFn: () => getVenueById(id!),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    enabled: enabled && !!id,
  });
  return q;
}

export function useCreateVenueMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: createVenue,
    onSuccess: async (venue) => {
      await qc.invalidateQueries({ queryKey: ['venues'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-emerald-500 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Local cadastrado!
          </span>
        ),
        description: `${venue.name} (${venue.city ?? '—'}${venue.state ? ', ' + venue.state : ''}) foi adicionado com ${venue.gates.length} portões.`,
        duration: 5000,
      });
    },
  });
}

export function useUpdateVenueMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVenuePayload }) =>
      updateVenue(id, payload),
    onSuccess: async (venue) => {
      await qc.invalidateQueries({ queryKey: ['venues'] });
      await qc.invalidateQueries({ queryKey: ['venues', 'detail', venue.id] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-emerald-500 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Local atualizado!
          </span>
        ),
        description: `${venue.name} teve seus dados atualizados com sucesso.`,
        duration: 5000,
      });
    },
    onError: (e: ApiError) => {
      const msg = messageFromPayload(e.payload) || 'Verifique os campos e tente novamente.';
      toast({
        variant: 'destructive',
        title: 'Não foi possível atualizar o local',
        description: msg,
        duration: 6000,
      });
    },
  });
}

export function useDeleteVenue() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => deleteVenue(id),
    onSuccess: async (_, id) => {
      await qc.invalidateQueries({ queryKey: ['venues'] });
      await qc.invalidateQueries({ queryKey: ['venues', 'detail', id] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'default',
        title: (
          <span className="inline-flex items-center gap-2 text-emerald-500 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Local excluído
          </span>
        ),
        description: 'O local e seus portões foram removidos da plataforma.',
        duration: 5000,
      });
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/locais/')) {
        router.push('/locais');
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

export type { CreateVenuePayload, UpdateVenuePayload, VenueRecent };
