# 01. Identidade Visual, Ícones e Acessibilidade

Este documento detalha todas as melhorias visuais, de tipografia, iconografia e acessibilidade implementadas no frontend Angular (`frontend-angular`) do sistema **Educa+**.

---

## 1. Identidade Visual Oficial e Paleta de Cores

**Commit de referência:** `23df816` — `feat: atualizar identidade visual do Educa+, aplicar logo oficial, paleta de cores e modo claro por padrão`

### 1.1. Logotipo e Favicon
- Adicionado o logotipo oficial em `frontend-angular/public/assets/logo-educa-mais.png`.
- Adicionado o ícone de navegador em `frontend-angular/public/favicon.png` e vinculado em `frontend-angular/src/index.html` (`<link rel="icon" type="image/png" href="assets/logo-educa-mais.png">`).
- Aplicada a marca oficial **Educa+** nos cabeçalhos de todas as visões:
  - Tela de Login (`login.component.ts`)
  - Portal do Estudante (`aluno-view.component.ts`)
  - Painel da Coordenação (`coordenador-view.component.ts`)
  - Layout e telas do Docente (`professor-layout.component.ts`, `dashboard.component.ts`, `notas.component.ts`, `frequencia.component.ts`, `relatorios.component.ts`)

### 1.2. Design System — Modo Claro Padrão e Modo Escuro Opcional
O sistema passou a iniciar no **Modo Claro institucional** por padrão (invertendo o comportamento anterior que iniciava em modo escuro), preservando o **Modo Escuro** como alternância voluntária do usuário em `frontend-angular/src/app/core/services/accessibility.service.ts` e `frontend-angular/src/styles.css`.

| Token CSS | Modo Claro (Padrão `:root`) | Modo Escuro (`body.dark-theme`) | Papel Semântico |
|---|---|---|---|
| `--bg-primary` | `#eef4f8` | `#07111e` | Fundo principal da aplicação |
| `--bg-surface` | `#ffffff` | `#0d1b2e` | Superfície de cards e painéis |
| `--bg-surface-elevated` | `#e3edf5` | `#142640` | Cabeçalhos e cartões elevados |
| `--bg-input` | `#f7fafc` | `#102138` | Campos de formulário |
| `--text-primary` | `#072540` | `#f1f7fc` | Texto principal e títulos |
| `--text-secondary` | `#34526e` | `#9fb6cd` | Subtítulos e descrições |
| `--text-muted` | `#64829c` | `#6985a1` | Metadados e legendas |
| `--primary` | `#083b66` | `#12a86b` | Azul Acadêmico (claro) / Esmeralda (escuro) |
| `--secondary` | `#0f9d68` | `#34d399` | Verde Esmeralda de destaque |
| `--border-focus` | `#0f9d68` | `#14b87a` | Realce de foco acessível |
| `--brand-gradient` | `linear-gradient(135deg, #083660 0%, #0c7c63 55%, #12a86b 100%)` | `linear-gradient(135deg, #0b4a7e 0%, #0f9d68 100%)` | Gradiente institucional inspirado no logo |

### 1.3. Tipografia Web (`index.html` e `styles.css`)
- `--font-heading`: `'Outfit', sans-serif` (títulos e métricas)
- `--font-body`: `'Inter', sans-serif` (textos e tabelas)
- `--font-mono`: `'Fira Code', monospace` (códigos, matrículas e notas tabulares)

---

## 2. Substituição Integral de Emojis por Ícones Vetoriais (Font Awesome)

**Commit de referência:** `4137416` — `feat: substituir todos os emojis de ícones por ícones vetoriais do Font Awesome em todas as telas`

Para garantir uniformidade visual entre Windows, macOS, Linux e navegadores (sem variações de renderização de emojis do sistema operacional), foi importado o **Font Awesome 6.5.2** no `frontend-angular/src/index.html` e todos os emojis usados como ícones de interface foram substituídos por ícones vetoriais (`<i class="fa-solid ...">`):

