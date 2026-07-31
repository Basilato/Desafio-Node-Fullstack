'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVenuesList } from '@/hooks/use-venues-list';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { CreateVenueForm, UpdateVenueForm } from '@/components/forms/create-venue-form';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import {
  Plus,
  Search,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  Users,
  DoorOpen,
  Home as HomeIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { VenueRecent } from '@/lib/api/venues';
import { useDeleteVenue } from '@/hooks/use-venue';

const PAGE_SIZE = 8;

export default function VenuesPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<VenueRecent | null>(null);
  const [deleting, setDeleting] = React.useState<VenueRecent | null>(null);

  const deleteVenue = useDeleteVenue();

  const router = useRouter();

  const {
    items: venues,
    meta,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useVenuesList({ page, perPage: PAGE_SIZE, search });

  const startIdx = venues.length ? (meta.page - 1) * PAGE_SIZE + 1 : 0;
  const endIdx = Math.min(meta.page * PAGE_SIZE, meta.total);

  return (
    <div className="container py-8 space-y-8">
      {/* Breadcrumb e header */}
      <header className="flex flex-col gap-5">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground font-semibold inline-flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-accent" />
            Locais
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/40 to-accent-foreground/15 ring-1 ring-white/10">
                <Building2 className="h-4.5 w-4.5 text-emerald-100" />
              </span>
              Catálogo de locais
            </h1>
            <p className="text-muted-foreground">
              Administre arenas, teatros, estádios e todos os locais onde os eventos da Localis
              acontecem.
            </p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent hover:to-accent/90 text-white shadow-lg shadow-soft"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Novo local
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl flex flex-col">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent/50 to-accent-foreground/15">
                    <Building2 className="h-4 w-4 text-emerald-50" />
                  </span>
                  Novo local
                </SheetTitle>
                <SheetDescription>
                  Preencha os dados abaixo para cadastrar um novo local na plataforma.
                </SheetDescription>
              </SheetHeader>
              <CreateVenueForm
                onSuccess={() => setSheetOpen(false)}
                onCancel={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Toolbar */}
      <Card className="rounded-3xl border-white/5 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pb-4 pt-5 space-y-0 border-b border-border/50">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              Localizar e filtrar
            </CardTitle>
            <CardDescription>
              Busque por nome, cidade ou endereço — debounce aplicado em 350ms.
            </CardDescription>
          </div>
          <div className="flex w-full sm:max-w-sm items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar local, cidade, endereço…"
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%] pl-6">Local</TableHead>
                <TableHead className="w-[15%]">Cidade / UF</TableHead>
                <TableHead className="w-[24%]">Endereço</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Portões</TableHead>
                <TableHead className="w-[60px] pr-6 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !venues.length
                ? Array.from({ length: Math.min(5, PAGE_SIZE) }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : null}
              {!isLoading && venues.length === 0 ? (
                <EmptyRow
                  onClick={() => setSheetOpen(true)}
                  title={search ? (isError ? 'Erro ao buscar locais' : 'Nenhum local encontrado') : 'Nenhum local cadastrado ainda'}
                  description={
                    search
                      ? isError
                        ? 'Clique em "Tentar novamente" para recarregar os resultados.'
                        : 'Tente outra palavra-chave ou ajuste os filtros.'
                      : 'Clique em "+ Novo local" para cadastrar o primeiro local.'
                  }
                  cta={
                    isError
                      ? { label: 'Tentar novamente', onClick: () => refetch() }
                      : search
                        ? undefined
                        : { label: '+ Novo local', onClick: () => setSheetOpen(true) }
                  }
                />
              ) : null}
              {venues.map((v) => (
                <VenueTr
                  key={v.id}
                  venue={v}
                  onView={() => router.push(`/locais/${v.id}`)}
                  onEdit={() => setEditing(v)}
                  onDelete={() => setDeleting(v)}
                />
              ))}
            </TableBody>
          </Table>

          {/* Paginação */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              {venues.length ? (
                <>
                  Exibindo <strong className="text-foreground">{startIdx}</strong> a{' '}
                  <strong className="text-foreground">{endIdx}</strong> de{' '}
                  <strong className="text-foreground">{meta.total.toLocaleString('pt-BR')}</strong>{' '}
                  locais
                </>
              ) : (
                isLoading ? 'Carregando lista…' : 'Nenhum item a exibir.'
              )}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background p-1 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 px-3 gap-1.5"
                disabled={meta.page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Badge
                variant="outline"
                className="rounded-full h-7 border-border text-xs font-mono mx-1 sm:mx-2 px-3 bg-muted/40"
              >
                Página {meta.page} / {Math.max(1, meta.totalPages)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 px-3 gap-1.5"
                disabled={meta.page >= meta.totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="sm:max-w-xl flex flex-col">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent/50 to-accent-foreground/15">
                <Pencil className="h-4 w-4 text-emerald-50" />
              </span>
              Editar local
            </SheetTitle>
            <SheetDescription>
              Ajuste os dados cadastrais ou os portões de acesso. Alterações são salvas imediatamente.
            </SheetDescription>
          </SheetHeader>
          {editing && (
            <UpdateVenueForm
              initialData={editing}
              onSuccess={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir local"
        description={
          deleting ? (
            <>
              Tem certeza que deseja excluir{' '}
              <strong className="text-foreground">{deleting.name}</strong>? Essa ação não pode ser
              desfeita. Portões de acesso também serão removidos.
            </>
          ) : (
            ''
          )
        }
        itemLabel={deleting?.name ?? ''}
        confirmButtonLabel="Excluir local"
        tone="danger"
        onConfirm={async () => {
          if (!deleting) return;
          await deleteVenue.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}

function VenueTr({
  venue,
  onView,
  onEdit,
  onDelete,
}: {
  venue: VenueRecent;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ids = venue.gates
    .map((g) => g.identifier.toUpperCase())
    .filter(Boolean)
    .slice(0, 6);
  const remaining = Math.max(0, venue.gates.length - ids.length);
  return (
    <TableRow className="group h-[64px]">
      <TableCell className="pl-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent/30 via-accent/20 to-accent-foreground/15 ring-1 ring-white/10 grid place-items-center">
            <MapPin className="h-4 w-4 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate max-w-[26ch]">{venue.name}</p>
            {venue.email && (
              <p className="text-xs text-muted-foreground truncate max-w-[34ch]">{venue.email}</p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {venue.city && venue.state ? (
          <>
            {venue.city} · <span className="font-mono uppercase text-xs">{venue.state}</span>
          </>
        ) : (
          <span className="text-muted-foreground/60 italic text-xs">—</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        <p className="truncate max-w-[36ch]">{venue.address || '—'}</p>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
          <Users className="h-3.5 w-3.5 text-accent" />
          {venue.capacity.toLocaleString('pt-BR')}
        </span>
      </TableCell>
      <TableCell>
        {ids.length ? (
          <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
            {ids.map((id) => (
              <span
                key={id}
                className="inline-flex h-6 min-w-[26px] items-center justify-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/30 px-2 font-mono text-[11px] font-bold"
              >
                {id}
              </span>
            ))}
            {remaining > 0 && (
              <span className="text-xs text-muted-foreground font-medium">+{remaining}</span>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <DoorOpen className="h-3.5 w-3.5" /> Sem portões
          </span>
        )}
      </TableCell>
      <TableCell className="pr-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-60 group-hover:opacity-100 transition-opacity"
              aria-label="Ações para local"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" onClick={onView}>
              <Eye className="h-4 w-4 text-accent" /> Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={onEdit}>
              <Pencil className="h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-primary focus:text-primary focus:bg-primary/10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableCell key={i} className={cn(i === 0 && 'pl-6', i === 5 && 'pr-6')}>
          <div className="h-5 rounded-lg bg-white/5 animate-pulse" style={{ width: 40 + (i * 27) % 140 }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

function EmptyRow({
  title,
  description,
  cta,
  onClick,
}: {
  title: string;
  description: string;
  cta?: { label: string; onClick: () => void };
  onClick?: () => void;
}) {
  return (
    <TableRow onClick={onClick} className={cn(cta?.label && 'cursor-pointer')}>
      <TableCell className="pl-6" colSpan={6}>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 my-2 bg-muted/20">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-foreground/10 ring-1 ring-white/10 grid place-items-center">
            <Building2 className="h-6 w-6 text-accent" />
          </div>
          <div className="text-center space-y-1.5 max-w-md">
            <p className="font-bold tracking-tight">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {cta && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                cta.onClick();
              }}
              className="mt-2 bg-gradient-to-r from-accent to-accent/90 hover:from-accent hover:to-accent/90 text-white shadow-lg shadow-soft"
            >
              {cta.label}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
