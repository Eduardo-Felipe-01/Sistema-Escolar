import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccessibilityService, DaltonismoMode } from './core/services/accessibility.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Top Accessibility Floating Bar (A11y Universal) -->
    <div class="a11y-toolbar">
      <span class="a11y-label">👁️ Daltonismo:</span>
      <select 
        [value]="a11y.currentDaltonismo()" 
        (change)="onDaltonismoChange($event)" 
        class="a11y-select" 
        title="Modo de Adaptação Visual para Daltonismo">
        <option value="normal">Normal (Padrão)</option>
        <option value="protanopia">Protanopia (Vermelho)</option>
        <option value="deuteranopia">Deuteranopia (Verde)</option>
        <option value="tritanopia">Tritanopia (Azul)</option>
        <option value="achromatopsia">Acromatopsia (P&B)</option>
        <option value="alto-contraste">Alto Contraste</option>
      </select>

      <div class="a11y-divider"></div>

      <button (click)="a11y.changeFontSize(-1)" class="a11y-btn" title="Diminuir Fonte">A-</button>
      <button (click)="a11y.changeFontSize(1)" class="a11y-btn" title="Aumentar Fonte">A+</button>

      <div class="a11y-divider"></div>

      <button (click)="a11y.toggleLightMode()" class="a11y-btn" title="Alternar Modo Claro/Escuro">
        {{ a11y.isLightMode() ? '🌙 Escuro' : '☀️ Claro' }}
      </button>
    </div>

    <!-- Main Router View -->
    <router-outlet></router-outlet>
  `,
  styles: [`
    .a11y-toolbar {
      position: fixed;
      top: 1rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-surface-glass);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-full);
      padding: 0.35rem 0.75rem;
      box-shadow: var(--shadow-md);
    }
    .a11y-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .a11y-select {
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.2rem 0.4rem;
      font-size: 0.75rem;
      font-weight: 500;
      outline: none;
      cursor: pointer;
    }
    .a11y-divider {
      width: 1px;
      height: 16px;
      background: var(--border-subtle);
    }
    .a11y-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
    }
    .a11y-btn:hover {
      color: var(--text-primary);
      background: var(--primary-light);
    }
  `]
})
export class AppComponent {
  constructor(public a11y: AccessibilityService) {}

  onDaltonismoChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as DaltonismoMode;
    this.a11y.setDaltonismo(val);
  }
}
