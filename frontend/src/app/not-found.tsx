'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPinOff, Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16">
      <div className="max-w-md w-full text-center space-y-6 px-6">
        <div className="mx-auto h-20 w-20 grid place-items-center rounded-3xl bg-gradient-to-br from-muted/60 to-muted/30 ring-1 ring-border/60 shadow-xl shadow-black/10">
          <MapPinOff className="h-10 w-10 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <p className="text-5xl font-black tracking-tighter text-foreground/80">404</p>
          <h1 className="text-2xl font-bold tracking-tight">Página não encontrada</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            A página que você tentou acessar não existe, foi movida ou está temporariamente indisponível.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Ir para o início
            </Link>
          </Button>
          <div className="flex sm:flex-row flex-col items-center gap-2 sm:gap-3">
            <Button asChild variant="outline">
              <Link href="/locais">
                <MapPinOff className="h-4 w-4 mr-2" />
                Ver locais
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/eventos">
                <Search className="h-4 w-4 mr-2" />
                Ver eventos
              </Link>
            </Button>
          </div>
        </div>

        <Button asChild variant="link" size="sm" className="text-xs text-muted-foreground">
          <Link href="javascript:history.back()">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Voltar para a página anterior
          </Link>
        </Button>
      </div>
    </div>
  );
}
