# Planejamento de Tarefas — Projeto Localis

> Sistema de gerenciamento de ingressos e locais de eventos com acesso via catracas de reconhecimento facial.

---

## 1. Resumo Executivo

| Área               | Tecnologias Definidas                                     | Total de Tarefas |
| ------------------ | --------------------------------------------------------- | ---------------- |
| Ambiente & Setup   | Monorepo, Node 20+, npm/pnpm, ESLint, Prettier, Husky     | 7                |
| Backend            | NestJS 10 + TypeScript, Prisma ORM, Supabase (PostgreSQL) | 21               |
| Design System      | Tailwind CSS v3, shadcn/ui, Tokens de tema (claro/escuro) | 11               |
| Frontend — Core    | React 18 + TypeScript, Vite/Next.js, React Router         | 13               |
| Frontend — Páginas | Dashboard, Locais, Eventos, Detalhes, Formulários CRUD    | 18               |
| Integração         | API Client, Hooks de dados, Tratamento de erros           | 6                |
| Qualidade & Testes | Jest, RTL, Vitest (backend), Testes E2E (opcional)        | 8                |
| Deploy & Ops       | Vercel (FE), Fly.io/Render (BE), Docker, CI/CD            | 7                |
| Diferenciais       | Busca, filtros, ordenação, animações, Swagger, logs       | 12               |

**Estimativa total de esforço:** ~80–100 horas/homem (cerca de 2 a 2,5 semanas em tempo integral para 1 dev fullstack).

---

## 2. Regras de Negócio — Requisitos Não-Negociáveis

