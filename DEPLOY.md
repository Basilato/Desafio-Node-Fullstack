# 🚀 Deploy do Event OS (Portfólio)

Estratégia: **Frontend na Vercel (grátis) + Backend no Render (grátis) + Banco no Supabase (já configurado)**

Ambos os deploys abaixo usam blueprint configurado — quase tudo automático.

---

## 🔐 PRÉ-REQUISITO (1 VEZ SÓ)

**Commit e push** das alterações atuais pro GitHub (Vercel e Render leem direto do seu repo):
```powershell
git add -A
git commit -m "config: deploy setup vercel + render"
git push
```

---

## PASSO 1 — 🌐 FRONTEND NA VERCEL

### Se o projeto já foi importado mas está quebrado:

1. Abre o projeto na Vercel → **Settings → General**
2. **Root Directory**: digita `frontend` → Save
3. **Framework Preset**: deixa em **Next.js** (ela detecta automaticamente agora)
4. Build Command e Output Directory → deixa a Vercel preencher sozinha
5. Salva
6. Vai na aba **Deployments** → 3 pontinhos no deploy mais recente → **Redeploy**

### Se ainda NÃO importou o projeto:

1. Vai em https://vercel.com/new
2. Importa o repo do GitHub
3. Na tela de configuração do projeto:
   - **Framework Preset**: Next.js (deve auto-detectar)
   - **Root Directory**: clica em Edit → digita `frontend`
   - **Build Command, Install Command, Output Directory**: deixa a Vercel preencher sozinha (ela lê de dentro da pasta frontend agora)
4. Clica em **Deploy** e aguarda ~2 min

### Variáveis de ambiente do Frontend:

Depois que o primeiro deploy terminar:
- Settings → **Environment Variables**
- Adiciona essas 3 (marque Production, Preview e Development nas 3):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_APP_NAME` | `Event OS` |
| `NEXT_PUBLIC_NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `$$COLE_AQUI_URL_DO_BACKEND_RENDER$$` (deixa esse placeholder por enquanto, atualiza no Passo 3) |

---

## PASSO 2 — ⚙️ BACKEND NO RENDER (Grátis — não precisa de cartão)

### Opção A: Deploy via Blueprint render.yaml (RECOMENDADO)

1. Acesse: https://dashboard.render.com/blueprints
2. Clica em **New Blueprint Instance**
3. Escolhe o mesmo repo do GitHub e branch `main`
4. O Render já encontra o arquivo `render.yaml` na raiz e preenche:
   - **Root Directory**: backend (automático)
   - **Build Command**: `npm install && npm run build` (automático)
   - **Start Command**: `npm run start:prod` (automático)
   - **Instance Plan**: Free (automático)
   - **JWT_SECRET**: ele gera um valor aleatório automaticamente (✅)
5. Agora na tela de configuração das envs que aparecem como **Required / Empty**:

| Key | O que colar |
|---|---|
| `DATABASE_URL` | Painel Supabase → Project Settings → Database → **Connection Pooler URL** (a que tem `:6543/postgres?pgbouncer=true` e `?schema=public` se já existir) |
| `DIRECT_URL` | Painel Supabase → Project Settings → Database → **Direct Connection URL** (a que tem `:5432/postgres` SEM pgbouncer) |
| `CORS_ORIGIN` | **Por enquanto pode deixar em branco** (o código já aceita automaticamente `*.vercel.app` e `*.onrender.com`). Se depois quiser domínio customizado, cola aqui a URL final do front Vercel |

6. Clica em **Apply** e espera o build (2-4 min)
7. Quando terminar, o Render te dá uma URL tipo: `https://event-os-backend-abc123.onrender.com` — **COPIA ESSA URL**

### Opção B: Deploy manual (se blueprint der problema):
1. New → **Web Service** → Conecta o repo
2. **Name**: `event-os-backend`
3. **Root Directory**: `backend`
4. **Runtime**: Node
5. **Build Command**: `npm install && npm run build`
6. **Start Command**: `npm run start:prod`
7. **Instance Type**: **Free**
8. Advanced → **Add Environment Variables** (todas abaixo):

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `CORS_ORIGIN` | _(pode deixar vazio)_ |
| `DATABASE_URL` | URL Pooler do Supabase |
| `DIRECT_URL` | URL Direta do Supabase |
| `JWT_SECRET` | gera com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` no terminal local |
| `JWT_EXPIRES_IN` | `7d` |
| `BCRYPT_ROUNDS` | `10` |
| `LOG_LEVEL` | `info` |

9. **Create Web Service**

---

## PASSO 3 — 🔗 CONECTA OS DOIS (Última etapa!)

1. **Copia a URL do backend do Render** (ex: `https://event-os-backend-abc123.onrender.com`)
2. Vai na Vercel → **Settings → Environment Variables**
3. Edita a variável `NEXT_PUBLIC_API_URL` e cola a URL do Render  
   ⚠️ **SEM BARRA NO FINAL** → `https://event-os-backend-abc123.onrender.com` (não adiciona `/api` — o frontend já faz isso internamente)
4. Marca ambientes Production, Preview e Development → Save
5. Vai na aba **Deployments** da Vercel → 3 pontinhos no último deploy → **Redeploy**
6. Quando terminar o Redeploy, clica em **Visit** na Vercel ✅

---

## PASSO 4 — TESTA RÁPIDO

- Abre a URL do Vercel → tela de login
- Faz login com `admin@localis.com.br` / senha do seed
- Se aparecer o Dashboard tá tudo OK.
- Se demorar 10-20s no primeiro acesso → é o backend free do Render acordando (comum para portfólio, pode colocar um aviso na tela se quiser).
- Swagger da API: `$$URL_DO_BACKEND$$/docs`

---

## 📋 RESUMO DE ARQUIVOS QUE FORAM AJUSTADOS NESSA RODADA:

| Arquivo | O que faz |
|---|---|
| [render.yaml](file:///c:/Users/Leo/Documents/trae_projects/Desafio-Node-Fullstack/render.yaml) | Blueprint do Render — cria backend já com build/start/env pré-configurados |
| [frontend/vercel.json](file:///c:/Users/Leo/Documents/trae_projects/Desafio-Node-Fullstack/frontend/vercel.json) | Config limpa de Vercel (o framework detection do Next pega o resto) |
| [backend/package.json](file:///c:/Users/Leo/Documents/trae_projects/Desafio-Node-Fullstack/backend/package.json#L8) | Build roda `prisma generate` antes do `nest build` (obrigatório no Render) |
| [backend/src/main.ts](file:///c:/Users/Leo/Documents/trae_projects/Desafio-Node-Fullstack/backend/src/main.ts#L24-L37) | CORS aceita automaticamente `*.vercel.app`, `*.onrender.com`, `*.railway.app` (sem precisar ficar trocando CORS_ORIGIN toda vez) |
