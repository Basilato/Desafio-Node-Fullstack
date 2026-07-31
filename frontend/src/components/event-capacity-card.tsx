'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Ticket,
  Users,
  Sparkles,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import { useEventCapacity } from '@/hooks/use-tickets';
import { TICKET_CATEGORY_LABELS } from '@/lib/api/ticket-types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

export function EventCapacityCard({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, refetch } = useEventCapacity(eventId);

  if (isLoading) {
    return (
      <Card className="rounded-3xl border-white/5 overflow-hidden">
        <CardHeader className="pb-4 pt-5 border-b border-border/50">
          <Skeleton className="h-5 w-56 rounded-lg" />
          <Skeleton className="h-3.5 w-80 rounded-lg mt-1.5" />
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="rounded-3xl border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 grid place-items-center ring-1 ring-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="font-bold tracking-tight">
                Não foi possível carregar os dados de capacidade
              </p>
              <p className="text-xs text-muted-foreground">
                Recarregue a página ou clique em tentar novamente.
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2"
          >
            Tentar novamente
          </button>
        </CardContent>
      </Card>
    );
  }

  const { venueCapacity, emittedCount, remaining, soldByType } = data;
  const pct = venueCapacity > 0 ? Math.min(100, (emittedCount / venueCapacity) * 100) : 0;
  const soldOut = venueCapacity > 0 && emittedCount >= venueCapacity;
  const near = pct >= 80 && !soldOut;

  return (
    <Card className="rounded-3xl border-white/5 overflow-hidden">
      <CardHeader className="pb-4 pt-5 border-b border-border/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Ticket className="h-3.5 w-3.5" />
            </span>
            Capacidade, ocupação e tipos
          </CardTitle>
          <CardDescription>
            Visão em tempo real de ingressos emitidos vs capacidade do{' '}
            <strong>{data.venueName}</strong>.
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-[11px] font-semibold tracking-wide uppercase shrink-0',
            soldOut
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : near
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
          )}
        >
          {soldOut
            ? 'ESGOTADO'
            : near
              ? `Últimos ${fmt(remaining)} disponíveis`
              : 'Vendas abertas'}
        </Badge>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Painel principal */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
          <div className="flex flex-wrap items-start justify-between gap-5 mb-4">
            <div className="inline-flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Ticket className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Ingressos emitidos
                </p>
                <p className="text-2xl font-extrabold tracking-tight">
                  {fmt(emittedCount)}
                  <span className="ml-1.5 text-sm font-semibold text-muted-foreground">
                    / {fmt(venueCapacity)}
                  </span>
                </p>
              </div>
            </div>

            <div className="text-right min-w-[12ch]">
              <p
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-wider opacity-80',
                  soldOut
                    ? 'text-destructive'
                    : near
                      ? 'text-warning'
                      : 'text-primary',
                )}
              >
                Ocupação
              </p>
              <p
                className={cn(
                  'text-3xl font-black font-mono tracking-tight leading-none',
                  soldOut
                    ? 'text-destructive'
                    : near
                      ? 'text-warning'
                      : 'text-primary',
                )}
              >
                {pct.toFixed(0)}%
              </p>
            </div>
          </div>

          <Progress
            value={pct}
            className={
              'h-2.5 rounded-full bg-muted/50 [&>div]:transition-all [&>div]:duration-500 [&>div]:rounded-full ' +
              (soldOut
                ? '[&>div]:bg-gradient-to-r [&>div]:from-destructive [&>div]:to-destructive/90'
                : near
                  ? '[&>div]:bg-gradient-to-r [&>div]:from-warning [&>div]:to-warning/90'
                  : '[&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/90')
            }
          />

          <div className="flex items-center justify-between mt-3.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Capacidade do venue
            </span>
            <span className="font-mono inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              {venueCapacity > 0
                ? `${fmt(remaining)} disponíveis`
                : 'Local sem capacidade definida'}
            </span>
          </div>
        </div>

        {/* Quebra por tipo */}
        <div className="rounded-2xl border border-border/60 bg-muted/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold tracking-tight inline-flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
                <Ticket className="h-3.5 w-3.5" />
              </span>
              Vendas por tipo de ingresso
            </p>
            <p className="text-[11px] text-muted-foreground">
              {soldByType.length} tipo{soldByType.length === 1 ? '' : 's'} com vendas
            </p>
          </div>

          {soldByType.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 flex flex-col items-center justify-center gap-2 text-center">
              <Ban className="h-7 w-7 text-muted-foreground/70" />
              <p className="text-sm font-semibold text-muted-foreground">
                Nenhum ingresso emitido ainda
              </p>
              <p className="text-xs text-muted-foreground/80">
                Use o botão <strong>&quot;Emitir ingresso&quot;</strong> no topo para cadastrar o primeiro.
              </p>
            </div>
          ) : (
            <ul className="space-y-3.5">
              {soldByType.map((row) => {
                const total = Object.values(row.totals).reduce((a, b) => a + b, 0);
                const price = Number(row.ticketType.price || 0);
                const active = row.totals['ACTIVE'] ?? 0;
                const used = row.totals['USED'] ?? 0;
                const cancelled = row.totals['CANCELLED'] ?? 0;
                return (
                  <li
                    key={row.ticketType.id}
                    className="rounded-xl border border-border/60 bg-background/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-primary/30 via-primary/20 to-primary-foreground/15 ring-1 ring-white/10 grid place-items-center">
                          <Ticket className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold tracking-tight truncate max-w-[28ch]">
                            {row.ticketType.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 h-5 text-[10px] font-mono uppercase bg-muted/40 border-border"
                            >
                              {TICKET_CATEGORY_LABELS[
                                row.ticketType.category as keyof typeof TICKET_CATEGORY_LABELS
                              ] ?? row.ticketType.category}
                            </Badge>
                            <span className="font-semibold">{currencyBRL(price)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black tracking-tight leading-none">
                          {fmt(total)}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          emitidos
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <MiniStat label="Ativos" value={active} tone="ok" />
                      <MiniStat label="Usados" value={used} tone="muted" />
                      <MiniStat label="Cancelados" value={cancelled} tone="bad" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'ok' | 'muted' | 'bad';
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-2.5 py-1.5',
        tone === 'ok' &&
          'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
        tone === 'muted' && 'border-border bg-muted/30 text-muted-foreground',
        tone === 'bad' && 'border-rose-500/20 bg-rose-500/5 text-rose-300',
      )}
    >
      <p className="text-[9px] uppercase tracking-wider font-semibold opacity-80">
        {label}
      </p>
      <p className="text-sm font-black font-mono leading-tight">{fmt(value)}</p>
    </div>
  );
}
