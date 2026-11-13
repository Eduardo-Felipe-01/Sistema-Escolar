# 03. Arquitetura de Hospedagem e Deploy em Produção (Vercel + Railway)

**Commit de referência na `develop`:** `719d926` — `feat(deploy): configurar hospedagem híbrida em produção (Vercel + Railway) com proxy reverso e suporte a portas dinâmicas`

---

## 1. Visão Arquitetural: Por que Vercel + Railway?

O ecossistema **Educa+** possui quatro camadas principais descritas no `docker-compose.yml`:
1. **Frontend Web (`frontend-angular`):** Angular 19 SPA (arquivos estáticos HTML/JS/CSS após build).
2. **Backend Central (`backend-spring`):** Java 17 + Spring Boot 3.2.3 (container contínuo com Tomcat, Hibernate/JPA e Spring Data MongoDB).
3. **Microsserviço de Estatísticas (`python-analytics`):** Python 3.11 + FastAPI + Uvicorn + **Pandas** + **NumPy**.
4. **Bancos de Dados:** PostgreSQL (relacional principal) e MongoDB (secundário de auditoria e relatórios).

Como a **Vercel** não executa containers Java 17/Spring Boot persistentes e funções serverless Python na Vercel possuem teto de tamanho (~250 MB) incompatível com empacotamento completo de `pandas` + `numpy`, adotamos uma **arquitetura híbrida profissional**:

```text
                       HTTPS (Domínio único Vercel)
     Navegador ─────────────────────────────────────────────┐
                                                            ▼
                                           ┌─────────────────────────────────┐
                                           │   VERCEL (frontend-angular)     │
                                           │   dist/gestao-escolar/browser   │
                                           └──────┬───────────────┬──────────┘
                                                  │               │
                        Rewrite /api/:path*       │               │ Rewrite /py-analytics/:path*
                     (x-vercel-enable-rewrite     │               │ (x-vercel-enable-rewrite
                              -caching: 0)        ▼               ▼        -caching: 0)
                                      ┌───────────────────┐ ┌──────────────────────┐
                                      │  RAILWAY          │ │  RAILWAY             │
                                      │  backend-spring   │ │  python-analytics    │
                                      │  Java 17 :8080    │ │  FastAPI :8000       │
                                      └────┬───────┬───┬──┘ └──────────────────────┘
                                           │       │   │              ▲
                     JDBC PostgreSQL       │       │   └──────────────┘
               ┌───────────────────────────┘       │    Rede Interna Railway
               ▼                                   ▼    (railway.internal:8000)
     ┌───────────────────┐             ┌──────────────────────┐
     │ RAILWAY Postgres  │             │  RAILWAY MongoDB     │
     │ PostgreSQL 18     │             │  MongoDB 8.0         │
     │ (postgres-volume) │             │  (mongodb-volume)    │
     └───────────────────┘             └──────────────────────┘
```

### Vantagens dessa arquitetura
- **Zero erros de CORS e Mixed Content:** o navegador sempre faz requisições HTTPS para o mesmo domínio (`https://frontend-angular-zeta.vercel.app`), enquanto os rewrites da Vercel encaminham no lado servidor para os serviços no Railway.
- **Tráfego privado entre backend Java e serviço Python + bancos:** no Railway, `backend-spring` comunica-se com `Postgres`, `MongoDB` e `python-analytics` diretamente pela rede privada (`*.railway.internal`), reduzindo latência e sem expor portas de banco à internet.
- **Desenvolvimento local preservado:** o `docker-compose.yml` local continua funcionando exatamente igual em `http://localhost:4200`.

---

## 2. Alterações Aplicadas no Código para Produção

### 2.1. Detecção Automática Local vs Produção (`api.config.ts`)
**Criado:** `frontend-angular/src/app/core/config/api.config.ts`

```ts
const isLocalHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocalHost ? 'http://localhost:8080' : '';
export const ANALYTICS_BASE_URL = isLocalHost ? 'http://localhost:8000' : '/py-analytics';
```

- **Quando acessado em `localhost`:** mantém chamadas diretas para `http://localhost:8080/api/...` e `http://localhost:8000/api/...`.
- **Quando acessado em produção na Vercel:** envia requisições relativas `/api/...` e `/py-analytics/...`, capturadas pelos rewrites da Vercel.

**Arquivos atualizados para substituir URLs fixas por `API_BASE_URL` / `ANALYTICS_BASE_URL`:**
- `frontend-angular/src/app/core/services/auth.service.ts`
- `frontend-angular/src/app/core/services/professor.service.ts`
- `frontend-angular/src/app/core/services/analytics.service.ts`
- `frontend-angular/src/app/modules/aluno/aluno-view.component.ts` (5 endpoints)
- `frontend-angular/src/app/modules/coordenador/coordenador-view.component.ts` (21 endpoints)

