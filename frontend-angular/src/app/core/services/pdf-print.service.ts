import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfPrintService {
  private originalTitle: string | null = null;
  private activeTarget: HTMLElement | null = null;
  private isPrinting = false;

  /**
   * Centraliza a exportação em PDF / impressão para todos os perfis de usuário
   * (Professor, Estudante e Coordenação), garantindo remoção do VLibras,
   * isolamento do documento alvo e layout A4 claro e padronizado.
   */
  printDocument(documentTitle: string, targetElement?: HTMLElement | null): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    if (this.isPrinting) {
      this.cleanup();
    }
    this.isPrinting = true;

    this.originalTitle = document.title;
    if (documentTitle) {
      document.title = documentTitle;
    }

    document.body.classList.add('is-printing-pdf');

    if (targetElement) {
      this.activeTarget = targetElement;
      targetElement.classList.add('print-target-active');
      document.body.classList.add('print-scoped-mode');
    }

    const win = window as unknown as {
      __educaHideVLibras?: () => void;
      __educaRawPrint?: () => void;
    };
    if (typeof win.__educaHideVLibras === 'function') {
      win.__educaHideVLibras();
    }

    const onAfterPrint = () => {
      window.removeEventListener('afterprint', onAfterPrint);
      this.cleanup();
    };
    window.addEventListener('afterprint', onAfterPrint);

    const printFn = typeof win.__educaRawPrint === 'function'
      ? win.__educaRawPrint
      : window.print.bind(window);

    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          printFn();
        } finally {
          // Fallback caso o navegador não dispare afterprint em certas condições
          setTimeout(() => {
            if (this.isPrinting) {
              window.removeEventListener('afterprint', onAfterPrint);
              this.cleanup();
            }
          }, 500);
        }
      }, 60);
    });
  }

  private cleanup(): void {
    if (this.originalTitle !== null) {
      document.title = this.originalTitle;
      this.originalTitle = null;
    }

    document.body.classList.remove('is-printing-pdf', 'print-scoped-mode');

    if (this.activeTarget) {
      this.activeTarget.classList.remove('print-target-active');
      this.activeTarget = null;
    }

    const win = window as unknown as { __educaRestoreVLibras?: () => void };
    if (typeof win.__educaRestoreVLibras === 'function') {
      win.__educaRestoreVLibras();
    }

    this.isPrinting = false;
  }
}
