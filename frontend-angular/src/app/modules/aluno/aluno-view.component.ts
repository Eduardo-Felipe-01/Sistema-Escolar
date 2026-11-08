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
      <div class="page-header">
        <div>
          <h1>Portal do Estudante</h1>
          <p class="subtitle">Bem-vindo(a), {{ auth.currentUser()?.nome }}! Acompanhe suas notas, frequência e histórico de auditoria.</p>
        </div>
        <button (click)="auth.logout()" class="btn btn-secondary btn-sm">
          <span>🚪</span> Sair
        </button>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button class="tab-btn" [class.active]="tabAtiva === 'boletim'" (click)="tabAtiva = 'boletim'">
          <span>📊</span> Meu Boletim Escolar
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'historico'" (click)="tabAtiva = 'historico'">
          <span>🕒</span> Histórico de Alterações dos Meus Dados
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'relatorios'" (click)="tabAtiva = 'relatorios'">
          <span>📑</span> Emissões de Relatórios Referentes a Mim
        </button>
      </div>

      <!-- Tab 1: Boletim -->
      <div *ngIf="tabAtiva === 'boletim'" class="tab-content">
        <div *ngFor="let turma of boletins" class="glass-panel boletim-card">
          <div class="card-header">
            <h3>{{ turma.turmaNome }}</h3>
            <span class="badge badge-info">{{ turma.status }}</span>
          </div>

          <table class="custom-table">
            <thead>
              <tr>
                <th>Disciplina</th>
                <th style="text-align: center;">Bimestre</th>
                <th style="text-align: center;">N1</th>
                <th style="text-align: center;">N2</th>
                <th style="text-align: center;">Trabalho</th>
                <th style="text-align: center;">Recuperação</th>
                <th style="text-align: center;">Média</th>
                <th style="text-align: center;">Situação</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let n of turma.notas">
                <td><strong>{{ n.disciplina }}</strong></td>
                <td style="text-align: center;">{{ n.bimestre }}º</td>
                <td style="text-align: center;">{{ n.nota1 ?? '-' }}</td>
                <td style="text-align: center;">{{ n.nota2 ?? '-' }}</td>
                <td style="text-align: center;">{{ n.trabalho ?? '-' }}</td>
                <td style="text-align: center;">{{ n.recuperacao ?? '-' }}</td>
                <td style="text-align: center;"><strong>{{ n.media ?? '-' }}</strong></td>
                <td style="text-align: center;">
                  <span class="badge" [ngClass]="n.status === 'APROVADO' ? 'badge-success' : 'badge-warning'">
                    {{ n.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: Histórico de Alterações dos Dados do Aluno (do MongoDB) -->
      <div *ngIf="tabAtiva === 'historico'" class="tab-content">
        <div class="glass-panel audit-panel">
          <div class="panel-header">
            <h3>Registro de Auditoria de Dados (Transparência do Aluno)</h3>
            <p>Histórico imutável de quem alterou ou lançou suas notas e frequência no banco de dados secundário MongoDB.</p>
          </div>

          <div *ngIf="historico.length === 0" class="empty-state">
            Nenhuma alteração registrada sobre seus dados até o momento.
          </div>

          <div *ngFor="let log of historico" class="log-item">
            <div class="log-badge">
              <span class="badge badge-info">{{ log.acao }}</span>
              <small>{{ log.dataHora | date:'dd/MM/yyyy HH:mm:ss' }}</small>
            </div>
            <div class="log-details">
              <strong>Responsável:</strong> {{ log.usuarioNome }} ({{ log.usuarioRole }})<br>
              <strong>Entidade:</strong> {{ log.entidade }} (ID #{{ log.entidadeId }})<br>
              <code>Novos Dados: {{ log.dadosNovos }}</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Emissões de Relatórios Referentes a Mim -->
      <div *ngIf="tabAtiva === 'relatorios'" class="tab-content">
        <div class="glass-panel audit-panel">
          <div class="panel-header">
            <h3>Emissões de Relatórios Referentes ao Estudante</h3>
            <p>Visualização das emissões pedagógicas e boletins gerados pela escola sobre você.</p>
          </div>

          <div *ngIf="relatorios.length === 0" class="empty-state">
            Nenhum relatório emitido especificamente para sua matrícula ainda.
          </div>

          <div *ngFor="let r of relatorios" class="log-item">
            <div class="log-badge">
              <span class="badge badge-success">{{ r.tipoRelatorio }}</span>
              <small>{{ r.dataEmissao | date:'dd/MM/yyyy HH:mm' }}</small>
            </div>
            <div class="log-details">
              <strong>Emitido por:</strong> {{ r.usuarioNome }}<br>
              <strong>Status de Validação:</strong> {{ r.statusValidacao }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .aluno-wrapper {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .subtitle { color: var(--text-secondary); margin-top: 0.25rem; }
    .tabs-nav {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 0.5rem;
    }
    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-family: var(--font-heading);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: var(--text-primary); background: rgba(255, 255, 255, 0.04); }
    .tab-btn.active {
      color: #fff;
      background: var(--primary);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .boletim-card, .audit-panel {
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .card-header, .panel-header {
      margin-bottom: 1.25rem;
    }
    .panel-header p {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }
    .log-item {
      padding: 1rem;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      margin-bottom: 0.75rem;
    }
    .log-badge {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .log-badge small { color: var(--text-muted); }
    .log-details { font-size: 0.85rem; line-height: 1.5; }
    .log-details code {
      display: block;
      margin-top: 0.35rem;
      padding: 0.35rem 0.5rem;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 0.75rem;
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
    }
  `]
})
export class AlunoViewComponent implements OnInit {
  tabAtiva: 'boletim' | 'historico' | 'relatorios' = 'boletim';
  boletins: any[] = [];
  historico: any[] = [];
  relatorios: any[] = [];

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.carregarDados();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` });
  }

  carregarDados() {
    this.http.get<any[]>('http://localhost:8080/api/aluno/meu-boletim', { headers: this.getHeaders() }).subscribe({
      next: (dados) => this.boletins = dados,
      error: (err) => console.error('Erro ao carregar boletim:', err)
    });

    this.http.get<any[]>('http://localhost:8080/api/aluno/meu-historico', { headers: this.getHeaders() }).subscribe({
      next: (dados) => this.historico = dados,
      error: (err) => console.error('Erro ao carregar histórico:', err)
    });

    this.http.get<any[]>('http://localhost:8080/api/aluno/meus-relatorios', { headers: this.getHeaders() }).subscribe({
      next: (dados) => this.relatorios = dados,
      error: (err) => console.error('Erro ao carregar relatórios:', err)
    });
  }
}
