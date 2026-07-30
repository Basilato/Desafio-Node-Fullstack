'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  itemLabel: string;
  confirmPhrase?: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  tone?: 'danger' | 'warning';
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  itemLabel,
  confirmPhrase,
  confirmButtonLabel = 'Excluir',
  cancelButtonLabel = 'Cancelar',
  onConfirm,
  onCancel,
  tone = 'danger',
}: ConfirmDeleteDialogProps) {
  const [confirmText, setConfirmText] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setConfirmText('');
      setError(null);
    }
  }, [open]);

  const requiredPhrase = confirmPhrase ?? itemLabel;
  const canConfirm =
    requiredPhrase.trim().toLowerCase() === confirmText.trim().toLowerCase();

  const toneClass =
    tone === 'danger'
      ? 'from-rose-500 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-900/40'
      : 'from-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-amber-900/40';
  const iconClass =
    tone === 'danger'
      ? 'text-rose-300 bg-rose-500/20 ring-rose-500/30'
      : 'text-amber-300 bg-amber-500/20 ring-amber-500/30';

  async function handleConfirm() {
    if (!canConfirm) return;
    try {
      setBusy(true);
      setError(null);
      await onConfirm();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        (typeof err === 'object' && err !== null && 'message' in err
          ? typeof (err as { message?: unknown }).message === 'string'
            ? (err as { message: string }).message
            : undefined
          : undefined) ?? 'Não foi possível concluir a exclusão. Tente novamente.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        if (!next) onCancel?.();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md border-rose-500/30">
        <DialogHeader className="text-left">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'h-11 w-11 grid place-items-center rounded-xl ring-1 shrink-0',
                iconClass,
              )}
            >
              <AlertTriangle className="h-5.5 w-5.5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <DialogTitle className="text-base font-bold tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Para confirmar, digite{' '}
              <strong className="text-foreground font-bold">{requiredPhrase}</strong>
            </label>
            <Input
              autoFocus
              value={confirmText}
              disabled={busy}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm) handleConfirm();
              }}
              placeholder={requiredPhrase}
              className={cn(
                'mt-1.5 font-mono tracking-wide',
                canConfirm && 'border-rose-500/60 ring-1 ring-rose-500/40',
              )}
            />
          </div>
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300 flex items-start gap-2">
              <Trash2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="mt-5 gap-2 sm:space-x-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
            disabled={busy}
            className="text-muted-foreground"
          >
            {cancelButtonLabel}
          </Button>
          <Button
            type="button"
            disabled={!canConfirm || busy}
            onClick={handleConfirm}
            className={cn(
              'bg-gradient-to-r text-white shadow-lg min-w-[140px]',
              toneClass,
            )}
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Excluindo…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                {confirmButtonLabel}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
