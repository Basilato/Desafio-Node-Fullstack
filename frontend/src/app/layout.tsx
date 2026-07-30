import type { Metadata } from 'next';
import { Inter as InterFont } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/app/providers';
import { AppHeader } from '@/components/app-header';

const inter = InterFont({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: 'Localis · Dashboard',
  description:
    'Localis — Gerencie locais, portões e eventos em um só lugar.',
  keywords: ['eventos', 'locais', 'ingressos', 'dashboard', 'Localis'],
  authors: [{ name: 'Localis' }],
  openGraph: {
    title: 'Localis · Dashboard',
    description:
      'Gerencie locais, portões e eventos em um só lugar.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className="antialiased font-sans">
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-1">{children}</main>
            <footer className="py-8 border-t border-white/5 mt-auto">
              <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <p>© {new Date().getFullYear()} Localis · Todos os direitos reservados.</p>
                <p className="font-mono">feito com carinho · build {process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev'}</p>
              </div>
            </footer>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