- `frontend-angular/src/app/app.component.ts` — botões de tema, seletor de daltonismo e tamanho de fonte
- `frontend-angular/src/app/modules/auth/login.component.ts` — atalhos rápidos de perfil, botões de entrada e alertas
- `frontend-angular/src/app/modules/aluno/aluno-view.component.ts` — abas do portal do estudante, status acadêmico e botões de exportação
- `frontend-angular/src/app/modules/coordenador/coordenador-view.component.ts` — ações de gestão de usuários, turmas, disciplinas, vínculos, auditoria e cronograma
- `frontend-angular/src/app/modules/professor/professor-layout.component.ts` — barra lateral e navegação do docente
- `frontend-angular/src/app/modules/professor/dashboard/dashboard.component.ts` — ícones dos cards de resumo e ações rápidas
- `frontend-angular/src/app/modules/professor/frequencia/frequencia.component.ts` — diário de chamada e indicadores de presença
- `frontend-angular/src/app/modules/professor/notas/notas.component.ts` — lançamento bimestral, recuperação e validação visual
- `frontend-angular/src/app/modules/professor/relatorios/relatorios.component.ts` — indicadores estatísticos e ações de emissão

---

## 3. Barra de Acessibilidade Compacta e Correção de Sobreposição

**Commits de referência:**  
- `e0e38b3` — `feat: compactar barra de acessibilidade em menu expansível e botão de alternância de tema`  
- `f58a6b1` — `fix: corrigir sobreposição dos botões de acessibilidade e tema sobre cabeçalhos e botões de ação`

### 3.1. De Barra Extensa para Controles Compactos (`app.component.ts`)
A barra horizontal antiga ocupava espaço constante sobre o layout das páginas. Ela foi substituída por um grupo compacto no topo direito (`.top-floating-controls`), composto por dois botões discretos:

1. **Botão Expansível de Acessibilidade** (utilizando o ícone dedicado `frontend-angular/public/assets/icon-acessibilidade.png` + indicador visual `.active-dot` quando há filtro ativo):
   - Abre um painel popover `.a11y-dropdown.glass-panel` com botão **"Restaurar padrão"**.
   - **Seletor de Daltonismo / Contraste** (com filtros SVG declarados diretamente no `index.html`):
     - `normal` — Normal (Padrão)
     - `protanopia` — Filtro `#protanopia-filter` (dificuldade com vermelho)
     - `deuteranopia` — Filtro `#deuteranopia-filter` (dificuldade com verde)
     - `tritanopia` — Filtro `#tritanopia-filter` (dificuldade com azul)
     - `achromatopsia` — Filtro `#achromatopsia-filter` (monocromático P&B)
     - `alto-contraste` — Modo Alto Contraste
   - **Controle de Tamanho de Fonte:** botões `A-` e `A+` (níveis `-1` até `+2`) com indicador de nível atual.
2. **Botão de Alternância de Tema (`.floating-theme-btn`):** alterna instantaneamente entre **Modo Claro** e **Modo Escuro** com `title` e `aria-label` dinâmicos.

### 3.2. Correção de Sobreposição (`app.component.ts` e `styles.css`)
Ajustado o posicionamento, espaçamento e reserva de área útil dos cabeçalhos em desktop e telas menores para impedir que os botões flutuantes encobrissem títulos, badges de matrícula ou botões de ação (como *"Sair"*, *"Lançar / Alterar Notas"* e botões de exportação).

---

## 4. Cards Clicáveis no Painel Geral do Docente

**Commit de referência:** `c88ea43` — `tornar cards de métricas do painel do docente clicáveis com navegação direta para cada seção`

- Em `frontend-angular/src/app/modules/professor/dashboard/dashboard.component.ts`, os cards estatísticos do painel inicial deixaram de ser apenas informativos e passaram a atuar como links/atalhos diretos para a respectiva área operacional (turmas, lançamento de notas, frequência ou relatórios).
