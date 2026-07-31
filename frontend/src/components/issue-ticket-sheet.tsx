'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  Ticket,
  UserCircle2,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { useTicketTypesList } from '@/hooks/use-ticket-types';
import { useCreateTicketMutation, useEventCapacity } from '@/hooks/use-tickets';
import { TICKET_CATEGORY_LABELS } from '@/lib/api/ticket-types';
import { cn } from '@/lib/utils';

const issueSchema = z.object({
  ticketTypeId: z.string().min(1, 'Selecione um tipo de ingresso'),
  holderName: z.string().min(2, 'Nome do titular muito curto').max(180),
  holderEmail: z
    .string()
    .max(180)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' ? undefined : v))
    .pipe(z.string().email('E-mail inválido').optional().or(z.undefined())),
  holderDoc: z
    .string()
    .max(32)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' ? undefined : v)),
  seat: z
    .string()
    .max(40)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' ? undefined : v)),
  pricePaid: z
    .string()
    .max(10)
    .optional()
    .or(z.literal('')),
});

export type IssueTicketForm = z.infer<typeof issueSchema>;

function currencyBRL(v: number): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `R$ ${v}`;
  }
}

function fmt(n: number): string {
  return n.toLocaleString('pt-BR');
}

export function IssueTicketSheet({
  open,
  onOpenChange,
  eventId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  eventId: string;
}) {
  const ticketTypes = useTicketTypesList(open);
  const capacityQ = useEventCapacity(open ? eventId : undefined);
  const emitMutation = useCreateTicketMutation();

  const form = useForm<IssueTicketForm>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      ticketTypeId: '',
      holderName: '',
      holderEmail: '',
      holderDoc: '',
      seat: '',
      pricePaid: '',
    },
    mode: 'onTouched',
  });

  React.useEffect(() => {
    if (!open) {
      form.reset({
        ticketTypeId: '',
        holderName: '',
        holderEmail: '',
        holderDoc: '',
        seat: '',
        pricePaid: '',
      });
    }
  }, [open, form]);

  const selectedTypeId = form.watch('ticketTypeId');
  const selectedType = React.useMemo(
    () =>
      (ticketTypes.data?.items ?? []).find((t) => t.id === selectedTypeId) ??
      null,
    [ticketTypes.data, selectedTypeId],
  );

  const pricePaidRaw = form.watch('pricePaid');
  const resolvedPriceNumber = React.useMemo(() => {
    if (pricePaidRaw !== '' && pricePaidRaw !== undefined && pricePaidRaw !== null) {
      const n = typeof pricePaidRaw === 'number' ? pricePaidRaw : Number(String(pricePaidRaw).replace(/[^0-9]/g, ''));
      if (!Number.isNaN(n)) return n;
    }
    return selectedType ? Number(selectedType.price || 0) : 0;
  }, [pricePaidRaw, selectedType]);

  const remaining = capacityQ.data?.remaining ?? null;
  const isSoldOut =
    remaining !== null &&
    (capacityQ.data?.venueCapacity ?? 0) > 0 &&
    remaining <= 0;

  async function handleSubmit(vals: z.infer<typeof issueSchema>) {
    if (!selectedType) return;
    await emitMutation.mutateAsync({
      eventId,
      ticketTypeId: selectedType.id,
      holderName: vals.holderName,
      holderEmail: vals.holderEmail,
      holderDoc: vals.holderDoc,
      seat: vals.seat,
      pricePaid: resolvedPriceNumber,
    });
    onOpenChange(false);
  }

  const loadingTT = ticketTypes.isLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-localis-event/80 to-rose-900/80 ring-1 ring-white/10">
              <Ticket className="h-4 w-4 text-rose-50" />
            </span>
            Emitir ingresso
          </SheetTitle>
          <SheetDescription>
            Os dados serão validados em tempo real. Caso a capacidade seja
            atingida, a emissão será bloqueada com uma mensagem do backend.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 py-5">
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* Capacidade rápida */}
            <div
              className={cn(
                'rounded-2xl border p-4 flex items-start gap-3',
                isSoldOut
                  ? 'border-rose-500/30 bg-rose-500/10'
                  : (remaining ?? 0) <= Math.max(
                      5,
                      Math.ceil((capacityQ.data?.venueCapacity ?? 1) * 0.1),
                    )
                    ? 'border-amber-500/30 bg-amber-500/10'
                    : 'border-emerald-500/20 bg-emerald-500/5',
              )}
            >
              {isSoldOut ? (
                <div className="h-9 w-9 shrink-0 rounded-lg bg-rose-500/15 grid place-items-center">
                  <Ban className="h-4.5 w-4.5 text-rose-400" />
                </div>
              ) : (
                <div className="h-9 w-9 shrink-0 rounded-lg bg-emerald-500/15 grid place-items-center">
                  <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold tracking-tight">
                  {isSoldOut
                    ? 'Capacidade atingida'
                    : capacityQ.data
                      ? `${fmt(remaining ?? 0)} disponíveis`
                      : 'Carregando capacidade…'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {capacityQ.data
                    ? `${fmt(capacityQ.data.emittedCount)} emitidos de ${fmt(capacityQ.data.venueCapacity)} — ${
                        capacityQ.data.venueName
                      }`
                    : 'Aguardando confirmação de capacidade.'}
                </p>
              </div>
              {isSoldOut && (
                <Badge
                  variant="outline"
                  className="shrink-0 bg-rose-500/20 border-rose-500/40 text-rose-200 uppercase text-[10px]"
                >
                  Esgotado
                </Badge>
              )}
            </div>

            {/* Tipo de ingresso */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="tt_select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo de ingresso
                </Label>
                {selectedType && (
                  <Badge variant="outline" className="text-[10px] uppercase bg-muted/40">
                    {TICKET_CATEGORY_LABELS[selectedType.category as keyof typeof TICKET_CATEGORY_LABELS] ??
                      selectedType.category}
                  </Badge>
                )}
              </div>

              {loadingTT ? (
                <div className="rounded-2xl border border-border/60 p-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border/50 h-24 animate-pulse bg-muted/20"
                    />
                  ))}
                </div>
              ) : (ticketTypes.data?.items?.length ?? 0) === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/15 p-5 text-center">
                  <AlertTriangle className="h-7 w-7 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-bold tracking-tight mb-1">
                    Nenhum tipo de ingresso cadastrado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Antes de emitir ingressos, é necessário criar os tipos em
                    painel.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(ticketTypes.data?.items ?? []).map((t) => {
                    const active = selectedType?.id === t.id;
                    const hasErr =
                      !!form.formState.errors.ticketTypeId && !selectedType?.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          form.setValue('ticketTypeId', t.id, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        className={cn(
                          'group relative text-left rounded-xl border p-3 flex flex-col gap-1.5 transition-all',
                          active
                            ? 'border-localis-event ring-2 ring-localis-event/30 bg-localis-event/5 shadow-lg shadow-rose-900/10'
                            : hasErr
                              ? 'border-rose-500/50 hover:border-rose-500/70 bg-rose-500/5'
                              : 'border-border/70 hover:border-white/15 hover:bg-muted/40',
                        )}
                      >
                        <p className="font-bold text-sm tracking-tight line-clamp-1">
                          {t.name}
                        </p>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                          {TICKET_CATEGORY_LABELS[
                            t.category as keyof typeof TICKET_CATEGORY_LABELS
                          ] ?? t.category}
                        </p>
                        <p className="text-lg font-black tracking-tight mt-0.5 text-localis-event">
                          {currencyBRL(Number(t.price || 0))}
                        </p>
                        {(t._count?.tickets ?? 0) > 0 && (
                          <Badge
                            variant="outline"
                            className="absolute top-2.5 right-2.5 text-[9px] font-mono uppercase h-4 px-1.5 bg-background/70"
                          >
                            {t._count?.tickets ?? 0} emitidos
                          </Badge>
                        )}
                        {active && (
                          <CheckCircle2 className="absolute bottom-3 right-3 h-4.5 w-4.5 text-localis-event" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {form.formState.errors.ticketTypeId && (
                <p className="text-xs text-rose-400 font-semibold">
                  {form.formState.errors.ticketTypeId.message}
                </p>
              )}
            </div>

            <Separator />

            {/* Dados do titular */}
            <div className="space-y-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <UserCircle2 className="h-3.5 w-3.5" />
                Dados do titular
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="holderName">Nome completo *</Label>
                  <Input
                    id="holderName"
                    autoComplete="off"
                    placeholder="Ex: Maria das Neves"
                    {...form.register('holderName')}
                  />
                  {form.formState.errors.holderName && (
                    <p className="text-[11px] text-rose-400 font-semibold">
                      {form.formState.errors.holderName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="holderEmail">E-mail</Label>
                  <Input
                    id="holderEmail"
                    type="email"
                    autoComplete="off"
                    placeholder="titular@email.com"
                    {...form.register('holderEmail')}
                  />
                  {form.formState.errors.holderEmail && (
                    <p className="text-[11px] text-rose-400 font-semibold">
                      {form.formState.errors.holderEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="holderDoc">Documento (CPF/RG)</Label>
                  <Input
                    id="holderDoc"
                    autoComplete="off"
                    placeholder="999.999.999-99"
                    {...form.register('holderDoc')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="seat">Assento / Setor</Label>
                  <Input
                    id="seat"
                    autoComplete="off"
                    placeholder="Ex: A23, Pista Sul, Cadeira 14"
                    {...form.register('seat')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pricePaid" className="flex items-center gap-1.5">
                    Preço pago (BRL)
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-normal">
                      opcional · usa padrão em branco
                    </span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="pricePaid"
                      inputMode="numeric"
                      className="pl-8 font-mono font-semibold text-base"
                      placeholder={
                        selectedType
                          ? currencyBRL(Number(selectedType.price || 0)).replace('R$', '').trim()
                          : '0'
                      }
                      {...form.register('pricePaid')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-localis-event/10 via-transparent to-transparent p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resumo
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold tracking-tight">
                    {selectedType ? selectedType.name : 'Selecione um tipo'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.watch('holderName') || 'Nome do titular'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Subtotal
                  </p>
                  <p className="text-xl font-black tracking-tight text-localis-event">
                    {currencyBRL(resolvedPriceNumber)}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>

        <SheetFooter className="sm:justify-end pt-4 border-t border-border/60 mt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={emitMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={
              emitMutation.isPending ||
              isSoldOut ||
              !form.formState.isValid ||
              !selectedType
            }
            className={
              'bg-gradient-to-r from-localis-event to-rose-600 hover:from-localis-event hover:to-rose-500 text-white shadow-lg shadow-rose-900/20 ' +
              (isSoldOut ? 'cursor-not-allowed opacity-70' : '')
            }
          >
            {emitMutation.isPending ? (
              'Emitindo…'
            ) : isSoldOut ? (
              <>
                <Ban className="h-4 w-4 mr-1.5" />
                Esgotado · não disponível
              </>
            ) : (
              <>
                Emitir ingresso
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
