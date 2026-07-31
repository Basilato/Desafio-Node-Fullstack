'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { AppLogo } from '@/components/app-logo';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  PartyPopper,
  ShieldCheck,
  UserPlus2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Informe o e-mail' })
    .min(1, 'Informe o e-mail')
    .email('E-mail inválido'),
  password: z
    .string({ required_error: 'Informe a senha' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Informe o nome' })
      .min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z
      .string({ required_error: 'Informe o e-mail' })
      .min(1, 'Informe o e-mail')
      .email('E-mail inválido'),
    password: z
      .string({ required_error: 'Informe a senha' })
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function PasswordInput(props, ref) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={show ? 'text' : 'password'} {...props} className={cn('pr-11', props.className)} />
      <button
        type="button"
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        onClick={() => setShow((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

function DemoCallout() {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-localis-venue" />
        <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          Conta demo do seed
        </p>
      </div>
      <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">E-mail</span>
        <code className="font-mono text-foreground break-all">admin@localis.com.br</code>
        <span className="text-muted-foreground">Senha</span>
        <code className="font-mono text-foreground break-all">admin123</code>
      </div>
    </div>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tone: 'venue' | 'event';
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
      <span
        className={cn(
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/10',
          tone === 'venue'
            ? 'bg-gradient-to-br from-localis-venue/60 to-emerald-900/60 text-emerald-100'
            : 'bg-gradient-to-br from-localis-event/60 to-rose-900/60 text-rose-100',
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="font-semibold tracking-tight text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const { login, register, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const onLoginSubmit = React.useCallback(
    async (values: LoginForm) => {
      try {
        const result = await login(values.email, values.password);
        toast({
          title: (
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-localis-venue" />
              Acesso liberado
            </span>
          ),
          description: `Bem-vindo(a), ${result.user.name}!`,
        });
        router.replace(redirect);
      } catch (err) {
        const status = (err as { status?: number })?.status;
        const message =
          (err as { message?: string })?.message ??
          'Não foi possível entrar. Verifique suas credenciais.';
        if (status === 401) {
          loginForm.setError('root', {
            type: 'custom',
            message: 'E-mail ou senha incorretos.',
          });
        } else {
          loginForm.setError('root', { type: 'custom', message });
        }
      }
    },
    [login, loginForm, redirect, router, toast],
  );

  const onRegisterSubmit = React.useCallback(
    async (values: RegisterForm) => {
      try {
        const result = await register({
          name: values.name,
          email: values.email,
          password: values.password,
          role: 'MANAGER',
        });
        toast({
          title: (
            <span className="inline-flex items-center gap-2">
              <UserPlus2 className="h-4 w-4 text-localis-event" />
              Conta criada
            </span>
          ),
          description: `Bem-vindo(a) à Localis, ${result.user.name}!`,
        });
        router.replace(redirect);
      } catch (err) {
        const status = (err as { status?: number })?.status;
        const message =
          (err as { message?: string })?.message ??
          'Não foi possível criar a conta. Tente novamente.';
        if (status === 409) {
          registerForm.setError('email', {
            type: 'custom',
            message: 'Este e-mail já está em uso. Tente outro ou faça login.',
          });
        } else {
          registerForm.setError('root', { type: 'custom', message });
        }
      }
    },
    [register, registerForm, redirect, router, toast],
  );

  const loggingIn = loginForm.formState.isSubmitting || authLoading;
  const registering = registerForm.formState.isSubmitting || authLoading;

  return (
    <Card className="rounded-3xl border-white/10 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden w-full max-w-md">
      <Tabs defaultValue="entrar" className="p-1 sm:p-2" activationMode="automatic">
        <TabsList className="w-full grid grid-cols-2 rounded-2xl bg-muted/40 p-1">
          <TabsTrigger
            value="entrar"
            className="h-10 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-semibold"
          >
            <span className="inline-flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Entrar
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="criar"
            className="h-10 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-semibold"
          >
            <span className="inline-flex items-center gap-2">
              <UserPlus2 className="h-4 w-4" />
              Criar conta
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entrar" className="mt-6 px-2 pb-2 focus-visible:outline-none">
          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="login-email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@localis.com.br"
                  className="pl-9"
                  {...loginForm.register('email')}
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Senha</Label>
              </div>
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                placeholder="Sua senha"
                {...loginForm.register('password')}
              />
              {loginForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {loginForm.formState.errors.root && (
              <div
                role="alert"
                className="rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm"
              >
                {loginForm.formState.errors.root.message}
              </div>
            )}

            <DemoCallout />

            <Button
              type="submit"
              size="lg"
              disabled={loggingIn}
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-localis-event to-rose-500 hover:from-localis-event hover:to-rose-400 text-white shadow-lg shadow-rose-900/30"
            >
              {loggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Entrando…
                </>
              ) : (
                <>
                  Entrar no painel
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="criar" className="mt-6 px-2 pb-2 focus-visible:outline-none">
          <form
            onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="register-name">Nome completo</Label>
              <Input
                id="register-name"
                autoComplete="name"
                placeholder="Como quer ser chamado(a)?"
                {...registerForm.register('name')}
              />
              {registerForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {registerForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@localis.com.br"
                  className="pl-9"
                  {...registerForm.register('email')}
                />
              </div>
              {registerForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="register-password">Senha</Label>
                <PasswordInput
                  id="register-password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  {...registerForm.register('password')}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-confirm">Confirmar senha</Label>
                <PasswordInput
                  id="register-confirm"
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  {...registerForm.register('confirmPassword')}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {registerForm.formState.errors.root && (
              <div
                role="alert"
                className="rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm"
              >
                {registerForm.formState.errors.root.message}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={registering}
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-localis-venue to-emerald-600 hover:from-localis-venue hover:to-emerald-500 text-white shadow-lg shadow-emerald-900/30"
            >
              {registering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Criando conta…
                </>
              ) : (
                <>
                  Criar minha conta
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function LoginCardFallback() {
  return (
    <Card className="rounded-3xl border-white/10 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden w-full max-w-md p-6 space-y-5">
      <div className="w-full h-10 rounded-2xl bg-muted/40" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <Skeleton className="h-11 w-full rounded-2xl" />
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-localis-venue/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-localis-event/10 blur-3xl" />
      </div>

      <div className="relative min-h-screen grid lg:grid-cols-2">
        <section className="hidden lg:flex relative flex-col justify-between p-10 xl:p-14 border-r border-white/5">
          <AppLogo />

          <div className="space-y-8 max-w-lg">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                <PartyPopper className="h-3.5 w-3.5 text-localis-event" />
                Nova versão do painel
              </div>
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-[1.05]">
                Gerencie locais,
                <br />
                eventos e portões
                <span className="bg-gradient-to-r from-localis-venue via-localis-event to-localis-event bg-clip-text text-transparent">
                  {' '}
                  em um só lugar
                </span>
                .
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                A Localis centraliza toda a operação de ingressos, capacidade e agenda dos seus
                espaços. Comece agora a organizar os seus eventos.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-1">
              <FeatureRow
                icon={Building2}
                tone="venue"
                title="Locais e portões organizados"
                description="Cadastre arenas, teatros, estádios com múltiplas entradas, capacidade e contatos em minutos."
              />
              <FeatureRow
                icon={CalendarDays}
                tone="event"
                title="Agenda sem conflito de horário"
                description="A plataforma valida automaticamente a disponibilidade do local antes de criar o evento."
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Localis · Todos os direitos reservados.
          </p>
        </section>

        <section className="relative flex flex-col items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md flex flex-col gap-6">
            <div className="flex lg:hidden items-center justify-between">
              <AppLogo />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Acesse sua conta
              </h2>
              <p className="text-muted-foreground text-sm">
                Entre para criar eventos, cadastrar locais e acompanhar a ocupação.
              </p>
            </div>

            <React.Suspense fallback={<LoginCardFallback />}>
              <LoginCard />
            </React.Suspense>

            <p className="text-center text-xs text-muted-foreground">
              Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade da
              Localis.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

