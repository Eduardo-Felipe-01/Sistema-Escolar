import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-coordenador-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="coord-wrapper">
      <div class="page-header">
        <div class="header-brand">
          <img src="assets/logo-educa-mais.png" alt="Logo Educa+" class="header-logo" />
          <div>
            <h1>Educa+ — Coordenação Pedagógica</h1>
            <p class="subtitle">Gestão escolar integral, validação de diários, cronograma e auditoria geral.</p>
          </div>
        </div>
        <div class="header-actions">
          <a routerLink="/professor/notas" class="btn btn-primary btn-sm">
            <span>📝</span> Alterar Notas / Faltas
          </a>
          <button (click)="auth.logout()" class="btn btn-secondary btn-sm">
            <span>🚪</span> Sair
          </button>
        </div>
      </div>

      <!-- Notification Banner -->
      <div *ngIf="mensagemSucesso" class="alert-banner">
        <span>✅</span> {{ mensagemSucesso }}
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
          <span>🛡️</span> Auditoria Global (MongoDB)
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'relatorios'" (click)="tabAtiva = 'relatorios'">
          <span>📑</span> Homologação de Relatórios
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'cronograma'" (click)="tabAtiva = 'cronograma'">
          <span>📅</span> Cronograma Escolar
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'usuarios'" (click)="tabAtiva = 'usuarios'">
          <span>👥</span> Gestão de Usuários
        </button>
      </div>

      <!-- Tab 1: Auditoria do Sistema (MongoDB) -->
      <div *ngIf="tabAtiva === 'auditoria'" class="glass-panel panel-content">
        <div class="section-flex">
          <div>
            <h3>Histórico de Ações e Auditoria Geral da Escola</h3>
            <p class="subtext" style="margin-bottom: 0;">Registrado no banco secundário MongoDB em conformidade com as regras de governança.</p>
          </div>
          <button (click)="carregarDados()" class="btn btn-secondary btn-sm">
            <span>🔄</span> Atualizar
          </button>
        </div>

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

      <!-- Tab 2: Validação e Homologação de Relatórios -->
      <div *ngIf="tabAtiva === 'relatorios'" class="glass-panel panel-content">
        <div class="section-flex">
          <div>
            <h3>Homologação de Relatórios Pedagógicos</h3>
            <p class="subtext" style="margin-bottom: 0;">Validação das emissões de boletins e relatórios gerados pelos professores.</p>
          </div>
          <a routerLink="/professor/relatorios" class="btn btn-primary btn-sm">
            <span>📊</span> Emitir Novo Relatório
          </a>
        </div>

        <div *ngIf="relatorios.length === 0" class="empty-state">
          Nenhum relatório emitido até o momento.
        </div>

        <div *ngIf="relatorios.length > 0" class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Data Emissão</th>
                <th>Tipo</th>
                <th>Turma / Disciplina</th>
                <th>Emitido Por</th>
                <th>Status</th>
                <th>Homologado Por</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of relatorios">
                <td><small>{{ r.dataEmissao | date:'dd/MM/yyyy HH:mm' }}</small></td>
                <td><span class="badge badge-info">{{ r.tipoRelatorio }}</span></td>
                <td>
                  <strong>{{ r.turmaNome || 'Turma Geral' }}</strong>
                  <div *ngIf="r.disciplinaNome"><small>{{ r.disciplinaNome }}</small></div>
                </td>
                <td>{{ r.usuarioNome }}</td>
                <td>
                  <span class="badge" [ngClass]="r.statusValidacao === 'VALIDADO_COORDENADOR' ? 'badge-success' : 'badge-warning'">
                    {{ r.statusValidacao }}
                  </span>
                </td>
                <td>{{ r.validadoPor || '-' }}</td>
                <td>
                  <button *ngIf="r.statusValidacao !== 'VALIDADO_COORDENADOR'"
                          (click)="validarRelatorio(r)"
                          class="btn btn-primary btn-sm">
                    ✅ Homologar
                  </button>
                  <span *ngIf="r.statusValidacao === 'VALIDADO_COORDENADOR'" class="text-ok">✔ Homologado</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Cronograma Escolar -->
      <div *ngIf="tabAtiva === 'cronograma'" class="glass-panel panel-content">
        <div class="section-flex">
          <div>
            <h3>Calendário e Cronograma Letivo</h3>
            <p class="subtext" style="margin-bottom: 0;">Definição de bimestres, períodos de provas e eventos escolares.</p>
          </div>
          <button (click)="mostrarFormCronograma = !mostrarFormCronograma" class="btn btn-primary btn-sm">
            <span>{{ mostrarFormCronograma ? '✖' : '➕' }}</span> {{ mostrarFormCronograma ? 'Fechar Formulário' : 'Novo Evento' }}
          </button>
        </div>

        <!-- Formulário de Novo Evento -->
        <div *ngIf="mostrarFormCronograma" class="glass-card form-box">
          <h4>Cadastrar Evento no Cronograma</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>Título do Evento</label>
              <input type="text" [(ngModel)]="novoEvento.titulo" placeholder="Ex: Conselho de Classe 2º Bimestre" class="form-control">
            </div>
            <div class="form-group">
              <label>Tipo</label>
              <select [(ngModel)]="novoEvento.tipo" class="form-control">
                <option value="BIMESTRE">BIMESTRE</option>
                <option value="AVALIACAO">AVALIACAO</option>
                <option value="EVENTO">EVENTO</option>
                <option value="FERIADO">FERIADO</option>
              </select>
            </div>
            <div class="form-group">
              <label>Data Início</label>
              <input type="date" [(ngModel)]="novoEvento.dataInicio" class="form-control">
            </div>
            <div class="form-group">
              <label>Data Fim</label>
              <input type="date" [(ngModel)]="novoEvento.dataFim" class="form-control">
            </div>
            <div class="form-group full-width">
              <label>Descrição</label>
              <input type="text" [(ngModel)]="novoEvento.descricao" placeholder="Descrição detalhada da atividade pedagógica" class="form-control">
            </div>
          </div>
          <div class="form-actions">
            <button (click)="salvarEvento()" class="btn btn-primary btn-sm">💾 Salvar Evento</button>
          </div>
        </div>

        <div class="cronograma-list">
          <div *ngFor="let c of cronograma" class="c-item glass-card">
            <div class="c-item-top">
              <span class="badge badge-info">{{ c.tipo }}</span>
              <button (click)="removerEvento(c)" class="btn-icon-danger" title="Remover Evento">🗑️</button>
            </div>
            <h4>{{ c.titulo }}</h4>
            <small>De {{ c.dataInicio }} até {{ c.dataFim }}</small>
            <p>{{ c.descricao }}</p>
          </div>
        </div>
      </div>

      <!-- Tab 4: Gestão de Usuários -->
      <div *ngIf="tabAtiva === 'usuarios'" class="glass-panel panel-content">
        <div class="section-flex">
          <div>
            <h3>Usuários Cadastrados na Instituição</h3>
            <p class="subtext" style="margin-bottom: 0;">Criação, exclusão e atribuição de perfis (Aluno, Professor ou Coordenador).</p>
          </div>
          <button (click)="mostrarFormUsuario = !mostrarFormUsuario" class="btn btn-primary btn-sm">
            <span>{{ mostrarFormUsuario ? '✖' : '➕' }}</span> {{ mostrarFormUsuario ? 'Fechar Formulário' : 'Novo Usuário' }}
          </button>
        </div>

        <!-- Formulário de Novo Usuário -->
        <div *ngIf="mostrarFormUsuario" class="glass-card form-box">
          <h4>Cadastrar Novo Usuário</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>Nome Completo</label>
              <input type="text" [(ngModel)]="novoUsuario.nome" placeholder="Nome completo" class="form-control">
            </div>
            <div class="form-group">
              <label>E-mail</label>
              <input type="email" [(ngModel)]="novoUsuario.email" placeholder="usuario@escola.com" class="form-control">
            </div>
            <div class="form-group">
              <label>Senha Inicial</label>
              <input type="password" [(ngModel)]="novoUsuario.senha" placeholder="Padrão: senha123" class="form-control">
            </div>
            <div class="form-group">
              <label>Perfil de Acesso</label>
              <select [(ngModel)]="novoUsuario.role" class="form-control">
                <option value="ROLE_ALUNO">ALUNO</option>
                <option value="ROLE_PROFESSOR">PROFESSOR</option>
                <option value="ROLE_COORDENADOR">COORDENADOR</option>
              </select>
            </div>
            <div class="form-group">
              <label>Matrícula / Registro</label>
              <input type="text" [(ngModel)]="novoUsuario.matricula" placeholder="Ex: 2026-ALU-010" class="form-control">
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input type="text" [(ngModel)]="novoUsuario.telefone" placeholder="(11) 99999-9999" class="form-control">
            </div>
          </div>
          <div class="form-actions">
            <button (click)="criarUsuario()" class="btn btn-primary btn-sm">💾 Cadastrar Usuário</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Matrícula</th>
                <th>Perfil (Atribuição)</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of usuarios">
                <td><strong>{{ u.nome }}</strong></td>
                <td>{{ u.email }}</td>
                <td>{{ u.matricula || '-' }}</td>
                <td>
                  <select [ngModel]="u.role" (ngModelChange)="alterarPerfilUsuario(u, $event)" class="role-select">
                    <option value="ROLE_ALUNO">ROLE_ALUNO</option>
                    <option value="ROLE_PROFESSOR">ROLE_PROFESSOR</option>
                    <option value="ROLE_COORDENADOR">ROLE_COORDENADOR</option>
                  </select>
                </td>
                <td><span class="badge badge-success">ATIVO</span></td>
                <td>
                  <button (click)="excluirUsuario(u)"
                          [disabled]="u.id === auth.currentUser()?.id"
                          class="btn btn-secondary btn-sm"
                          title="Excluir Usuário">
                    🗑️ Excluir
                  </button>
                </td>
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
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header-logo {
      width: 54px;
      height: 54px;
      object-fit: contain;
    }
    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .subtitle { color: var(--text-secondary); margin-top: 0.25rem; }
    .alert-banner {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10b981;
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
      font-weight: 500;
    }
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
      flex-wrap: wrap;
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
    .tab-btn:hover { color: var(--text-primary); background: var(--primary-light); }
    .tab-btn.active {
      color: #fff;
      background: var(--brand-gradient);
      box-shadow: 0 4px 12px rgba(8, 54, 96, 0.22);
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
      flex-wrap: wrap;
      gap: 1rem;
    }
    .form-box {
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(99, 102, 241, 0.35);
    }
    .form-box h4 {
      margin-bottom: 1rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-group.full-width {
      grid-column: 1 / -1;
    }
    .form-group label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-weight: 600;
    }
    .form-control, .role-select {
      padding: 0.55rem 0.75rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      font-size: 0.85rem;
    }
    .form-actions {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
    }
    .cronograma-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }
    .c-item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-icon-danger {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 0.95rem;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    .btn-icon-danger:hover { opacity: 1; }
    .c-item h4 { margin: 0.5rem 0 0.25rem 0; font-size: 1rem; }
    .c-item small { color: var(--secondary); font-weight: 600; }
    .c-item p { font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem; }
    .text-ok { color: #10b981; font-weight: 600; font-size: 0.85rem; }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
    }
    code {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--primary);
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
    }
  `]
})
export class CoordenadorViewComponent implements OnInit {
  tabAtiva: 'auditoria' | 'relatorios' | 'cronograma' | 'usuarios' = 'auditoria';
  stats: any = null;
  auditoria: any[] = [];
  relatorios: any[] = [];
  cronograma: any[] = [];
  usuarios: any[] = [];
  mensagemSucesso = '';

  mostrarFormCronograma = false;
  novoEvento = {
    titulo: '',
    tipo: 'EVENTO',
    dataInicio: new Date().toISOString().substring(0, 10),
    dataFim: new Date().toISOString().substring(0, 10),
    descricao: ''
  };

  mostrarFormUsuario = false;
  novoUsuario = {
    nome: '',
    email: '',
    senha: '',
    role: 'ROLE_ALUNO',
    matricula: '',
    telefone: ''
  };

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.carregarDados();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` });
  }

  private notificar(msg: string) {
    this.mensagemSucesso = msg;
    setTimeout(() => this.mensagemSucesso = '', 4000);
  }

  carregarDados() {
    this.http.get<any>('http://localhost:8080/api/coordenador/estatisticas-gerais', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.stats = res
    });

    this.http.get<any[]>('http://localhost:8080/api/coordenador/auditoria', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.auditoria = res
    });

    this.http.get<any[]>('http://localhost:8080/api/coordenador/relatorios', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.relatorios = res
    });

    this.http.get<any[]>('http://localhost:8080/api/coordenador/cronograma', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.cronograma = res
    });

    this.http.get<any[]>('http://localhost:8080/api/coordenador/usuarios', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.usuarios = res
    });
  }

  validarRelatorio(relatorio: any) {
    this.http.post<any>(`http://localhost:8080/api/coordenador/validar-relatorio/${relatorio.id}`, {}, { headers: this.getHeaders() }).subscribe({
      next: (atualizado) => {
        relatorio.statusValidacao = atualizado.statusValidacao;
        relatorio.validadoPor = atualizado.validadoPor;
        relatorio.dataValidacao = atualizado.dataValidacao;
        this.notificar('Relatório homologado pela Coordenação e registrado na auditoria do MongoDB!');
        this.carregarDados();
      }
    });
  }

  salvarEvento() {
    if (!this.novoEvento.titulo.trim()) return;
    this.http.post<any>('http://localhost:8080/api/coordenador/cronograma', this.novoEvento, { headers: this.getHeaders() }).subscribe({
      next: (c) => {
        this.cronograma.push(c);
        this.mostrarFormCronograma = false;
        this.novoEvento = {
          titulo: '',
          tipo: 'EVENTO',
          dataInicio: new Date().toISOString().substring(0, 10),
          dataFim: new Date().toISOString().substring(0, 10),
          descricao: ''
        };
        this.notificar('Evento adicionado ao cronograma escolar com sucesso!');
        this.carregarDados();
      }
    });
  }

  removerEvento(evento: any) {
    this.http.delete(`http://localhost:8080/api/coordenador/cronograma/${evento.id}`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.cronograma = this.cronograma.filter(c => c.id !== evento.id);
        this.notificar('Evento removido do cronograma.');
      }
    });
  }

  criarUsuario() {
    if (!this.novoUsuario.nome.trim() || !this.novoUsuario.email.trim()) return;
    this.http.post<any>('http://localhost:8080/api/coordenador/usuarios', this.novoUsuario, { headers: this.getHeaders() }).subscribe({
      next: (u) => {
        this.usuarios.push(u);
        this.mostrarFormUsuario = false;
        this.novoUsuario = { nome: '', email: '', senha: '', role: 'ROLE_ALUNO', matricula: '', telefone: '' };
        this.notificar(`Usuário ${u.nome} criado com sucesso e registrado no MongoDB!`);
        this.carregarDados();
      }
    });
  }

  alterarPerfilUsuario(usuario: any, novoRole: string) {
    this.http.put<any>(`http://localhost:8080/api/coordenador/usuarios/${usuario.id}`, { role: novoRole }, { headers: this.getHeaders() }).subscribe({
      next: (atualizado) => {
        usuario.role = atualizado.role;
        this.notificar(`Perfil de ${usuario.nome} atualizado para ${novoRole}!`);
        this.carregarDados();
      }
    });
  }

  excluirUsuario(usuario: any) {
    if (usuario.id === this.auth.currentUser()?.id) return;
    this.http.delete(`http://localhost:8080/api/coordenador/usuarios/${usuario.id}`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
        this.notificar(`Usuário ${usuario.nome} removido com sucesso.`);
        this.carregarDados();
      }
    });
  }
}
