import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProfessorService } from '../../../core/services/professor.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
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
            <span>🖨️</span> Imprimir / Salvar PDF
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
          <span>🔄</span> Atualizar Relatório
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state no-print">
        <div class="spinner"></div>
        <p>Processando relatório estatístico nos microserviços...</p>
      </div>

      <!-- Report Sheet Document (Printable) -->
      <div *ngIf="!loading && relatorio" class="glass-panel print-document">
        <!-- Institution Header -->
        <div class="doc-header">
          <div class="doc-brand">
            <img src="assets/logo-educa-mais.png" alt="Logo Educa+" class="doc-logo-img" />
            <div>
              <h2>EDUCA+ — COLÉGIO INTEGRADO DE EDUCAÇÃO BÁSICA</h2>
              <p>Relatório de Rendimento e Desempenho Escolar - Ano Letivo {{ relatorio.anoLetivo }}</p>
            </div>
          </div>
          <div class="doc-meta">
            <span><strong>Emissão:</strong> {{ relatorio.emitidoEm | date:'dd/MM/yyyy HH:mm' }}</span>
            <span><strong>Docente:</strong> {{ relatorio.professorNome }}</span>
          </div>
        </div>

        <div class="doc-subinfo">
          <div><strong>Turma:</strong> {{ relatorio.turmaNome }}</div>
          <div><strong>Disciplina:</strong> {{ relatorio.disciplinaNome }}</div>
          <div><strong>Total de Estudantes:</strong> {{ relatorio.totalAlunos }}</div>
          <div><strong>Média Geral da Turma:</strong> <span class="badge badge-info">{{ relatorio.mediaGeralTurma }}</span></div>
        </div>

        <!-- Python Analytics Section -->
        <div *ngIf="analisePython" class="analytics-card no-print">
          <div class="analytics-title">
            <span>🐍</span>
            <h3>Insights do Microserviço Python de Análise de Dados</h3>
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
            <strong>Recomendações Pedagógicas Automatizadas:</strong>
            <ul>
              <li *ngFor="let rec of analisePython.recomendacoes">• {{ rec }}</li>
            </ul>
          </div>
        </div>

        <!-- Student Performance Table -->
        <div class="table-responsive">
          <table class="custom-table doc-table">
            <thead>
              <tr>
                <th style="width: 50px;">Nº</th>
                <th>Nome do Estudante</th>
                <th style="text-align: center;">Média Acumulada</th>
                <th style="text-align: center;">Taxa de Presença</th>
                <th style="text-align: center;">Situação Final</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let aluno of relatorio.alunos">
                <td>{{ aluno.numeroChamada }}</td>
                <td><strong>{{ aluno.nome }}</strong></td>
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

        <!-- Signatures (for print) -->
        <div class="signatures-area">
          <div class="sign-box">
            <div class="sign-line"></div>
            <span>{{ relatorio.professorNome }}</span>
            <small>Professor(a) Responsável</small>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <span>Coordenação Pedagógica</span>
            <small>Visto e Homologação</small>
          </div>
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
      border-bottom: 2px solid var(--border-subtle);
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .doc-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .doc-logo-img {
      width: 56px;
      height: 56px;
      object-fit: contain;
    }
    .doc-brand h2 {
      font-size: 1.35rem;
      letter-spacing: -0.01em;
    }
    .doc-brand p {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .doc-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .doc-subinfo {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      background: var(--bg-surface-elevated);
      padding: 1rem 1.25rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      margin-bottom: 2rem;
      font-size: 0.9rem;
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
    private route: ActivatedRoute
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
    window.print();
  }
}
