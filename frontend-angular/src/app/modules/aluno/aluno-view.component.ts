import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-aluno-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="aluno-wrapper">
      <!-- Page Header -->
      <div class="page-header no-print">
        <div class="header-brand">
          <img src="assets/logo-educa-mais.png" alt="Logo Educa+" class="header-logo" />
          <div>
            <h1>Educa+ — Portal do Estudante</h1>
            <p class="subtitle">
              Bem-vindo(a), <strong>{{ auth.currentUser()?.nome }}</strong>! Acompanhe seu boletim, cronograma letivo, relatórios pedagógicos e auditoria.
            </p>
          </div>
        </div>
        <div class="header-actions">
          <span *ngIf="auth.currentUser()?.matricula" class="badge badge-info">
            <i class="fa-solid fa-id-card"></i> {{ auth.currentUser()?.matricula }}
          </span>
          <button (click)="auth.logout()" class="btn btn-secondary btn-sm">
            <i class="fa-solid fa-right-from-bracket"></i> Sair
          </button>
        </div>
      </div>

      <!-- Interactive KPI Summary Grid (Mesma estética do Painel do Docente e Coordenação) -->
      <div class="metrics-grid no-print">
        <div
          class="glass-card metric-card clickable-card"
          [class.active-card]="tabAtiva === 'boletim'"
          role="button"
          tabindex="0"
          (click)="irParaAba('boletim')"
          (keydown.enter)="irParaAba('boletim')">
          <div class="metric-icon"><i class="fa-solid fa-graduation-cap"></i></div>
          <div class="metric-content">
            <span class="metric-label">Média Geral</span>
            <strong class="metric-value" [ngClass]="(mediaGeralGlobal ?? 0) >= 6.0 ? 'text-success' : 'text-accent'">
              {{ mediaGeralGlobal !== null ? mediaGeralGlobal.toFixed(1) : '-' }}
            </strong>
            <span class="metric-sub">Média mínima para aprovação: 6.0</span>
            <span class="metric-link">Ver boletim <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>

        <div
          class="glass-card metric-card clickable-card"
          [class.active-card]="tabAtiva === 'boletim'"
          role="button"
          tabindex="0"
          (click)="irParaAba('boletim')"
          (keydown.enter)="irParaAba('boletim')">
          <div class="metric-icon"><i class="fa-solid fa-clipboard-check"></i></div>
          <div class="metric-content">
            <span class="metric-label">Assiduidade</span>
            <strong class="metric-value" [ngClass]="taxaPresencaGlobal >= 75.0 ? 'text-success' : 'text-danger'">
              {{ taxaPresencaGlobal }}%
            </strong>
            <span class="metric-sub">Exigência mínima LDB: 75%</span>
            <span class="metric-link">Ver frequência <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>

        <div
          class="glass-card metric-card clickable-card"
          [class.active-card]="tabAtiva === 'cronograma'"
          role="button"
          tabindex="0"
          (click)="irParaAba('cronograma')"
          (keydown.enter)="irParaAba('cronograma')">
          <div class="metric-icon"><i class="fa-solid fa-calendar-days"></i></div>
          <div class="metric-content">
            <span class="metric-label">Cronograma Escolar</span>
            <strong class="metric-value">{{ cronograma.length }}</strong>
            <span class="metric-sub">Eventos, bimestres e avaliações</span>
            <span class="metric-link">Abrir calendário <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>

        <div
          class="glass-card metric-card clickable-card"
          [class.active-card]="tabAtiva === 'relatorios'"
          role="button"
          tabindex="0"
          (click)="irParaAba('relatorios')"
          (keydown.enter)="irParaAba('relatorios')">
          <div class="metric-icon"><i class="fa-solid fa-file-signature"></i></div>
          <div class="metric-content">
            <span class="metric-label">Relatórios Emitidos</span>
            <strong class="metric-value text-accent">{{ relatorios.length }}</strong>
            <span class="metric-sub">Boletins e pareceres pedagógicos</span>
            <span class="metric-link">Acessar relatórios <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-nav no-print">
        <button class="tab-btn" [class.active]="tabAtiva === 'boletim'" (click)="irParaAba('boletim')">
          <i class="fa-solid fa-chart-simple"></i>
          <span>Meu Boletim Escolar</span>
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'cronograma'" (click)="irParaAba('cronograma')">
          <i class="fa-solid fa-calendar-days"></i>
          <span>Cronograma Escolar</span>
          <span *ngIf="cronograma.length > 0" class="tab-counter">{{ cronograma.length }}</span>
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'relatorios'" (click)="irParaAba('relatorios')">
          <i class="fa-solid fa-file-lines"></i>
          <span>Emissões de Relatórios Referentes a Mim</span>
          <span *ngIf="relatorios.length > 0" class="tab-counter">{{ relatorios.length }}</span>
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'historico'" (click)="irParaAba('historico')">
          <i class="fa-solid fa-clock-rotate-left"></i>
          <span>Histórico de Alterações dos Meus Dados</span>
          <span *ngIf="historico.length > 0" class="tab-counter">{{ historico.length }}</span>
        </button>
      </div>

      <!-- =====================================================================
           TAB 1: MEU BOLETIM ESCOLAR
           ===================================================================== -->
      <div *ngIf="tabAtiva === 'boletim'" class="tab-content">
        <div *ngIf="boletins.length === 0" class="glass-panel panel-content empty-state">
          Nenhuma matrícula ou boletim disponível no momento.
        </div>

        <div *ngFor="let turma of boletins" class="glass-panel panel-content boletim-card">
          <div class="section-flex">
            <div>
              <h3>{{ turma.turmaNome }}</h3>
              <p class="subtext" style="margin-bottom: 0;">
                Ano Letivo {{ turma.anoLetivo || 2026 }} • Turno {{ turma.turno || 'MATUTINO' }} • {{ turma.sala || 'Sala 301' }} • Nº na Chamada: <strong>{{ turma.numeroChamada }}</strong>
              </p>
            </div>
            <div class="header-badges">
              <span class="badge" [ngClass]="getStatusMatriculaBadgeClass(turma.status)">
                <i class="fa-solid" [ngClass]="getStatusMatriculaIcon(turma.status)"></i>
                Matrícula: {{ turma.status }}
              </span>
            </div>
          </div>

          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th style="text-align: center;">Bimestre</th>
                  <th style="text-align: center;">N1 (Peso 4)</th>
                  <th style="text-align: center;">N2 (Peso 4)</th>
                  <th style="text-align: center;">Trabalho (Peso 2)</th>
                  <th style="text-align: center;">Recuperação</th>
                  <th style="text-align: center;">Média</th>
                  <th style="text-align: center;">Presença</th>
                  <th style="text-align: center;">Situação</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let n of turma.notas">
                  <td><strong>{{ n.disciplina }}</strong></td>
                  <td style="text-align: center;">{{ n.bimestre }}º Bim.</td>
                  <td style="text-align: center;">{{ n.nota1 ?? '-' }}</td>
                  <td style="text-align: center;">{{ n.nota2 ?? '-' }}</td>
                  <td style="text-align: center;">{{ n.trabalho ?? '-' }}</td>
                  <td style="text-align: center;">{{ n.recuperacao ?? '-' }}</td>
                  <td style="text-align: center;">
                    <strong class="media-num" [ngClass]="n.media >= 6.0 ? 'text-success' : (n.media >= 4.0 ? 'text-warning' : 'text-danger')">
                      {{ n.media ?? '-' }}
                    </strong>
                  </td>
                  <td style="text-align: center;">
                    <span [ngClass]="n.reprovadoPorFalta ? 'text-danger font-bold' : ''">
                      {{ n.taxaPresenca ?? 100 }}% ({{ n.totalFaltas ?? 0 }} faltas)
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <span *ngIf="n.reprovadoPorFalta" class="badge badge-danger" style="margin-right: 4px;">
                      <i class="fa-solid fa-triangle-exclamation"></i> REPROVADO POR FALTA
                    </span>
                    <span class="badge" [ngClass]="n.status === 'APROVADO' ? 'badge-success' : (n.status === 'RECUPERACAO' ? 'badge-warning' : 'badge-danger')">
                      {{ n.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="legend-footer">
            <div class="legend-item">
              <span class="badge badge-success">APROVADO</span>
              <small>Média ≥ 6.0 e Presença ≥ 75%</small>
            </div>
            <div class="legend-item">
              <span class="badge badge-warning">RECUPERAÇÃO</span>
              <small>4.0 ≤ Média &lt; 6.0</small>
            </div>
            <div class="legend-item">
              <span class="badge badge-danger">REPROVADO</span>
              <small>Média &lt; 4.0 ou Presença &lt; 75%</small>
            </div>
          </div>
        </div>
      </div>

      <!-- =====================================================================
           TAB 2: CRONOGRAMA ESCOLAR (SOMENTE LEITURA, INTEGRADO AO DESIGN SYSTEM)
           ===================================================================== -->
      <div *ngIf="tabAtiva === 'cronograma'" class="tab-content">
        <div class="glass-panel panel-content">
          <div class="section-flex">
            <div>
              <h3>Calendário e Cronograma Letivo Oficial</h3>
              <p class="subtext" style="margin-bottom: 0;">
                Consulte os períodos de bimestres, semanas de avaliações, feriados e eventos pedagógicos publicados pela Coordenação.
              </p>
            </div>
            <div class="filter-pills">
              <button
                *ngFor="let tipo of tiposCronograma"
                type="button"
                class="pill-btn"
                [class.active]="filtroCronograma === tipo"
                (click)="filtroCronograma = tipo">
                {{ tipo === 'TODOS' ? 'Todos (' + cronograma.length + ')' : tipo }}
              </button>
            </div>
          </div>

          <div *ngIf="cronogramaFiltrado.length === 0" class="empty-state">
            <i class="fa-regular fa-calendar-xmark" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
            Nenhum evento encontrado para este filtro no cronograma escolar.
          </div>

          <div *ngIf="cronogramaFiltrado.length > 0" class="cronograma-list">
            <div *ngFor="let c of cronogramaFiltrado" class="c-item glass-card">
              <div class="c-item-top">
                <span class="badge" [ngClass]="getBadgeTipoCronograma(c.tipo)">
                  <i class="fa-solid" [ngClass]="getIconeTipoCronograma(c.tipo)"></i>
                  {{ c.tipo }}
                </span>
                <span class="readonly-tag">
                  <i class="fa-solid fa-lock"></i> Oficial
                </span>
              </div>
              <h4>{{ c.titulo }}</h4>
              <div class="c-item-dates">
                <i class="fa-regular fa-calendar-check"></i>
                <span>De <strong>{{ c.dataInicio | date:'dd/MM/yyyy':'UTC' }}</strong> até <strong>{{ c.dataFim | date:'dd/MM/yyyy':'UTC' }}</strong></span>
              </div>
              <p>{{ c.descricao || 'Atividade oficial prevista no calendário acadêmico.' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- =====================================================================
           TAB 3: EMISSÕES DE RELATÓRIOS REFERENTES A MIM (COM VISUALIZADOR INTEGRADO)
           ===================================================================== -->
      <div *ngIf="tabAtiva === 'relatorios'" class="tab-content">
        <!-- Lista de Relatórios Emitidos -->
        <div class="glass-panel panel-content no-print" style="margin-bottom: 1.75rem;">
          <div class="section-flex">
            <div>
              <h3>Emissões de Relatórios Referentes ao Estudante</h3>
              <p class="subtext" style="margin-bottom: 0;">
                Selecione qualquer relatório emitido pelos seus professores para abrir e visualizar o documento completo abaixo.
              </p>
            </div>
            <button (click)="carregarDados()" class="btn btn-secondary btn-sm">
              <i class="fa-solid fa-rotate"></i> Atualizar Lista
            </button>
          </div>

          <div *ngIf="relatorios.length === 0" class="empty-state">
            Nenhum relatório emitido especificamente para sua matrícula ou turma até o momento.
          </div>

          <div *ngIf="relatorios.length > 0" class="relatorios-cards-grid">
            <div
              *ngFor="let r of relatorios"
              class="glass-card relatorio-item-card"
              [class.selected-report]="relatorioSelecionadoId === r.id"
              (click)="visualizarRelatorio(r)">
              <div class="relatorio-card-top">
                <span class="badge" [ngClass]="r.tipoRelatorio === 'BOLETIM_TURMA' ? 'badge-info' : 'badge-success'">
                  <i class="fa-solid" [ngClass]="r.tipoRelatorio === 'BOLETIM_TURMA' ? 'fa-file-invoice' : 'fa-user-check'"></i>
                  {{ r.tipoRelatorio }}
                </span>
                <small class="report-date">
                  <i class="fa-regular fa-clock"></i> {{ r.dataEmissao | date:'dd/MM/yyyy HH:mm' }}
                </small>
              </div>

              <div class="relatorio-card-body">
                <h4>{{ r.turmaNome || 'Turma Matriculada' }} <span *ngIf="r.disciplinaNome">— {{ r.disciplinaNome }}</span></h4>
                <p class="emitido-por">
                  <i class="fa-solid fa-chalkboard-user"></i> Emitido por: <strong>{{ r.usuarioNome }}</strong>
                </p>
                <div class="validacao-row">
                  <span>Status de Validação:</span>
                  <span class="badge" [ngClass]="r.statusValidacao === 'VALIDADO_COORDENADOR' ? 'badge-success' : 'badge-warning'">
                    <i class="fa-solid" [ngClass]="r.statusValidacao === 'VALIDADO_COORDENADOR' ? 'fa-check-double' : 'fa-hourglass-half'"></i>
                    {{ r.statusValidacao }}
                  </span>
                </div>
                <small *ngIf="r.validadoPor" class="homologado-por">
                  Homologado pela Coordenação: <strong>{{ r.validadoPor }}</strong>
                </small>
              </div>

              <div class="relatorio-card-actions" (click)="$event.stopPropagation()">
                <button
                  type="button"
                  class="btn btn-sm"
                  [ngClass]="relatorioSelecionadoId === r.id ? 'btn-primary' : 'btn-secondary'"
                  (click)="visualizarRelatorio(r)">
                  <i class="fa-solid" [ngClass]="relatorioSelecionadoId === r.id ? 'fa-eye' : 'fa-folder-open'"></i>
                  {{ relatorioSelecionadoId === r.id ? 'Visualizando Abaixo' : 'Abrir Relatório' }}
                </button>
                <button
                  *ngIf="relatorioSelecionadoId === r.id && relatorioDetalhado"
                  type="button"
                  class="btn btn-secondary btn-sm"
                  (click)="imprimirRelatorio()"
                  title="Imprimir ou Salvar Relatório em PDF">
                  <i class="fa-solid fa-print"></i> Imprimir / PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading do Visualizador de Relatório -->
        <div *ngIf="carregandoRelatorio" class="glass-panel panel-content loading-state no-print">
          <div class="spinner"></div>
          <p>Carregando dados detalhados do seu relatório escolar...</p>
        </div>

        <!-- Visualizador do Documento Oficial do Relatório (Mesma estética de relatorios.component.ts) -->
        <div *ngIf="!carregandoRelatorio && relatorioDetalhado" id="visualizador-relatorio-aluno" class="glass-panel print-document">
          <div class="doc-toolbar no-print">
            <div class="doc-toolbar-left">
              <span class="badge badge-info">
                <i class="fa-solid fa-eye"></i> Visualizador de Documento Oficial — Modo Leitura do Estudante
              </span>
            </div>
            <div class="doc-toolbar-actions">
              <button type="button" (click)="imprimirRelatorio()" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-print"></i> Imprimir / Salvar PDF
              </button>
              <button type="button" (click)="fecharRelatorio()" class="btn btn-secondary btn-sm">
                <i class="fa-solid fa-xmark"></i> Fechar
              </button>
            </div>
          </div>

          <!-- Cabeçalho Institucional do Relatório -->
          <div class="doc-header">
            <div class="doc-brand">
              <img src="assets/logo-educa-mais.png" alt="Logo Educa+" class="doc-logo-img" />
              <div>
                <h2>EDUCA+ — COLÉGIO INTEGRADO DE EDUCAÇÃO BÁSICA</h2>
                <p>
                  {{ relatorioDetalhado.tipoRelatorio === 'FREQUENCIA_DISCIPLINA'
                     ? 'Relatório Individual de Assiduidade e Frequência Escolar'
                     : 'Boletim e Relatório Individual de Desempenho Acadêmico' }}
                  — Ano Letivo {{ relatorioDetalhado.anoLetivo }}
                </p>
              </div>
            </div>
            <div class="doc-meta">
              <span><strong>Emissão:</strong> {{ relatorioDetalhado.dataEmissao | date:'dd/MM/yyyy HH:mm' }}</span>
              <span><strong>Docente:</strong> {{ relatorioDetalhado.emitidoPor }}</span>
              <span>
                <span class="badge" [ngClass]="relatorioDetalhado.statusValidacao === 'VALIDADO_COORDENADOR' ? 'badge-success' : 'badge-warning'">
                  {{ relatorioDetalhado.statusValidacao }}
                </span>
              </span>
            </div>
          </div>

          <!-- Sub-informações da Matrícula e Disciplina -->
          <div class="doc-subinfo">
            <div><strong>Estudante:</strong> {{ relatorioDetalhado.alunoNome }}</div>
            <div><strong>Matrícula / Nº:</strong> {{ relatorioDetalhado.alunoMatricula || '-' }} (Nº {{ relatorioDetalhado.numeroChamada }})</div>
            <div><strong>Turma / Turno:</strong> {{ relatorioDetalhado.turmaNome }} ({{ relatorioDetalhado.turno }})</div>
            <div><strong>Disciplina:</strong> {{ relatorioDetalhado.disciplinaNome }} ({{ relatorioDetalhado.cargaHoraria }}h)</div>
          </div>

          <!-- Indicadores Consolidados do Estudante no Relatório -->
          <div class="doc-stats-grid">
            <div class="stat-box">
              <small>Média Acumulada</small>
              <strong [ngClass]="relatorioDetalhado.mediaGeral >= 6.0 ? 'text-success' : 'text-danger'">
                {{ relatorioDetalhado.mediaGeral }}
              </strong>
            </div>
            <div class="stat-box">
              <small>Taxa de Presença</small>
              <strong [ngClass]="relatorioDetalhado.taxaPresenca >= 75.0 ? 'text-success' : 'text-danger'">
                {{ relatorioDetalhado.taxaPresenca }}%
              </strong>
            </div>
            <div class="stat-box">
              <small>Presenças / Aulas</small>
              <strong>{{ relatorioDetalhado.totalPresencas }} / {{ relatorioDetalhado.totalAulas }}</strong>
            </div>
            <div class="stat-box">
              <small>Situação na Matrícula</small>
              <span class="badge" [ngClass]="relatorioDetalhado.reprovadoPorFalta ? 'badge-danger' : 'badge-success'" style="margin-top: 0.35rem;">
                {{ relatorioDetalhado.reprovadoPorFalta ? 'REPROVADO POR FALTA' : relatorioDetalhado.statusMatricula }}
              </span>
            </div>
          </div>

          <!-- Seção 1: Avaliações Bimestrais da Disciplina -->
          <div class="doc-section">
            <h4><i class="fa-solid fa-award"></i> 1. Rendimento nas Avaliações Bimestrais ({{ relatorioDetalhado.disciplinaNome }})</h4>
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th style="text-align: center;">Bimestre</th>
                    <th style="text-align: center;">N1 (Peso 4)</th>
                    <th style="text-align: center;">N2 (Peso 4)</th>
                    <th style="text-align: center;">Trabalho (Peso 2)</th>
                    <th style="text-align: center;">Recuperação</th>
                    <th style="text-align: center;">Média Bimestral</th>
                    <th style="text-align: center;">Situação</th>
                    <th>Observações Docentes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let av of relatorioDetalhado.avaliacoes">
                    <td style="text-align: center;"><strong>{{ av.bimestre }}º Bimestre</strong></td>
                    <td style="text-align: center;">{{ av.nota1 ?? '-' }}</td>
                    <td style="text-align: center;">{{ av.nota2 ?? '-' }}</td>
                    <td style="text-align: center;">{{ av.trabalho ?? '-' }}</td>
                    <td style="text-align: center;">{{ av.recuperacao ?? '-' }}</td>
                    <td style="text-align: center;">
                      <strong [ngClass]="av.mediaBimestre >= 6.0 ? 'text-success' : 'text-danger'">
                        {{ av.mediaBimestre ?? '-' }}
                      </strong>
                    </td>
                    <td style="text-align: center;">
                      <span class="badge" [ngClass]="av.status === 'APROVADO' ? 'badge-success' : (av.status === 'RECUPERACAO' ? 'badge-warning' : 'badge-danger')">
                        {{ av.status }}
                      </span>
                    </td>
                    <td><small>{{ av.observacoes || 'Lançamento regular confirmado.' }}</small></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Seção 2: Extrato de Chamadas e Frequência da Disciplina -->
          <div class="doc-section" style="margin-top: 1.75rem;">
            <h4><i class="fa-solid fa-calendar-check"></i> 2. Extrato do Diário de Frequência ({{ relatorioDetalhado.disciplinaNome }})</h4>
            <div *ngIf="!relatorioDetalhado.frequencias || relatorioDetalhado.frequencias.length === 0" class="empty-state">
              Nenhum registro de chamada lançado para esta disciplina.
            </div>
            <div *ngIf="relatorioDetalhado.frequencias && relatorioDetalhado.frequencias.length > 0" class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Data da Aula</th>
                    <th style="text-align: center;">Aulas Ministradas</th>
                    <th style="text-align: center;">Presenças</th>
                    <th style="text-align: center;">Faltas</th>
                    <th style="text-align: center;">Registro</th>
                    <th>Observação / Justificativa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let f of relatorioDetalhado.frequencias">
                    <td><strong>{{ f.data | date:'dd/MM/yyyy':'UTC' }}</strong></td>
                    <td style="text-align: center;">{{ f.aulasNoDia }}</td>
                    <td style="text-align: center;" class="text-success font-bold">{{ f.presencas }}</td>
                    <td style="text-align: center;" [ngClass]="f.faltas > 0 ? 'text-danger font-bold' : ''">{{ f.faltas }}</td>
                    <td style="text-align: center;">
                      <span *ngIf="f.faltas === 0" class="badge badge-success">PRESENTE</span>
                      <span *ngIf="f.faltas > 0 && f.justificada" class="badge badge-warning">FALTA JUSTIFICADA</span>
                      <span *ngIf="f.faltas > 0 && !f.justificada" class="badge badge-danger">FALTA</span>
                    </td>
                    <td><small>{{ f.observacao || (f.faltas === 0 ? 'Presença regular registrada em chamada.' : 'Ausência registrada no diário de classe.') }}</small></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Assinaturas de Validação -->
          <div class="signatures-area">
            <div class="sign-box">
              <div class="sign-line"></div>
              <span>{{ relatorioDetalhado.emitidoPor }}</span>
              <small>Docente Responsável pela Emissão</small>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <span>{{ relatorioDetalhado.validadoPor || 'Coordenação Pedagógica' }}</span>
              <small>
                {{ relatorioDetalhado.statusValidacao === 'VALIDADO_COORDENADOR'
                   ? 'Homologado Oficialmente pela Coordenação'
                   : 'Aguardando Homologação da Coordenação' }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- =====================================================================
           TAB 4: HISTÓRICO DE ALTERAÇÕES DOS DADOS DO ALUNO (AUDITORIA MONGODB)
           ===================================================================== -->
      <div *ngIf="tabAtiva === 'historico'" class="tab-content">
        <div class="glass-panel panel-content">
          <div class="section-flex">
            <div>
              <h3>Registro de Auditoria de Dados (Transparência do Estudante)</h3>
              <p class="subtext" style="margin-bottom: 0;">
                Histórico imutável de quem lançou, alterou ou homologou suas notas e frequência no banco secundário MongoDB.
              </p>
            </div>
            <button (click)="carregarDados()" class="btn btn-secondary btn-sm">
              <i class="fa-solid fa-rotate"></i> Atualizar
            </button>
          </div>

          <div *ngIf="historico.length === 0" class="empty-state">
            Nenhuma alteração registrada sobre seus dados até o momento.
          </div>

          <div *ngFor="let log of historico" class="log-item">
            <div class="log-badge">
              <span class="badge badge-info">
                <i class="fa-solid fa-shield-halved"></i> {{ log.acao }}
              </span>
              <small><i class="fa-regular fa-clock"></i> {{ log.dataHora | date:'dd/MM/yyyy HH:mm:ss' }}</small>
            </div>
            <div class="log-details">
              <strong>Responsável pela Ação:</strong> {{ log.usuarioNome }} <span class="badge badge-success" style="margin-left: 6px;">{{ log.usuarioRole }}</span><br>
              <strong>Entidade Afetada:</strong> {{ log.entidade }} (Registro #{{ log.entidadeId }})
              <div class="audit-diff-grid">
                <div *ngIf="log.dadosAnteriores && log.dadosAnteriores !== '{}'" class="diff-box diff-old">
                  <small>Valor Anterior:</small>
                  <code>{{ log.dadosAnteriores }}</code>
                </div>
                <div class="diff-box diff-new">
                  <small>Valor Registrado / Novo:</small>
                  <code>{{ log.dadosNovos }}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .aluno-wrapper { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; }
    .page-header, .section-flex, .doc-toolbar, .doc-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
    .header-brand, .doc-brand { display: flex; align-items: center; gap: 1rem; }
    .header-logo, .doc-logo-img { width: 54px; height: 54px; object-fit: contain; }
    .header-actions, .header-badges, .doc-toolbar-actions, .legend-item, .validacao-row { display: flex; align-items: center; gap: 0.5rem; }
    .subtitle, .subtext, .metric-sub, .c-item p, .emitido-por, .doc-brand p { color: var(--text-secondary); font-size: 0.85rem; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1.15rem; margin-bottom: 2rem; }
    .metric-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; }
    .clickable-card { cursor: pointer; user-select: none; outline: none; }
    .clickable-card:hover, .clickable-card.active-card { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: var(--secondary); }
    .clickable-card.active-card .metric-icon, .clickable-card:hover .metric-icon { border-color: var(--secondary); background: var(--primary-light); }
    .metric-icon { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; color: var(--primary); background: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); flex-shrink: 0; transition: all 0.2s; }
    .metric-content { display: flex; flex-direction: column; min-width: 0; }
    .metric-label, .stat-box small, .diff-box small { font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; }
    .metric-value { font-size: 1.7rem; font-family: var(--font-heading); line-height: 1.2; margin: 0.1rem 0; }
    .metric-link { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.35rem; font-size: 0.75rem; font-weight: 700; color: var(--secondary); }
    .tabs-nav { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; flex-wrap: wrap; }
    .tab-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.2rem; background: transparent; border: 1px solid transparent; border-radius: var(--radius-md); color: var(--text-secondary); font-family: var(--font-heading); font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .tab-btn:hover { color: var(--text-primary); background: var(--primary-light); }
    .tab-btn.active, .pill-btn.active { color: #fff; background: var(--brand-gradient); border-color: transparent; }
    .tab-counter { background: rgba(15, 157, 104, 0.18); font-size: 0.72rem; padding: 0.1rem 0.45rem; border-radius: var(--radius-full); font-weight: 700; }
    .tab-btn.active .tab-counter { background: rgba(255, 255, 255, 0.25); color: #fff; }
    .panel-content { padding: 1.75rem; margin-bottom: 1.5rem; }
    .media-num, .stat-box strong { font-family: var(--font-mono); }
    .stat-box strong { font-size: 1.35rem; }
    .legend-footer { display: flex; gap: 2rem; align-items: center; padding-top: 1.25rem; flex-wrap: wrap; }
    .legend-item small, .readonly-tag, .report-date, .sign-box small, .log-badge small { color: var(--text-muted); font-size: 0.78rem; }
    .filter-pills { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .pill-btn { padding: 0.35rem 0.85rem; border-radius: var(--radius-full); border: 1px solid var(--border-subtle); background: var(--bg-surface-elevated); color: var(--text-secondary); font-family: var(--font-heading); font-size: 0.78rem; font-weight: 600; cursor: pointer; }
    .cronograma-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.15rem; }
    .c-item, .relatorio-item-card { display: flex; flex-direction: column; justify-content: space-between; gap: 0.65rem; }
    .c-item-top, .relatorio-card-top, .log-badge { display: flex; justify-content: space-between; align-items: center; }
    .c-item h4, .relatorio-card-body h4 { font-size: 1.05rem; margin: 0.25rem 0; }
    .c-item-dates { display: flex; align-items: center; gap: 0.45rem; color: var(--secondary); font-size: 0.82rem; }
    .relatorios-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 1.25rem; }
    .relatorio-item-card { cursor: pointer; }
    .relatorio-item-card.selected-report { border: 2px solid var(--secondary); box-shadow: var(--shadow-lg); background: var(--bg-surface); }
    .homologado-por { display: block; margin-top: 0.35rem; font-size: 0.78rem; color: var(--success); }
    .relatorio-card-actions { display: flex; gap: 0.65rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle); }
    .print-document { padding: 2rem; background: var(--bg-surface); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); margin-bottom: 2rem; }
    .doc-toolbar { padding-bottom: 1rem; border-bottom: 1px dashed var(--border-subtle); }
    .doc-header { border-bottom: 2px solid var(--border-subtle); padding-bottom: 1.25rem; }
    .doc-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; font-size: 0.85rem; color: var(--text-secondary); }
    .doc-subinfo { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; background: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.5rem; font-size: 0.88rem; }
    .doc-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-box, .log-item { background: var(--bg-surface-elevated); padding: 0.9rem 1.1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); }
    .log-item { margin-bottom: 0.85rem; }
    .doc-section h4 { font-size: 1rem; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.5rem; color: var(--primary); }
    .signatures-area { margin-top: 3rem; display: flex; justify-content: space-around; padding-top: 1.5rem; flex-wrap: wrap; gap: 2rem; }
    .sign-box { text-align: center; width: 250px; }
    .sign-line { height: 1px; background: var(--border-subtle); margin-bottom: 0.5rem; }
    .sign-box span { display: block; font-weight: 600; font-size: 0.9rem; }
    .log-details { font-size: 0.85rem; line-height: 1.6; margin-top: 0.4rem; }
    .audit-diff-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75rem; margin-top: 0.5rem; }
    .diff-box code { display: block; padding: 0.45rem 0.6rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--primary); border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem; word-break: break-all; }
    .text-success { color: var(--success); }
    .text-warning { color: var(--warning); }
    .text-danger { color: var(--danger); }
    .text-accent { color: var(--secondary); }
    .font-bold { font-weight: 700; }
    .empty-state, .loading-state { text-align: center; padding: 2.5rem; color: var(--text-muted); }
    .spinner { margin: 0 auto 1rem; width: 28px; height: 28px; border: 3px solid rgba(8, 54, 96, 0.15); border-radius: 50%; border-top-color: var(--primary); animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AlunoViewComponent implements OnInit {
  tabAtiva: 'boletim' | 'cronograma' | 'relatorios' | 'historico' = 'boletim';
  boletins: any[] = [];
  cronograma: any[] = [];
  historico: any[] = [];
  relatorios: any[] = [];

  mediaGeralGlobal: number | null = null;
  taxaPresencaGlobal: number = 100;

  tiposCronograma: string[] = ['TODOS', 'BIMESTRE', 'AVALIACAO', 'EVENTO', 'FERIADO'];
  filtroCronograma: string = 'TODOS';

  relatorioSelecionadoId: string | null = null;
  relatorioDetalhado: any = null;
  carregandoRelatorio: boolean = false;

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.carregarDados();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` });
  }

  get cronogramaFiltrado(): any[] {
    if (this.filtroCronograma === 'TODOS') {
      return this.cronograma;
    }
    return this.cronograma.filter(c => c.tipo === this.filtroCronograma);
  }

  irParaAba(aba: 'boletim' | 'cronograma' | 'relatorios' | 'historico') {
    this.tabAtiva = aba;
    if (aba === 'relatorios' && !this.relatorioDetalhado && this.relatorios.length > 0) {
      this.visualizarRelatorio(this.relatorios[0], false);
    }
  }

  carregarDados() {
    this.http.get<any[]>('http://localhost:8080/api/aluno/meu-boletim', { headers: this.getHeaders() }).subscribe({
      next: (dados) => {
        this.boletins = dados;
        this.calcularIndicadoresGlobais(dados);
      },
      error: (err) => console.error('Erro ao carregar boletim:', err)
    });

    this.http.get<any[]>('http://localhost:8080/api/aluno/cronograma', { headers: this.getHeaders() }).subscribe({
      next: (dados) => this.cronograma = dados,
      error: (err) => console.error('Erro ao carregar cronograma:', err)
    });

    this.http.get<any[]>('http://localhost:8080/api/aluno/meu-historico', { headers: this.getHeaders() }).subscribe({
      next: (dados) => this.historico = dados,
      error: (err) => console.error('Erro ao carregar histórico:', err)
    });

    this.http.get<any[]>('http://localhost:8080/api/aluno/meus-relatorios', { headers: this.getHeaders() }).subscribe({
      next: (dados) => {
        this.relatorios = dados;
        if (dados.length > 0 && !this.relatorioSelecionadoId) {
          this.visualizarRelatorio(dados[0], false);
        }
      },
      error: (err) => console.error('Erro ao carregar relatórios:', err)
    });
  }

  private calcularIndicadoresGlobais(turmas: any[]) {
    let somaMedias = 0;
    let totalNotas = 0;
    let somaPresenca = 0;
    let totalDisciplinas = 0;

    for (const t of turmas) {
      for (const n of (t.notas || [])) {
        if (n.media !== null && n.media !== undefined) {
          somaMedias += Number(n.media);
          totalNotas++;
        }
        if (n.taxaPresenca !== null && n.taxaPresenca !== undefined) {
          somaPresenca += Number(n.taxaPresenca);
          totalDisciplinas++;
        }
      }
    }

    this.mediaGeralGlobal = totalNotas > 0 ? Math.round((somaMedias / totalNotas) * 10) / 10 : null;
    this.taxaPresencaGlobal = totalDisciplinas > 0 ? Math.round((somaPresenca / totalDisciplinas) * 10) / 10 : 100;
  }

  visualizarRelatorio(relatorio: any, rolarTela: boolean = true) {
    this.relatorioSelecionadoId = relatorio.id;
    this.carregandoRelatorio = true;

    this.http.get<any>(`http://localhost:8080/api/aluno/meus-relatorios/${relatorio.id}/detalhes`, { headers: this.getHeaders() }).subscribe({
      next: (detalhes) => {
        this.relatorioDetalhado = detalhes;
        this.carregandoRelatorio = false;
        if (rolarTela) {
          setTimeout(() => {
            const el = document.getElementById('visualizador-relatorio-aluno');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do relatório:', err);
        this.carregandoRelatorio = false;
      }
    });
  }

  fecharRelatorio() {
    this.relatorioSelecionadoId = null;
    this.relatorioDetalhado = null;
  }

  imprimirRelatorio() {
    window.print();
  }

  getStatusMatriculaBadgeClass(status: string): string {
    if (status === 'APROVADO') return 'badge-success';
    if (status === 'RECUPERACAO') return 'badge-warning';
    if (status === 'REPROVADO_NOTA' || status === 'REPROVADO_FALTA') return 'badge-danger';
    return 'badge-info';
  }

  getStatusMatriculaIcon(status: string): string {
    if (status === 'APROVADO') return 'fa-circle-check';
    if (status === 'RECUPERACAO') return 'fa-circle-exclamation';
    if (status === 'REPROVADO_NOTA' || status === 'REPROVADO_FALTA') return 'fa-triangle-exclamation';
    return 'fa-book-open';
  }

  getBadgeTipoCronograma(tipo: string): string {
    if (tipo === 'AVALIACAO') return 'badge-warning';
    if (tipo === 'FERIADO') return 'badge-danger';
    if (tipo === 'BIMESTRE') return 'badge-success';
    return 'badge-info';
  }

  getIconeTipoCronograma(tipo: string): string {
    if (tipo === 'AVALIACAO') return 'fa-pen-clip';
    if (tipo === 'FERIADO') return 'fa-umbrella-beach';
    if (tipo === 'BIMESTRE') return 'fa-flag-checkered';
    return 'fa-calendar-day';
  }
}
