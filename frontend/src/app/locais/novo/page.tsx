'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateVenueForm } from '@/components/forms/create-venue-form';
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
} from 'lucide-react';
import type { VenueRecent } from '@/lib/api/venues';

export default function NovoLocalPage() {
  const router = useRouter();

  const onSuccess = React.useCallback(
    (venue: VenueRecent) => {
      router.replace(`/locais/${venue.id}`);
    },
    [router],
  );

  const onCancel = React.useCallback(() => {
    router.push('/locais');
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
            href="/locais"
            className="hover:text-foreground transition-colors"
          >
            Locais
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Novo local</span>
        </nav>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/locais">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 grid place-items-center rounded-2xl bg-gradient-to-br from-localis-venue/80 to-emerald-900/70 ring-1 ring-white/10 shadow-lg shadow-emerald-900/30">
            <Building2 className="h-6 w-6 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Criar novo local</h1>
            <p className="text-sm text-muted-foreground">
              Preencha os campos abaixo. Portões e liberações poderão ser configurados
              depois na página do local.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border/70 shadow-xl shadow-black/20 bg-card/60 backdrop-blur">
        <CardHeader className="border-b border-border/50 pb-5">
          <CardTitle className="text-xl">Dados do local</CardTitle>
          <CardDescription>
            Os campos marcados com <span className="text-emerald-400">*</span> são
            obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <CreateVenueForm
            mode="create"
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
