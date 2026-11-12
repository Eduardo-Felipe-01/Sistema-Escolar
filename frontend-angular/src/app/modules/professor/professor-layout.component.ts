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
          <img src="assets/logo-educa-mais.png" alt="Logo Educa+" class="brand-logo-sm" />
          <div class="brand-text">
            <h2>Educa+</h2>
            <span class="badge badge-info">Painel do Professor</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/professor/dashboard" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-chart-pie nav-icon"></i>
            <span>Visão Geral</span>
          </a>
          <a routerLink="/professor/notas" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-pen-to-square nav-icon"></i>
            <span>Lançamento de Notas</span>
          </a>
          <a routerLink="/professor/frequencia" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-calendar-check nav-icon"></i>
            <span>Diário de Frequência</span>
          </a>
          <a routerLink="/professor/relatorios" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-file-lines nav-icon"></i>
            <span>Emissão de Relatórios</span>
          </a>
          <a *ngIf="auth.currentUser()?.role === 'ROLE_COORDENADOR'" routerLink="/coordenador" class="nav-item" style="margin-top: 0.75rem; border: 1px dashed var(--secondary);">
            <i class="fa-solid fa-user-tie nav-icon"></i>
            <span>Painel da Coordenação</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-card">
            <div class="avatar"><i class="fa-solid fa-chalkboard-user"></i></div>
            <div class="user-details">
              <strong>{{ auth.currentUser()?.nome || 'Prof. Carlos' }}</strong>
              <small>{{ auth.currentUser()?.matricula || 'PROF-101' }}</small>
            </div>
          </div>
          <button (click)="logout()" class="btn btn-secondary btn-sm btn-logout" title="Sair do Sistema">
            <i class="fa-solid fa-right-from-bracket"></i> Sair
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
    .brand-logo-sm {
      width: 48px;
      height: 48px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .brand-text h2 {
      font-size: 1.35rem;
      line-height: 1.2;
      background: var(--brand-heading-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.15rem;
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
      background: var(--primary-light);
      transform: translateX(3px);
    }
    .nav-item.active {
      color: #ffffff;
      background: var(--brand-gradient);
      border: 1px solid rgba(15, 157, 104, 0.35);
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(8, 54, 96, 0.22);
    }
    .nav-icon {
      font-size: 1.05rem;
      width: 20px;
      text-align: center;
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
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      color: var(--primary);
      background: var(--bg-surface-elevated);
      border-radius: var(--radius-full);
      border: 1px solid var(--border-subtle);
      flex-shrink: 0;
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
