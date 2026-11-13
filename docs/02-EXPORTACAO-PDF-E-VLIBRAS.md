# 02. Padronização das Exportações em PDF e Remoção do VLibras na Impressão

**Commit de referência:** `3a6ea39` — `fix(frontend): padronizar layouts de exportação PDF para professor e aluno, remover widget VLibras e cabeçalhos de URL na impressão`

---

## 1. Diagnóstico dos Problemas Anteriores

Antes da padronização, as exportações baseadas em impressão do navegador apresentavam quatro problemas recorrentes:
1. **Ícone flutuante do VLibras vazando para dentro do PDF:** mesmo utilizando seletores simples de `.no-print`, o script oficial do `vlibras-plugin.js` injeta elementos e containers próprios (`[vw]`, `[vp]`, `.vw-access-button`, `#vlibras-access-wrapper`, iframes dinâmicos) com estilos inline ou posicionamento fixo que continuavam aparecendo sobre tabelas e textos na geração de PDF do Chromium.
2. **URL do site e data/hora automáticos no PDF:** margens padrão do navegador imprimiam cabeçalhos e rodapés com `http://localhost:4200/...` (ou URL do domínio) e carimbo de data na borda da folha.
3. **Inconsistência visual entre usuários e temas:** cada tela tratava a impressão de um jeito diferente e herdava fundos escuros, sombras `glassmorphism` ou scroll containers que quebravam a paginação A4.
4. **Remoção indesejada fora da exportação:** esconder o VLibras de forma permanente prejudicaria a acessibilidade em Libras durante a navegação normal do site — o requisito era ocultá-lo **exclusivamente durante a geração do PDF**.

---

## 2. Solução Implementada em Três Camadas

### Camada 1 — Serviço Centralizado `PdfPrintService`
**Arquivo:** `frontend-angular/src/app/core/services/pdf-print.service.ts`

Todas as exportações em PDF (Professor e Estudante) passaram a chamar `pdfPrintService.printDocument(documentTitle, targetElement?)`:

1. **Controle de título e estado:** salva `document.title` original, aplica um título institucional limpo ao documento exportado e ativa as classes `is-printing-pdf` (e `print-scoped-mode` + `.print-target-active` quando um card/relatório específico é escolhido, ocultando outros cards da mesma página).
2. **Ocultação programática pré-impressão:** chama `window.__educaHideVLibras()` antes do `window.print()`.
3. **Atraso coordenado com renderização (`requestAnimationFrame` + `setTimeout 60ms`):** garante que o navegador já aplicou `display: none !important` e recolheu os nós do VLibras antes de abrir o preview de impressão/PDF.
4. **Restauração automática garantida (`cleanup()`):** após o evento `afterprint` (ou um fallback de segurança de `500ms`), remove `is-printing-pdf`, `print-scoped-mode`, `print-target-active`, restaura o `document.title` original e executa `window.__educaRestoreVLibras()` para devolver o widget azul do VLibras exatamente ao seu estado anterior na tela.

---

### Camada 2 — Interceptação Global no `frontend-angular/src/index.html`

Para cobrir **qualquer** botão que acione impressão na aplicação (diretamente ou via `PdfPrintService`, incluindo `Ctrl+P`), foi adicionado um controlador no `index.html`:

- **`hideVLibrasForPrint()`**: percorre uma lista abrangente de seletores conhecidos do VLibras v7+ e legado (`#vlibras-access-wrapper`, `#vlibras-access`, `#vlibras-button`, `#vlibras-popup`, `[id^="vlibras"]`, `[vw]`, `[vp]`, `[vw-access-button]`, `[vw-plugin-wrapper]`, `.vw-access-button`, `.vw-plugin-wrapper`, `.vpw-box`, `iframe[src*="vlibras"]`), registra os estilos inline prévios (`display`, `visibility`, `opacity` e suas prioridades) em memória e força `display: none !important`, `visibility: hidden !important` e `opacity: 0 !important`.
- **`restoreVLibrasAfterPrint()`**: restaura exatamente os estilos anteriores de cada nó assim que a janela de impressão fecha.
- **Listeners nativos e wrapper de `window.print`:** registra `beforeprint` e `afterprint` e envolve `window.print` (preservando a referência nativa em `window.__educaRawPrint`) para garantir ocultação prévia mesmo em chamadas diretas.

---

### Camada 3 — Folha de Estilo Oficial A4 em `@media print` (`styles.css` e componentes)

Regras adicionadas em `frontend-angular/src/styles.css`, `aluno-view.component.ts` e `relatorios.component.ts`:

- **`@page` sem cabeçalho/rodapé de URL:** configura margem/tamanho A4 para suprimir a exibição automática de URL do site nos cantos da página pelo diálogo de impressão do navegador.
- **Modo Claro forçado apenas no PDF:** dentro de `@media print`, as variáveis `--bg-primary`, `--bg-surface`, `--text-primary` etc. são travadas em fundo branco (`#ffffff`) e texto escuro de alto contraste (`#0f172a` / `#083b66`), removendo `filter` de daltonismo, `backdrop-filter` e sombras no papel, mantendo o modo escuro intacto na tela se o usuário preferir.
- **Bloqueio de elementos de interface no PDF:** oculta agressivamente `.sidebar`, `.a11y-toolbar`, `.top-floating-controls`, `.btn`, `.no-print` e todos os seletores do VLibras (`display: none`, `clip-path: inset(100%)`, `transform: scale(0)`, posicionamento fora da viewport).
- **Correção de paginação do Chromium:** converte `.teacher-container`, `.main-content`, `.relatorios-wrapper`, `.aluno-wrapper`, `.coord-wrapper` e `.tab-content` de `flex`/`overflow` para `display: block !important; overflow: visible !important; height: auto !important`, impedindo cortes de página no meio de tabelas longas.
- **Integridade de blocos e tabelas:** aplica `display: table-header-group` em `.custom-table thead` (repetindo o cabeçalho em quebras de página) e `break-inside: avoid` em `tr`, `.sign-box`, `.signatures-area`, `.doc-header`, `.doc-subinfo`, `.doc-stats-grid` e `.analytics-card`.

---

## 3. Pontos de Exportação Cobertos

- **Portal do Professor (`relatorios.component.ts`):**
  - Exportação do Relatório Consolidado da Turma e Diagnóstico Pedagógico (indicadores estatísticos + recomendações + relação nominal de estudantes + assinaturas).
- **Portal do Estudante (`aluno-view.component.ts`):**
  - Exportação do Boletim Escolar Oficial de Rendimento e Frequência.
  - Exportação do Relatório Detalhado por Disciplina (avaliações bimestrais + extrato diário de frequência + campos de homologação).
