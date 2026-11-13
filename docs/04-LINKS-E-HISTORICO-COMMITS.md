# 04. Links Públicos, Validação em Produção e Histórico Completo

---

## 1. Mapa Consolidado de Links

### Aplicação Hospedada
- **Frontend Web (Vercel Production):** https://educamaisnassau.vercel.app
- **Login Direto:** https://educamaisnassau.vercel.app/login
- **Backend Spring Boot (Railway):** https://backend-spring-production-5401a3f1.up.railway.app
- **Python Analytics (Railway):** https://python-analytics-production-0b901680.up.railway.app
- **Healthcheck Python Direto:** https://python-analytics-production-0b901680.up.railway.app/health
- **Healthcheck Python via Proxy Vercel:** https://educamaisnassau.vercel.app/py-analytics/health

### Controle de Versão (GitHub)
- **Repositório Principal:** https://github.com/Eduardo-Felipe-01/Sistema-Escolar
- **Branch de Desenvolvimento (`develop`):** https://github.com/Eduardo-Felipe-01/Sistema-Escolar/tree/develop
- **Branch Exclusiva desta Documentação (`Docs-Alexsander`):** https://github.com/Eduardo-Felipe-01/Sistema-Escolar/tree/Docs-Alexsander

### Identificadores de Infraestrutura (Sem Credenciais)
- **Vercel Project:** `frontend-angular` (`prj_DqsVCRHyQxN8NOEruf8yUuDkW5C3`)
- **Railway Project:** `sistema-escolar-educa-mais` (`8a8ffb7b-130e-4639-80c0-9bb6203542f3`)
- **Railway Environment:** `production` (`54c28ef1-df7e-46ab-b7b6-8e4f023e42ff`)
- **Serviços no Railway:** `Postgres`, `MongoDB`, `python-analytics`, `backend-spring`

---

## 2. Verificação Ponta a Ponta Executada em Produção

Após a publicação simultânea nos dois provedores, o sistema foi validado em navegador real sobre `https://educamaisnassau.vercel.app`:

1. **Inicialização de Bancos e Carga Inicial (`backend-spring`):**
   - `HikariPool-1` conectado ao PostgreSQL (`postgres.railway.internal:5432`).
   - Driver MongoDB conectado ao servidor `mongodb.railway.internal:27017` (`state=CONNECTED`).
   - `DataInitializationService` concluiu a carga inicial (`Carga inicial concluída com sucesso! Usuários de teste prontos.`).
2. **Microsserviço Python (`python-analytics`):**
   - `GET /py-analytics/health` via Vercel retornou `HTTP 200` com `{"status":"healthy","service":"Python Analytics Service","version":"1.0.0"}`.
3. **Autenticação e Navegação Real no Navegador:**
   - Tela de login carregada com logo oficial, atalhos de perfil, alternador de tema e widget VLibras.
   - Login autenticado como `prof.carlos@escola.com` (`POST /api/auth/login` → `HTTP 200` via proxy Vercel → Railway).
   - Painel do Docente carregou `GET /api/professor/turmas` (`HTTP 200`) exibindo 2 turmas atribuídas (*3º Ano A - Ensino Médio* / Matemática e *2º Ano B - Ensino Médio* / Física).
   - Tela de Relatórios carregou `GET /api/professor/turmas/1/disciplinas/1/relatorio` (`HTTP 200`) e acionou `POST /py-analytics/api/analytics/turma-estatisticas` (`HTTP 200`), renderizando os indicadores reais (Média `6.84`, Mediana `7.4`, Desvio Padrão `1.87`, Taxa de Aprovação `60%`) e recomendações pedagógicas automatizadas, com **0 erros de console**.

---

## 3. Histórico Detalhado de Commits Documentados

| Hash | Branch Origem | Resumo Técnico | Principais Arquivos Impactados |
|---|---|---|---|
| `23df816` | `develop` | Identidade visual Educa+, logo oficial, favicon e Modo Claro padrão | `styles.css`, `index.html`, `accessibility.service.ts`, `logo-educa-mais.png`, `favicon.png`, views e módulos |
| `e0e38b3` | `develop` | Compactação da barra de acessibilidade em menu expansível + alternância de tema | `app.component.ts`, `accessibility.service.ts`, `styles.css`, `icon-acessibilidade.png` |
| `c88ea43` | `develop` | Cards de métricas clicáveis no dashboard do docente com navegação direta | `dashboard.component.ts` |
| `4137416` | `develop` | Substituição de todos os emojis de UI por ícones vetoriais Font Awesome | `index.html`, `app.component.ts`, `login`, `aluno-view`, `coordenador-view`, módulos `professor` |
| `f58a6b1` | `develop` | Correção de sobreposição dos botões flutuantes sobre cabeçalhos e ações | `app.component.ts`, `styles.css` |
| `3a6ea39` | `develop` | `PdfPrintService`, remoção do VLibras na impressão e ocultação de URL/cabeçalhos no PDF | `pdf-print.service.ts`, `index.html`, `styles.css`, `relatorios.component.ts`, `aluno-view.component.ts`, `angular.json`, `nginx.conf` |
| `719d926` | `develop` | Deploy híbrido Vercel + Railway, proxy reverso e suporte a `PORT` dinâmica | `api.config.ts`, `vercel.json`, `auth/professor/analytics.service.ts`, `aluno-view`, `coordenador-view`, `application.yml`, `Dockerfile`, `.dockerignore` |
