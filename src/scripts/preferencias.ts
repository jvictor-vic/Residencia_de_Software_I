import { gravar, ler } from './armazenamento';

/**
 * Preferências de acessibilidade do usuário:
 * tema (claro/escuro), tamanho da fonte e espaçamento do texto.
 * São aplicadas como atributos/variáveis no <html>.
 */
export type Tema = 'claro' | 'escuro';
export type Espacamento = 'normal' | 'amplo';

export interface Preferencias {
  tema: Tema;
  escala: number; // 1 = 100%
  espacamento: Espacamento;
}

export const ESCALAS = [1, 1.125, 1.25, 1.375];

const PADRAO: Preferencias = {
  tema: 'claro',
  escala: 1,
  espacamento: 'normal',
};

export function lerPreferencias(): Preferencias {
  // Sem escolha salva, o tema atual é o que o script do <head> aplicou (tema do sistema)
  const temaDoDocumento = document.documentElement.dataset.tema;
  const temaAtual: Tema =
    temaDoDocumento === 'claro' || temaDoDocumento === 'escuro'
      ? temaDoDocumento
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'escuro'
        : 'claro';
  return { ...PADRAO, tema: temaAtual, ...ler<Partial<Preferencias>>('preferencias', {}) };
}

export function aplicarPreferencias(p: Preferencias): void {
  const html = document.documentElement;
  html.dataset.tema = p.tema;
  html.dataset.espacamento = p.espacamento;
  html.style.setProperty('--escala-fonte', String(p.escala));
}

export function salvarPreferencias(parcial: Partial<Preferencias>): Preferencias {
  const novas = { ...lerPreferencias(), ...parcial };
  gravar('preferencias', novas);
  aplicarPreferencias(novas);
  document.dispatchEvent(new CustomEvent('preferencias-alteradas', { detail: novas }));
  return novas;
}

export function alternarTema(): Tema {
  const atual = lerPreferencias().tema;
  const novo: Tema = atual === 'claro' ? 'escuro' : 'claro';
  salvarPreferencias({ tema: novo });
  return novo;
}