### 2.2. Configuração da Vercel (`frontend-angular/vercel.json`)
- `framework`: `"angular"`
- `buildCommand`: `"npm run build"`
- `outputDirectory`: `"dist/gestao-escolar/browser"` (pasta gerada pelo builder `@angular-devkit/build-angular:application` do Angular 19)
- `rewrites`:
  1. `/api/:path*` → `https://backend-spring-production-5401a3f1.up.railway.app/api/:path*`
  2. `/py-analytics/:path*` → `https://python-analytics-production-0b901680.up.railway.app/:path*`
  3. `/(.*)` → `/index.html` (fallback SPA para deep links das rotas `/login`, `/professor/...`, `/aluno`, `/coordenador`)
- `headers`: define `x-vercel-enable-rewrite-caching: "0"` para `/api/:path*` e `/py-analytics/:path*`, evitando cache indevido na borda da CDN sobre respostas autenticadas ou dinâmicas da API.

### 2.3. Adaptação dos Serviços no Railway
- **`backend-spring/src/main/resources/application.yml`:** `server.port` atualizado para `${PORT:8080}` (respeita `PORT` do Railway e mantém `8080` como padrão local).
- **`backend-spring/.dockerignore`:** criado ignorando `target/` e `.git/` para acelerar e limpar o upload do container.
- **`python-analytics/Dockerfile`:** comando `CMD` alterado para `["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]` (respeita `PORT` do Railway e mantém `8000` como padrão local).

---

## 3. Infraestrutura Provisionada no Railway

Projeto criado: **`sistema-escolar-educa-mais`** (ambiente **`production`**)

| Serviço | Tipo / Origem | Porta Pública | Configuração e Variáveis Principais (Sem Segredos) |
|---|---|---|---|
| **Postgres** | Template PostgreSQL (`postgres-ssl:18`) | Privada (`5432`) | Volume persistente `postgres-volume` (`/var/lib/postgresql/data`) |
| **MongoDB** | Template MongoDB (`mongo:8.0`) | Privada (`27017`) | Volume persistente `mongodb-volume` (`/data/db`) |
| **python-analytics** | Dockerfile (`python:3.11-slim`) | `8000` (HTTPS pública + interna) | `PORT=8000` |
| **backend-spring** | Dockerfile (Maven + Temurin 17 JRE) | `8080` (HTTPS pública) | `PORT=8080`, `POSTGRES_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `MONGODB_URI`, `ANALYTICS_URL` |

### Referências de Conexão Interna no `backend-spring`
- `POSTGRES_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}`
- `POSTGRES_USER=${{Postgres.PGUSER}}`
- `POSTGRES_PASSWORD=${{Postgres.PGPASSWORD}}`
- `MONGODB_URI=mongodb://${{MongoDB.MONGOUSER}}:${{MongoDB.MONGOPASSWORD}}@${{MongoDB.MONGOHOST}}:${{MongoDB.MONGOPORT}}/escola_secundaria?authSource=admin`
  > *Nota técnica:* o sufixo `/escola_secundaria?authSource=admin` é obrigatório no Spring Data MongoDB quando o usuário root do template MongoDB do Railway se autentica no banco `admin` para gravar na base `escola_secundaria`.
- `ANALYTICS_URL=http://${{python-analytics.RAILWAY_PRIVATE_DOMAIN}}:8000`

---

## 4. Como Funciona a Atualização do Site e Como Ativar Auto-Deploy por Branch (`develop` → `main`)

No deploy inicial, tanto a Vercel (`vercel --prod --yes` na pasta `frontend-angular`) quanto o Railway (`railway up`) receberam o código diretamente via CLI, pois a vinculação automática ao GitHub falhou durante a criação por autorização de repositório (`Failed to connect Eduardo-Felipe-01/Sistema-Escolar to project`).

**Para passar a atualizar automaticamente a cada commit no GitHub:**
1. No painel da **Vercel** (`frontend-angular` → **Settings → Git**):
   - Autorize o GitHub App da Vercel no repositório `Eduardo-Felipe-01/Sistema-Escolar` e conecte o repositório ao projeto.
2. Em **Settings → Build and Deployment → Root Directory**:
   - Preencha **`frontend-angular`** (obrigatório quando conectado ao repositório completo).
3. Em **Settings → Environments / Git → Production Branch**:
   - Defina inicialmente **`develop`**. Sempre que houver `git push` na `develop`, a Vercel atualizará automaticamente o domínio de produção.
   - Quando quiser migrar para a branch principal, basta alterar **Production Branch** para **`main`**.
4. No **Railway** (opcional, para rebuild automático do Java/Python via Git):
   - Em **Settings → Source** dos serviços `backend-spring` e `python-analytics`, conecte `Eduardo-Felipe-01/Sistema-Escolar` apontando para os respectivos diretórios raiz (`/backend-spring` e `/python-analytics`) na branch desejada.
   - Enquanto não conectar via Git, o redeploy manual pode ser feito a qualquer momento rodando `railway up` nas pastas de cada serviço e `vercel --prod` dentro de `frontend-angular`.
