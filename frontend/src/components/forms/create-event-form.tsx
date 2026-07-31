'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type ConflictErrorDetail,
  type CreateEventPayload,
  type EventRecent,
  type UpdateEventPayload,
} from '@/lib/api/events';
import { listVenues, type VenueRecent } from '@/lib/api/venues';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  CalendarClock,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_META, type EventCategoryKey } from '@/components/category-badge';
import {
  useCreateEventMutation,
  useEventAvailability,
  useUpdateEventMutation,
} from '@/hooks/use-event';

type EventFormMode = 'create' | 'update';

interface CreateEventFormProps {
  mode?: EventFormMode;
  initialData?: EventRecent;
  defaultVenueId?: string;
  onSuccess?: (event: EventRecent) => void;
  onCancel?: () => void;
}

const CATEGORY_OPTIONS: Array<{ key: EventCategoryKey; label: string }> = Object.entries(
  CATEGORY_META,
).map(([k, v]) => ({ key: k as EventCategoryKey, label: v.label }));

function toLocalInput(iso?: string | Date): string {
  const d = iso ? (iso instanceof Date ? iso : new Date(iso)) : new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addHours(d: Date, h: number): Date {
  const copy = new Date(d);
  copy.setHours(copy.getHours() + h);
  return copy;
}

function formatBRDateTime(iso: string) {
  try {
    return Intl.DateTimeFormat('pt-BR', {
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

export function CreateEventForm({
  mode = 'create',
  initialData,
  defaultVenueId = '',
  onSuccess,
  onCancel,
}: CreateEventFormProps) {
  useQueryClient();

  const resolvedMode: EventFormMode = initialData ? 'update' : mode;
  const eventId = initialData?.id;

  const [name, setName] = React.useState(initialData?.name ?? '');
  const [description, setDescription] = React.useState(initialData?.description ?? '');
  const [category, setCategory] = React.useState<EventCategoryKey | ''>(
    initialData?.category ?? '',
  );
  const [venueId, setVenueId] = React.useState(
    initialData?.venueId ?? defaultVenueId,
  );
  const now = new Date();
  const [startLocal, setStartLocal] = React.useState(
    initialData?.startDate
      ? toLocalInput(initialData.startDate)
      : toLocalInput(addHours(now, 24)),
  );
  const [endLocal, setEndLocal] = React.useState(
    initialData?.endDate
      ? toLocalInput(initialData.endDate)
      : toLocalInput(addHours(now, 27)),
  );
  const [formError, setFormError] = React.useState<string | null>(null);

  const startIso = React.useMemo(() => {
    const d = new Date(startLocal);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }, [startLocal]);
  const endIso = React.useMemo(() => {
    const d = new Date(endLocal);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }, [endLocal]);

  const venuesQ = useQuery({
    queryKey: ['venues', 'select-choices'] as const,
    queryFn: () => listVenues({ page: 1, perPage: 200 }),
    staleTime: 1000 * 60 * 10,
  });
  const venueOptions = venuesQ.data?.items ?? [];

  const avail = useEventAvailability({
    venueId,
    startIso,
    endIso,
    excludeEventId: eventId,
  });

  const createMutation = useCreateEventMutation();
  const updateMutation = useUpdateEventMutation();
  const activeMutation = resolvedMode === 'create' ? createMutation : updateMutation;
  const busy = activeMutation.isPending;

  const submitDisabled = busy || avail.available === false;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const errs: string[] = [];
    if (!name.trim()) errs.push('Nome do evento é obrigatório.');
    if (!category) errs.push('Selecione a categoria do evento.');
    if (!venueId) errs.push('Selecione o local do evento.');

    const start = new Date(startLocal);
    const end = new Date(endLocal);
    if (Number.isNaN(start.getTime())) errs.push('Data/hora de início inválidas.');
    if (Number.isNaN(end.getTime())) errs.push('Data/hora de término inválidas.');
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      if (end.getTime() <= start.getTime())
        errs.push('Término deve ser posterior ao início.');
      else if (end.getTime() - start.getTime() < 10 * 60 * 1000)
        errs.push('Duração mínima é de 10 minutos.');
    }

    if (errs.length) {
      setFormError(errs.join(' '));
      return;
    }

    const base = {
      name: name.trim(),
      description: description.trim() || undefined,
      category: category as EventCategoryKey,
      venueId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };

    if (resolvedMode === 'create') {
      createMutation.mutate(base as CreateEventPayload, {
        onSuccess: (ev) => onSuccess?.(ev),
      });
    } else if (eventId) {
      updateMutation.mutate(
        { id: eventId, payload: base as UpdateEventPayload },
        { onSuccess: (ev) => onSuccess?.(ev) },
      );
    }
  }

  const isUpdate = resolvedMode === 'update';

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4 pt-2">
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
          <div className="h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br from-primary/40 to-primary-foreground/15 ring-1 ring-white/10">
            <CalendarDays className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-primary-foreground">
              {isUpdate ? 'Editar evento' : 'Novo evento'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {isUpdate
                ? 'Atualize local, categoria e datas (conflitos serão detectados automaticamente).'
                : 'Defina local, categoria e datas (conflitos serão detectados automaticamente).'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome do evento *" className="sm:col-span-2">
            <Input
              disabled={busy}
              placeholder="Ex: Final do Brasileirão 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Categoria *">
            <select
              disabled={busy}
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategoryKey | '')}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                !category && 'text-muted-foreground',
              )}
            >
              <option value="">Selecione uma categoria…</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Local *">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <select
                disabled={busy || venuesQ.isLoading}
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  !venueId && 'text-muted-foreground',
                )}
              >
                <option value="">
                  {venuesQ.isLoading ? 'Carregando locais…' : 'Selecione um local…'}
                </option>
                {venueOptions.map((v: VenueRecent) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                    {v.city ? ` · ${v.city}${v.state ? '/' + v.state : ''}` : ''} ·{' '}
                    {v.capacity.toLocaleString('pt-BR')} lugares
                  </option>
                ))}
              </select>
            </div>
          </Field>

          <Field label="Início *">
            <div className="relative">
              <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="datetime-local"
                disabled={busy}
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                className="pl-9"
              />
            </div>
          </Field>
          <Field label="Término *">
            <div className="relative">
              <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="datetime-local"
                disabled={busy}
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
                className="pl-9"
              />
            </div>
          </Field>

          <Field label="Descrição (opcional)" className="sm:col-span-2">
            <textarea
              disabled={busy}
              rows={4}
              placeholder="Atrações, horário dos portões, instruções importantes…"
              className={cn(
                'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </div>

        <Separator className="my-6" />

        <AvailabilityBanner avail={avail} />

        {formError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 mb-4">
            ⚠️ {formError}
          </div>
        )}

        <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs text-muted-foreground">
          💡 Regras aplicadas automaticamente:
          <ul className="mt-2 space-y-1 list-disc pl-5 marker:text-primary">
            <li>Data e hora de término deve ser posterior ao início.</li>
            <li>Duração mínima de 10 minutos.</li>
            <li>Conflito de agenda com outro evento no mesmo local retorna erro detalhado.</li>
          </ul>
        </div>
      </ScrollArea>

      <div className="mt-2 flex items-center justify-between gap-3 pt-2 border-t border-border">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={busy}
          className="text-muted-foreground"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={submitDisabled}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/90 text-white shadow-lg shadow-soft min-w-[160px]"
        >
          {busy
            ? 'Salvando…'
            : avail.available === false
              ? 'Horário conflitante'
              : isUpdate
                ? 'Salvar alterações'
                : 'Criar evento'}
        </Button>
      </div>
    </form>
  );
}

