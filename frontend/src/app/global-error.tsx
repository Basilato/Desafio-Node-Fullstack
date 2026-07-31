'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';

type AppError = Error & { digest?: string };

interface GlobalErrorProps {
  error: AppError;
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const visibleMsg =
    error?.message?.trim() && !error.message.toLowerCase().includes('digest')
      ? error.message
      : 'Ops, ocorreu um erro inesperado ao carregar essa página.';

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center py-16 bg-background text-foreground">
          <div className="max-w-md w-full text-center space-y-6 px-6">
            <div className="mx-auto h-20 w-20 grid place-items-center rounded-3xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 ring-1 ring-amber-500/40 shadow-xl shadow-amber-900/10">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
            </div>

            <div className="space-y-2">
              <p className="text-5xl font-black tracking-tighter text-foreground/80">500</p>
              <h1 className="text-2xl font-bold tracking-tight">Algo deu errado</h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {visibleMsg}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button onClick={reset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Ir para o início
                </Link>
              </Button>
            </div>

            <Button asChild variant="link" size="sm" className="text-xs text-muted-foreground">
              <Link href="javascript:history.back()">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
