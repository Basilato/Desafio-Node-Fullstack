'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEvent } from '@/hooks/use-event';
import { UpdateEventForm } from '@/components/forms/create-event-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ChevronRight,
  CalendarPlus2,
  Home as HomeIcon,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { EventRecent } from '@/lib/api/events';

export default function EditarEventoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params?.id ?? null;

  const { data: event, isLoading, isError } = useEvent(eventId);

  const onSuccess = React.useCallback(
    (ev: EventRecent) => {
      router.replace(`/eventos/${ev.id}`);
    },
    [router],
  );

  const onCancel = React.useCallback(() => {
    if (eventId) router.push(`/eventos/${eventId}`);
    else router.push('/eventos');
  }, [router, eventId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            Início
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/eventos"
            className="hover:text-foreground transition-colors"
          >
            Eventos
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {eventId ? (
            <Link
              href={`/eventos/${eventId}`}
              className="hover:text-foreground transition-colors"
            >
              {isLoading ? 'Carregando…' : event?.name ?? 'Evento'}
            </Link>
          ) : (
            <span>Evento</span>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Editar</span>
        </nav>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href={eventId ? `/eventos/${eventId}` : '/eventos'}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 grid place-items-center rounded-2xl bg-gradient-to-br from-primary/50 to-primary-foreground/15 ring-1 ring-border/40 shadow-soft">
            <CalendarPlus2 className="h-6 w-6 text-primary-foreground/90" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar evento</h1>
            <p className="text-sm text-muted-foreground">
              Atualize os dados do evento. Conflitos de agenda serão detectados
              automaticamente antes de salvar.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border/70 shadow-xl shadow-black/20 bg-card/60 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-5">
          <CardTitle className="text-xl">Dados do evento</CardTitle>
          <CardDescription>
            Os campos marcados com <span className="text-primary">*</span> são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 h-[72vh] max-h-[72vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Carregando dados do evento…</span>
            </div>
          ) : isError || !event ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="text-muted-foreground">
                Não foi possível carregar os dados do evento.
              </p>
              <Button asChild size="sm">
                <Link href="/eventos">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar para Eventos
                </Link>
              </Button>
            </div>
          ) : (
            <UpdateEventForm initialData={event} onSuccess={onSuccess} onCancel={onCancel} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
