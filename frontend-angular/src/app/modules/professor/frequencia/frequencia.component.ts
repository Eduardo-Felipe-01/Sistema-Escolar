import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProfessorService } from '../../../core/services/professor.service';
import { TurmaResumo, FrequenciaAluno } from '../../../core/models/user.model';

@Component({
  selector: 'app-professor-frequencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="frequencia-wrapper">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Diário de Classe & Chamada Escolar</h1>
          <p class="subtitle">Controle diário de assiduidade com cálculo automático de presença e reprovação por faltas (&lt; 75%).</p>
        </div>
        <div class="actions-header">
          <button (click)="marcarTodosPresentes()" class="btn btn-secondary">
            <i class="fa-solid fa-check-double"></i> Todos Presentes
          </button>
          <button (click)="salvarChamada()" class="btn btn-primary" [disabled]="salvando">
            <i class="fa-solid fa-floppy-disk"></i> Salvar Chamada do Dia
          </button>
        </div>
      </div>

      <!-- Notification Banners -->
      <div *ngIf="mensagemSucesso" class="alert-banner success-banner">
        <i class="fa-solid fa-circle-check"></i>
        <span>{{ mensagemSucesso }}</span>
        <button type="button" class="btn-close-banner" (click)="mensagemSucesso = ''">&times;</button>
      </div>

      <div *ngIf="mensagemErro" class="alert-banner error-banner">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span>{{ mensagemErro }}</span>
        <button type="button" class="btn-close-banner" (click)="mensagemErro = ''">&times;</button>
      </div>

      <!-- Filters Bar -->
      <div class="glass-panel filters-bar">
        <div class="filter-group">
          <label class="filter-label">Turma:</label>
          <select [(ngModel)]="turmaSelecionadaId" (change)="onTurmaChange()" class="form-control select-control">
            <option *ngFor="let t of turmas" [value]="t.id">
              {{ t.nome }} ({{ t.disciplinaNome }})
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Data da Aula:</label>
          <input type="date" class="form-control" [(ngModel)]="dataSelecionada" (change)="carregarResumo()" />
        </div>

        <div class="filter-group">
          <label class="filter-label">Quantidade de Aulas:</label>
          <select [(ngModel)]="aulasNoDia" class="form-control" style="width: 110px;">
            <option [ngValue]="1">1 Aula</option>
            <option [ngValue]="2">2 Aulas</option>
          </select>
        </div>

        <div class="filter-info">
          <span class="badge badge-warning">LDB: Frequência mínima exigida = 75%</span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando registros de frequência da turma...</p>
      </div>

      <!-- Attendance Table -->
      <div *ngIf="!loading" class="glass-panel table-panel">
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th style="width: 60px;">Nº</th>
                <th>Estudante</th>
                <th style="text-align: center;">Chamada Hoje</th>
                <th style="text-align: center;">Presenças Acumuladas</th>
                <th style="text-align: center;">Faltas Acumuladas</th>
                <th style="text-align: center;">Assiduidade Geral</th>
                <th style="text-align: center;">Situação por Frequência</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let aluno of alunos">
                <td class="chamada-col">{{ aluno.numeroChamada }}</td>
                <td>
                  <strong class="aluno-nome">{{ aluno.alunoNome }}</strong>
                  <small class="aluno-mat">Matrícula #{{ aluno.matriculaId }}</small>
                </td>
                <td style="text-align: center;">
                  <div class="attendance-buttons">
                    <button 
                      type="button" 
                      class="btn-status btn-presente" 
                      [class.active]="aluno.presencaHoje === 1"
                      (click)="definirPresenca(aluno, 1)">
                      P
                    </button>
                    <button 
                      type="button" 
                      class="btn-status btn-falta" 
                      [class.active]="aluno.presencaHoje === 0 && !aluno.justificadaHoje"
                      (click)="definirPresenca(aluno, 0, false)">
                      F
                    </button>
                    <button 
                      type="button" 
                      class="btn-status btn-justificada" 
                      [class.active]="aluno.presencaHoje === 0 && aluno.justificadaHoje"
                      (click)="definirPresenca(aluno, 0, true)">
                      FJ
                    </button>
                  </div>
                </td>
                <td style="text-align: center;">
                  <span class="badge badge-info">{{ aluno.totalPresencas }} aulas</span>
                </td>
                <td style="text-align: center;">
                  <span class="badge" [ngClass]="aluno.totalFaltas > 3 ? 'badge-danger' : 'badge-warning'">
                    {{ aluno.totalFaltas }} faltas
                  </span>
                </td>
                <td style="text-align: center;">
                  <strong class="taxa-display" [ngClass]="aluno.taxaPresenca < 75.0 ? 'text-danger' : 'text-success'">
                    {{ aluno.taxaPresenca }}%
                  </strong>
                </td>
                <td style="text-align: center;">
                  <span *ngIf="aluno.reprovadoPorFalta" class="badge badge-danger">
                    <i class="fa-solid fa-triangle-exclamation"></i> REPROVADO POR FALTA
                  </span>
                  <span *ngIf="!aluno.reprovadoPorFalta && aluno.taxaPresenca < 80.0" class="badge badge-warning">
                    ALERTA DE INFREQUÊNCIA
                  </span>
                  <span *ngIf="!aluno.reprovadoPorFalta && aluno.taxaPresenca >= 80.0" class="badge badge-success">
                    REGULAR
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .frequencia-wrapper {
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
    .actions-header {
      display: flex;
      gap: 0.75rem;
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
    .error-banner {
      background: var(--danger-bg);
      border: 1px solid rgba(239, 68, 68, 0.5);
      color: var(--danger);
    }
    .btn-close-banner {
      background: transparent;
      border: none;
      color: inherit;
      font-size: 1.35rem;
      line-height: 1;
      cursor: pointer;
      opacity: 0.7;
      margin-left: auto;
    }
    .btn-close-banner:hover {
      opacity: 1;
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
    .attendance-buttons {
      display: inline-flex;
      gap: 0.35rem;
      background: var(--bg-input);
      padding: 0.25rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }
    .btn-status {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      border-radius: 4px;
      border: 1px solid transparent;
      cursor: pointer;
      background: transparent;
      color: var(--text-muted);
      transition: all 0.2s;
    }
    .btn-status:hover {
      background: var(--primary-light);
      color: var(--text-primary);
    }
    .btn-presente.active {
      background: var(--success);
      color: #fff;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
    }
    .btn-falta.active {
      background: var(--danger);
      color: #fff;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
    }
    .btn-justificada.active {
      background: var(--warning);
      color: #000;
      box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
    }
    .taxa-display {
      font-family: var(--font-mono);
      font-size: 1.05rem;
    }
    .text-danger {
      color: var(--danger);
    }
    .text-success {
      color: var(--success);
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
export class FrequenciaComponent implements OnInit {
  turmas: TurmaResumo[] = [];
  turmaSelecionadaId: number = 0;
  disciplinaId: number = 0;
  dataSelecionada: string = new Date().toISOString().substring(0, 10);
  aulasNoDia: number = 1;
  alunos: FrequenciaAluno[] = [];
  loading: boolean = true;
  salvando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

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
          this.carregarResumo();
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
      this.carregarResumo();
    }
  }

  carregarResumo() {
    this.loading = true;
    this.mensagemSucesso = '';
    this.professorService.getResumoFrequencia(this.turmaSelecionadaId, this.disciplinaId).subscribe({
      next: (dados) => {
        this.alunos = dados.map(a => ({
          ...a,
          presencaHoje: 1, // padrão: presente
          justificadaHoje: false
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar frequência:', err);
        this.loading = false;
      }
    });
  }

  definirPresenca(aluno: FrequenciaAluno, presenca: number, justificada: boolean = false) {
    aluno.presencaHoje = presenca;
    aluno.justificadaHoje = justificada;
  }

  marcarTodosPresentes() {
    this.alunos.forEach(a => {
      a.presencaHoje = 1;
      a.justificadaHoje = false;
    });
  }

  salvarChamada() {
    this.mensagemErro = '';
    this.salvando = true;
    const itens = this.alunos.map(a => ({
      matriculaId: a.matriculaId,
      presencas: a.presencaHoje === 1 ? this.aulasNoDia : 0,
      faltas: a.presencaHoje === 0 ? this.aulasNoDia : 0,
      justificada: a.justificadaHoje || false,
      observacao: a.justificadaHoje ? 'Falta Justificada' : ''
    }));

    const payload = {
      turmaId: this.turmaSelecionadaId,
      disciplinaId: this.disciplinaId,
      data: this.dataSelecionada,
      aulasNoDia: this.aulasNoDia,
      itens
    };

    this.professorService.salvarFrequencias(payload).subscribe({
      next: () => {
        this.salvando = false;
        this.mostrarMensagem('Chamada registrada com sucesso! Frequências recalculadas e auditoria gravada no MongoDB.');
        this.carregarResumo(); // Atualiza contadores acumulados
      },
      error: (err) => {
        this.salvando = false;
        const msg = err.error?.mensagem || err.error?.erro || err.error?.message || 'Falha de comunicação com o servidor ao salvar frequência.';
        this.mensagemErro = msg;
      }
    });
  }

  mostrarMensagem(texto: string) {
    this.mensagemSucesso = texto;
    setTimeout(() => this.mensagemSucesso = '', 6000);
  }
}
