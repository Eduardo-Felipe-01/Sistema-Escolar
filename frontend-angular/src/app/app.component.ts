import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccessibilityService, DaltonismoMode } from './core/services/accessibility.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Compact Top-Right Floating Controls: Accessibility Menu + Theme Toggle -->
    <div class="top-floating-controls no-print">
      <!-- 1. Expandable Accessibility Button & Popover -->
      <div class="a11y-menu-wrapper">
        <button
          type="button"
          class="floating-icon-btn"
          [class.active]="menuAberto || temAjusteAtivo()"
          (click)="toggleMenu($event)"
          title="Opções de Acessibilidade (Daltonismo e Tamanho de Fonte)"
          aria-label="Abrir menu de acessibilidade"
          [attr.aria-expanded]="menuAberto">
          <img src="assets/icon-acessibilidade.png" alt="Acessibilidade" class="a11y-icon-img" />
          <span *ngIf="temAjusteAtivo()" class="active-dot"></span>
        </button>

        <!-- Expandable Dropdown Panel -->
        <div *ngIf="menuAberto" class="a11y-dropdown glass-panel" (click)="$event.stopPropagation()">
          <div class="a11y-dropdown-header">
            <strong>Acessibilidade</strong>
            <button *ngIf="temAjusteAtivo()" type="button" class="btn-reset" (click)="resetarAcessibilidade()">
              Restaurar padrão
            </button>
          </div>

          <div class="a11y-section">
            <label class="a11y-label" for="daltonismo-select">
              <i class="fa-solid fa-eye"></i> Modo de Daltonismo / Contraste
            </label>
            <select
              id="daltonismo-select"
              [value]="a11y.currentDaltonismo()"
              (change)="onDaltonismoChange($event)"
              class="a11y-select"
              title="Modo de Adaptação Visual para Daltonismo">
              <option value="normal">Normal (Padrão)</option>
              <option value="protanopia">Protanopia (Vermelho)</option>
              <option value="deuteranopia">Deuteranopia (Verde)</option>
              <option value="tritanopia">Tritanopia (Azul)</option>
              <option value="achromatopsia">Acromatopsia (P&amp;B)</option>
              <option value="alto-contraste">Alto Contraste</option>
            </select>
          </div>

          <div class="a11y-section">
            <span class="a11y-label">
              <i class="fa-solid fa-font"></i> Tamanho da Fonte
            </span>
            <div class="font-controls">
              <button
                type="button"
                (click)="a11y.changeFontSize(-1)"
                class="a11y-font-btn"
                [disabled]="a11y.fontSizeLevel() <= -1"
                title="Diminuir Fonte">
                A-
              </button>
              <span class="font-level-indicator">
                {{ getFontLevelLabel() }}
              </span>
              <button
                type="button"
                (click)="a11y.changeFontSize(1)"
                class="a11y-font-btn"
                [disabled]="a11y.fontSizeLevel() >= 2"
                title="Aumentar Fonte">
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Theme Toggle Button (Claro / Escuro) -->
      <button
        type="button"
        (click)="a11y.toggleLightMode()"
        class="floating-theme-btn"
        [title]="a11y.isLightMode() ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'"
        [attr.aria-label]="a11y.isLightMode() ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'">
        <i class="fa-solid theme-icon" [ngClass]="a11y.isLightMode() ? 'fa-moon' : 'fa-sun'"></i>
        <span class="theme-text">{{ a11y.isLightMode() ? 'Escuro' : 'Claro' }}</span>
      </button>
    </div>

    <!-- Main Router View -->
    <router-outlet></router-outlet>
  `,
  styles: [`
    .top-floating-controls {
      position: fixed;
      top: 1rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .a11y-menu-wrapper {
      position: relative;
    }
    .floating-icon-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: var(--bg-surface-glass);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-glass);
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      padding: 0;
    }
    .floating-icon-btn:hover,
    .floating-icon-btn.active {
      border-color: var(--secondary);
      background: var(--bg-surface);
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }
    .a11y-icon-img {
      width: 22px;
      height: 22px;
      object-fit: contain;
      transition: filter 0.2s ease;
    }
    :host-context(body.dark-theme) .a11y-icon-img {
      filter: invert(1) brightness(1.1);
    }
    .active-dot {
      position: absolute;
      top: 3px;
      right: 3px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--secondary);
      border: 1.5px solid var(--bg-surface);
    }
    .floating-theme-btn {
      height: 40px;
      padding: 0 0.85rem;
      border-radius: var(--radius-full);
      background: var(--bg-surface-glass);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-glass);
      box-shadow: var(--shadow-md);
      color: var(--text-primary);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: var(--font-heading);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .floating-theme-btn:hover {
      border-color: var(--secondary);
      background: var(--bg-surface);
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }
    .theme-icon {
      font-size: 0.95rem;
      line-height: 1;
    }
    .a11y-dropdown {
      position: absolute;
      top: calc(100% + 0.55rem);
      right: 0;
      width: 260px;
      padding: 1rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-glass);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      animation: fadeSlideIn 0.16s ease-out;
    }
    @keyframes fadeSlideIn {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .a11y-dropdown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .a11y-dropdown-header strong {
      font-family: var(--font-heading);
      font-size: 0.88rem;
      color: var(--text-primary);
    }
    .btn-reset {
      background: transparent;
      border: none;
      color: var(--secondary);
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.15rem 0.3rem;
      border-radius: 4px;
    }
    .btn-reset:hover {
      background: var(--primary-light);
    }
    .a11y-section {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .a11y-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .a11y-select {
      width: 100%;
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.45rem 0.6rem;
      font-size: 0.8rem;
      font-weight: 500;
      outline: none;
      cursor: pointer;
    }
    .a11y-select:focus {
      border-color: var(--secondary);
    }
    .font-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.25rem;
    }
    .a11y-font-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 0.3rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 700;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .a11y-font-btn:hover:not(:disabled) {
      background: var(--primary-light);
      border-color: var(--secondary);
      color: var(--primary);
    }
    .a11y-font-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .font-level-indicator {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
  `]
})
export class AppComponent {
  menuAberto = false;

  constructor(public a11y: AccessibilityService, private elRef: ElementRef) {}

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuAberto = !this.menuAberto;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuAberto && !this.elRef.nativeElement.contains(event.target)) {
      this.menuAberto = false;
    }
  }

  onDaltonismoChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as DaltonismoMode;
    this.a11y.setDaltonismo(val);
  }

  temAjusteAtivo(): boolean {
    return this.a11y.currentDaltonismo() !== 'normal' || this.a11y.fontSizeLevel() !== 0;
  }

  getFontLevelLabel(): string {
    const lvl = this.a11y.fontSizeLevel();
    if (lvl === -1) return 'Pequena';
    if (lvl === 1) return 'Grande (115%)';
    if (lvl === 2) return 'Extra (130%)';
    return 'Padrão (100%)';
  }

  resetarAcessibilidade() {
    this.a11y.setDaltonismo('normal');
    const diff = -this.a11y.fontSizeLevel();
    if (diff !== 0) {
      this.a11y.changeFontSize(diff);
    }
  }
}
