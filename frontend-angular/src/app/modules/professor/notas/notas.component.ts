import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProfessorService } from '../../../core/services/professor.service';
import { TurmaResumo, NotaAluno } from '../../../core/models/user.model';

@Component({
  selector: 'app-professor-notas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notas-wrapper">
      <!-- Top Title & Controls -->
      <div class="page-header">
        <div>
          <h1>Lançamento de Avaliações e Notas</h1>
          <p class="subtitle">Lançamento de notas bimestrais com cálculo automático em tempo real e auditoria em MongoDB.</p>
        </div>
        <div class="actions-header">
          <button (click)="salvarTodas()" class="btn btn-success" [disabled]="salvando">
            <i class="fa-solid fa-floppy-disk"></i> Salvar Todas as Notas
          </button>
        </div>
      </div>

      <!-- Notification Banner -->
      <div *ngIf="mensagemSucesso" class="alert-banner success-banner">
        <i class="fa-solid fa-circle-check"></i> {{ mensagemSucesso }}
      </div>

      <!-- Filters Panel -->
      <div class="glass-panel filters-bar">
        <div class="filter-group">
          <label class="filter-label">Turma Selecionada:</label>
          <select [(ngModel)]="turmaSelecionadaId" (change)="onTurmaChange()" class="form-control select-control">
            <option *ngFor="let t of turmas" [value]="t.id">
              {{ t.nome }} ({{ t.disciplinaNome }})
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Bimestre Letivo:</label>
          <div class="bimestre-toggle">
            <button 
              *ngFor="let b of [1, 2, 3, 4]" 
              type="button" 
              class="btn-bimestre" 
              [class.active]="bimestreSelecionado === b"
              (click)="selecionarBimestre(b)">
              {{ b }}º Bimestre
            </button>
          </div>
        </div>

        <div class="filter-info">
          <span class="badge badge-info">Fórmula: (N1×0.4) + (N2×0.4) + (Trab×0.2)</span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando notas dos estudantes...</p>
      </div>

      <!-- Grades Table -->
      <div *ngIf="!loading" class="glass-panel table-panel">
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th style="width: 60px;">Nº</th>
                <th>Estudante</th>
                <th style="text-align: center;">N1 (Peso 4)</th>
                <th style="text-align: center;">N2 (Peso 4)</th>
                <th style="text-align: center;">Trabalho (Peso 2)</th>
                <th style="text-align: center;">Recuperação</th>
                <th style="text-align: center;">Média Bimestral</th>
                <th style="text-align: center;">Situação</th>
                <th style="text-align: center; width: 100px;">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let nota of notas">
                <td class="chamada-col">{{ nota.numeroChamada }}</td>
                <td>
                  <strong class="aluno-nome">{{ nota.alunoNome }}</strong>
                  <small class="aluno-mat">Matrícula #{{ nota.matriculaId }}</small>
                </td>
                <td style="text-align: center;">
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="10" 
                    class="cell-input" 
                    [(ngModel)]="nota.nota1" 
                    (ngModelChange)="calcularMediaLocal(nota)"
                    placeholder="-" 
                  />
                </td>
                <td style="text-align: center;">
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="10" 
                    class="cell-input" 
                    [(ngModel)]="nota.nota2" 
                    (ngModelChange)="calcularMediaLocal(nota)"
                    placeholder="-" 
                  />
                </td>
                <td style="text-align: center;">
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="10" 
                    class="cell-input" 
                    [(ngModel)]="nota.trabalho" 
                    (ngModelChange)="calcularMediaLocal(nota)"
                    placeholder="-" 
                  />
                </td>
                <td style="text-align: center;">
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="10" 
                    class="cell-input" 
                    [(ngModel)]="nota.recuperacao" 
                    (ngModelChange)="calcularMediaLocal(nota)"
                    placeholder="-" 
                  />
                </td>
                <td style="text-align: center;">
                  <strong class="media-display" [ngClass]="getMediaClass(nota.mediaBimestre)">
                    {{ nota.mediaBimestre !== null ? nota.mediaBimestre.toFixed(1) : '-' }}
                  </strong>
                </td>
                <td style="text-align: center;">
                  <span class="badge" [ngClass]="getStatusBadgeClass(nota.status)">
                    {{ nota.status }}
                  </span>
                </td>
                <td style="text-align: center;">
                  <button (click)="salvarNotaIndividual(nota)" class="btn btn-secondary btn-sm" title="Salvar Nota">
                    <i class="fa-solid fa-floppy-disk"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Legend Footer -->
      <div class="legend-footer">
        <div class="legend-item">
          <span class="badge badge-success">APROVADO</span>
          <small>Média ≥ 6.0</small>
        </div>
        <div class="legend-item">
          <span class="badge badge-warning">RECUPERAÇÃO</span>
          <small>4.0 ≤ Média &lt; 6.0</small>
        </div>
        <div class="legend-item">
          <span class="badge badge-danger">REPROVADO</span>
          <small>Média &lt; 4.0</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notas-wrapper {
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
    .alert-banner {
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .success-banner {
      background: var(--success-bg);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: var(--success);
    }
    .filters-bar {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
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
    .bimestre-toggle {
      display: flex;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.25rem;
      gap: 0.25rem;
    }
    .btn-bimestre {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 0.4rem 0.85rem;
      font-family: var(--font-heading);
      font-size: 0.825rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-bimestre:hover {
      color: var(--text-primary);
    }
    .btn-bimestre.active {
      background: var(--brand-gradient);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(8, 54, 96, 0.25);
    }
    .table-panel {
      padding: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .chamada-col {
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--text-muted);
    }
    .aluno-nome {
      display: block;
      font-size: 0.95rem;
    }
    .aluno-mat {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .media-display {
      font-family: var(--font-mono);
      font-size: 1.1rem;
    }
    .media-high {
      color: var(--success);
    }
    .media-mid {
      color: var(--warning);
    }
    .media-low {
      color: var(--danger);
    }
    .legend-footer {
      display: flex;
      gap: 2rem;
      align-items: center;
      padding: 1rem 0;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .legend-item small {
      color: var(--text-muted);
      font-size: 0.8rem;
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
export class NotasComponent implements OnInit {
  turmas: TurmaResumo[] = [];
  turmaSelecionadaId: number = 0;
  disciplinaId: number = 0;
  bimestreSelecionado: number = 1;
  notas: NotaAluno[] = [];
  loading: boolean = true;
  salvando: boolean = false;
  mensagemSucesso: string = '';

  constructor(
    private professorService: ProfessorService,
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
          this.carregarNotas();
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
      this.carregarNotas();
    }
  }

  selecionarBimestre(b: number) {
    this.bimestreSelecionado = b;
    this.carregarNotas();
  }

  carregarNotas() {
    this.loading = true;
    this.mensagemSucesso = '';
    this.professorService.getNotas(this.turmaSelecionadaId, this.disciplinaId, this.bimestreSelecionado).subscribe({
      next: (dados) => {
        this.notas = dados;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar notas:', err);
        this.loading = false;
      }
    });
  }

  // Cálculo de Média Automático em Tempo Real
  calcularMediaLocal(nota: NotaAluno) {
    const n1 = nota.nota1 !== null && !isNaN(nota.nota1) ? +nota.nota1 : 0;
    const n2 = nota.nota2 !== null && !isNaN(nota.nota2) ? +nota.nota2 : 0;
    const trab = nota.trabalho !== null && !isNaN(nota.trabalho) ? +nota.trabalho : 0;

    let media = (n1 * 0.4) + (n2 * 0.4) + (trab * 0.2);

    if (nota.recuperacao !== null && !isNaN(nota.recuperacao) && media < 6.0) {
      const mediaRec = (media + (+nota.recuperacao)) / 2.0;
      media = Math.max(media, mediaRec);
    }

    nota.mediaBimestre = +media.toFixed(2);

    if (nota.mediaBimestre >= 6.0) {
      nota.status = 'APROVADO';
    } else if (nota.mediaBimestre >= 4.0) {
      nota.status = 'RECUPERACAO';
    } else {
      nota.status = 'REPROVADO';
    }
  }

  getMediaClass(media: number | null): string {
    if (media === null) return '';
    if (media >= 6.0) return 'media-high';
    if (media >= 4.0) return 'media-mid';
    return 'media-low';
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'APROVADO') return 'badge-success';
    if (status === 'RECUPERACAO') return 'badge-warning';
    if (status === 'REPROVADO') return 'badge-danger';
    return 'badge-info';
  }

  salvarNotaIndividual(nota: NotaAluno) {
    const payload = {
      matriculaId: nota.matriculaId,
      disciplinaId: this.disciplinaId,
      bimestre: this.bimestreSelecionado,
      nota1: nota.nota1,
      nota2: nota.nota2,
      trabalho: nota.trabalho,
      recuperacao: nota.recuperacao,
      observacoes: nota.observacoes || ''
    };

    this.professorService.salvarNota(payload).subscribe({
      next: (resp) => {
        nota.id = resp.id;
        nota.mediaBimestre = resp.mediaBimestre;
        nota.status = resp.status;
        this.mostrarMensagem(`Nota de ${nota.alunoNome} salva com sucesso e registrada na auditoria do MongoDB!`);
      },
      error: (err) => alert('Erro ao salvar nota: ' + (err.error?.message || 'Falha de conexão'))
    });
  }

  salvarTodas() {
    this.salvando = true;
    let salvas = 0;
    const total = this.notas.length;

    if (total === 0) {
      this.salvando = false;
      return;
    }

    this.notas.forEach(n => {
      const payload = {
        matriculaId: n.matriculaId,
        disciplinaId: this.disciplinaId,
        bimestre: this.bimestreSelecionado,
        nota1: n.nota1,
        nota2: n.nota2,
        trabalho: n.trabalho,
        recuperacao: n.recuperacao,
        observacoes: n.observacoes || ''
      };

      this.professorService.salvarNota(payload).subscribe({
        next: (resp) => {
          n.id = resp.id;
          n.mediaBimestre = resp.mediaBimestre;
          n.status = resp.status;
          salvas++;
          if (salvas === total) {
            this.salvando = false;
            this.mostrarMensagem(`Todas as ${total} notas do ${this.bimestreSelecionado}º Bimestre foram salvas com sucesso e registradas na auditoria!`);
          }
        },
        error: () => {
          salvas++;
          if (salvas === total) this.salvando = false;
        }
      });
    });
  }

  mostrarMensagem(texto: string) {
    this.mensagemSucesso = texto;
    setTimeout(() => this.mensagemSucesso = '', 6000);
  }
}
