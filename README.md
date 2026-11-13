# 📚 Documentação Técnica — Educa+ (Branch `Docs-Alexsander`)

> **Responsável:** Alexsander Albino dos Santos  
> **Escopo desta branch:** Documentação exclusiva de todas as evoluções de **Identidade Visual**, **Iconografia (Font Awesome)**, **Acessibilidade**, **Padronização de Exportação PDF (sem VLibras/URL)** e **Arquitetura & Deploy em Produção (Vercel + Railway)** realizadas no projeto **Educa+ — Sistema Integrado de Gestão Escolar**.

---

## 🌐 Links Públicos do Sistema Hospedado

| Serviço / Recurso | Plataforma | Link Direto |
|---|---|---|
| **Sistema Web (Frontend Angular 19)** | **Vercel** | https://educamaisnassau.vercel.app |
| **API Central (Java 17 / Spring Boot 3)** | **Railway** | https://backend-spring-production-5401a3f1.up.railway.app |
| **Microsserviço Analytics (Python / FastAPI)** | **Railway** | https://python-analytics-production-0b901680.up.railway.app |
| **Healthcheck Analytics (via Proxy Vercel)** | **Vercel → Railway** | https://educamaisnassau.vercel.app/py-analytics/health |
| **Repositório Oficial (`develop`)** | **GitHub** | https://github.com/Eduardo-Felipe-01/Sistema-Escolar/tree/develop |
| **Branch desta Documentação (`Docs-Alexsander`)** | **GitHub** | https://github.com/Eduardo-Felipe-01/Sistema-Escolar/tree/Docs-Alexsander |

---

## 🔐 Contas de Demonstração em Produção

> Todos os usuários semeados automaticamente pelo `DataInitializationService` na primeira inicialização utilizam a senha padrão: `senha123`

| Perfil | Nome | E-mail | Matrícula |
|---|---|---|---|
| **Coordenação** | Ana Paula Silva | `coord.ana@escola.com` | `COORD-001` |
| **Docente (Matemática / Física)** | Prof. Carlos Alberto Mendes | `prof.carlos@escola.com` | `PROF-101` |
| **Docente** | Profa. Fernanda Rocha | `prof.fernanda@escola.com` | `PROF-102` |
| **Estudante** | Lucas Gabriel Oliveira | `aluno.lucas@escola.com` | `2026-ALU-001` |
| **Estudante** | Beatriz Helena Santos | `aluno.beatriz@escola.com` | `2026-ALU-002` |

---

## 📑 Índice da Documentação

| Documento | Conteúdo Abordado |
|---|---|
| **[01. Identidade Visual, Ícones e Acessibilidade](docs/01-IDENTIDADE-VISUAL-E-ACESSIBILIDADE.md)** | Paleta institucional (`#083660` / `#12A86B`), Modo Claro padrão + Modo Escuro opcional, logo e favicon oficiais, substituição integral de emojis por **Font Awesome 6.5.2**, compactação da barra de acessibilidade, filtros de daltonismo, correção de sobreposição e cards clicáveis no painel docente. |
| **[02. Exportação PDF, VLibras e Impressão Limpa](docs/02-EXPORTACAO-PDF-E-VLIBRAS.md)** | Arquitetura do `PdfPrintService`, ocultação inteligente do widget VLibras **apenas** durante a impressão, supressão de cabeçalhos/rodapés com URL do navegador (`@page`), layout A4 oficial claro para Professor e Aluno e isolamento de documento alvo. |
| **[03. Arquitetura e Deploy em Produção (Vercel + Railway)](docs/03-ARQUITETURA-E-DEPLOY-VERCEL-RAILWAY.md)** | Justificativa da arquitetura híbrida, diagrama de rede, proxy reverso via `vercel.json`, detecção automática Local vs Produção (`api.config.ts`), provisionamento de PostgreSQL + MongoDB + FastAPI + Spring Boot no Railway, variáveis de ambiente e guia de Auto-Deploy via GitHub (`develop` → `main`). |
| **[04. Links, Validação Ponta a Ponta e Histórico de Commits](docs/04-LINKS-E-HISTORICO-COMMITS.md)** | Mapa consolidado de links e serviços em nuvem, evidências da validação ponta a ponta em produção e linha do tempo detalhada dos commits (`23df816` até `719d926`). |

---

## 🧭 Linha do Tempo Resumida das Entregas

1. **`23df816`** — Identidade visual oficial do Educa+ (logo, favicon, paleta Azul Acadêmico & Verde Esmeralda e Modo Claro como padrão).
2. **`e0e38b3`** — Compactação da barra fixa de acessibilidade em dois botões flutuantes (menu expansível de acessibilidade + alternador de tema).
3. **`c88ea43`** — Cards de métricas do painel do docente transformados em atalhos clicáveis de navegação.
4. **`4137416`** — Substituição completa de todos os emojis usados como ícones por ícones vetoriais do **Font Awesome**.
5. **`f58a6b1`** — Correção de posicionamento para eliminar sobreposição dos controles flutuantes sobre cabeçalhos e botões de ação.
6. **`3a6ea39`** — Reestruturação completa das exportações em PDF (Professor e Aluno), remoção do widget VLibras nos PDFs e eliminação da URL/data de impressão.
7. **`719d926`** — Configuração e publicação full-stack em produção na **Vercel** (Frontend SPA + Proxy Reverso) e **Railway** (Spring Boot, FastAPI, PostgreSQL e MongoDB).
