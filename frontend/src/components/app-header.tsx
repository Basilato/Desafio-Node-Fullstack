'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import {
  Home,
  Calendar,
  MapPin,
  LayoutDashboard,
  UserCircle2,
  Settings,
  LogOut,
  ChevronDown,
  KeyRound,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth, getInitials } from '@/providers/auth-provider';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/locais', label: 'Locais', icon: MapPin },
];

const roleLabel: Record<string, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gestor(a)',
  ATTENDANT: 'Atendente',
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: (
        <span className="inline-flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sessão encerrada
        </span>
      ),
      description: 'Você saiu da sua conta.',
    });
    router.push('/login');
  };

  const initials = getInitials(user);

  return (
    <header
      className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl
        bg-background/70 supports-[backdrop-filter]:bg-background/50"
    >
      <div className="container h-16 flex items-center justify-between gap-4">
        <AppLogo />

        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-1 rounded-2xl p-1 border border-border/60 bg-muted/50 shadow-sm"
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/'
                ? pathname === '/'
                : pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'inline-flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/80',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isLoading ? (
            <Button variant="ghost" size="sm" disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Carregando…
            </Button>
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 h-10 pl-1.5 pr-3 rounded-xl
                    hover:bg-muted border border-border/60 data-[state=open]:bg-muted"
                >
                  <Avatar className="h-7 w-7 ring-2 ring-primary/40">
                    <AvatarImage
                      src={user.avatarUrl ?? undefined}
                      alt="Foto de perfil do usuário"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-xs text-muted-foreground">Olá,</span>
                    <span className="text-sm font-semibold text-foreground">
                      {user.name.split(' ')[0]}
                    </span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-64 p-2"
              >
                <DropdownMenuLabel className="pb-2 px-1.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-sm truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    <span className="font-medium uppercase tracking-wide">
                      {roleLabel[user.role] ?? user.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                      <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/eventos">
                      <Calendar className="h-4 w-4" />
                      Meus eventos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/locais">
                      <MapPin className="h-4 w-4" />
                      Locais cadastrados
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/perfil">
                      <UserCircle2 className="h-4 w-4" />
                      Minha conta
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes">
                    <Settings className="h-4 w-4" />
                    Configurações
                    <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da conta
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              variant="default"
              size="sm"
              className="h-9 shadow-md"
            >
              <Link href="/login">
                <KeyRound className="h-4 w-4" />
                Entrar
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
