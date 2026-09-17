import { Injectable, signal } from '@angular/core';

export type DaltonismoMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' | 'alto-contraste';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  currentDaltonismo = signal<DaltonismoMode>('normal');
  fontSizeLevel = signal<number>(0); // -1, 0, 1, 2
  isLightMode = signal<boolean>(false);

  constructor() {
    const savedFilter = localStorage.getItem('escola_daltonismo') as DaltonismoMode;
    if (savedFilter) {
      this.setDaltonismo(savedFilter);
    }
    const savedTheme = localStorage.getItem('escola_theme');
    if (savedTheme === 'light') {
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

    const body = document.body;
    body.classList.remove('font-large', 'font-xlarge');

    if (next === 1) body.classList.add('font-large');
    if (next === 2) body.classList.add('font-xlarge');
  }

  toggleLightMode(forceLight?: boolean) {
    const next = forceLight !== undefined ? forceLight : !this.isLightMode();
    this.isLightMode.set(next);
    localStorage.setItem('escola_theme', next ? 'light' : 'dark');

    if (next) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }
}
