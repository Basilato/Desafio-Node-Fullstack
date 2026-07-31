'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  DoorOpen,
  BadgeCheck,
  IndianRupee,
  Search,
  X as XIcon,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import {
  useCreateTicketTypeMutation,
  useDeleteTicketTypeMutation,
  useTicketTypesList,
  useUpdateTicketTypeMutation,
} from '@/hooks/use-ticket-types';
import {
  TICKET_CATEGORY_LABELS,
  TicketCategoryKey,
  type TicketTypeSummary,
} from '@/lib/api/ticket-types';
import {
  useAssignGateAllowedTicketTypesMutation,
  useCreateGateMutation,
  useDeleteGateMutation,
  useGatesByVenue,
  useUpdateGateMutation,
} from '@/hooks/use-gates';
import type { GateSummary } from '@/lib/api/gates';
import { cn } from '@/lib/utils';

const ticketCategoryOptions: TicketCategoryKey[] = [
  'INTEIRA',
  'MEIA',
  'VIP',
  'CORTESIA',
];

const createTicketTypeSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(120),
  category: z.enum(['INTEIRA', 'MEIA', 'VIP', 'CORTESIA']),
  price: z
    .string()
    .max(10)
    .refine((v) => /^\d+$/.test(v), 'Preço deve ser número inteiro em centavos (ex: 12000)'),
  description: z.string().max(500).optional().or(z.literal('')),
});

type CreateTicketTypeForm = z.infer<typeof createTicketTypeSchema>;

const createGateSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(120),
  identifier: z.string().min(1, 'Identificador obrigatório').max(16),
  description: z.string().max(255).optional().or(z.literal('')),
});

type CreateGateForm = z.infer<typeof createGateSchema>;

function currencyBRL(v: number): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `R$ ${v}`;
  }
}

function categoryBadgeVariant(c: TicketCategoryKey):
  | 'default'
  | 'secondary'
  | 'outline' {
  switch (c) {
    case 'VIP':
      return 'default';
    case 'CORTESIA':
      return 'secondary';
    case 'MEIA':
      return 'outline';
    default:
      return 'outline';
  }
}

