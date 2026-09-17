import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-coordenador-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="coord-wrapper">
      <div class="page-header">
        <div>
          <h1>Painel da Coordenação Pedagógica</h1>
          <p class="subtitle">Gestão escolar integral, validação de diários, cronograma e auditoria geral.</p>
        </div>
        <button (click)="auth.logout()" class="btn btn-secondary btn-sm">
          <span>🚪</span> Sair
        </button>
      </div>

      <!-- Stats Grid -->
      <div *ngIf="stats" class="stats-grid">
        <div class="glass-card stat-item">
          <small>Total de Usuários</small>
          <strong>{{ stats.totalUsuarios }}</strong>
        </div>
        <div class="glass-card stat-item">
          <small>Turmas Ativas</small>
          <strong>{{ stats.totalTurmas }}</strong>
        </div>
        <div class="glass-card stat-item">
          <small>Professores</small>
          <strong>{{ stats.totalProfessores }}</strong>
        </div>
        <div class="glass-card stat-item">
          <small>Estudantes</small>
          <strong>{{ stats.totalAlunos }}</strong>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-nav">
        <button class="tab-btn" [class.active]="tabAtiva === 'auditoria'" (click)="tabAtiva = 'auditoria'">
          <span>🛡️</span> Auditoria Global (MySQL)
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'cronograma'" (click)="tabAtiva = 'cronograma'">
          <span>📅</span> Cronograma Escolar
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'usuarios'" (click)="tabAtiva = 'usuarios'">
          <span>👥</span> Gestão de Usuários
        </button>
      </div>

      <!-- Tab 1: Auditoria do Sistema (MySQL) -->
      <div *ngIf="tabAtiva === 'auditoria'" class="glass-panel panel-content">
        <h3>Histórico de Ações e Auditoria Geral da Escola</h3>
        <p class="subtext">Registrado no banco secundário MySQL em conformidade com as regras de governança.</p>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Usuário Responsável</th>
                <th>Perfil</th>
                <th>Ação</th>
                <th>Entidade</th>
                <th>Detalhes / Novos Dados</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of auditoria">
                <td><small>{{ log.dataHora | date:'dd/MM/yyyy HH:mm:ss' }}</small></td>
                <td><strong>{{ log.usuarioNome }}</strong></td>
                <td><span class="badge badge-info">{{ log.usuarioRole }}</span></td>
                <td><span class="badge badge-success">{{ log.acao }}</span></td>
                <td>{{ log.entidade }} #{{ log.entidadeId }}</td>
                <td><code>{{ log.dadosNovos }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: Cronograma Escolar -->
      <div *ngIf="tabAtiva === 'cronograma'" class="glass-panel panel-content">
        <div class="section-flex">
          <div>
            <h3>Calendário e Cronograma Letivo</h3>
            <p class="subtext">Definição de bimestres, períodos de provas e eventos escolares.</p>
          </div>
          <button (click)="adicionarEvento()" class="btn btn-primary btn-sm">
            <span>➕</span> Adicionar Evento
          </button>
        </div>

        <div class="cronograma-list">
          <div *ngFor="let c of cronograma" class="c-item glass-card">
            <span class="badge badge-info">{{ c.tipo }}</span>
            <h4>{{ c.titulo }}</h4>
            <small>De {{ c.dataInicio }} até {{ c.dataFim }}</small>
            <p>{{ c.descricao }}</p>
          </div>
        </div>
      </div>

      <!-- Tab 3: Gestão de Usuários -->
      <div *ngIf="tabAtiva === 'usuarios'" class="glass-panel panel-content">
        <h3>Usuários Cadastrados na Instituição</h3>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Matrícula</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of usuarios">
                <td><strong>{{ u.nome }}</strong></td>
                <td>{{ u.email }}</td>
                <td><span class="badge badge-info">{{ u.role }}</span></td>
                <td>{{ u.matricula || '-' }}</td>
                <td><span class="badge badge-success">ATIVO</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .coord-wrapper {
      max-width: 1200px;
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
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-item {
      padding: 1.25rem;
      text-align: center;
    }
    .stat-item small {
      display: block;
      color: var(--text-muted);
      text-transform: uppercase;
      font-size: 0.75rem;
    }
    .stat-item strong {
      font-size: 2rem;
      font-family: var(--font-heading);
      color: var(--primary);
    }
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
    .panel-content {
      padding: 1.75rem;
    }
    .subtext {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .section-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .cronograma-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }
    .c-item h4 { margin: 0.5rem 0 0.25rem 0; font-size: 1rem; }
    .c-item small { color: var(--secondary); font-weight: 600; }
    .c-item p { font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem; }
    code {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      background: rgba(0, 0, 0, 0.3);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
    }
  `]
})
export class CoordenadorViewComponent implements OnInit {
  tabAtiva: 'auditoria' | 'cronograma' | 'usuarios' = 'auditoria';
  stats: any = null;
  auditoria: any[] = [];
  cronograma: any[] = [];
  usuarios: any[] = [];

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.carregarDados();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` });
  }

  carregarDados() {
    this.http.get<any>('http://localhost:8080/api/coordenador/estatisticas-gerais', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.stats = res
    });

    this.http.get<any[]>('http://localhost:8080/api/coordenador/auditoria', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.auditoria = res
    });

    this.http.get<any[]>('http://localhost:8080/api/coordenador/cronograma', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.cronograma = res
    });

    this.http.get<any[]>('http://localhost:8080/api/coordenador/usuarios', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.usuarios = res
    });
  }

  adicionarEvento() {
    const titulo = prompt('Título do evento escolar:');
    if (!titulo) return;
    const novo = {
      titulo,
      dataInicio: new Date().toISOString().substring(0, 10),
      dataFim: new Date().toISOString().substring(0, 10),
      tipo: 'EVENTO',
      descricao: 'Cadastrado pela Coordenação Pedagógica'
    };
    this.http.post<any>('http://localhost:8080/api/coordenador/cronograma', novo, { headers: this.getHeaders() }).subscribe({
      next: (c) => this.cronograma.push(c)
    });
  }
}
