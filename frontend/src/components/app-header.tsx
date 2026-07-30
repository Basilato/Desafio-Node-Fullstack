'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import {
  Home,
  Calendar,
  MapPin,
  LayoutDashboard,
  UserCircle2,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/locais', label: 'Locais', icon: MapPin },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl
        bg-background/50 supports-[backdrop-filter]:bg-background/30"
    >
      <div className="container h-16 flex items-center justify-between gap-4">
        <AppLogo />

        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-1 rounded-full p-1 border border-white/10 bg-white/5"
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
                  'inline-flex items-center gap-2 px-4 h-9 rounded-full text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-foreground text-background shadow-soft'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 h-10 pl-1.5 pr-3 rounded-full
                  hover:bg-white/5 border border-white/10 data-[state=open]:bg-white/5"
              >
                <Avatar className="h-7 w-7 ring-2 ring-onentree-event/60">
                  <AvatarImage
                    src=""
                    alt="Foto de perfil do usuário"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-onentree-event to-onentree-venue text-white text-xs font-bold">
                    TA
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-xs text-muted-foreground">Olá,</span>
                  <span className="text-sm font-semibold text-foreground">
                    Mariana
                  </span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-64 p-2 border-white/10 bg-background/95 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-onentree-event to-onentree-venue text-white text-sm font-bold">
                      TA
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-sm truncate">
                      Mariana Silva
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      mariana@onentree.com.br
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
                  <Link href="/">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                    <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
                  <Link href="/eventos">
                    <Calendar className="mr-2 h-4 w-4" />
                    Meus eventos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
                  <Link href="/locais">
                    <MapPin className="mr-2 h-4 w-4" />
                    Locais cadastrados
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
                  <Link href="/perfil">
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    Minha conta
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
                <Link href="/configuracoes">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                  <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair da conta
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
