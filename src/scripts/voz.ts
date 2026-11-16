/**
 * Leitura em voz alta (Text-To-Speech) com a Web Speech API do navegador.
 * Não precisa de internet nem de biblioteca: Chrome e Edge já trazem vozes em português.
 */
export function vozDisponivel(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function escolherVoz(): SpeechSynthesisVoice | undefined {
  const vozes = window.speechSynthesis.getVoices();
  return vozes.find((v) => v.lang === 'pt-BR') ?? vozes.find((v) => v.lang.startsWith('pt'));
}

export function falar(texto: string, aoTerminar?: () => void): boolean {
  if (!vozDisponivel()) return false;
  const limpo = texto.replace(/\s+/g, ' ').trim();
  if (!limpo) return false;

  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(limpo);
  fala.lang = 'pt-BR';
  fala.rate = 0.95;
  const voz = escolherVoz();
  if (voz) fala.voice = voz;
  if (aoTerminar) {
    fala.onend = aoTerminar;
    fala.onerror = aoTerminar;
  }
  window.speechSynthesis.speak(fala);
  return true;
}

export function pararFala(): void {
  if (vozDisponivel()) window.speechSynthesis.cancel();
}

/** Extrai o texto "legível" de um elemento, ignorando o que é só visual */
export function textoDoElemento(el: Element): string {
  const descricao = el.getAttribute('aria-description');
  if (descricao) return descricao;
  const clone = el.cloneNode(true) as Element;
  clone
    .querySelectorAll("[aria-hidden='true'], script, style, .sr-only-ignorar")
    .forEach((n) => n.remove());
  return clone.textContent ?? '';
}
