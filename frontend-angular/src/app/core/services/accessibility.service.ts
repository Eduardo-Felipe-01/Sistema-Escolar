import { Injectable, signal } from '@angular/core';

export type DaltonismoMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' | 'alto-contraste';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  currentDaltonismo = signal<DaltonismoMode>('normal');
  fontSizeLevel = signal<number>(0); // -1, 0, 1, 2
  isLightMode = signal<boolean>(true);

  constructor() {
    const savedFilter = localStorage.getItem('escola_daltonismo') as DaltonismoMode;
    if (savedFilter) {
      this.setDaltonismo(savedFilter);
    }
    const savedTheme = localStorage.getItem('educa_theme');
    if (savedTheme === 'dark') {
      this.toggleLightMode(false);
    } else {
      this.toggleLightMode(true);
    }
  }

  setDaltonismo(mode: DaltonismoMode) {
    this.currentDaltonismo.set(mode);
    localStorage.setItem('escola_daltonismo', mode);

    const body = document.body;
    body.classList.remove(
      'daltonismo-protanopia',
      'daltonismo-deuteranopia',
      'daltonismo-tritanopia',
      'daltonismo-achromatopsia',
      'daltonismo-alto-contraste'
    );

    if (mode !== 'normal') {
      body.classList.add(`daltonismo-${mode}`);
    }
  }

  changeFontSize(delta: number) {
    const next = Math.max(-1, Math.min(2, this.fontSizeLevel() + delta));
    this.fontSizeLevel.set(next);

    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('font-small', 'font-large', 'font-xlarge');
    body.classList.remove('font-small', 'font-large', 'font-xlarge');

    if (next === -1) {
      root.classList.add('font-small');
      body.classList.add('font-small');
    } else if (next === 1) {
      root.classList.add('font-large');
      body.classList.add('font-large');
    } else if (next === 2) {
      root.classList.add('font-xlarge');
      body.classList.add('font-xlarge');
    }
  }

  toggleLightMode(forceLight?: boolean) {
    const next = forceLight !== undefined ? forceLight : !this.isLightMode();
    this.isLightMode.set(next);
    localStorage.setItem('educa_theme', next ? 'light' : 'dark');

    if (next) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }
  }
}
