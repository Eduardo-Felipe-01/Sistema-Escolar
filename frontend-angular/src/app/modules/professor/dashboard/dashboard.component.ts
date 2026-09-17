import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProfessorService } from '../../../core/services/professor.service';
import { TurmaResumo } from '../../../core/models/user.model';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-wrapper">
      <!-- Welcome Header -->
      <div class="header-section">
        <div>
          <h1>Painel Geral do Docente</h1>
          <p class="subtitle">Bem-vindo(a)! Gerencie suas turmas, lance avaliações e acompanhe a frequência escolar.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-success">● Ano Letivo 2026 Ativo</span>
          <span class="badge badge-info">1º Bimestre em Aberto</span>
        </div>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="metrics-grid">
        <div class="glass-card metric-card">
          <div class="metric-icon">🏫</div>
          <div class="metric-content">
            <span class="metric-label">Minhas Turmas</span>
            <strong class="metric-value">{{ turmas.length }}</strong>
            <span class="metric-sub">Matutino e Vespertino</span>
          </div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-icon">👥</div>
          <div class="metric-content">
            <span class="metric-label">Total de Estudantes</span>
            <strong class="metric-value">{{ totalEstudantes }}</strong>
            <span class="metric-sub">Em acompanhamento contínuo</span>
          </div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-icon">🎯</div>
          <div class="metric-content">
            <span class="metric-label">Média das Turmas</span>
            <strong class="metric-value text-accent">7.4</strong>
            <span class="metric-sub">Acima da média mínima (6.0)</span>
          </div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-icon">✅</div>
          <div class="metric-content">
            <span class="metric-label">Assiduidade Geral</span>
            <strong class="metric-value text-success">89.2%</strong>
            <span class="metric-sub">Frequência mínima exigida: 75%</span>
          </div>
        </div>
      </div>

      <!-- Assigned Classes List -->
      <div class="section-title">
        <h2>Turmas e Disciplinas Vinculadas</h2>
        <p>Acesse rapidamente as ferramentas pedagógicas de cada turma:</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando turmas vinculadas do banco de dados...</p>
      </div>

      <div *ngIf="!loading" class="turmas-grid">
        <div *ngFor="let turma of turmas" class="glass-panel turma-card">
          <div class="turma-header">
            <div>
              <h3>{{ turma.nome }}</h3>
              <span class="turma-subject">{{ turma.disciplinaNome }}</span>
            </div>
            <span class="badge badge-info">{{ turma.turno }}</span>
          </div>

          <div class="turma-details">
            <div class="detail-item">
              <span class="detail-label">Sala</span>
              <strong>{{ turma.sala || 'Sala 301' }}</strong>
            </div>
            <div class="detail-item">
              <span class="detail-label">Estudantes</span>
              <strong>{{ turma.totalAlunos }} matriculados</strong>
            </div>
            <div class="detail-item">
              <span class="detail-label">Ano</span>
              <strong>{{ turma.anoLetivo }}</strong>
            </div>
          </div>

          <div class="turma-actions">
            <button (click)="irParaNotas(turma)" class="btn btn-primary btn-sm">
              <span>📝</span> Lançar Notas
            </button>
            <button (click)="irParaFrequencia(turma)" class="btn btn-secondary btn-sm">
              <span>📅</span> Fazer Chamada
            </button>
            <button (click)="irParaRelatorios(turma)" class="btn btn-secondary btn-sm">
              <span>📑</span> Relatório
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Tips Card -->
      <div class="glass-panel tips-panel">
        <div class="tips-icon">💡</div>
        <div class="tips-text">
          <strong>Regras Automáticas do Sistema:</strong>
          <p>
            • A <strong>média ponderada</strong> é calculada automaticamente: Avaliações (80%) + Trabalho (20%). 
            Recuperação entra no recálculo caso a média seja menor que 6.0.<br>
            • A <strong>reprovação por falta</strong> é computada automaticamente se a presença do aluno for inferior a 75%.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .subtitle {
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }
    .header-badges {
      display: flex;
      gap: 0.5rem;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }
    .metric-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .metric-icon {
      font-size: 2.25rem;
      padding: 0.75rem;
      background: var(--bg-surface-elevated);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }
    .metric-label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .metric-value {
      display: block;
      font-size: 1.85rem;
      font-family: var(--font-heading);
      line-height: 1.2;
    }
    .text-accent {
      color: var(--secondary);
    }
    .text-success {
      color: var(--success);
    }
    .metric-sub {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .section-title {
      margin-bottom: 1.25rem;
    }
    .section-title p {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .turmas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .turma-card {
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s;
    }
    .turma-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
      border-color: rgba(99, 102, 241, 0.4);
    }
    .turma-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }
    .turma-header h3 {
      font-size: 1.2rem;
      margin-bottom: 0.25rem;
    }
    .turma-subject {
      color: var(--primary);
      font-weight: 600;
      font-size: 0.9rem;
    }
    .turma-details {
      display: flex;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
    }
    .detail-label {
      display: block;
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .detail-item strong {
      font-size: 0.85rem;
      color: var(--text-primary);
    }
    .turma-actions {
      display: grid;
      grid-template-columns: 1.2fr 1fr 0.8fr;
      gap: 0.5rem;
    }
    .tips-panel {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      border-left: 4px solid var(--primary);
    }
    .tips-icon {
      font-size: 2rem;
    }
    .tips-text strong {
      display: block;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }
    .tips-text p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
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
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  turmas: TurmaResumo[] = [];
  loading: boolean = true;
  totalEstudantes: number = 0;

  constructor(private professorService: ProfessorService, private router: Router) {}

  ngOnInit() {
    this.carregarTurmas();
  }

  carregarTurmas() {
    this.loading = true;
    this.professorService.getTurmas().subscribe({
      next: (dados) => {
        this.turmas = dados;
        this.totalEstudantes = dados.reduce((acc, t) => acc + (t.totalAlunos || 0), 0);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar turmas:', err);
        this.loading = false;
      }
    });
  }

  irParaNotas(turma: TurmaResumo) {
    this.router.navigate(['/professor/notas'], {
      queryParams: { turmaId: turma.id, disciplinaId: turma.disciplinaId }
    });
  }

  irParaFrequencia(turma: TurmaResumo) {
    this.router.navigate(['/professor/frequencia'], {
      queryParams: { turmaId: turma.id, disciplinaId: turma.disciplinaId }
    });
  }

  irParaRelatorios(turma: TurmaResumo) {
    this.router.navigate(['/professor/relatorios'], {
      queryParams: { turmaId: turma.id, disciplinaId: turma.disciplinaId }
    });
  }
}
