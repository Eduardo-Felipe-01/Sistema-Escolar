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

      <!-- Notification Banners -->
      <div *ngIf="mensagemSucesso" class="alert-banner success-banner">
        <i class="fa-solid fa-circle-check"></i>
        <span>{{ mensagemSucesso }}</span>
        <button type="button" class="btn-close-banner" (click)="mensagemSucesso = ''">&times;</button>
      </div>

      <div *ngIf="mensagemErro" class="alert-banner error-banner">
        <div class="banner-content">
          <i class="fa-solid fa-triangle-exclamation banner-icon"></i>
          <div>
            <strong>Regra de Negócio:</strong> {{ mensagemErro }}
            <ul *ngIf="detalhesErro.length > 0" class="error-details-list">
              <li *ngFor="let det of detalhesErro">{{ det }}</li>
            </ul>
          </div>
        </div>
        <button type="button" class="btn-close-banner" (click)="mensagemErro = ''">&times;</button>
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
              <tr *ngFor="let nota of notas" [class.row-invalid]="temNotaInvalida(nota)">
                <td class="chamada-col">{{ nota.numeroChamada }}</td>
                <td>
                  <strong class="aluno-nome">{{ nota.alunoNome }}</strong>
                  <small class="aluno-mat">Matrícula #{{ nota.matriculaId }}</small>
                </td>
                <td style="text-align: center;">
                  <div class="input-cell-wrapper">
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      class="cell-input" 
                      [class.cell-input-invalid]="isNotaInvalida(nota.nota1)"
                      [(ngModel)]="nota.nota1" 
                      (ngModelChange)="calcularMediaLocal(nota)"
                      placeholder="-" 
                    />
                    <span *ngIf="isNotaInvalida(nota.nota1)" class="cell-error-tag">0 a 10</span>
                  </div>
                </td>
                <td style="text-align: center;">
                  <div class="input-cell-wrapper">
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      class="cell-input" 
                      [class.cell-input-invalid]="isNotaInvalida(nota.nota2)"
                      [(ngModel)]="nota.nota2" 
                      (ngModelChange)="calcularMediaLocal(nota)"
                      placeholder="-" 
                    />
                    <span *ngIf="isNotaInvalida(nota.nota2)" class="cell-error-tag">0 a 10</span>
                  </div>
                </td>
                <td style="text-align: center;">
                  <div class="input-cell-wrapper">
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      class="cell-input" 
                      [class.cell-input-invalid]="isNotaInvalida(nota.trabalho)"
                      [(ngModel)]="nota.trabalho" 
                      (ngModelChange)="calcularMediaLocal(nota)"
                      placeholder="-" 
                    />
                    <span *ngIf="isNotaInvalida(nota.trabalho)" class="cell-error-tag">0 a 10</span>
                  </div>
                </td>
                <td style="text-align: center;">
                  <div class="input-cell-wrapper">
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      class="cell-input" 
                      [class.cell-input-invalid]="isNotaInvalida(nota.recuperacao)"
                      [(ngModel)]="nota.recuperacao" 
                      (ngModelChange)="calcularMediaLocal(nota)"
                      placeholder="-" 
                    />
                    <span *ngIf="isNotaInvalida(nota.recuperacao)" class="cell-error-tag">0 a 10</span>
                  </div>
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
                  <button 
                    (click)="salvarNotaIndividual(nota)" 
                    class="btn btn-sm" 
                    [ngClass]="temNotaInvalida(nota) ? 'btn-danger' : 'btn-secondary'"
                    [title]="temNotaInvalida(nota) ? 'Corrija os valores inválidos antes de salvar' : 'Salvar Nota'">
                    <i class="fa-solid" [ngClass]="temNotaInvalida(nota) ? 'fa-triangle-exclamation' : 'fa-floppy-disk'"></i>
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
        <div class="legend-item">
          <span class="badge badge-danger badge-outline">NOTA INVÁLIDA</span>
          <small>Fora da escala (0.0 a 10.0)</small>
        </div>
      </div>

      <!-- MODAL DE ERRO DE REGRA DE NEGÓCIO -->
      <div *ngIf="modalErroAberto" class="custom-modal-backdrop" (click)="fecharModalErro()">
        <div class="custom-modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header-error">
            <div class="modal-icon-badge">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div class="modal-title-group">
              <h3>Nota Fora da Regra de Negócio</h3>
              <p class="modal-subtitle">Validação Pedagógica do Sistema Escolar</p>
            </div>
            <button type="button" class="btn-modal-close" (click)="fecharModalErro()">&times;</button>
          </div>

          <div class="modal-body">
            <!-- Box da Regra Escolar -->
            <div class="rule-explainer-box">
              <div class="rule-explainer-header">
                <i class="fa-solid fa-scale-balanced"></i>
                <strong>Regra Oficial do Sistema:</strong>
              </div>
              <p>
                Todas as avaliações (<strong>N1</strong>, <strong>N2</strong>, <strong>Trabalho</strong> e <strong>Recuperação</strong>) 
                devem ter notas compreendidas estritamente entre <strong>0,0</strong> e <strong>10,0</strong>. 
                Valores acima de 10 ou negativos violam os critérios de cálculo de médias.
              </p>
            </div>

            <!-- Card com o estudante e o campo incorreto -->
            <div *ngIf="modalErroAluno" class="student-fault-card">
              <div class="student-fault-header">
                <i class="fa-solid fa-user-graduate"></i>
                <span>Estudante: <strong>{{ modalErroAluno.alunoNome }}</strong> (Nº {{ modalErroAluno.numeroChamada }})</span>
              </div>
              <div class="student-fault-fields">
                <div *ngFor="let falha of camposInvalidosModal" class="fault-item">
                  <i class="fa-solid fa-circle-xmark"></i>
                  <span>{{ falha }}</span>
                </div>
              </div>
            </div>

            <!-- Detalhes do Servidor (se houver) -->
            <div *ngIf="detalhesErro.length > 0" class="backend-fault-card">
              <div class="backend-fault-title">
                <i class="fa-solid fa-server"></i> Resposta do Servidor Spring Boot:
              </div>
              <ul>
                <li *ngFor="let item of detalhesErro">{{ item }}</li>
              </ul>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-primary" (click)="fecharModalErro()">
              <i class="fa-solid fa-pen-to-square"></i> Entendi e vou corrigir a nota
            </button>
          </div>
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
      justify-content: space-between;
      gap: 0.75rem;
      font-size: 0.9rem;
      font-weight: 500;
      animation: fadeIn 0.25s ease-out;
    }
    .banner-content {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .banner-icon {
      font-size: 1.15rem;
      margin-top: 0.15rem;
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
    .error-details-list {
      margin: 0.4rem 0 0 1.25rem;
      padding: 0;
      font-size: 0.85rem;
    }
    .btn-close-banner {
      background: transparent;
      border: none;
      color: inherit;
      font-size: 1.35rem;
      line-height: 1;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
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
    .row-invalid {
      background: rgba(239, 68, 68, 0.05);
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
    .input-cell-wrapper {
      position: relative;
      display: inline-block;
    }
    .cell-input {
      width: 72px;
      text-align: center;
      padding: 0.45rem 0.25rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-weight: 600;
      transition: all 0.2s;
    }
    .cell-input-invalid {
      border: 2px solid #ef4444 !important;
      background: rgba(239, 68, 68, 0.15) !important;
      color: #ef4444 !important;
      box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
      animation: pulseError 1.2s infinite alternate;
    }
    .cell-error-tag {
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.65rem;
      font-weight: 700;
      color: #ffffff;
      background: #ef4444;
      padding: 1px 4px;
      border-radius: 3px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 5;
    }
    @keyframes pulseError {
      from { box-shadow: 0 0 4px rgba(239, 68, 68, 0.3); }
      to { box-shadow: 0 0 10px rgba(239, 68, 68, 0.7); }
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
    .badge-outline {
      border: 1px solid currentColor;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .legend-footer {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      padding: 1rem 0;
      flex-wrap: wrap;
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

    /* CUSTOM GLASS MODAL */
    .custom-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(10, 15, 29, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease-out;
    }
    .custom-modal-dialog {
      background: var(--bg-surface-elevated, #1e293b);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: var(--radius-lg, 16px);
      width: 100%;
      max-width: 560px;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 68, 68, 0.2);
      overflow: hidden;
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .modal-header-error {
      padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(185, 28, 28, 0.05));
      border-bottom: 1px solid rgba(239, 68, 68, 0.25);
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
    }
    .modal-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ef4444;
      font-size: 1.35rem;
      flex-shrink: 0;
    }
    .modal-title-group h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: #f87171;
    }
    .modal-subtitle {
      margin: 0.2rem 0 0 0;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .btn-modal-close {
      position: absolute;
      top: 1rem;
      right: 1.25rem;
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: var(--text-muted);
      cursor: pointer;
    }
    .btn-modal-close:hover {
      color: var(--text-primary);
    }
    .modal-body {
      padding: 1.5rem;
    }
    .rule-explainer-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-left: 4px solid var(--primary);
      border-radius: var(--radius-md);
      padding: 0.9rem 1.15rem;
      margin-bottom: 1.25rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .rule-explainer-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 0.35rem;
    }
    .student-fault-card {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: var(--radius-md);
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .student-fault-header {
      font-size: 0.95rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.65rem;
    }
    .student-fault-fields {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .fault-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ef4444;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .backend-fault-card {
      background: rgba(0, 0, 0, 0.2);
      border-radius: var(--radius-sm);
      padding: 0.75rem 1rem;
      font-size: 0.825rem;
      color: var(--text-muted);
    }
    .backend-fault-card ul {
      margin: 0.35rem 0 0 1.25rem;
      padding: 0;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      background: rgba(0, 0, 0, 0.15);
      border-top: 1px solid var(--border-subtle);
      display: flex;
      justify-content: flex-end;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
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
  mensagemErro: string = '';
  detalhesErro: string[] = [];

  // Modal de erro de validação
  modalErroAberto: boolean = false;
  modalErroAluno: NotaAluno | null = null;
  camposInvalidosModal: string[] = [];

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
    this.mensagemErro = '';
    this.detalhesErro = [];
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

  // Validador individual de célula
  isNotaInvalida(val: any): boolean {
    if (val === null || val === undefined || val === '') return false;
    const num = Number(val);
    return isNaN(num) || num < 0 || num > 10;
  }

  // Verifica se o aluno possui alguma nota fora do range 0..10
  temNotaInvalida(nota: NotaAluno): boolean {
    return this.isNotaInvalida(nota.nota1) ||
           this.isNotaInvalida(nota.nota2) ||
           this.isNotaInvalida(nota.trabalho) ||
           this.isNotaInvalida(nota.recuperacao);
  }

  // Retorna lista legível das infrações encontradas
  obterCamposInvalidos(nota: NotaAluno): string[] {
    const lista: string[] = [];
    if (this.isNotaInvalida(nota.nota1)) {
      lista.push(`N1 (Peso 4): valor "${nota.nota1}" é inválido (permitido: 0.0 a 10.0)`);
    }
    if (this.isNotaInvalida(nota.nota2)) {
      lista.push(`N2 (Peso 4): valor "${nota.nota2}" é inválido (permitido: 0.0 a 10.0)`);
    }
    if (this.isNotaInvalida(nota.trabalho)) {
      lista.push(`Trabalho (Peso 2): valor "${nota.trabalho}" é inválido (permitido: 0.0 a 10.0)`);
    }
    if (this.isNotaInvalida(nota.recuperacao)) {
      lista.push(`Recuperação: valor "${nota.recuperacao}" é inválido (permitido: 0.0 a 10.0)`);
    }
    return lista;
  }

  // Cálculo de Média Automático em Tempo Real
  calcularMediaLocal(nota: NotaAluno) {
    if (this.temNotaInvalida(nota)) {
      nota.mediaBimestre = null;
      nota.status = 'NOTA INVÁLIDA';
      return;
    }

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
    if (status === 'NOTA INVÁLIDA') return 'badge-danger badge-outline';
    return 'badge-info';
  }

  abrirModalErro(nota: NotaAluno | null, erros: string[], detalhesBackend: string[] = []) {
    this.modalErroAluno = nota;
    this.camposInvalidosModal = erros;
    this.detalhesErro = detalhesBackend;
    this.modalErroAberto = true;
  }

  fecharModalErro() {
    this.modalErroAberto = false;
    this.modalErroAluno = null;
    this.camposInvalidosModal = [];
  }

  extrairMensagemErro(err: any): { mensagem: string, detalhes: string[] } {
    let mensagem = 'Não foi possível salvar a nota.';
    let detalhes: string[] = [];

    if (err?.error) {
      if (err.error.detalhes && typeof err.error.detalhes === 'object') {
        mensagem = err.error.erro || 'Valores inválidos nos campos informados:';
        for (const [campo, desc] of Object.entries(err.error.detalhes)) {
          detalhes.push(`${campo}: ${desc}`);
        }
      } else if (err.error.mensagem) {
        mensagem = err.error.mensagem;
      } else if (err.error.erro) {
        mensagem = err.error.erro;
      } else if (err.error.message) {
        mensagem = err.error.message;
      }
    } else if (err?.status === 0) {
      mensagem = 'Falha de comunicação com o servidor Spring Boot.';
    }
    return { mensagem, detalhes };
  }

  salvarNotaIndividual(nota: NotaAluno) {
    this.mensagemErro = '';
    this.detalhesErro = [];

    // Validação preventiva no frontend
    if (this.temNotaInvalida(nota)) {
      const erros = this.obterCamposInvalidos(nota);
      this.mensagemErro = `O estudante ${nota.alunoNome} possui notas fora dos limites permitidos (0.0 a 10.0).`;
      this.abrirModalErro(nota, erros);
      return;
    }

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
      error: (err) => {
        const { mensagem, detalhes } = this.extrairMensagemErro(err);
        this.mensagemErro = mensagem;
        this.detalhesErro = detalhes;
        this.abrirModalErro(nota, detalhes.length > 0 ? detalhes : [mensagem], detalhes);
      }
    });
  }

  salvarTodas() {
    this.mensagemErro = '';
    this.detalhesErro = [];

    // Checar se há algum aluno com nota inválida antes de disparar requisições
    const alunoComErro = this.notas.find(n => this.temNotaInvalida(n));
    if (alunoComErro) {
      const erros = this.obterCamposInvalidos(alunoComErro);
      this.mensagemErro = `Ação bloqueada: Existem notas fora dos limites permitidos (0 a 10). Corrija antes de salvar.`;
      this.abrirModalErro(alunoComErro, erros);
      return;
    }

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
        error: (err) => {
          salvas++;
          if (salvas === total) this.salvando = false;
          const { mensagem, detalhes } = this.extrairMensagemErro(err);
          this.mensagemErro = mensagem;
          this.detalhesErro = detalhes;
          this.abrirModalErro(n, detalhes.length > 0 ? detalhes : [mensagem], detalhes);
        }
      });
    });
  }

  mostrarMensagem(texto: string) {
    this.mensagemSucesso = texto;
    setTimeout(() => this.mensagemSucesso = '', 6000);
  }
}
