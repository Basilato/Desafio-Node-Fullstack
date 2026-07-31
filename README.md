
<div align="center">

# Event OS

**Sistema de gerenciamento de eventos, locais e emissão de ingressos**

Solução fullstack moderna para gestão de casas de show, estádios e arenas — com controle de portões, tipos de ingresso por categoria, validação de disponibilidade de agenda e emissão de ingressos com bloqueio de capacidade.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A520-43853D?logo=nodedotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Acessibilidade](https://img.shields.io/badge/WCAG-2.1%20AA-5B21B6)

</div>

---

## 🎯 Sobre o projeto

O **Event OS** é um ERP de eventos que cobre todo o ciclo de vida: desde o cadastro do local e seus portões de acesso, passando pela criação do evento com checagem de conflito de agenda, até a emissão individualizada de ingressos com matriz de permissão (qual tipo de ingresso acessa qual portão).

Tudo foi projetado com **regras de negócio consistentes** e **interface premium** (tema claro/escuro, tokens OKLCH, componentes shadcn/ui).

---

## 🏗️ Arquitetura & Tecnologias

Monorepo organizado em dois serviços independentes com scripts de orquestração na raiz.

### Backend — API REST robusta
| Camada | Tecnologia | Propósito |
|---|---|---|
| Framework | **NestJS 10** | Arquitetura modular (Modules / Controllers / Services) + DI nativo |
| Linguagem | **TypeScript 5.3** | Strict mode + SWC para build ultrarrápida |
| ORM | **Prisma 5.10** | Schema-first, migrations versionadas, tipos gerados |
| Banco | **PostgreSQL** (Supabase) | Índices compostos, constraints e enums nativos |
| Auth | **JWT + Passport** | Guards opcionais e estritos; roles `ADMIN / MANAGER / ATTENDANT` |
| Validação | **class-validator + class-transformer** | DTOs tipados com transformação automática de query params |
| Documentação | **Swagger / OpenAPI** (`@nestjs/swagger`) | Interface em `/docs` com persistência do token |
| Logging | **nestjs-pino** (Pino HTTP) | Logs estruturados em JSON para produção |
| Testes | **Vitest** + Supertest | Unitário e E2E configurados |
| Segurança | **bcrypt** (10 rounds) | Hash de senhas; CORS configurável por env |

### Frontend — Dashboard de alta performance
| Camada | Tecnologia | Propósito |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | SSR/ISR + Middleware de bloqueio de rotas autenticadas |
| UI | **shadcn/ui + Radix UI Primitives** | Componentes acessíveis com `class-variance-authority` |
| Estilos | **Tailwind CSS 3.4** | Design tokens `oklch()` + `color-mix()` para sombras uniformes |
| Estado servidor | **TanStack Query 5** | Cache reativo, invalidations e infinite queries |
| Tabelas | **TanStack Table 8** | Ordenação, paginação e filtros client-side |
| Formulários | **React Hook Form 7 + Zod** | Validação performante com schemas tipados |
| Ícones | **lucide-react** | Ícones consistentes e leves |
| Tema | **next-themes** | Claro/escuro sem FOUC; respeita `prefers-color-scheme` |
| Fonte | **Inter (next/font)** | Fontes otimizadas, sem `layout shift` |
| Testes | **Jest + Testing Library** | Configurados para React 18 |

### Decisões arquiteturais que merecem destaque
1. **Controle estrito de CUD**: Todo `POST / PUT / DELETE` no backend exige `JwtAuthGuard`. No frontend, o `middleware.ts` do Next.js bloqueia rotas protegidas antes mesmo de renderizar a página.
2. **Checagem de conflitos**: Antes de criar um evento, o frontend consulta `GET /events/availability/conflict` para evitar sobreposição de agenda no mesmo local.
3. **Bloqueio de capacidade**: Emissão de ingressos retorna **409 Conflict** se a capacidade do local for atingida — regra validada em transação no service.
4. **Matriz de permissões**: Tabela pivô `AllowedTicketType` (gateId + ticketTypeId) define quais categorias de ingresso acessam cada portão.
5. **Acessibilidade WCAG 2.1 AA**: Foco visível obrigatório, contraste via tokens perceptualmente uniformes (`oklch`) e suporte a `prefers-reduced-motion`.

---

## ✨ Principais funcionalidades

### 🔐 Autenticação & Perfis
- Login via JWT com roles `ADMIN / MANAGER / ATTENDANT`
- Registro de usuários com hash bcrypt
- Persistência de sessão no TanStack Query com refresh automático

### 🏟️ Gestão de Locais (Venues)
- Cadastro completo com endereço, capacidade, contato
- Associação de múltiplos portões (gates) por local
- Visualização de total de liberações (ticket types) por portão

### 📅 Gestão de Eventos
- 6 categorias fixas com variantes de cor (Futebol, Show, Teatro, Festival, Esporte, Outro)
- Validação automática de conflito de horário no mesmo local
- Dashboard com cards de capacidade e estatísticas em tempo real

### 🎟️ Emissão & Controle de Ingressos
- 4 categorias: **Inteira, Meia, VIP, Cortesia** (VIP com estilo visual "Dourado" diferenciado)
- Tabela de ingressos com **8 colunas** e filtros combináveis:
  - Por portão (`gateId`)
  - Por status (`ACTIVE / USED / CANCELLED / REFUNDED`)
  - Por uso (`used=true/false`) — com conversão booleana segura no DTO
- Emissão em lote com preço fixado por tipo
- Validação de capacidade transacional

### 📊 Dashboard analítico
- KPIs: eventos, locais, ingressos emitidos, capacidade total
- Listas de "recentes" com links diretos
- Tema claro ↔ escuro alternado por seção (ritmo visual)

---

## 🧩 Modelo de Dados (Prisma)

```
User ──────┐ (createdBy)
           ▼
Venue ──> Event ──> Ticket
  │                        ▲
  └──> Gate ──> AllowedTicketType ──> TicketType
```

**Entidades principais**:
- **User** — sistema de roles via enum `UserRole`
- **Venue** — local com capacidade e índice por nome
- **Gate** — portão com chave composta `(venueId, identifier)` (unique)
- **TicketType** — categoria + preço (Decimal 10,2)
- **AllowedTicketType** — matriz de permissão (PK composta `[gateId, ticketTypeId]`)
- **Event** — associa venue + criador; índices para busca por data/local
- **Ticket** — individualizado por titular; índices por evento e portão

---

## 🚀 Como rodar o projeto

### Pré-requisitos
- **Node.js ≥ 20** (recomendado 20.10 LTS ou superior)
- **PostgreSQL** (instância local ou Supabase)
- **npm** (versão que acompanha o Node 20)

### Passo a passo

#### 1. Clone e instale tudo com um comando
```bash
git clone <seu-fork>
cd Desafio-Node-Fullstack
npm run install:all
```
O script `install:all` roda `npm install` na raiz, no frontend e no backend.

#### 2. Configure as variáveis de ambiente

**Backend** — copie `backend/.env.example` para `backend/.env`:
```env
# Banco (exemplo Supabase; funciona com PostgreSQL local também)
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/eventos?pgbouncer=true"
DIRECT_URL="postgresql://postgres:sua_senha@localhost:5432/eventos"

# App
PORT=3001
CORS_ORIGIN="http://localhost:3000"

# JWT (gere uma chave forte: openssl rand -hex 32)
JWT_SECRET="sua_chave_super_segura_aqui"
JWT_EXPIRES_IN="7d"

# Bcrypt
BCRYPT_ROUNDS=10
LOG_LEVEL="debug"
```

**Frontend** — copie `frontend/.env.example` para `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="Event OS"
```

#### 3. Gere o client Prisma e rode as migrations
```bash
npm run prisma:generate    # Gera @prisma/client tipado
npm run prisma:migrate     # Aplica migrations no PostgreSQL
```

#### 4. Popule a base com dados de exemplo (seed)
```bash
npm run prisma:seed
```
O seed cria:
- **Usuário admin**: `admin@localis.com.br` / `admin123`
- 3 locais (Morumbis, Allianz Parque, Neo Química Arena) + ~20 portões
- 2 tipos de ingresso (Inteira R$ 120,00 / VIP R$ 500,00)
- 3 eventos (Final e Semi da Copa América, Harry Styles)
- **1.482 ingressos emitidos**

#### 5. Inicie os dois serviços (desenvolvimento)
```bash
npm run dev
```
Isso abre dois processos:
- **Frontend**: http://localhost:3000  (Next.js HMR)
- **Backend**:  http://localhost:3001/api  (NestJS watch mode)
- **Swagger**:  http://localhost:3001/docs  (OpenAPI interativo)
- **Prisma Studio** (opcional): `npm run prisma:studio` → http://localhost:5555

---

## 🔧 Scripts disponíveis (raiz)

| Comando | O que faz |
|---|---|
| `npm run install:all` | Instala dependências da raiz + frontend + backend |
| `npm run dev` | Sobe frontend (porta 3000) e backend (porta 3001) em paralelo |
| `npm run dev:fe` / `dev:be` | Sobe apenas um dos serviços |
| `npm run build` | Builda backend e frontend em sequência |
| `npm run lint` | Roda ESLint em frontend e backend (com --fix) |
| `npm run typecheck` | Verifica tipos TypeScript (`tsc --noEmit`) nos dois projetos |
| `npm run test` | Roda testes Vitest (backend) + Jest (frontend) |
| `npm run prisma:generate` | Regenera tipos do Prisma Client |
| `npm run prisma:migrate` | Cria e aplica migration (`prisma migrate dev`) |
| `npm run prisma:studio` | Abre interface visual do banco |
| `npm run prisma:seed` | Popula banco com dados de demonstração |

---

## 🧪 Qualidade & Validação

Antes de abrir PR ou dar build, sempre valide:
```bash
npm run typecheck   # 0 erros TypeScript
npm run lint        # Padrões de código
npm run build       # Build limpo de ambos
```
O build do Next.js valida estaticamente todas as rotas do App Router, garantindo que nenhuma página quebrou.

---

## 📁 Estrutura de pastas

```
Desafio-Node-Fullstack/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelo de dados + enums
│   │   ├── migrations/            # Versionamento do schema
│   │   └── seed.ts                # Dados iniciais (1.4k ingressos)
│   └── src/
│       ├── auth/                  # JWT Strategy, Guards, Decorators (@CurrentUser)
│       ├── venues/                # CRUD locais + associação de portões
│       ├── gates/                 # Portões por local
│       ├── events/                # CRUD eventos + /availability/conflict
│       ├── ticket-types/          # Categorias de ingresso
│       ├── tickets/               # Emissão + listagem com filtros (list-tickets.dto)
│       ├── prisma/                # PrismaService + PrismaModule
│       ├── health/                # Health check
│       └── main.ts                # Bootstrap: CORS, ValidationPipe, Swagger
│
├── frontend/
│   └── src/
│       ├── app/                   # Next.js App Router (rotas + layout raiz)
│       │   ├── dashboard-*        # Hero + stat cards + seções recentes
│       │   ├── eventos/           # Listagem, novo, detalhe, editar
│       │   ├── locais/            # Listagem, novo, detalhe, editar
│       │   ├── login/             # Autenticação
│       │   ├── middleware.ts      # Bloqueio de rotas autenticadas
│       │   ├── globals.css        # Tokens OKLCH + variáveis de categoria
│       │   └── providers.tsx      # QueryClient + ThemeProvider
│       ├── components/
│       │   ├── ui/                # 18+ componentes shadcn/ui (CVA)
│       │   ├── forms/             # CreateEventForm + CreateVenueForm (RHF + Zod)
│       │   ├── app-header.tsx     # Header em estilo pill com dropdown perfil
│       │   ├── event-ticket-gate-tabs.tsx  # Aba "Ingressos emitidos" (8 colunas + filtros)
│       │   └── issue-ticket-sheet.tsx      # Emissão com visual VIP dourado
│       ├── hooks/                 # useEvent, useVenue, useTickets, useDashboardQueries...
│       └── lib/api/               # Camada HTTP centralizada por domínio
│
└── package.json                   # Scripts de orquestração do monorepo
```


<div align="center">

**Feito com** · NestJS, Next.js 14, Prisma, Tailwind · 

</div>
