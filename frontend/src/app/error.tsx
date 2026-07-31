'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [showDetail, setShowDetail] = React.useState(false);

  const visibleMsg =
    error?.message?.trim() && !error.message.toLowerCase().includes('digest')
      ? error.message
      : 'Ops, ocorreu um erro inesperado ao carregar essa página.';

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16">
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
          {error?.digest && (
            <p className="text-[11px] text-muted-foreground font-mono">
              ref: {error.digest}
            </p>
          )}
          {showDetail && error?.stack && (
            <pre className="mt-4 p-4 text-left text-[11px] bg-black/5 border border-border rounded-lg overflow-auto max-h-60 text-muted-foreground whitespace-pre-wrap break-words">
              {error.stack}
            </pre>
          )}
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

        <div className="flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setShowDetail((s) => !s)}
          >
            {showDetail ? 'Ocultar detalhes' : 'Exibir detalhes técnicos'}
          </Button>
          <Button asChild variant="link" size="sm" className="text-xs text-muted-foreground">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