Baseados em [README.md](file:///c:/Users/Leo/Documents/trae_projects/Desafio-Node-Fullstack/README.md#L13-L19):

1. Locais possuem múltiplas entradas/portões e o acesso varia por tipo de ingresso.
2. Todo evento deve estar associado a **1 único local**.
3. Todo evento possui `data_inicio`, `hora_inicio`, `data_fim`, `hora_fim`.
4. **Conflito de agenda:** um local não pode hospedar 2 eventos no mesmo horário; um evento não ocorre em 2 locais simultaneamente.
5. Validações de formulário **client-side + server-side** com mensagens claras.
6. Interface 100% responsiva (mobile-first).

---

## 3. Análise da Interface Atual (Dashboard de Referência)

Com base em [image.png](file:///c:/Users/Leo/Documents/trae_projects/Desafio-Node-Fullstack/image.png), a interface atual exibe:

- **Header:** Logo "Localis", navegação (Home, Eventos, Locais), menu do usuário (avatar + dropdown).
- **Hero / Saudação:** Avatar personalizado, "Olá, [Nome]", subtítulo de apresentação.
- **Cards de destaque (2 colunas):**
  - Locais (fundo verde escuro) — "Conferir locais"
  - Eventos (fundo bordô escuro) — "Conferir eventos"
- **Listagens recentes (2 colunas):**
  - Últimos locais adicionados (3 registros + "Ver todos")
  - Últimos eventos adicionados (3 registros + "Ver todos")

### 3.1 Problemas e Oportunidades de Melhoria (incorporar nas tarefas)

| #  | Problema Identificado                                            | Tarefa Associada                                    |
| -- | ---------------------------------------------------------------- | --------------------------------------------------- |
| 1  | Texto incorreto no card Eventos ("Confira todo os locais...")    | [FE-PAG-03]                                         |
| 2  | Endereço truncado ("Avenida Francisc…") sem tooltip ao dar hover | [FE-COMP-07] + [DS-08]                              |
| 3  | Badges de categoria com cores inconsistentes (Futebol vs Show)   | [DS-06] / [FE-COMP-06] Badge com tokens de categoria|
| 4  | Menu de 3 pontos sem feedback (hover/foco)                       | [FE-COMP-11] Dropdown shadcn/ui c/ estados          |
| 5  | Ritmo visual: fundo muito carregado (gradiente genérico)         | [DS-04] Camadas de fundo alternadas claro/escuro    |
| 6  | Contraste: verificar WCAG em texto sobre fundo escuro/colorido   | [DS-05] Verificação AA em todas as combinações      |
| 7  | Nenhum indicador de loading ou empty states                      | [FE-COMP-08] Skeleton + Empty state                 |
| 8  | Responsividade não aplicada (layout fixo 2 colunas)              | [FE-CORE-05] Breakpoints Tailwind                   |
| 9  | Ícones sem `aria-label` / sem descrição para leitores de tela    | [DS-09] + [QA-04] Acessibilidade                    |
| 10 | Avatar sem fallback acessível                                    | [FE-COMP-02] Avatar c/ fallback textual             |

---

## 4. Lista Hierárquica de Tarefas

Legenda:
- **Prioridade:** 🔴 Alta | 🟡 Média | 🟢 Baixa
- **Estimativa:** em horas/homem (HH)
- **Dependência(s):** tarefa(s) que devem estar concluídas antes

---

### 4.1 Área: Configuração de Ambiente & Setup

| ID          | Descrição                                                                                           | Prioridade | Estimativa | Dependência |
| ----------- | --------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| **AMB-01**  | Estruturar monorepo (ou separar pastas `backend/` + `frontend/`) com package.json raiz              | 🔴 Alta    | 3 HH       | —           |
| **AMB-02**  | Configurar Node 20+, npm/pnpm workspace, scripts de bootstrap (`install`, `dev`, `build`, `test`)    | 🔴 Alta    | 2 HH       | AMB-01      |
| **AMB-03**  | Configurar ESLint + Prettier com regras compartilhadas (TS + React + NestJS) + .editorconfig         | 🔴 Alta    | 3 HH       | AMB-02      |
| **AMB-04**  | Configurar Husky + lint-staged (pre-commit: lint + type-check + format)                             | 🟡 Média   | 2 HH       | AMB-03      |
| **AMB-05**  | Criar `.env.example` em ambos os projetos com variáveis documentadas (SUPABASE_URL, JWT_SECRET, etc)| 🔴 Alta    | 1 HH       | AMB-01      |
| **AMB-06**  | Atualizar `.gitignore` (node_modules, dist, .env, coverage, prisma/migrations gerada)                | 🟢 Baixa   | 0,5 HH     | AMB-01      |
| **AMB-07**  | Integrar Supabase ao projeto: criar projeto via CLI ou UI, anotar `anon_key` e `service_role_key`    | 🔴 Alta    | 2 HH       | AMB-05      |

**Subtotal Ambiente: 7 tarefas / ~13,5 HH**

---

### 4.2 Área: Backend (NestJS + Prisma + Supabase)

#### 4.2.1 Modelagem de Dados & Banco

| ID          | Descrição                                                                                                   | Prioridade | Estimativa | Dependência |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| **BE-MOD-01** | Inicializar NestJS no diretório `backend/`, estruturar módulos (Common, Auth, Locais, Eventos, Tickets)     | 🔴 Alta    | 3 HH       | AMB-02      |
| **BE-MOD-02** | Instalar e configurar Prisma (schema.prisma, datasource PostgreSQL Supabase, generator client)              | 🔴 Alta    | 2 HH       | AMB-07 + BE-MOD-01 |
| **BE-MOD-03** | Modelar entidades no Prisma: **Usuario**, **Local**, **Portao**, **TipoIngresso**, **Evento**, **Ingresso**| 🔴 Alta    | 6 HH       | BE-MOD-02   |
| **BE-MOD-04** | Relacionamentos: Local 1—N Portão, Evento 1—1 Local, Ingresso N—1 Evento, regra de horário (unique parcial)| 🔴 Alta    | 4 HH       | BE-MOD-03   |
| **BE-MOD-05** | Criar e executar primeira migration Prisma (`prisma migrate dev`) + seed com dados mínimos (ex: 2 locais, 1 evento teste) | 🔴 Alta | 3 HH | BE-MOD-04 |
| **BE-MOD-06** | Exportar diagrama ER do Prisma (prisma-erd-generator) e salvar referência no projeto                        | 🟢 Baixa   | 1 HH       | BE-MOD-05   |

#### 4.2.2 Camada de Aplicação (Módulos NestJS)

| ID          | Descrição                                                                                                   | Prioridade | Estimativa | Dependência |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| **BE-APP-01** | Módulo **Locais**: DTOs (CreateLocal, UpdateLocal, ListLocalQuery), Service, Controller (CRUD + paginação)  | 🔴 Alta    | 5 HH       | BE-MOD-05   |
| **BE-APP-02** | Módulo **Portões** (embedded em Local): CRUD de portões por local + associação a tipos de ingresso          | 🔴 Alta    | 4 HH       | BE-APP-01   |
| **BE-APP-03** | Módulo **Tipos de Ingresso**: entidade + CRUD                                                               | 🟡 Média   | 3 HH       | BE-MOD-05   |
| **BE-APP-04** | Módulo **Eventos**: DTOs, Service c/ **validação de conflito de horário por local**, Controller (CRUD)      | 🔴 Alta    | 7 HH       | BE-APP-01   |
| **BE-APP-05** | Módulo **Ingressos**: emitir ingresso associado a evento + tipo + validação de capacidade do local          | 🟡 Média   | 5 HH       | BE-APP-04 + BE-APP-03 |
| **BE-APP-06** | Módulo **Auth** (básico): JWT guard, login de usuário demo (email/senha) — integração c/ Supabase Auth opcional | 🟡 Média | 6 HH | BE-MOD-05 |
| **BE-APP-07** | Validações globais (ValidationPipe, class-validator, class-transformer) + filtros de exceção centralizados | 🔴 Alta    | 3 HH       | BE-MOD-01   |

#### 4.2.3 Validações de Negócio Crítico

| ID          | Descrição                                                                                                   | Prioridade | Estimativa | Dependência |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| **BE-BIZ-01** | Validar **conflito de agenda** ao criar/atualizar evento: `localId` + intervalo de datas/horas sobrepostas | 🔴 Alta    | 4 HH       | BE-APP-04   |
| **BE-BIZ-02** | Validar **capacidade do local** vs. total de ingressos emitidos por evento                                  | 🟡 Média   | 2 HH       | BE-APP-05   |
| **BE-BIZ-03** | Garantir que um evento não seja associado a múltiplos locais (integridade referencial)                     | 🟢 Baixa   | 1 HH       | BE-MOD-04   |
| **BE-BIZ-04** | Associação de **tipo de ingresso → portão liberado** (lógica para catraca)                                 | 🟡 Média   | 3 HH       | BE-APP-02 + BE-APP-03 |

**Subtotal Backend: 21 tarefas / ~71 HH**

---

### 4.3 Área: Design System (shadcn/ui + Tailwind CSS)

| ID      | Descrição                                                                                                     | Prioridade | Estimativa | Dependência |
| ------- | ------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| **DS-01** | Bootstrap frontend: Next.js 14 (App Router) c/ TypeScript + Tailwind CSS v3 + PostCSS + Autoprefixer           | 🔴 Alta    | 3 HH       | AMB-02      |
| **DS-02** | Inicializar **shadcn/ui** no projeto (npx shadcn@latest init): configurar `components.json`, alias `@/`, tema | 🔴 Alta    | 2 HH       | DS-01       |
| **DS-03** | Instalar componentes shadcn base: `button`, `card`, `input`, `label`, `badge`, `avatar`, `dropdown-menu`, `table`, `dialog`, `sheet`, `toast` | 🔴 Alta | 2 HH | DS-02 |
| **DS-04** | Definir tokens de tema em `tailwind.config.ts`: paleta Localis (verde local, bordô evento, neutros, estados de erro/sucesso/aviso) + modo escuro/claro | 🔴 Alta | 4 HH | DS-01 |
| **DS-05** | Validar contraste WCAG AA para todas as combinações de tokens (texto/fundo/bordas) — ajustar se necessário    | 🟡 Média   | 2 HH       | DS-04       |
| **DS-06** | Criar variantes de **Badge** por categoria (Futebol, Show, Teatro, Festival, etc.) c/ cores consistentes     | 🟡 Média   | 1 HH       | DS-03 + DS-04 |
| **DS-07** | Tipografia: configurar fontes (ex: Inter), escala de tamanhos, pesos e line-heights consistentes             | 🟡 Média   | 2 HH       | DS-04       |
| **DS-08** | Utility custom: classe `.line-clamp` c/ tooltip (shadcn `tooltip`) para texto truncado                       | 🟡 Média   | 2 HH       | DS-02       |
| **DS-09** | Ícones: integrar `lucide-react`, criar padrão de `aria-label` + tamanho padrão (16, 18, 20px)                | 🟡 Média   | 1,5 HH     | DS-02       |
| **DS-10** | Criar layout base com ritmo alternado de seções (claro ↔ escuro) — header fixo + sidebar opcional no desktop | 🔴 Alta    | 4 HH       | DS-04 + DS-07 |
| **DS-11** | Animações: definir tokens de transição (duração, easing) + animações padrão (fade, slide, hover)             | 🟢 Baixa   | 2 HH       | DS-04       |

**Subtotal Design System: 11 tarefas / ~25,5 HH**

---

### 4.4 Área: Frontend — Componentes Base

| ID          | Descrição                                                                                                      | Prioridade | Estimativa | Dependência |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| **FE-COMP-01** | **Header**: logo Localis, navegação (Home, Eventos, Locais), tema toggle, menu do usuário c/ dropdown (logout)| 🔴 Alta | 4 HH | DS-03 + DS-10 |
| **FE-COMP-02** | **Avatar c/ fallback**: iniciais + `aria-label` + estado de erro (imagem quebrada)                             | 🟡 Média   | 1,5 HH     | DS-03       |
| **FE-COMP-03** | **HeroSaudacao**: saudação personalizada + subtítulo (corrigir cópia atual no protótipo)                       | 🟡 Média   | 1 HH       | DS-07 + FE-COMP-02 |
| **FE-COMP-04** | **CardDestaque**: componente reutilizável para Locais (verde) e Eventos (bordô), com variante `variant="local"\|"evento"` e CTA | 🔴 Alta | 3 HH | DS-03 + DS-04 |
| **FE-COMP-05** | **ListaRecentes**: wrapper p/ listagem de últimos registros com título + "Ver todos"                          | 🔴 Alta    | 2 HH       | DS-03       |
| **FE-COMP-06** | **BadgeCategoria** com a paleta definida em DS-06 + `aria-label`                                              | 🟡 Média   | 1 HH       | DS-06       |
| **FE-COMP-07** | **LinhaTabela** para locais: nome, endereço (truncado c/ tooltip), portões/email, ações (editar/excluir)      | 🔴 Alta    | 3 HH       | DS-08       |
| **FE-COMP-08** | **LinhaTabela** para eventos: nome, BadgeCategoria, local, datas, ações                                       | 🔴 Alta    | 3 HH       | FE-COMP-07 + FE-COMP-06 |
| **FE-COMP-09** | **EmptyState**: ilustração/ícone + mensagem + CTA (quando não há locais/eventos)                              | 🟡 Média   | 1,5 HH     | DS-09       |
| **FE-COMP-10** | **Skeleton loader** para cards, listas e tabelas                                                              | 🟡 Média   | 2 HH       | DS-03       |
| **FE-COMP-11** | **DropdownAcoes** shadcn com itens: "Editar", "Excluir", "Ver detalhes" + separadores + atalhos de teclado    | 🔴 Alta    | 2 HH       | DS-03       |
| **FE-COMP-12** | **Toast/Notificações** feedback de sucesso/erro após ações CRUD                                               | 🟡 Média   | 2 HH       | DS-03       |
| **FE-COMP-13** | **Form components**: Input com máscara, Select, DatePicker, TimePicker, Textarea, Checkbox, RadioGroup        | 🔴 Alta    | 5 HH       | DS-03       |

**Subtotal Componentes Frontend: 13 tarefas / ~31 HH**

---

### 4.5 Área: Frontend — Páginas, Rotas e Fluxos

| ID          | Descrição                                                                                                      | Prioridade | Estimativa | Dependência |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| **FE-PAG-01** | Roteamento (Next.js App Router): criar grupos `(marketing)`, `(dashboard)` + layouts aninhados                 | 🔴 Alta    | 3 HH       | DS-01       |
| **FE-PAG-02** | **Home / Dashboard** (/) — unir Header, Hero, CardDestaque (×2), ListaRecentes (×2) em grid responsivo         | 🔴 Alta    | 5 HH       | FE-COMP-01/02/03/04/05/07/08/11 |
| **FE-PAG-03** | Correção textual: card Eventos deve exibir "Confira todos os eventos cadastrados!" (não "locais")              | 🟢 Baixa   | 0,5 HH     | FE-PAG-02   |
| **FE-PAG-04** | **Listagem de Locais** (/locais) — tabela shadcn com paginação, busca, filtro por portão, ordenação (diferencial) | 🔴 Alta | 6 HH | FE-COMP-07/09/10/11 |
| **FE-PAG-05** | **Detalhe do Local** (/locais/:id) — ficha do local, lista de portões, eventos associados                      | 🟡 Média   | 4 HH       | FE-PAG-04   |
| **FE-PAG-06** | **Formulário Novo Local** (/locais/novo) — validar campos: nome, capacidade, endereço, N portões → ingresso   | 🔴 Alta    | 6 HH       | FE-COMP-13 + FE-COMP-12 |
| **FE-PAG-07** | **Formulário Editar Local** (/locais/:id/editar) — reutilizar formulário com preenchimento                    | 🔴 Alta    | 2 HH       | FE-PAG-06   |
| **FE-PAG-08** | **Listagem de Eventos** (/eventos) — tabela com filtro por período, categoria, local                          | 🔴 Alta    | 5 HH       | FE-COMP-08/09/10/11 |
| **FE-PAG-09** | **Detalhe do Evento** (/eventos/:id) — dados completos + ingressos emitidos + capacidade vs vendidos          | 🟡 Média   | 4 HH       | FE-PAG-08   |
| **FE-PAG-10** | **Formulário Novo Evento** (/eventos/novo) — validação de conflito client-side **pré-submit** (chama endpoint de disponibilidade) | 🔴 Alta | 7 HH | FE-COMP-13 + FE-COMP-12 |
| **FE-PAG-11** | **Formulário Editar Evento** (/eventos/:id/editar) — reusar + pré-preenchido                                  | 🔴 Alta    | 2 HH       | FE-PAG-10   |
| **FE-PAG-12** | **Confirmação de exclusão**: Dialog shadcn p/ eventos e locais (ação destrutiva — requer confirmação 2x?)      | 🔴 Alta    | 2 HH       | FE-COMP-11   |
| **FE-PAG-13** | **Página 404 e 500 customizadas** c/ navegação de retorno                                                     | 🟢 Baixa   | 1 HH       | FE-PAG-01   |
| **FE-PAG-14** | **Página de Login** simples (se houver módulo auth) — email + senha + loading                                 | 🟡 Média   | 3 HH       | BE-APP-06   |
| **FE-PAG-15** | **Empty states nas listagens**: integração FE-COMP-09 com mensagens customizadas por contexto                  | 🟡 Média   | 1 HH       | FE-PAG-04/08 |
| **FE-PAG-16** | Responsividade final: validar breakpoints `sm`, `md`, `lg`, `xl` em todas as páginas                          | 🔴 Alta    | 4 HH       | TODAS PAGs  |
| **FE-PAG-17** | **Navegação funcional**: links entre páginas (CTA "Conferir", "Ver todos", logo → Home, breadcrumb detalhes)   | 🔴 Alta    | 2 HH       | FE-PAG-01 a 11 |
| **FE-PAG-18** | Animações de transição entre páginas (next/navigation framer-motion / CSSTransition — diferencial)            | 🟢 Baixa   | 2 HH       | DS-11       |

**Subtotal Páginas e Fluxos: 18 tarefas / ~61,5 HH**

---

### 4.6 Área: Integração Frontend ↔ Backend

| ID          | Descrição                                                                                                      | Prioridade | Estimativa | Dependência |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| **INT-01**  | Criar **API Client** base com `fetch` wrapper + interceptor de JWT + timeout + retry (3× em 5xx)              | 🔴 Alta    | 3 HH       | AMB-05 + BE-APP-06 |
| **INT-02**  | **Hooks de dados (TanStack Query / React Query)**: `useLocais`, `useLocal`, `useEventos`, `useEvento`, `useCUD` (create/update/delete) | 🔴 Alta | 5 HH | INT-01 |
| **INT-03**  | **Serviço tipado**: gerar/definir interfaces TypeScript a partir de DTOs Nest (shared types ou `zod`)          | 🔴 Alta    | 3 HH       | BE-APP-01 a 05 |
| **INT-04**  | Tratamento de erros centralizado: mapear HTTP status → mensagens amigáveis + Toast (FE-COMP-12)                | 🔴 Alta    | 2 HH       | FE-COMP-12 + INT-01 |
| **INT-05**  | **Máscaras de campos**: aplicar em formulários (CEP, telefone, email, hora, data) — ex: `react-hook-form` + zod | 🔴 Alta | 2 HH | FE-COMP-13 |
| **INT-06**  | **Validação de conflito em formulário evento (INT-02→BE-BIZ-01)**: campo "local" + datas acionam endpoint `GET /eventos/disponibilidade` | 🔴 Alta | 3 HH | FE-PAG-10 + BE-BIZ-01 |

**Subtotal Integração: 6 tarefas / ~18 HH**

---

### 4.7 Área: Qualidade & Testes

| ID      | Descrição                                                                                                        | Prioridade | Estimativa | Dependência |
| ------- | ---------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| **QA-01** | Backend: configurar **Vitest** + testes unitários para Services (Locais, Eventos, Auth) — 1 caso de uso por método | 🟡 Média | 8 HH | BE-APP-01 a 07 |
| **QA-02** | Backend: testes de integração (supertest) para endpoints principais CRUD + validação de conflito (BE-BIZ-01)     | 🟡 Média   | 5 HH       | BE-BIZ-01   |
| **QA-03** | Frontend: configurar **Jest + React Testing Library**, testes de snapshot p/ componentes críticos (Header, Cards)| 🟢 Baixa   | 4 HH       | FE-COMP-01 a 05 |
| **QA-04** | Audit de acessibilidade (axe-core / Lighthouse): foco em contraste, labels, navegação teclada + ARIA             | 🟡 Média   | 3 HH       | DS-05 + FE-PAG-16 |
| **QA-05** | Testes E2E (Playwright/Cypress) — fluxo: login → listar → criar evento → excluir (diferencial)                   | 🟢 Baixa   | 5 HH       | INT-06 concluído |
| **QA-06** | **Type-check estrito** (`tsc --noEmit`) + coverage mínimo (ex: ≥ 70%) no CI                                      | 🟡 Média   | 2 HH       | AMB-04      |
| **QA-07** | Revisão de tratamento de erros: bordas do sistema (sem conexão, timeouts, 401, 403, 404, 409, 500)              | 🟡 Média   | 2 HH       | INT-04      |
| **QA-08** | **Smoke test manual checklist**: navegadores (Chrome, Firefox, Safari) × dispositivos (375px, 768px, 1280px)     | 🟢 Baixa   | 2 HH       | FE-PAG-16   |

**Subtotal Qualidade: 8 tarefas / ~31 HH**

---

### 4.8 Área: Deploy & Infraestrutura

| ID        | Descrição                                                                                                      | Prioridade | Estimativa | Dependência |
| --------- | -------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| **DEP-01**| Backend: **Dockerfile** + `docker-compose` c/ app + banco (p/ rodar local sem depender de Supabase em dev)     | 🟡 Média   | 3 HH       | BE-MOD-05   |
| **DEP-02**| Frontend: preparar build de produção Next.js (standalone output) + variáveis de env públicas/privadas          | 🔴 Alta    | 2 HH       | FE-PAG-10   |
| **DEP-03**| **Deploy Frontend → Vercel**: configurar projeto, domínio opcional, variáveis, integração GitHub               | 🟡 Média   | 1 HH       | DEP-02      |
| **DEP-04**| **Deploy Backend → Fly.io / Render**: configurar runtime Node 20, variáveis (SUPABASE, JWT), healthcheck       | 🟡 Média   | 2 HH       | DEP-01      |
| **DEP-05**| **CI/CD** (GitHub Actions): pipeline: `lint → type-check → test → build → deploy` (separado FE/BE)             | 🟡 Média   | 4 HH       | AMB-04 + QA-06 |
| **DEP-06**| Supabase em produção: ativar RLS, configurar PITR, anotar endpoint público vs interno                         | 🟡 Média   | 2 HH       | AMB-07      |
| **DEP-07**| **Documentação de deploy** passo a passo (README seção "Rodando local" e "Deploy")                             | 🟢 Baixa   | 1 HH       | DEP-03/04   |

**Subtotal Deploy: 7 tarefas / ~15 HH**

---

### 4.9 Área: Diferenciais (Valor Agregado)

| ID          | Descrição                                                                                                      | Prioridade | Estimativa | Dependência |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| **DIF-01**  | **Busca global (search)** via query param nas listagens (debounce 300ms)                                       | 🟡 Média   | 3 HH       | FE-PAG-04/08 + INT-02 |
| **DIF-02**  | **Filtros avançados**: combo de filtros (período, categoria, local, capacidade) com URL state                  | 🟢 Baixa   | 4 HH       | DIF-01      |
| **DIF-03**  | **Ordenação clicável** no header da tabela shadcn (nome, data, capacidade)                                     | 🟢 Baixa   | 2 HH       | DIF-02      |
| **DIF-04**  | **Paginação servidor** (page / perPage) em todos os endpoints de listagem                                      | 🟡 Média   | 3 HH       | BE-APP-01/04 |
| **DIF-05**  | Backend: **Swagger/OpenAPI** (`@nestjs/swagger`) documentando todos os endpoints, DTOs e códigos HTTP          | 🟡 Média   | 4 HH       | BE-APP-01 a 07 |
| **DIF-06**  | Backend: **Logger** estruturado (Pino ou Nest Logger) + middleware de request/response log                     | 🟢 Baixa   | 2 HH       | BE-APP-07   |
| **DIF-07**  | Frontend: **Animações de interação** (hover scale, botão click, toast entrada/saída) — DS-11                   | 🟢 Baixa   | 2 HH       | DS-11 + FE-COMP-04/11 |
| **DIF-08**  | Feature: **gerar ingresso PDF/QR** (simulação da catraca facial)                                              | 🟢 Baixa   | 4 HH       | BE-APP-05   |
| **DIF-09**  | Frontend: **Importar/Exportar CSV** nas listagens                                                              | 🟢 Baixa   | 3 HH       | DIF-04      |
| **DIF-10**  | **Compartilhar evento**: botão com deep-link + Web Share API                                                  | 🟢 Baixa   | 1 HH       | FE-PAG-09   |
| **DIF-11**  | **Modo offline básico**: cache TanStack Query persist (localStorage)                                           | 🟢 Baixa   | 2 HH       | INT-02      |
| **DIF-12**  | **Dark/Light mode toggle** no Header (persistência c/ cookie + Tailwind class strategy)                        | 🟡 Média   | 2 HH       | DS-04 + FE-COMP-01 |

**Subtotal Diferenciais: 12 tarefas / ~32 HH**

---

## 5. Ordem Sugerida de Execução (Roadmap em Fases)

```
Fase 1 — Infra e Fundações (~2 dias)
  1. AMB-01 → AMB-07 (Setup completo)
  2. DS-01 → DS-04, DS-10 (Design System base)
  3. BE-MOD-01 → BE-MOD-05 (Backend modelagem + first migration)

Fase 2 — Backend MVP (~3 dias)
  4. BE-APP-01, BE-APP-02, BE-APP-03 (Módulos Locais/Portões/TipoIngresso)
  5. BE-APP-04, BE-APP-05, BE-APP-07 (Módulos Eventos/Ingressos + validações)
  6. BE-BIZ-01, BE-BIZ-02, BE-BIZ-04 (Regras de negócio)
  7. BE-APP-06 (Auth — opcionalmente adiantar)

Fase 3 — Frontend Componentes + Páginas CRUD (~4 dias)
  8. DS-05 → DS-11 (Restante do Design System)
  9. FE-COMP-01 → FE-COMP-13 (Componentes)
  10. FE-PAG-01, FE-PAG-02, FE-PAG-17 (Dashboard + navegação funcional)
  11. FE-PAG-04 → FE-PAG-07 (Locais: listagem, detalhe, form)
  12. FE-PAG-08 → FE-PAG-11 (Eventos: listagem, detalhe, form)
  13. FE-PAG-12, FE-PAG-15, FE-PAG-16 (Confirmar exclusão, empty states, responsividade)

Fase 4 — Integração + Qualidade (~2 dias)
  14. INT-01 → INT-06 (API client, hooks, tipagem, validações)
  15. QA-01, QA-02, QA-06 (Testes backend + type-check CI)
  16. QA-04, QA-07 (Acessibilidade + bordas de erro)

Fase 5 — Diferenciais + Deploy (~1-2 dias, opcional)
  17. DIF-04, DIF-05 (Paginação + Swagger)
  18. DIF-01, DIF-02, DIF-03 (Busca, filtros, ordenação)
  19. DIF-12 (Tema claro/escuro)
  20. DEP-01 → DEP-07 (Docker + Vercel/Render + CI/CD)
```

---

## 6. Critérios de Pronto (Definition of Done) por Tarefa

Para **qualquer** tarefa ser considerada concluída, deve atender:

1. ✅ Código com tipagem TypeScript estrita (`strict: true`)
2. ✅ Lint + Prettier passando (`npm run lint` sem erros)
3. ✅ Testes do módulo passando (quando QA-X associado)
4. ✅ Responsivo em 375px (mobile), 768px (tablet), 1280px (desktop)
5. ✅ WCAG AA: contraste texto/fundo, `aria-label` em ícones/botões sem texto, navegação teclada
6. ✅ Componente/página com estado de loading + empty state + erro
7. ✅ Revisão de acessibilidade com `axe-core` (QA-04)
8. ✅ Integração funcional com rotas e navegação entre páginas

---

## 7. Rastreabilidade — Requisitos → Tarefas

| Requisito (README)                                                                 | Tarefas que o entregam                                                                 |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Locais com diferentes entradas/portões e acesso por tipo de ingresso               | BE-MOD-03, BE-MOD-04, BE-APP-02, BE-APP-03, BE-BIZ-04, FE-COMP-07, FE-PAG-05           |
| Eventos sempre associados a 1 local                                                | BE-MOD-03, BE-MOD-04, BE-BIZ-03, FE-PAG-10, INT-06                                     |
| Eventos com data e horário início e fim                                            | BE-APP-04, FE-COMP-13 (DatePicker/TimePicker), FE-PAG-10                               |
| Sem conflito de agenda local/horário                                               | BE-BIZ-01, INT-06, FE-PAG-10                                                           |
| React/Next + estado (Context/Redux/MobX/TanStack Query)                            | DS-01, INT-02                                                                          |
| Rotas (react-router / next)                                                        | FE-PAG-01, FE-PAG-17                                                                   |
| Biblioteca de design system (shadcn/ui) + CSS (Tailwind) — *definido no escopo*    | DS-01 a DS-11, FE-COMP-01 a FE-COMP-13                                                 |
| Validação de formulários + máscaras                                                | INT-05, FE-COMP-13, FE-PAG-06, FE-PAG-10                                               |
| Responsividade                                                                     | FE-PAG-16, DS-04 (breakpoints Tailwind)                                                |
| Diferenciais (testes, animações, lint, busca/filtros, deploy)                      | QA-01 a QA-08, DIF-01 a DIF-12, DEP-01 a DEP-07                                        |

---

*Documento gerado a partir da análise de [README.md](file:///c:/Users/Leo/Documents/trae_projects/Desafio-Node-Fullstack/README.md) e [image.png](file:///c:/Users/Leo/Documents/trae_projects/Desafio-Node-Fullstack/image.png).*
