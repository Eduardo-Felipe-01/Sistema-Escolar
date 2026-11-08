import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card glass-panel">
        <div class="brand-header">
          <div class="brand-logo">🎓</div>
          <h2>Educa+</h2>
          <p class="subtitle">Sistema Integrado de Gestão Escolar</p>
        </div>

        <!-- Quick Access Profile Demo Selector -->
        <div class="quick-profiles">
          <span class="quick-label">Acesso Rápido por Perfil:</span>
          <div class="profile-buttons">
            <button type="button" class="btn-profile" [class.active]="email === 'prof.carlos@escola.com'" (click)="selectProfile('prof.carlos@escola.com')">
              <span class="profile-icon">👨‍🏫</span>
              <div class="profile-meta">
                <strong>Professor</strong>
                <small>Carlos Mendes</small>
              </div>
            </button>
            <button type="button" class="btn-profile" [class.active]="email === 'coord.ana@escola.com'" (click)="selectProfile('coord.ana@escola.com')">
              <span class="profile-icon">👔</span>
              <div class="profile-meta">
                <strong>Coordenador</strong>
                <small>Ana Paula</small>
              </div>
            </button>
            <button type="button" class="btn-profile" [class.active]="email === 'aluno.lucas@escola.com'" (click)="selectProfile('aluno.lucas@escola.com')">
              <span class="profile-icon">🎓</span>
              <div class="profile-meta">
                <strong>Aluno</strong>
                <small>Lucas Gabriel</small>
              </div>
            </button>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label class="form-label" for="email">E-mail Institucional</label>
            <input 
              id="email" 
              type="email" 
              class="form-control" 
              [(ngModel)]="email" 
              name="email" 
              required 
              placeholder="seu.nome@escola.com" 
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="senha">Senha Criptografada</label>
            <input 
              id="senha" 
              type="password" 
              class="form-control" 
              [(ngModel)]="senha" 
              name="senha" 
              required 
              placeholder="••••••••" 
            />
          </div>

          <div *ngIf="errorMessage" class="error-alert">
            <span>⚠️</span> {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            <span *ngIf="!loading">Entrar no Sistema</span>
            <span *ngIf="loading" class="spinner"></span>
          </button>
        </form>

        <div class="login-footer">
          <p>Ambiente seguro com criptografia BCrypt e RBAC multi-banco.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 85vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .login-card {
      width: 100%;
      max-width: 480px;
      padding: 2.5rem;
      position: relative;
    }
    .brand-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .brand-logo {
      font-size: 3rem;
      margin-bottom: 0.5rem;
      filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.4));
    }
    .brand-header h2 {
      font-size: 1.85rem;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }
    .quick-profiles {
      margin-bottom: 1.75rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }
    .quick-label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
      font-weight: 700;
    }
    .profile-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }
    .btn-profile {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.65rem 0.5rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-profile:hover, .btn-profile.active {
      border-color: var(--primary);
      background: var(--primary-light);
      transform: translateY(-2px);
    }
    .profile-icon {
      font-size: 1.4rem;
      margin-bottom: 0.25rem;
    }
    .profile-meta strong {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .profile-meta small {
      display: block;
      font-size: 0.65rem;
      color: var(--text-muted);
    }
    .btn-block {
      width: 100%;
      padding: 0.85rem;
      margin-top: 0.5rem;
    }
    .error-alert {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: var(--danger-bg);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: var(--radius-md);
      color: var(--danger);
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
    }
    .login-footer {
      text-align: center;
      margin-top: 1.75rem;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  email: string = 'prof.carlos@escola.com';
  senha: string = 'senha123';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  selectProfile(email: string) {
    this.email = email;
    this.senha = 'senha123';
  }

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.senha).subscribe({
      next: (user) => {
        this.loading = false;
        if (user.role === 'ROLE_PROFESSOR') {
          this.router.navigate(['/professor']);
        } else if (user.role === 'ROLE_COORDENADOR') {
          this.router.navigate(['/coordenador']);
        } else if (user.role === 'ROLE_ALUNO') {
          this.router.navigate(['/aluno']);
        } else {
          this.router.navigate(['/professor']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Falha ao autenticar. Verifique e-mail e senha.';
      }
    });
  }
}