export function UpdateEventForm(props: Omit<CreateEventFormProps, 'mode' | 'initialData' | 'defaultVenueId'> & {
  initialData: EventRecent;
}) {
  return <CreateEventForm {...props} mode="update" initialData={props.initialData} />;
}

type AvailHook = ReturnType<typeof useEventAvailability>;

function AvailabilityBanner({ avail }: { avail: AvailHook }) {
  if (avail.error) {
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-amber-900/10 to-transparent p-4 mb-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold">
          <AlertTriangle className="h-4.5 w-4.5" /> Não foi possível validar disponibilidade
        </div>
        <p className="text-sm text-amber-200/90">
          Verifique a conexão com a API. O submit será bloqueado por segurança.
        </p>
      </div>
    );
  }
  if (!avail.isCheckable) {
    return (
      <div className="rounded-2xl border border-slate-500/30 bg-slate-500/5 p-4 mb-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
          <CalendarDays className="h-4 w-4" /> Preencha local, início e término para validar a agenda.
        </div>
      </div>
    );
  }
  if (avail.isFetching || avail.available === null) {
    return (
      <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 mb-4 space-y-2">
        <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Verificando conflitos na agenda…
        </div>
      </div>
    );
  }
  if (avail.available === false && avail.firstConflict) {
    const c = avail.firstConflict;
    const cStart = c.startDate ?? (c as unknown as { start?: string }).start;
    const cEnd = c.endDate ?? (c as unknown as { end?: string }).end;
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-500/15 via-rose-900/10 to-transparent p-4 mb-4 space-y-2">
        <div className="flex items-center gap-2 text-rose-300 font-bold">
          <AlertTriangle className="h-4.5 w-4.5" /> Horário conflitante na agenda
        </div>
        <p className="text-sm text-rose-200/90">
          Já existe{' '}
          <strong className="text-rose-100 underline decoration-rose-500/60 underline-offset-2">
            {c.name}
          </strong>{' '}
          no mesmo local neste horário. Ajuste as datas ou escolha outro local para poder criar.
        </p>
        <div className="text-xs text-rose-200/70">
          Horário do conflito: {formatBRDateTime(cStart)} → {formatBRDateTime(cEnd)}
        </div>
      </div>
    );
  }
  if (avail.available === true) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-emerald-900/10 to-transparent p-4 mb-4 space-y-1">
        <div className="flex items-center gap-2 text-emerald-300 font-bold">
          <CheckCircle2 className="h-4.5 w-4.5" /> Agenda disponível para o local selecionado
        </div>
        {avail.conflicts.length === 0 && (
          <p className="text-xs text-emerald-200/80">
            Nenhum outro evento foi marcado no intervalo que você escolheu.
          </p>
        )}
      </div>
    );
  }
  return null;
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
