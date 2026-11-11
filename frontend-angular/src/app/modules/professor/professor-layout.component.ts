import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-professor-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="teacher-container">
      <!-- Sidebar Navigation -->
      <aside class="sidebar glass-panel">
        <div class="sidebar-brand">
          <span class="brand-icon">📚</span>
          <div class="brand-text">
            <h2>Educa+</h2>
            <span class="badge badge-info">Painel do Professor</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/professor/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span>Visão Geral</span>
          </a>
          <a routerLink="/professor/notas" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📝</span>
            <span>Lançamento de Notas</span>
          </a>
          <a routerLink="/professor/frequencia" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📅</span>
            <span>Diário de Frequência</span>
          </a>
          <a routerLink="/professor/relatorios" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📑</span>
            <span>Emissão de Relatórios</span>
          </a>
          <a *ngIf="auth.currentUser()?.role === 'ROLE_COORDENADOR'" routerLink="/coordenador" class="nav-item" style="margin-top: 0.75rem; border: 1px dashed rgba(99, 102, 241, 0.5);">
            <span class="nav-icon">👔</span>
            <span>Painel da Coordenação</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-card">
            <div class="avatar">👨‍🏫</div>
            <div class="user-details">
              <strong>{{ auth.currentUser()?.nome || 'Prof. Carlos' }}</strong>
              <small>{{ auth.currentUser()?.matricula || 'PROF-101' }}</small>
            </div>
          </div>
          <button (click)="logout()" class="btn btn-secondary btn-sm btn-logout" title="Sair do Sistema">
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .teacher-container {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-primary);
    }
    .sidebar {
      width: 280px;
      margin: 1rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 2rem);
      position: sticky;
      top: 1rem;
    }
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 1.5rem;
    }
    .brand-icon {
      font-size: 2rem;
    }
    .brand-text h2 {
      font-size: 1.25rem;
      line-height: 1.2;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-family: var(--font-heading);
      font-weight: 500;
      font-size: 0.95rem;
      border-radius: var(--radius-md);
      transition: all 0.2s;
    }
    .nav-item:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.04);
      transform: translateX(3px);
    }
    .nav-item.active {
      color: #ffffff;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(79, 70, 229, 0.4) 100%);
      border: 1px solid rgba(99, 102, 241, 0.4);
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }
    .nav-icon {
      font-size: 1.2rem;
    }
    .sidebar-footer {
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-subtle);
    }
    .user-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .avatar {
      font-size: 1.8rem;
      background: var(--bg-surface-elevated);
      border-radius: var(--radius-full);
      padding: 0.25rem;
      border: 1px solid var(--border-subtle);
    }
    .user-details strong {
      display: block;
      font-size: 0.85rem;
      color: var(--text-primary);
    }
    .user-details small {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .btn-logout {
      width: 100%;
    }
    .main-content {
      flex: 1;
      padding: 1.5rem 2rem 2rem 1rem;
      overflow-y: auto;
    }
    @media (max-width: 900px) {
      .teacher-container {
        flex-direction: column;
      }
      .sidebar {
        width: calc(100% - 2rem);
        height: auto;
        position: static;
      }
    }
  `]
})
export class ProfessorLayoutComponent {
  constructor(public auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
