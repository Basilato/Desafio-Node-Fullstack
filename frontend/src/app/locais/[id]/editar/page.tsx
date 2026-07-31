'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useVenue } from '@/hooks/use-venue';
import { UpdateVenueForm } from '@/components/forms/create-venue-form';
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
  Building2,
  Home as HomeIcon,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { VenueRecent } from '@/lib/api/venues';

export default function EditarLocalPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const venueId = params?.id ?? null;

  const { data: venue, isLoading, isError } = useVenue(venueId);

  const onSuccess = React.useCallback(
    (v: VenueRecent) => {
      router.replace(`/locais/${v.id}`);
    },
    [router],
  );

  const onCancel = React.useCallback(() => {
    if (venueId) router.push(`/locais/${venueId}`);
    else router.push('/locais');
  }, [router, venueId]);

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
            href="/locais"
            className="hover:text-foreground transition-colors"
          >
            Locais
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {venueId ? (
            <Link
              href={`/locais/${venueId}`}
              className="hover:text-foreground transition-colors"
            >
              {isLoading ? 'Carregando…' : venue?.name ?? 'Local'}
            </Link>
          ) : (
            <span>Local</span>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Editar</span>
        </nav>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href={venueId ? `/locais/${venueId}` : '/locais'}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 grid place-items-center rounded-2xl bg-gradient-to-br from-accent/50 to-accent-foreground/15 ring-1 ring-border/40 shadow-soft">
            <Building2 className="h-6 w-6 text-accent-foreground/90" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar local</h1>
            <p className="text-sm text-muted-foreground">
              Atualize os dados cadastrais. Portões e liberações continuam na página de detalhes.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border/70 shadow-xl shadow-black/20 bg-card/60 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-5">
          <CardTitle className="text-xl">Dados do local</CardTitle>
          <CardDescription>
            Os campos marcados com <span className="text-accent">*</span> são
            obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Carregando dados do local…</span>
            </div>
          ) : isError || !venue ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="text-muted-foreground">
                Não foi possível carregar os dados do local.
              </p>
              <Button asChild size="sm">
                <Link href="/locais">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar para Locais
                </Link>
              </Button>
            </div>
          ) : (
            <UpdateVenueForm initialData={venue} onSuccess={onSuccess} onCancel={onCancel} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