export function EventTicketGateTabs({ venueId }: { venueId?: string | null }) {
  const ticketTypes = useTicketTypesList();
  const gates = useGatesByVenue(venueId);
  const deleteTtMutation = useDeleteTicketTypeMutation();
  const deleteGateMutation = useDeleteGateMutation();

  const [ttSearch, setTtSearch] = React.useState('');
  const [gateSearch, setGateSearch] = React.useState('');

  const [ttDialogMode, setTtDialogMode] = React.useState<
    { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; item: TicketTypeSummary }
  >({ mode: 'closed' });
  const [ttDeleting, setTtDeleting] = React.useState<TicketTypeSummary | null>(null);
  const [gateDialogMode, setGateDialogMode] = React.useState<
    { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; item: GateSummary }
  >({ mode: 'closed' });
  const [gateDeleting, setGateDeleting] = React.useState<GateSummary | null>(null);

  const filteredTt = React.useMemo(() => {
    const items = ticketTypes.data?.items ?? [];
    if (!ttSearch.trim()) return items;
    const q = ttSearch.toLowerCase();
    return items.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q),
    );
  }, [ticketTypes.data, ttSearch]);

  const filteredGates = React.useMemo(() => {
    const items = gates.data?.items ?? [];
    if (!gateSearch.trim()) return items;
    const q = gateSearch.toLowerCase();
    return items.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.identifier.toLowerCase().includes(q) ||
        (g.description ?? '').toLowerCase().includes(q),
    );
  }, [gates.data, gateSearch]);

  return (
    <Card className="rounded-3xl border-white/5 overflow-hidden">
      <CardHeader className="pb-3 pt-5 border-b border-border/50">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
            <BadgeCheck className="h-3.5 w-3.5" />
          </span>
          Pilar 5 · Tipos de ingresso e portões
        </CardTitle>
        <CardDescription>
          Gere os tipos de ingresso que você vai emitir e os portões (catracas) do local,
          e associe quem pode entrar por onde.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="ticket-types" className="w-full">
          <div className="px-5 sm:px-6 pt-4 border-b border-border/40">
            <TabsList className="mb-4 grid w-full grid-cols-2 h-10 p-1 bg-muted/30 border border-white/5">
              <TabsTrigger
                value="ticket-types"
                className="text-xs sm:text-sm data-[state=active]:bg-rose-500/15 data-[state=active]:text-rose-300 data-[state=active]:ring-1 data-[state=active]:ring-rose-500/30"
              >
                <Ticket className="h-3.5 w-3.5 mr-1.5" /> Tipos de ingresso
              </TabsTrigger>
              <TabsTrigger
                value="gates"
                className="text-xs sm:text-sm data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-300 data-[state=active]:ring-1 data-[state=active]:ring-emerald-500/30"
              >
                <DoorOpen className="h-3.5 w-3.5 mr-1.5" /> Portões do local
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ticket-types" className="m-0 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={ttSearch}
                  onChange={(e) => setTtSearch(e.target.value)}
                  placeholder="Buscar tipo por nome, categoria, descrição…"
                  className="pl-9"
                />
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-500 text-white shadow-lg shadow-rose-900/20"
                onClick={() => setTtDialogMode({ mode: 'create' })}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Novo tipo
              </Button>
            </div>

            {ticketTypes.isLoading && <TicketTypesSkeleton />}
            {ticketTypes.isError && !ticketTypes.data && (
              <EmptyCard
                icon={<Ticket className="h-5 w-5 text-muted-foreground" />}
                title="Erro ao carregar tipos"
                description="Verifique a conexão com o backend."
              />
            )}
            {!ticketTypes.isLoading && !ticketTypes.isError && filteredTt.length === 0 && (
              <EmptyCard
                icon={<Ticket className="h-5 w-5 text-muted-foreground" />}
                title={
                  ttSearch
                    ? 'Nenhum tipo encontrado para a busca'
                    : 'Nenhum tipo de ingresso cadastrado ainda'
                }
                description={
                  ttSearch
                    ? 'Tente outra palavra-chave.'
                    : 'Comece cadastrando um tipo como "Inteira" ou "VIP".'
                }
              />
            )}
            {filteredTt.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredTt.map((tt) => (
                  <TicketTypeCard
                    key={tt.id}
                    item={tt}
                    onEdit={() => setTtDialogMode({ mode: 'edit', item: tt })}
                    onDelete={() => setTtDeleting(tt)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="gates" className="m-0 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={gateSearch}
                  onChange={(e) => setGateSearch(e.target.value)}
                  placeholder="Buscar portão por nome, identificador, descrição…"
                  className="pl-9"
                />
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white shadow-lg shadow-emerald-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!venueId}
                onClick={() => setGateDialogMode({ mode: 'create' })}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Novo portão
              </Button>
            </div>

            {!venueId && (
              <EmptyCard
                icon={<DoorOpen className="h-5 w-5 text-muted-foreground" />}
                title="Local não vinculado"
                description="Você precisa vincular este evento a um local antes de gerenciar seus portões."
              />
            )}
            {venueId && gates.isLoading && <GatesSkeleton />}
            {venueId && gates.isError && !gates.data && (
              <EmptyCard
                icon={<DoorOpen className="h-5 w-5 text-muted-foreground" />}
                title="Erro ao carregar portões"
                description="Verifique a conexão com o backend."
              />
            )}
            {venueId && !gates.isLoading && !gates.isError && filteredGates.length === 0 && (
              <EmptyCard
                icon={<DoorOpen className="h-5 w-5 text-muted-foreground" />}
                title={
                  gateSearch
                    ? 'Nenhum portão encontrado para a busca'
                    : 'Nenhum portão cadastrado para este local'
                }
                description={
                  gateSearch
                    ? 'Tente outra palavra-chave.'
                    : 'Comece cadastrando um portão (ex: A1, Principal, Camarote Norte).'
                }
              />
            )}
            {venueId && filteredGates.length > 0 && (
              <div className="space-y-3">
                {filteredGates.map((g) => (
                  <GateRow
                    key={g.id}
                    venueId={venueId}
                    item={g}
                    allTicketTypes={ticketTypes.data?.items ?? []}
                    onEdit={() => setGateDialogMode({ mode: 'edit', item: g })}
                    onDelete={() => setGateDeleting(g)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* TicketType CRUD Dialog */}
      <TicketTypeDialog
        open={ttDialogMode.mode !== 'closed'}
        onOpenChange={(o) => !o && setTtDialogMode({ mode: 'closed' })}
        initial={ttDialogMode.mode === 'edit' ? ttDialogMode.item : null}
      />

      {/* Gate CRUD Dialog */}
      {venueId ? (
        <GateDialog
          venueId={venueId}
          open={gateDialogMode.mode !== 'closed'}
          onOpenChange={(o) => !o && setGateDialogMode({ mode: 'closed' })}
          initial={gateDialogMode.mode === 'edit' ? gateDialogMode.item : null}
        />
      ) : null}

      {/* Delete TT */}
      <ConfirmDeleteDialog
        open={!!ttDeleting}
        onOpenChange={(o) => !o && setTtDeleting(null)}
        title="Excluir tipo de ingresso"
        description={
          ttDeleting ? (
            <>
              Tem certeza que deseja excluir{' '}
              <strong className="text-foreground">{ttDeleting.name}</strong>? Ação
              não pode ser desfeita. Ingressos emitidos neste tipo também serão
              removidos.
            </>
          ) : (
            ''
          )
        }
        itemLabel={ttDeleting?.name ?? ''}
        confirmButtonLabel="Excluir tipo"
        tone="danger"
        onConfirm={async () => {
          if (!ttDeleting) return;
          await deleteTtMutation.mutateAsync(ttDeleting.id);
          setTtDeleting(null);
        }}
      />

      {/* Delete Gate */}
      <ConfirmDeleteDialog
        open={!!gateDeleting}
        onOpenChange={(o) => !o && setGateDeleting(null)}
        title="Excluir portão"
        description={
          gateDeleting ? (
            <>
              Tem certeza que deseja excluir o portão{' '}
              <strong className="text-foreground">{gateDeleting.name}</strong>? As
              liberações de tipos de ingresso serão removidas junto.
            </>
          ) : (
            ''
          )
        }
        itemLabel={gateDeleting ? `${gateDeleting.identifier} · ${gateDeleting.name}` : ''}
        confirmButtonLabel="Excluir portão"
        tone="danger"
        onConfirm={async () => {
          if (!gateDeleting) return;
          await deleteGateMutation.mutateAsync({
            id: gateDeleting.id,
            venueId: gateDeleting.venueId,
          });
          setGateDeleting(null);
        }}
      />
    </Card>
  );
}

function TicketTypeCard({
  item,
  onEdit,
  onDelete,
}: {
  item: TicketTypeSummary;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative rounded-2xl border border-border/60 bg-muted/10 hover:bg-muted/20 transition-colors p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold tracking-tight truncate max-w-[22ch]">{item.name}</p>
            <Badge variant={categoryBadgeVariant(item.category as TicketCategoryKey)} className="text-[10px] uppercase">
              {TICKET_CATEGORY_LABELS[item.category as TicketCategoryKey]}
            </Badge>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            <IndianRupee className="h-3.5 w-3.5 text-rose-400" />
            <span className="font-mono font-semibold text-foreground">
              {currencyBRL(Number(item.price))}
            </span>
            <span className="text-muted-foreground opacity-80">por ingresso</span>
          </div>
          {item.description ? (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-60 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TicketTypesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 bg-muted/10 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function GatesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 bg-muted/10 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-10 rounded-md" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function EmptyCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-10 px-5 bg-muted/15">
      <div className="h-11 w-11 rounded-2xl bg-muted/40 ring-1 ring-white/5 grid place-items-center">
        {icon}
      </div>
      <div className="text-center space-y-1.5 max-w-sm">
        <p className="font-bold tracking-tight text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function TicketTypeDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: TicketTypeSummary | null;
}) {
  const isEdit = !!initial;
  const createMut = useCreateTicketTypeMutation();
  const updateMut = useUpdateTicketTypeMutation();

  const form = useForm<CreateTicketTypeForm>({
    resolver: zodResolver(createTicketTypeSchema),
    defaultValues: {
      name: initial?.name ?? '',
      category: (initial?.category ?? 'INTEIRA') as TicketCategoryKey,
      price: initial ? String(initial.price) : '0',
      description: initial?.description ?? '',
    },
    mode: 'onTouched',
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      name: initial?.name ?? '',
      category: (initial?.category ?? 'INTEIRA') as TicketCategoryKey,
      price: initial ? String(initial.price) : '0',
      description: initial?.description ?? '',
    });
  }, [open, initial, form]);

  const busy = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: CreateTicketTypeForm) {
    const priceNumber = Number(values.price);
    if (isEdit && initial) {
      await updateMut.mutateAsync({
        id: initial.id,
        payload: {
          name: values.name,
          category: values.category,
          price: priceNumber,
          description: values.description || undefined,
        },
      });
    } else {
      await createMut.mutateAsync({
        name: values.name,
        category: values.category,
        price: priceNumber,
        description: values.description || undefined,
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/60 to-rose-900/60">
              <Ticket className="h-4 w-4 text-rose-50" />
            </span>
            {isEdit ? 'Editar tipo de ingresso' : 'Novo tipo de ingresso'}
          </DialogTitle>
          <DialogDescription>
            Defina o nome, categoria e preço. O preço é em centavos (ex: 12000 para R$ 120,00).
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="tt-name">Nome</Label>
            <Input
              id="tt-name"
              placeholder="Ex: Inteira, VIP, Camarote Premium"
              {...form.register('name')}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-rose-400">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tt-cat">Categoria</Label>
              <select
                id="tt-cat"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register('category')}
              >
                {ticketCategoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {TICKET_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              {form.formState.errors.category ? (
                <p className="text-xs text-rose-400">{form.formState.errors.category.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tt-price">Preço (centavos)</Label>
              <Input
                id="tt-price"
                inputMode="numeric"
                placeholder="Ex: 5000 para R$ 50,00"
                {...form.register('price')}
              />
              {form.formState.errors.price ? (
                <p className="text-xs text-rose-400">
                  {String(form.formState.errors.price.message ?? '')}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tt-desc">Descrição (opcional)</Label>
            <textarea
              id="tt-desc"
              rows={3}
              placeholder="Regras de uso, observações, etc."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register('description')}
            />
            {form.formState.errors.description ? (
              <p className="text-xs text-rose-400">
                {String(form.formState.errors.description.message ?? '')}
              </p>
            ) : null}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={busy || !form.formState.isValid}
              className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-500 text-white shadow-lg shadow-rose-900/20"
            >
              {busy ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar tipo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GateRow({
  venueId,
  item,
  allTicketTypes,
  onEdit,
  onDelete,
}: {
  venueId: string;
  item: GateSummary;
  allTicketTypes: TicketTypeSummary[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const assignMut = useAssignGateAllowedTicketTypesMutation();
  const allowedIdsRef = React.useMemo(
    () => new Set((item.ticketTypes ?? []).map((t) => t.ticketType.id)),
    [item.ticketTypes],
  );
  const [selected, setSelected] = React.useState<Set<string>>(allowedIdsRef);
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    setSelected(allowedIdsRef);
    setDirty(false);
  }, [allowedIdsRef]);

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setDirty(true);
  }

  async function save() {
    await assignMut.mutateAsync({
      venueId,
      gateId: item.id,
      ticketTypeIds: Array.from(selected),
    });
    setDirty(false);
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/10 overflow-hidden">
      <div className="p-4 flex items-start gap-3 justify-between flex-wrap">
        <div className="min-w-0 flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500/60 via-emerald-500/40 to-emerald-900/40 grid place-items-center ring-1 ring-white/10">
            <DoorOpen className="h-5 w-5 text-emerald-100" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                {item.identifier}
              </Badge>
              <p className="font-bold tracking-tight truncate max-w-[28ch]">{item.name}</p>
            </div>
            {item.description ? (
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">{item.description}</p>
            ) : null}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {Array.from(selected).length === 0 ? (
                <Badge variant="secondary" className="text-[10px] uppercase">
                  Sem tipos liberados
                </Badge>
              ) : (
                Array.from(selected).map((id) => {
                  const t = allTicketTypes.find((x) => x.id === id);
                  if (!t) return null;
                  return (
                    <Badge
                      key={id}
                      variant={categoryBadgeVariant(t.category as TicketCategoryKey)}
                      className="text-[10px]"
                    >
                      {t.name}
                    </Badge>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {allTicketTypes.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={save}
              disabled={!dirty || assignMut.isPending}
              className="text-xs"
            >
              {assignMut.isPending ? 'Salvando…' : dirty ? 'Salvar liberações' : 'Liberações ok'}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {allTicketTypes.length > 0 && (
        <>
          <Separator className="opacity-50" />
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            {allTicketTypes.map((t) => {
              const checked = selected.has(t.id);
              return (
                <label
                  key={t.id}
                  className={cn(
                    'flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-colors',
                    checked
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-transparent border-border/40 hover:border-border/70 hover:bg-muted/20',
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-3.5 w-3.5 accent-rose-500"
                    checked={checked}
                    onChange={() => toggleOne(t.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">{t.name}</span>
                      <Badge
                        variant={categoryBadgeVariant(t.category as TicketCategoryKey)}
                        className="text-[9px] uppercase"
                      >
                        {TICKET_CATEGORY_LABELS[t.category as TicketCategoryKey]}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {currencyBRL(Number(t.price))}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function GateDialog({
  venueId,
  open,
  onOpenChange,
  initial,
}: {
  venueId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: GateSummary | null;
}) {
  const isEdit = !!initial;
  const createMut = useCreateGateMutation();
  const updateMut = useUpdateGateMutation();

  const form = useForm<CreateGateForm>({
    resolver: zodResolver(createGateSchema),
    defaultValues: {
      name: initial?.name ?? '',
      identifier: initial?.identifier ?? '',
      description: initial?.description ?? '',
    },
    mode: 'onTouched',
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      name: initial?.name ?? '',
      identifier: initial?.identifier ?? '',
      description: initial?.description ?? '',
    });
  }, [open, initial, form]);

  const busy = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: CreateGateForm) {
    if (isEdit && initial) {
      await updateMut.mutateAsync({
        id: initial.id,
        payload: {
          name: values.name,
          identifier: values.identifier,
          description: values.description || undefined,
        },
      });
    } else {
      await createMut.mutateAsync({
        venueId,
        payload: {
          name: values.name,
          identifier: values.identifier,
          description: values.description || undefined,
        },
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/60 to-emerald-900/60">
              <DoorOpen className="h-4 w-4 text-emerald-50" />
            </span>
            {isEdit ? 'Editar portão' : 'Novo portão'}
          </DialogTitle>
          <DialogDescription>
            Defina um identificador curto (A, B, 1, 2, A1…) que será impresso no ingresso, e o
            nome completo do portão.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="gate-id">Identificador</Label>
              <Input
                id="gate-id"
                placeholder="Ex: A, B, 1, A1"
                className="uppercase font-mono"
                {...form.register('identifier')}
              />
              {form.formState.errors.identifier ? (
                <p className="text-xs text-rose-400">
                  {form.formState.errors.identifier.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="gate-name">Nome</Label>
              <Input
                id="gate-name"
                placeholder="Ex: Portão A, Camarote Norte"
                {...form.register('name')}
              />
              {form.formState.errors.name ? (
                <p className="text-xs text-rose-400">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gate-desc">Descrição / acesso (opcional)</Label>
            <Input
              id="gate-desc"
              placeholder="Ex: Acesso pela Avenida Francisco Matarazzo"
              {...form.register('description')}
            />
            {form.formState.errors.description ? (
              <p className="text-xs text-rose-400">
                {String(form.formState.errors.description.message ?? '')}
              </p>
            ) : null}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={busy || !form.formState.isValid}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white shadow-lg shadow-emerald-900/20"
            >
              {busy ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar portão'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
