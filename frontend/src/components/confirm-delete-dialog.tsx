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

  const toneButtonVariant = tone === 'danger' ? 'destructive' : 'warning';
  const iconClass =
    tone === 'danger'
      ? 'text-destructive bg-destructive/15 ring-1 ring-destructive/30'
      : 'text-warning-foreground bg-warning/20 ring-1 ring-warning/30';
  const borderTone =
    tone === 'danger' ? 'border-destructive/30' : 'border-warning/30';

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
      <DialogContent className={cn('max-w-md sm:max-w-md', borderTone)}>
        <DialogHeader className="text-left">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'h-11 w-11 grid place-items-center rounded-xl shrink-0',
                iconClass,
              )}
            >
              <AlertTriangle className="h-5.5 w-5.5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <DialogTitle className="text-base font-bold tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Para confirmar, digite{' '}
              <strong className="text-foreground font-semibold">{requiredPhrase}</strong>
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
                canConfirm && tone === 'danger' &&
                  'border-destructive/60 ring-1 ring-destructive/40',
                canConfirm && tone === 'warning' &&
                  'border-warning/60 ring-1 ring-warning/40',
              )}
            />
          </div>
          {error && (
            <div
              className={cn(
                'rounded-xl border px-4 py-2.5 text-sm flex items-start gap-2',
                tone === 'danger'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive-foreground'
                  : 'border-warning/30 bg-warning/10 text-warning-foreground',
              )}
            >
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
            variant={toneButtonVariant as 'destructive' | 'warning'}
            disabled={!canConfirm || busy}
            onClick={handleConfirm}
            className="min-w-[140px]"
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
