'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateEventForm } from '@/components/forms/create-event-form';
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
} from 'lucide-react';
import type { EventRecent } from '@/lib/api/events';

export default function NovoEventoPage() {
  const router = useRouter();

  const onSuccess = React.useCallback(
    (ev: EventRecent) => {
      router.replace(`/eventos/${ev.id}`);
    },
    [router],
  );

  const onCancel = React.useCallback(() => {
    router.push('/eventos');
  }, [router]);

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
          <span className="text-foreground font-medium">Novo evento</span>
        </nav>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/eventos">
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
            <h1 className="text-2xl font-bold tracking-tight">Criar novo evento</h1>
            <p className="text-sm text-muted-foreground">
              Preencha os campos abaixo. Conflitos de agenda serão detectados
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
          <CreateEventForm
            mode="create"
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
