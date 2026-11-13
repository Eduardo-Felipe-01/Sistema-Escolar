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
            <p class="subtitle">Gestão escolar integral, validação de diários, turmas, cronograma e auditoria geral.</p>
          </div>
        </div>
        <div class="header-actions">
          <a routerLink="/professor/notas" class="btn btn-primary btn-sm">
            <i class="fa-solid fa-pen-to-square"></i> Lançar / Alterar Notas
          </a>
          <button (click)="auth.logout()" class="btn btn-secondary btn-sm">
            <i class="fa-solid fa-right-from-bracket"></i> Sair
          </button>
        </div>
      </div>

      <!-- Notification Banners -->
      <div *ngIf="mensagemSucesso" class="alert-banner success-banner">
        <div class="banner-content">
          <i class="fa-solid fa-circle-check"></i>
          <span>{{ mensagemSucesso }}</span>
        </div>
        <button type="button" class="btn-close-banner" (click)="mensagemSucesso = ''">&times;</button>
      </div>

      <div *ngIf="mensagemErro" class="alert-banner error-banner">
        <div class="banner-content">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span><strong>Regra de Negócio:</strong> {{ mensagemErro }}</span>
        </div>
        <button type="button" class="btn-close-banner" (click)="mensagemErro = ''">&times;</button>
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

      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button class="tab-btn" [class.active]="tabAtiva === 'auditoria'" (click)="tabAtiva = 'auditoria'">
          <i class="fa-solid fa-shield-halved"></i> Auditoria Global (MongoDB)
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'academico'" (click)="tabAtiva = 'academico'">
          <i class="fa-solid fa-graduation-cap"></i> Turmas & Vínculos
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'disciplinas'" (click)="tabAtiva = 'disciplinas'">
          <i class="fa-solid fa-book-bookmark"></i> Disciplinas
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'relatorios'" (click)="tabAtiva = 'relatorios'">
          <i class="fa-solid fa-file-circle-check"></i> Homologação de Relatórios
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'cronograma'" (click)="tabAtiva = 'cronograma'">
          <i class="fa-solid fa-calendar-days"></i> Cronograma Escolar
        </button>
        <button class="tab-btn" [class.active]="tabAtiva === 'usuarios'" (click)="tabAtiva = 'usuarios'">
          <i class="fa-solid fa-users-gear"></i> Gestão de Usuários
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
            <i class="fa-solid fa-rotate"></i> Atualizar
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

      <!-- Tab 2: Gestão Acadêmica (Turmas, Matrículas e Vínculos) -->
      <div *ngIf="tabAtiva === 'academico'" class="glass-panel panel-content">
        <!-- Turmas -->
        <div class="section-flex">
          <div>
            <h3>Turmas da Instituição</h3>
            <p class="subtext" style="margin-bottom: 0;">Cadastro de salas, turnos e acompanhamento de turmas letivas.</p>
          </div>
          <div class="section-actions-group">
            <button (click)="mostrarFormMatricula = !mostrarFormMatricula" class="btn btn-secondary btn-sm">
              <i class="fa-solid fa-user-plus"></i> Matricular Estudante
            </button>
            <button (click)="mostrarFormTurma = !mostrarFormTurma" class="btn btn-primary btn-sm">
              <i class="fa-solid" [ngClass]="mostrarFormTurma ? 'fa-xmark' : 'fa-plus'"></i> {{ mostrarFormTurma ? 'Fechar' : 'Nova Turma' }}
            </button>
          </div>
        </div>

        <!-- Form Nova Turma -->
        <div *ngIf="mostrarFormTurma" class="glass-card form-box">
          <h4>Cadastrar Nova Turma</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>Nome da Turma</label>
              <input type="text" [(ngModel)]="novaTurma.nome" placeholder="Ex: 1º Ano C - Ensino Médio" class="form-control">
            </div>
            <div class="form-group">
              <label>Ano Letivo</label>
              <input type="number" [(ngModel)]="novaTurma.anoLetivo" class="form-control">
            </div>
            <div class="form-group">
              <label>Turno</label>
              <select [(ngModel)]="novaTurma.turno" class="form-control">
                <option value="MATUTINO">MATUTINO</option>
                <option value="VESPERTINO">VESPERTINO</option>
                <option value="NOTURNO">NOTURNO</option>
                <option value="INTEGRAL">INTEGRAL</option>
              </select>
            </div>
            <div class="form-group">
              <label>Sala</label>
              <input type="text" [(ngModel)]="novaTurma.sala" placeholder="Ex: Sala 102" class="form-control">
            </div>
          </div>
          <div class="form-actions">
            <button (click)="criarTurma()" class="btn btn-primary btn-sm"><i class="fa-solid fa-floppy-disk"></i> Salvar Turma</button>
          </div>
        </div>

        <!-- Form Matricular Aluno -->
        <div *ngIf="mostrarFormMatricula" class="glass-card form-box" style="border-left: 4px solid var(--primary);">
          <h4>Matricular Estudante em uma Turma</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>Turma de Destino</label>
              <select [(ngModel)]="novaMatricula.turmaId" class="form-control">
                <option value="0" disabled>Selecione a Turma</option>
                <option *ngFor="let t of turmas" [value]="t.id">{{ t.nome }} ({{ t.turno }})</option>
              </select>
            </div>
            <div class="form-group">
              <label>Estudante</label>
              <select [(ngModel)]="novaMatricula.alunoId" class="form-control">
                <option value="0" disabled>Selecione o Estudante</option>
                <option *ngFor="let a of getAlunos()" [value]="a.id">{{ a.nome }} ({{ a.matricula || a.email }})</option>
              </select>
            </div>
            <div class="form-group">
              <label>Número na Chamada (Opcional)</label>
              <input type="number" [(ngModel)]="novaMatricula.numeroChamada" placeholder="Automático" class="form-control">
            </div>
          </div>
          <div class="form-actions">
            <button (click)="matricularAluno()" class="btn btn-success btn-sm"><i class="fa-solid fa-user-check"></i> Efetivar Matrícula</button>
          </div>
        </div>

        <!-- Tabela de Turmas -->
        <div class="table-responsive" style="margin-bottom: 2rem;">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Nome da Turma</th>
                <th>Ano Letivo</th>
                <th>Turno</th>
                <th>Sala</th>
                <th style="width: 100px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of turmas">
                <td><strong>{{ t.nome }}</strong></td>
                <td>{{ t.anoLetivo }}</td>
                <td><span class="badge badge-info">{{ t.turno }}</span></td>
                <td>{{ t.sala || '-' }}</td>
                <td>
                  <button (click)="confirmarExclusao('turma', t)" class="btn btn-secondary btn-sm" title="Excluir Turma">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Atribuição Docente (Vínculos) -->
        <div class="section-flex" style="border-top: 1px solid var(--border-subtle); padding-top: 1.5rem;">
          <div>
            <h3>Atribuição Docente (Vínculos Turma x Disciplina)</h3>
            <p class="subtext" style="margin-bottom: 0;">Define qual docente leciona determinada disciplina em cada turma.</p>
          </div>
          <button (click)="mostrarFormVinculo = !mostrarFormVinculo" class="btn btn-primary btn-sm">
            <i class="fa-solid" [ngClass]="mostrarFormVinculo ? 'fa-xmark' : 'fa-plus'"></i> {{ mostrarFormVinculo ? 'Fechar' : 'Novo Vínculo' }}
          </button>
        </div>

        <!-- Form Novo Vínculo -->
        <div *ngIf="mostrarFormVinculo" class="glass-card form-box">
          <h4>Atribuir Professor a Turma e Disciplina</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>Turma</label>
              <select [(ngModel)]="novoVinculo.turmaId" class="form-control">
                <option value="0" disabled>Selecione a Turma</option>
                <option *ngFor="let t of turmas" [value]="t.id">{{ t.nome }} ({{ t.turno }})</option>
              </select>
            </div>
            <div class="form-group">
              <label>Disciplina</label>
              <select [(ngModel)]="novoVinculo.disciplinaId" class="form-control">
                <option value="0" disabled>Selecione a Disciplina</option>
                <option *ngFor="let d of disciplinas" [value]="d.id">{{ d.nome }} ({{ d.codigo || d.cargaHoraria + 'h' }})</option>
              </select>
            </div>
            <div class="form-group">
              <label>Professor(a)</label>
              <select [(ngModel)]="novoVinculo.professorId" class="form-control">
                <option value="0" disabled>Selecione o(a) Professor(a)</option>
                <option *ngFor="let p of getProfessores()" [value]="p.id">{{ p.nome }}</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button (click)="criarVinculo()" class="btn btn-primary btn-sm"><i class="fa-solid fa-link"></i> Confirmar Vínculo</button>
          </div>
        </div>

        <!-- Tabela de Vínculos -->
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Turma</th>
                <th>Disciplina</th>
                <th>Professor Responsável</th>
                <th style="width: 100px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let v of vinculos">
                <td><strong>{{ v.turma?.nome }}</strong></td>
                <td>{{ v.disciplina?.nome }}</td>
                <td><i class="fa-solid fa-chalkboard-user"></i> {{ v.professor?.nome }}</td>
                <td>
                  <button (click)="confirmarExclusao('vinculo', v)" class="btn btn-secondary btn-sm" title="Remover Vínculo">
                    <i class="fa-solid fa-link-slash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Disciplinas Escolares -->
      <div *ngIf="tabAtiva === 'disciplinas'" class="glass-panel panel-content">
        <div class="section-flex">
          <div>
            <h3>Matriz Curricular & Disciplinas</h3>
            <p class="subtext" style="margin-bottom: 0;">Cadastro das matérias lecionadas na escola com código e carga horária.</p>
          </div>
          <button (click)="mostrarFormDisciplina = !mostrarFormDisciplina" class="btn btn-primary btn-sm">
            <i class="fa-solid" [ngClass]="mostrarFormDisciplina ? 'fa-xmark' : 'fa-plus'"></i> {{ mostrarFormDisciplina ? 'Fechar' : 'Nova Disciplina' }}
          </button>
        </div>

        <!-- Form Nova Disciplina -->
        <div *ngIf="mostrarFormDisciplina" class="glass-card form-box">
          <h4>Cadastrar Nova Disciplina</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>Nome da Disciplina</label>
              <input type="text" [(ngModel)]="novaDisciplina.nome" placeholder="Ex: Química Orgânica" class="form-control">
            </div>
            <div class="form-group">
              <label>Carga Horária (Horas)</label>
              <input type="number" [(ngModel)]="novaDisciplina.cargaHoraria" class="form-control">
            </div>
            <div class="form-group">
              <label>Código da Matéria</label>
              <input type="text" [(ngModel)]="novaDisciplina.codigo" placeholder="Ex: QUI-101" class="form-control">
            </div>
          </div>
          <div class="form-actions">
            <button (click)="criarDisciplina()" class="btn btn-primary btn-sm"><i class="fa-solid fa-floppy-disk"></i> Salvar Disciplina</button>
          </div>
        </div>

        <!-- Tabela de Disciplinas -->
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome da Disciplina</th>
                <th>Carga Horária</th>
                <th style="width: 100px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of disciplinas">
                <td><span class="badge badge-info">{{ d.codigo || 'S/CÓD' }}</span></td>
                <td><strong>{{ d.nome }}</strong></td>
                <td>{{ d.cargaHoraria }} horas</td>
                <td>
                  <button (click)="confirmarExclusao('disciplina', d)" class="btn btn-secondary btn-sm" title="Excluir Disciplina">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 4: Homologação de Relatórios -->
      <div *ngIf="tabAtiva === 'relatorios'" class="glass-panel panel-content">
        <div class="section-flex">
          <div>
            <h3>Homologação de Relatórios Pedagógicos</h3>
            <p class="subtext" style="margin-bottom: 0;">Validação das emissões de boletins e relatórios gerados pelos professores.</p>
          </div>
          <a routerLink="/professor/relatorios" class="btn btn-primary btn-sm">
            <i class="fa-solid fa-chart-column"></i> Emitir Novo Relatório
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
                    <i class="fa-solid fa-check"></i> Homologar
                  </button>
                  <span *ngIf="r.statusValidacao === 'VALIDADO_COORDENADOR'" class="text-ok"><i class="fa-solid fa-circle-check"></i> Homologado</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 5: Cronograma Escolar -->
      <div *ngIf="tabAtiva === 'cronograma'" class="glass-panel panel-content">
        <div class="section-flex">
          <div>
            <h3>Calendário e Cronograma Letivo</h3>
            <p class="subtext" style="margin-bottom: 0;">Definição de bimestres, períodos de provas e eventos escolares.</p>
          </div>
          <button (click)="mostrarFormCronograma = !mostrarFormCronograma" class="btn btn-primary btn-sm">
            <i class="fa-solid" [ngClass]="mostrarFormCronograma ? 'fa-xmark' : 'fa-plus'"></i> {{ mostrarFormCronograma ? 'Fechar Formulário' : 'Novo Evento' }}
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
            <button (click)="salvarEvento()" class="btn btn-primary btn-sm"><i class="fa-solid fa-floppy-disk"></i> Salvar Evento</button>
          </div>
        </div>

        <div class="cronograma-list">
          <div *ngFor="let c of cronograma" class="c-item glass-card">
            <div class="c-item-top">
              <span class="badge badge-info">{{ c.tipo }}</span>
              <button (click)="removerEvento(c)" class="btn-icon-danger" title="Remover Evento"><i class="fa-solid fa-trash-can"></i></button>
            </div>
            <h4>{{ c.titulo }}</h4>
            <small>De {{ c.dataInicio }} até {{ c.dataFim }}</small>
            <p>{{ c.descricao }}</p>
          </div>
        </div>
      </div>

      <!-- Tab 6: Gestão de Usuários -->
      <div *ngIf="tabAtiva === 'usuarios'" class="glass-panel panel-content">
        <div class="section-flex">
          <div>
            <h3>Usuários Cadastrados na Instituição</h3>
            <p class="subtext" style="margin-bottom: 0;">Criação, exclusão e atribuição de perfis (Aluno, Professor ou Coordenador).</p>
          </div>
          <button (click)="mostrarFormUsuario = !mostrarFormUsuario" class="btn btn-primary btn-sm">
            <i class="fa-solid" [ngClass]="mostrarFormUsuario ? 'fa-xmark' : 'fa-plus'"></i> {{ mostrarFormUsuario ? 'Fechar Formulário' : 'Novo Usuário' }}
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
            <button (click)="criarUsuario()" class="btn btn-primary btn-sm"><i class="fa-solid fa-floppy-disk"></i> Cadastrar Usuário</button>
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
                  <button (click)="confirmarExclusao('usuario', u)"
                          [disabled]="u.id === auth.currentUser()?.id"
                          class="btn btn-secondary btn-sm"
                          title="Excluir Usuário">
                    <i class="fa-solid fa-trash-can"></i> Excluir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO -->
      <div *ngIf="modalConfirmacaoAberto" class="modal-backdrop" (click)="fecharModalConfirmacao()">
        <div class="modal-dialog-glass" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <i class="fa-solid fa-triangle-exclamation modal-icon-warn"></i>
            <h4>{{ modalConfirmacaoTitulo }}</h4>
          </div>
          <p class="modal-desc">{{ modalConfirmacaoMensagem }}</p>
          <div class="modal-btn-group">
            <button (click)="fecharModalConfirmacao()" class="btn btn-secondary btn-sm">Cancelar</button>
            <button (click)="executarConfirmacao()" class="btn btn-danger btn-sm">
              <i class="fa-solid fa-trash-can"></i> Confirmar Exclusão
            </button>
          </div>
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
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      animation: fadeIn 0.25s ease-out;
    }
    .banner-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .success-banner {
      background: var(--success-bg, rgba(16, 185, 129, 0.15));
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10b981;
    }
    .error-banner {
      background: var(--danger-bg, rgba(239, 68, 68, 0.15));
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #ef4444;
    }
    .btn-close-banner {
      background: transparent;
      border: none;
      color: inherit;
      font-size: 1.35rem;
      line-height: 1;
      cursor: pointer;
      opacity: 0.7;
    }
    .btn-close-banner:hover { opacity: 1; }
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
      overflow-x: auto;
    }
    .tab-btn {
      background: transparent;
      border: none;
      padding: 0.65rem 1.2rem;
      font-family: var(--font-heading);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .tab-btn:hover {
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
    }
    .tab-btn.active {
      background: var(--brand-gradient);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(8, 54, 96, 0.25);
    }
    .panel-content {
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .section-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .section-actions-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .section-flex h3 { margin: 0; font-size: 1.15rem; }
    .subtext { font-size: 0.85rem; color: var(--text-muted); }
    .form-box {
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      border: 1px solid var(--border-subtle);
    }
    .form-box h4 { margin: 0 0 1rem 0; font-size: 1rem; color: var(--primary); }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-group label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
      color: var(--text-secondary);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
    .role-select {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 0.35rem 0.6rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
    }
    .cronograma-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }
    .c-item { padding: 1.25rem; }
    .c-item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-icon-danger {
      background: transparent;
      border: none;
      color: #ef4444;
      cursor: pointer;
      opacity: 0.7;
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

    /* Modal Backdrop and Box */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(10, 15, 29, 0.7);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
    }
    .modal-dialog-glass {
      background: var(--bg-surface-elevated, #1e293b);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      max-width: 460px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .modal-head {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .modal-head h4 { margin: 0; font-size: 1.15rem; color: var(--text-primary); }
    .modal-icon-warn { font-size: 1.5rem; color: #f59e0b; }
    .modal-desc { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.5rem; }
    .modal-btn-group { display: flex; justify-content: flex-end; gap: 0.75rem; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CoordenadorViewComponent implements OnInit {
  tabAtiva: 'auditoria' | 'relatorios' | 'cronograma' | 'usuarios' | 'academico' | 'disciplinas' = 'auditoria';
  stats: any = null;
  auditoria: any[] = [];
  relatorios: any[] = [];
  cronograma: any[] = [];
  usuarios: any[] = [];
  turmas: any[] = [];
  disciplinas: any[] = [];
  vinculos: any[] = [];

  mensagemSucesso = '';
  mensagemErro = '';

  // Modais de confirmação
  modalConfirmacaoAberto = false;
  modalConfirmacaoTitulo = '';
  modalConfirmacaoMensagem = '';
  modalConfirmacaoAcao: (() => void) | null = null;

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

  mostrarFormTurma = false;
  novaTurma = {
    nome: '',
    anoLetivo: 2026,
    turno: 'MATUTINO',
    sala: ''
  };

  mostrarFormMatricula = false;
  novaMatricula = {
    turmaId: 0,
    alunoId: 0,
    numeroChamada: null as number | null
  };

  mostrarFormDisciplina = false;
  novaDisciplina = {
    nome: '',
    cargaHoraria: 60,
    codigo: ''
  };

  mostrarFormVinculo = false;
  novoVinculo = {
    turmaId: 0,
    disciplinaId: 0,
    professorId: 0
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
    this.mensagemErro = '';
    setTimeout(() => this.mensagemSucesso = '', 4000);
  }

  private notificarErro(msg: string) {
    this.mensagemErro = msg;
    this.mensagemSucesso = '';
    setTimeout(() => this.mensagemErro = '', 6000);
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

    this.http.get<any[]>('http://localhost:8080/api/coordenador/turmas', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.turmas = res
    });

    this.http.get<any[]>('http://localhost:8080/api/coordenador/disciplinas', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.disciplinas = res
    });

    this.http.get<any[]>('http://localhost:8080/api/coordenador/vinculos', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.vinculos = res
    });
  }

  getProfessores(): any[] {
    return this.usuarios.filter(u => u.role === 'ROLE_PROFESSOR' || u.role === 'ROLE_COORDENADOR');
  }

  getAlunos(): any[] {
    return this.usuarios.filter(u => u.role === 'ROLE_ALUNO');
  }

  confirmarExclusao(tipo: 'usuario' | 'turma' | 'disciplina' | 'vinculo', item: any) {
    if (tipo === 'usuario') {
      if (item.id === this.auth.currentUser()?.id) {
        this.notificarErro('Você não pode excluir o seu próprio usuário logado.');
        return;
      }
      this.modalConfirmacaoTitulo = 'Excluir Usuário';
      this.modalConfirmacaoMensagem = `Deseja realmente excluir o usuário "${item.nome}"? O sistema verificará se não há matrículas ou turmas vinculadas.`;
      this.modalConfirmacaoAcao = () => this.executarExclusaoUsuario(item);
    } else if (tipo === 'turma') {
      this.modalConfirmacaoTitulo = 'Excluir Turma';
      this.modalConfirmacaoMensagem = `Deseja excluir a turma "${item.nome}"? A turma não pode ter estudantes matriculados nem disciplinas vinculadas.`;
      this.modalConfirmacaoAcao = () => this.executarExclusaoTurma(item);
    } else if (tipo === 'disciplina') {
      this.modalConfirmacaoTitulo = 'Excluir Disciplina';
      this.modalConfirmacaoMensagem = `Deseja excluir a disciplina "${item.nome}"? A exclusão só é permitida se ela não estiver vinculada a nenhuma turma.`;
      this.modalConfirmacaoAcao = () => this.executarExclusaoDisciplina(item);
    } else if (tipo === 'vinculo') {
      this.modalConfirmacaoTitulo = 'Remover Vínculo Docente';
      this.modalConfirmacaoMensagem = `Deseja desvincular o professor da turma ${item.turma?.nome}?`;
      this.modalConfirmacaoAcao = () => this.executarExclusaoVinculo(item);
    }
    this.modalConfirmacaoAberto = true;
  }

  executarConfirmacao() {
    if (this.modalConfirmacaoAcao) {
      this.modalConfirmacaoAcao();
    }
    this.fecharModalConfirmacao();
  }

  fecharModalConfirmacao() {
    this.modalConfirmacaoAberto = false;
    this.modalConfirmacaoAcao = null;
  }

  validarRelatorio(relatorio: any) {
    this.http.post<any>(`http://localhost:8080/api/coordenador/validar-relatorio/${relatorio.id}`, {}, { headers: this.getHeaders() }).subscribe({
      next: (atualizado) => {
        relatorio.statusValidacao = atualizado.statusValidacao;
        relatorio.validadoPor = atualizado.validadoPor;
        relatorio.dataValidacao = atualizado.dataValidacao;
        this.notificar('Relatório homologado pela Coordenação e registrado na auditoria do MongoDB!');
        this.carregarDados();
      },
      error: (err) => this.notificarErro(err.error?.mensagem || 'Erro ao homologar relatório.')
    });
  }

  salvarEvento() {
    if (!this.novoEvento.titulo.trim()) {
      this.notificarErro('O título do evento é obrigatório.');
      return;
    }
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
      },
      error: (err) => this.notificarErro(err.error?.mensagem || 'Erro ao criar evento no cronograma.')
    });
  }

  removerEvento(evento: any) {
    this.http.delete(`http://localhost:8080/api/coordenador/cronograma/${evento.id}`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.cronograma = this.cronograma.filter(c => c.id !== evento.id);
        this.notificar('Evento removido do cronograma.');
      },
      error: (err) => this.notificarErro(err.error?.mensagem || 'Erro ao remover evento.')
    });
  }

  criarUsuario() {
    if (!this.novoUsuario.nome.trim() || !this.novoUsuario.email.trim()) {
      this.notificarErro('Nome e E-mail são obrigatórios.');
      return;
    }
    this.http.post<any>('http://localhost:8080/api/coordenador/usuarios', this.novoUsuario, { headers: this.getHeaders() }).subscribe({
      next: (u) => {
        this.usuarios.push(u);
        this.mostrarFormUsuario = false;
        this.novoUsuario = { nome: '', email: '', senha: '', role: 'ROLE_ALUNO', matricula: '', telefone: '' };
        this.notificar(`Usuário ${u.nome} criado com sucesso e registrado no MongoDB!`);
        this.carregarDados();
      },
      error: (err) => {
        this.notificarErro(err.error?.mensagem || err.error?.erro || 'Erro ao cadastrar usuário. Verifique se o e-mail ou a matrícula já estão em uso.');
      }
    });
  }

  alterarPerfilUsuario(usuario: any, novoRole: string) {
    this.http.put<any>(`http://localhost:8080/api/coordenador/usuarios/${usuario.id}`, { role: novoRole }, { headers: this.getHeaders() }).subscribe({
      next: (atualizado) => {
        usuario.role = atualizado.role;
        this.notificar(`Perfil de ${usuario.nome} atualizado para ${novoRole}!`);
        this.carregarDados();
      },
      error: (err) => this.notificarErro(err.error?.mensagem || 'Erro ao alterar perfil do usuário.')
    });
  }

  private executarExclusaoUsuario(usuario: any) {
    this.http.delete(`http://localhost:8080/api/coordenador/usuarios/${usuario.id}`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
        this.notificar(`Usuário ${usuario.nome} removido com sucesso.`);
        this.carregarDados();
      },
      error: (err) => {
        this.notificarErro(err.error?.mensagem || 'Regra de Negócio: Não foi possível excluir o usuário pois ele possui vínculos ou matrículas ativas.');
      }
    });
  }

  // --- TURMAS ---
  criarTurma() {
    if (!this.novaTurma.nome.trim()) {
      this.notificarErro('O nome da turma é obrigatório.');
      return;
    }
    this.http.post<any>('http://localhost:8080/api/coordenador/turmas', this.novaTurma, { headers: this.getHeaders() }).subscribe({
      next: (t) => {
        this.turmas.push(t);
        this.mostrarFormTurma = false;
        this.novaTurma = { nome: '', anoLetivo: 2026, turno: 'MATUTINO', sala: '' };
        this.notificar(`Turma ${t.nome} criada com sucesso!`);
        this.carregarDados();
      },
      error: (err) => this.notificarErro(err.error?.mensagem || 'Erro ao criar turma.')
    });
  }

  private executarExclusaoTurma(turma: any) {
    this.http.delete(`http://localhost:8080/api/coordenador/turmas/${turma.id}`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.turmas = this.turmas.filter(t => t.id !== turma.id);
        this.notificar(`Turma ${turma.nome} removida com sucesso.`);
        this.carregarDados();
      },
      error: (err) => this.notificarErro(err.error?.mensagem || 'Regra de Negócio: Não é possível excluir a turma pois existem alunos matriculados ou disciplinas vinculadas a ela.')
    });
  }

  // --- MATRÍCULAS ---
  matricularAluno() {
    if (!this.novaMatricula.turmaId || !this.novaMatricula.alunoId) {
      this.notificarErro('Selecione a Turma e o Estudante para efetivar a matrícula.');
      return;
    }
    let url = `http://localhost:8080/api/coordenador/turmas/${this.novaMatricula.turmaId}/matricular/${this.novaMatricula.alunoId}`;
    if (this.novaMatricula.numeroChamada) {
      url += `?numeroChamada=${this.novaMatricula.numeroChamada}`;
    }
    this.http.post<any>(url, {}, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.mostrarFormMatricula = false;
        this.novaMatricula = { turmaId: 0, alunoId: 0, numeroChamada: null };
        this.notificar('Estudante matriculado na turma com sucesso!');
        this.carregarDados();
      },
      error: (err) => this.notificarErro(err.error?.mensagem || 'Regra de Negócio: Este estudante já se encontra matriculado nesta turma.')
    });
  }

  // --- DISCIPLINAS ---
  criarDisciplina() {
    if (!this.novaDisciplina.nome.trim()) {
      this.notificarErro('O nome da disciplina é obrigatório.');
      return;
    }
    this.http.post<any>('http://localhost:8080/api/coordenador/disciplinas', this.novaDisciplina, { headers: this.getHeaders() }).subscribe({
      next: (d) => {
        this.disciplinas.push(d);
        this.mostrarFormDisciplina = false;
        this.novaDisciplina = { nome: '', cargaHoraria: 60, codigo: '' };
        this.notificar(`Disciplina ${d.nome} cadastrada com sucesso!`);
        this.carregarDados();
      },
      error: (err) => this.notificarErro(err.error?.mensagem || 'Erro ao cadastrar disciplina.')
    });
  }

  private executarExclusaoDisciplina(disciplina: any) {
    this.http.delete(`http://localhost:8080/api/coordenador/disciplinas/${disciplina.id}`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.disciplinas = this.disciplinas.filter(d => d.id !== disciplina.id);
        this.notificar(`Disciplina ${disciplina.nome} removida com sucesso.`);
        this.carregarDados();
      },
      error: (err) => this.notificarErro(err.error?.mensagem || 'Regra de Negócio: Não é possível excluir a disciplina pois ela está vinculada a turmas ativas.')
    });
  }

  // --- VÍNCULOS ---
  criarVinculo() {
    if (!this.novoVinculo.turmaId || !this.novoVinculo.disciplinaId || !this.novoVinculo.professorId) {
      this.notificarErro('Selecione Turma, Disciplina e Professor para atribuir o vínculo.');
      return;
    }
    const params = `turmaId=${this.novoVinculo.turmaId}&disciplinaId=${this.novoVinculo.disciplinaId}&professorId=${this.novoVinculo.professorId}`;
    this.http.post<any>(`http://localhost:8080/api/coordenador/vinculos?${params}`, {}, { headers: this.getHeaders() }).subscribe({
      next: (v) => {
        this.vinculos.push(v);
        this.mostrarFormVinculo = false;
        this.novoVinculo = { turmaId: 0, disciplinaId: 0, professorId: 0 };
        this.notificar('Vínculo docente atribuído com sucesso!');
        this.carregarDados();
      },
      error: (err) => this.notificarErro(err.error?.mensagem || 'Regra de Negócio: Este vínculo entre professor, turma e disciplina já existe.')
    });
  }

  private executarExclusaoVinculo(vinculo: any) {
    this.http.delete(`http://localhost:8080/api/coordenador/vinculos/${vinculo.id}`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.vinculos = this.vinculos.filter(v => v.id !== vinculo.id);
        this.notificar('Vínculo docente removido com sucesso.');
        this.carregarDados();
      },
      error: (err) => this.notificarErro(err.error?.mensagem || 'Erro ao remover vínculo docente.')
    });
  }
}
