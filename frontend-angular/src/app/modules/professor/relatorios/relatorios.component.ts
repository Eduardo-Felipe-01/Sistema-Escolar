import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProfessorService } from '../../../core/services/professor.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { PdfPrintService } from '../../../core/services/pdf-print.service';
import { TurmaResumo } from '../../../core/models/user.model';

@Component({
  selector: 'app-professor-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relatorios-wrapper">
      <!-- Header -->
      <div class="page-header no-print">
        <div>
          <h1>Emissão de Relatórios & Análise Estatística</h1>
          <p class="subtitle">Relatório consolidado de rendimento escolar e análise de dados integrada com Python Analytics.</p>
        </div>
        <div class="actions-header">
          <button (click)="imprimir()" class="btn btn-secondary">
            <i class="fa-solid fa-print"></i> Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="glass-panel filters-bar no-print">
        <div class="filter-group">
          <label class="filter-label">Selecione a Turma:</label>
          <select [(ngModel)]="turmaSelecionadaId" (change)="onTurmaChange()" class="form-control select-control">
            <option *ngFor="let t of turmas" [value]="t.id">
              {{ t.nome }} ({{ t.disciplinaNome }})
            </option>
          </select>
        </div>
        <button (click)="gerarRelatorio()" class="btn btn-primary" [disabled]="loading">
          <i class="fa-solid fa-rotate"></i> Atualizar Relatório
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state no-print">
        <div class="spinner"></div>
        <p>Processando relatório estatístico nos microserviços...</p>
      </div>

      <!-- Report Sheet Document (Printable) -->
      <div *ngIf="!loading && relatorio" id="relatorio-docente-sheet" class="glass-panel print-document">
        <!-- Institution Header -->
        <div class="doc-header">
          <div class="doc-brand">
            <img src="assets/logo-educa-mais.png" alt="Logo Educa+" class="doc-logo-img" />
            <div>
              <span class="doc-inst-tag">DOCUMENTO OFICIAL DE ESCRITURAÇÃO ESCOLAR • LDB LEI Nº 9.394/96</span>
              <h2>EDUCA+ — COLÉGIO INTEGRADO DE EDUCAÇÃO BÁSICA</h2>
              <p>Ata e Relatório Consolidado de Rendimento e Assiduidade Escolar — Ano Letivo {{ relatorio.anoLetivo }}</p>
            </div>
          </div>
          <div class="doc-meta">
            <div><strong>Emissão:</strong> {{ relatorio.emitidoEm | date:'dd/MM/yyyy HH:mm' }}</div>
            <div><strong>Docente:</strong> {{ relatorio.professorNome }}</div>
            <div><strong> Ano Letivo:</strong> {{ relatorio.anoLetivo }}</div>
          </div>
        </div>

        <!-- Structured Class Info Grid -->
        <div class="doc-subinfo">
          <div class="subinfo-cell">
            <small>Turma / Série</small>
            <strong>{{ relatorio.turmaNome }}</strong>
          </div>
          <div class="subinfo-cell">
            <small>Componente Curricular</small>
            <strong>{{ relatorio.disciplinaNome }}</strong>
          </div>
          <div class="subinfo-cell">
            <small>Estudantes Matriculados</small>
            <strong>{{ relatorio.totalAlunos }} alunos</strong>
          </div>
          <div class="subinfo-cell">
            <small>Média Geral da Turma</small>
            <strong class="text-primary-val">{{ relatorio.mediaGeralTurma }}</strong>
          </div>
        </div>

        <!-- Python Analytics Section (Visible on Screen & Print) -->
        <div *ngIf="analisePython" class="analytics-card">
          <div class="analytics-title">
            <i class="fa-brands fa-python no-print" style="color: var(--primary); font-size: 1.25rem;"></i>
            <h3>Indicadores Estatísticos e Diagnóstico Pedagógico da Turma</h3>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <small>Média da Turma</small>
              <strong>{{ analisePython.media_geral }}</strong>
            </div>
            <div class="stat-box">
              <small>Mediana</small>
              <strong>{{ analisePython.mediana }}</strong>
            </div>
            <div class="stat-box">
              <small>Desvio Padrão</small>
              <strong>{{ analisePython.desvio_padrao }}</strong>
            </div>
            <div class="stat-box">
              <small>Taxa de Aprovação</small>
              <strong class="text-success">{{ analisePython.taxa_aprovacao }}%</strong>
            </div>
          </div>

          <!-- Pedagogical Recommendations from Python -->
          <div class="recomendacoes-box">
            <strong>Parecer e Recomendações Pedagógicas Automatizadas:</strong>
            <ul>
              <li *ngFor="let rec of analisePython.recomendacoes">• {{ rec }}</li>
            </ul>
          </div>
        </div>

        <!-- Student Performance Table -->
        <div class="doc-section-title">
          <h4>Relação Nominal de Estudantes e Situação Final</h4>
        </div>
        <div class="table-responsive">
          <table class="custom-table doc-table">
            <thead>
              <tr>
                <th style="width: 55px; text-align: center;">Nº</th>
                <th style="min-width: 210px;">Nome do Estudante</th>
                <th style="width: 140px; text-align: center;">Média Acumulada</th>
                <th style="width: 140px; text-align: center;">Taxa de Presença</th>
                <th style="width: 170px; text-align: center;">Situação Final</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let aluno of relatorio.alunos">
                <td style="text-align: center; font-weight: 600;">{{ aluno.numeroChamada }}</td>
                <td class="student-name-cell"><strong>{{ aluno.nome }}</strong></td>
                <td style="text-align: center;">
                  <strong [ngClass]="aluno.mediaGeral >= 6.0 ? 'text-success' : 'text-danger'">
                    {{ aluno.mediaGeral }}
                  </strong>
                </td>
                <td style="text-align: center;">
                  <strong [ngClass]="aluno.taxaPresenca >= 75.0 ? 'text-success' : 'text-danger'">
                    {{ aluno.taxaPresenca }}%
                  </strong>
                </td>
                <td style="text-align: center;">
                  <span *ngIf="aluno.reprovadoPorFalta" class="badge badge-danger">
                    REPROVADO POR FALTA
                  </span>
                  <span *ngIf="!aluno.reprovadoPorFalta && aluno.mediaGeral >= 6.0" class="badge badge-success">
                    APROVADO
                  </span>
                  <span *ngIf="!aluno.reprovadoPorFalta && aluno.mediaGeral >= 4.0 && aluno.mediaGeral < 6.0" class="badge badge-warning">
                    RECUPERAÇÃO
                  </span>
                  <span *ngIf="!aluno.reprovadoPorFalta && aluno.mediaGeral < 4.0" class="badge badge-danger">
                    REPROVADO POR NOTA
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Signatures (for print & official view) -->
        <div class="signatures-area">
          <div class="sign-box">
            <div class="sign-line"></div>
            <span>{{ relatorio.professorNome }}</span>
            <small>Professor(a) Responsável pela Disciplina</small>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <span>Coordenação Pedagógica</span>
            <small>Visto e Homologação Institucional</small>
          </div>
        </div>

        <div class="doc-footer-note">
          <span>Documento gerado eletronicamente pelo Sistema Integrado de Gestão Escolar <strong>Educa+</strong> • Registro auditado em banco secundário MongoDB.</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .relatorios-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .subtitle {
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }
    .filters-bar {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .filter-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .select-control {
      min-width: 250px;
    }
    .print-document {
      padding: 2.5rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-lg);
    }
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 1.25rem;
      margin-bottom: 1.25rem;
    }
    .doc-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .doc-logo-img {
      width: 60px;
      height: 60px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .doc-inst-tag {
      display: block;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--secondary);
      text-transform: uppercase;
      margin-bottom: 0.15rem;
    }
    .doc-brand h2 {
      font-size: 1.25rem;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .doc-brand p {
      font-size: 0.84rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }
    .doc-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.2rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
      background: var(--bg-surface-elevated);
      padding: 0.65rem 0.9rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .doc-subinfo {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .subinfo-cell {
      background: var(--bg-surface-elevated);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }
    .subinfo-cell small {
      display: block;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
      font-weight: 700;
      margin-bottom: 0.2rem;
    }
    .subinfo-cell strong {
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    .text-primary-val {
      color: var(--primary) !important;
      font-family: var(--font-mono);
      font-size: 1.05rem !important;
    }
    .doc-section-title {
      margin-bottom: 0.75rem;
    }
    .doc-section-title h4 {
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--primary);
    }
    .student-name-cell {
      white-space: nowrap;
    }
    .doc-footer-note {
      margin-top: 1.75rem;
      padding-top: 0.75rem;
      border-top: 1px dashed var(--border-subtle);
      text-align: center;
      font-size: 0.74rem;
      color: var(--text-muted);
    }
    @media print {
      .print-document {
        padding: 0 !important;
        border: none !important;
        background: #ffffff !important;
      }
      .doc-header {
        display: flex !important;
        flex-wrap: nowrap !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 0.85rem !important;
        padding-bottom: 0.85rem !important;
        margin-bottom: 0.9rem !important;
      }
      .doc-brand { min-width: 0 !important; flex: 1 !important; }
      .doc-brand h2 { font-size: 1rem !important; color: #083b66 !important; }
      .doc-brand p { font-size: 0.76rem !important; }
      .doc-logo-img { width: 48px !important; height: 48px !important; }
      .doc-meta {
        font-size: 0.72rem !important;
        padding: 0.45rem 0.7rem !important;
        background: #f8fafc !important;
        border-color: #cbd5e1 !important;
        color: #334155 !important;
      }
      .doc-subinfo, .stats-grid {
        gap: 0.5rem !important;
        margin-bottom: 1rem !important;
      }
      .subinfo-cell, .stat-box, .recomendacoes-box {
        background: #f8fafc !important;
        border-color: #cbd5e1 !important;
        padding: 0.55rem 0.75rem !important;
      }
      .analytics-card {
        padding: 0.85rem !important;
        margin-bottom: 1rem !important;
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
      }
      .signatures-area {
        margin-top: 2rem !important;
        padding-top: 0.85rem !important;
      }
      .sign-line {
        height: 0 !important;
        background: transparent !important;
        border-top: 1.5px solid #334155 !important;
      }
    }
    .analytics-card {
      background: linear-gradient(135deg, rgba(8, 54, 96, 0.06) 0%, rgba(18, 168, 107, 0.08) 100%);
      border: 1px solid rgba(15, 157, 104, 0.3);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .analytics-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .analytics-title h3 {
      font-size: 1.05rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .stat-box {
      background: var(--bg-surface);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }
    .stat-box small {
      display: block;
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    .stat-box strong {
      font-size: 1.35rem;
      font-family: var(--font-mono);
    }
    .recomendacoes-box {
      font-size: 0.85rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      padding: 1rem;
      border-radius: var(--radius-sm);
    }
    .recomendacoes-box ul {
      margin-top: 0.5rem;
      padding-left: 0.5rem;
      list-style: none;
    }
    .recomendacoes-box li {
      margin-bottom: 0.25rem;
      color: var(--text-secondary);
    }
    .signatures-area {
      margin-top: 4rem;
      display: flex;
      justify-content: space-around;
      padding-top: 2rem;
    }
    .sign-box {
      text-align: center;
      width: 250px;
    }
    .sign-line {
      height: 1px;
      background: var(--border-subtle);
      margin-bottom: 0.5rem;
    }
    .sign-box span {
      display: block;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .sign-box small {
      color: var(--text-muted);
      font-size: 0.75rem;
    }
    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); }
    .loading-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
    }
    .spinner {
      margin: 0 auto 1rem auto;
      width: 28px;
      height: 28px;
      border: 3px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      border-top-color: var(--primary);
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RelatoriosComponent implements OnInit {
  turmas: TurmaResumo[] = [];
  turmaSelecionadaId: number = 0;
  disciplinaId: number = 0;
  relatorio: any = null;
  analisePython: any = null;
  loading: boolean = true;

  constructor(
    private professorService: ProfessorService,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
    private pdfPrint: PdfPrintService
  ) {}

  ngOnInit() {
    this.carregarTurmas();
  }

  carregarTurmas() {
    this.professorService.getTurmas().subscribe({
      next: (dados) => {
        this.turmas = dados;
        if (dados.length > 0) {
          const qpTurmaId = this.route.snapshot.queryParams['turmaId'];
          const qpDiscId = this.route.snapshot.queryParams['disciplinaId'];

          if (qpTurmaId && qpDiscId) {
            this.turmaSelecionadaId = +qpTurmaId;
            this.disciplinaId = +qpDiscId;
          } else {
            this.turmaSelecionadaId = dados[0].id;
            this.disciplinaId = dados[0].disciplinaId;
          }
          this.gerarRelatorio();
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false
    });
  }

  onTurmaChange() {
    const t = this.turmas.find(item => item.id == this.turmaSelecionadaId);
    if (t) {
      this.disciplinaId = t.disciplinaId;
      this.gerarRelatorio();
    }
  }

  gerarRelatorio() {
    this.loading = true;
    this.professorService.getRelatorio(this.turmaSelecionadaId, this.disciplinaId).subscribe({
      next: (dados) => {
        this.relatorio = dados;
        // Chamar o microserviço Python de Analytics
        this.analyticsService.analisarTurma(dados.turmaNome, dados.disciplinaNome, dados.alunos).subscribe({
          next: (res) => {
            this.analisePython = res.analise;
            this.loading = false;
          },
          error: () => this.loading = false
        });
      },
      error: (err) => {
        console.error('Erro ao gerar relatório:', err);
        this.loading = false;
      }
    });
  }

  imprimir() {
    const docEl = document.getElementById('relatorio-docente-sheet');
    const turma = this.relatorio?.turmaNome || 'Turma';
    const disc = this.relatorio?.disciplinaNome || 'Disciplina';
    this.pdfPrint.printDocument(`Educa+ - Relatorio Consolidado - ${turma} - ${disc}`, docEl);
  }
}
