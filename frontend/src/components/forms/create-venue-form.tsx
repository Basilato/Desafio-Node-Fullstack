'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  type CreateVenuePayload,
  type UpdateVenuePayload,
  type VenueRecent,
} from '@/lib/api/venues';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, MapPinHouse } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCreateVenueMutation,
  useUpdateVenueMutation,
} from '@/hooks/use-venue';

type VenueFormMode = 'create' | 'update';

interface CreateVenueFormProps {
  mode?: VenueFormMode;
  initialData?: VenueRecent;
  onSuccess?: (venue: VenueRecent) => void;
  onCancel?: () => void;
}

interface GateDraft {
  _key: string;
  name: string;
  identifier: string;
  description?: string;
}

function makeGate(partial?: Partial<GateDraft>): GateDraft {
  return {
    _key: crypto.randomUUID(),
    name: '',
    identifier: '',
    description: '',
    ...partial,
  };
}

function validateEmail(email: string) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function _errorsToMessage(msgs?: unknown): string {
  if (!msgs) return 'Verifique os campos e tente novamente.';
  if (Array.isArray(msgs)) return msgs.join(' · ');
  return typeof msgs === 'string' ? msgs : 'Verifique os campos e tente novamente.';
}

export function CreateVenueForm({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
}: CreateVenueFormProps) {
  const _queryClient = useQueryClient();
  void _queryClient;

  const resolvedMode: VenueFormMode = initialData ? 'update' : mode;
  const venueId = initialData?.id;

  const [name, setName] = React.useState(initialData?.name ?? '');
  const [capacity, setCapacity] = React.useState<string>(
    initialData ? String(initialData.capacity) : '',
  );
  const [address, setAddress] = React.useState(initialData?.address ?? '');
  const [city, setCity] = React.useState(initialData?.city ?? '');
  const [state, setState] = React.useState(initialData?.state ?? '');
  const [zipCode, setZipCode] = React.useState(initialData?.zipCode ?? '');
  const [email, setEmail] = React.useState(initialData?.email ?? '');
  const [phone, setPhone] = React.useState(initialData?.phone ?? '');
  const [description, setDescription] = React.useState(initialData?.description ?? '');
  const [gates, setGates] = React.useState<GateDraft[]>(() => {
    if (initialData?.gates?.length) {
      return initialData.gates.map((g) =>
        makeGate({
          name: g.name,
          identifier: g.identifier,
          description: g.description ?? '',
        }),
      );
    }
    return [makeGate(), makeGate(), makeGate()];
  });
  const [formError, setFormError] = React.useState<string | null>(null);

  const createMutation = useCreateVenueMutation();
  const updateMutation = useUpdateVenueMutation();
  const activeMutation = resolvedMode === 'create' ? createMutation : updateMutation;
  const busy = activeMutation.isPending;

  function updateGate(key: string, patch: Partial<GateDraft>) {
    setGates((arr) => arr.map((g) => (g._key === key ? { ...g, ...patch } : g)));
  }
  function removeGate(key: string) {
    setGates((arr) => (arr.length > 1 ? arr.filter((g) => g._key !== key) : arr));
  }
  function addGate() {
    setGates((arr) => [...arr, makeGate()]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const errs: string[] = [];
    if (!name.trim()) errs.push('Nome do local é obrigatório.');
    const cap = Number(capacity);
    if (!capacity || Number.isNaN(cap) || cap <= 0)
      errs.push('Capacidade deve ser um número maior que zero.');
    if (!address.trim()) errs.push('Endereço é obrigatório.');
    if (!validateEmail(email)) errs.push('E-mail inválido.');

    const gatesPayload = gates
      .map((g) => ({
        name: g.name.trim() || `Portão ${g.identifier.toUpperCase()}`,
        identifier: g.identifier.trim().toUpperCase(),
        description: g.description?.trim() || undefined,
      }))
      .filter((g) => g.identifier);
    if (gatesPayload.length === 0)
      errs.push('Cadastre pelo menos um portão com identificador.');
    if (new Set(gatesPayload.map((g) => g.identifier)).size !== gatesPayload.length) {
      errs.push('Identificadores de portão devem ser únicos.');
    }

    if (errs.length) {
      setFormError(errs.join(' '));
      return;
    }

    const payload = {
      name: name.trim(),
      capacity: cap,
      address: address.trim(),
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      zipCode: zipCode.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      description: description.trim() || undefined,
      gates: gatesPayload,
    };

    if (resolvedMode === 'create') {
      createMutation.mutate(payload as CreateVenuePayload, {
        onSuccess: (v) => onSuccess?.(v),
      });
    } else if (venueId) {
      updateMutation.mutate(
        { id: venueId, payload: payload as UpdateVenuePayload },
        { onSuccess: (v) => onSuccess?.(v) },
      );
    }
  }

  const isUpdate = resolvedMode === 'update';

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4 pt-2">
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="flex items-center gap-3 rounded-2xl border border-localis-venue/30 bg-localis-venue/10 px-4 py-3">
          <div className="h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br from-localis-venue/60 to-emerald-900/60 ring-1 ring-white/10">
            <MapPinHouse className="h-5 w-5 text-emerald-100" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-emerald-100">
              {isUpdate ? 'Editar local' : 'Novo local'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {isUpdate
                ? 'Atualize os dados básicos ou altere os portões de acesso.'
                : 'Defina os dados básicos e os portões de acesso.'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome do local *" error={!name && !!formError}>
            <Input
              disabled={busy}
              placeholder="Ex: Allianz Parque"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Capacidade *" error={!capacity && !!formError}>
            <Input
              type="number"
              min={1}
              disabled={busy}
              placeholder="Ex: 43713"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </Field>
          <Field label="Endereço *" className="sm:col-span-2" error={!address && !!formError}>
            <Input
              disabled={busy}
              placeholder="Av. Francisco Matarazzo, 1705"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Field>
          <Field label="Cidade">
            <Input
              disabled={busy}
              placeholder="São Paulo"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Field>
          <Field label="Estado (UF)">
            <Input
              disabled={busy}
              maxLength={2}
              placeholder="SP"
              className="uppercase"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
            />
          </Field>
          <Field label="CEP">
            <Input
              disabled={busy}
              placeholder="05001-200"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </Field>
          <Field label="E-mail">
            <Input
              type="email"
              disabled={busy}
              placeholder="contato@local.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Telefone">
            <Input
              disabled={busy}
              placeholder="(11) 3000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field label="Descrição (opcional)" className="sm:col-span-2">
            <textarea
              disabled={busy}
              rows={3}
              placeholder="Alguma informação útil sobre o local, acessibilidade, etc."
              className={cn(
                'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight">Portões de acesso</h3>
            <p className="text-xs text-muted-foreground">
              Adicione pelo menos um portão com identificador único (C, D, 5, 12…).
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addGate}
            disabled={busy}
            className="gap-1.5"
          >
            <PlusCircle className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {gates.map((g, i) => (
            <div
              key={g._key}
              className="grid grid-cols-[auto,1fr,1fr,1.6fr,auto] items-end gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
            >
              <span className="text-xs font-mono text-muted-foreground self-center pl-1">
                #{i + 1}
              </span>
              <Field label="Identificador" small>
                <Input
                  value={g.identifier}
                  disabled={busy}
                  maxLength={6}
                  placeholder="C"
                  className="uppercase"
                  onChange={(e) => updateGate(g._key, { identifier: e.target.value })}
                />
              </Field>
              <Field label="Nome" small>
                <Input
                  value={g.name}
                  disabled={busy}
                  placeholder="Portão Principal"
                  onChange={(e) => updateGate(g._key, { name: e.target.value })}
                />
              </Field>
              <Field label="Descrição" small>
                <Input
                  value={g.description}
                  disabled={busy}
                  placeholder="Acesso leste, cadeiras inferiores"
                  onChange={(e) => updateGate(g._key, { description: e.target.value })}
                />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeGate(g._key)}
                disabled={busy || gates.length === 1}
                className="text-muted-foreground hover:text-rose-500"
                aria-label="Remover portão"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {formError && (
          <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            ⚠️ {formError}
          </div>
        )}
      </ScrollArea>

      <div className="mt-2 flex items-center justify-between gap-3 pt-2 border-t border-border">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={busy}
          className="text-muted-foreground"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={busy}
          className="bg-gradient-to-r from-localis-venue to-emerald-600 hover:from-localis-venue hover:to-emerald-500 text-white shadow-lg shadow-emerald-900/30 min-w-[160px]"
        >
          {busy ? 'Salvando…' : isUpdate ? 'Salvar alterações' : 'Cadastrar local'}
        </Button>
      </div>
    </form>
  );
}

export function UpdateVenueForm(props: Omit<CreateVenueFormProps, 'mode' | 'initialData'> & {
  initialData: VenueRecent;
}) {
  return <CreateVenueForm {...props} mode="update" initialData={props.initialData} />;
}

function Field({
  label,
  children,
  className,
  error,
  small,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  error?: boolean;
  small?: boolean;
}) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span
        className={cn(
          'font-medium',
          small ? 'text-[11px] text-muted-foreground' : 'text-xs text-muted-foreground',
          error && 'text-rose-400',
        )}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
