/**
 * Mostra uma mensagem rápida ("toast") no canto da tela.
 * A região tem aria-live, então leitores de tela também anunciam a mensagem.
 */
export type TipoAviso = 'sucesso' | 'info' | 'alerta';

export function mostrarAviso(mensagem: string, tipo: TipoAviso = 'sucesso'): void {
  const regiao = document.getElementById('avisos');
  if (!regiao) return;

  const item = document.createElement('div');
  item.className = `aviso aviso-${tipo}`;
  item.setAttribute('role', 'status');
  const simbolo = tipo === 'sucesso' ? '✓' : tipo === 'alerta' ? '!' : 'i';
  item.innerHTML = `<span class="aviso-simbolo" aria-hidden="true">${simbolo}</span><span></span>`;
  (item.lastElementChild as HTMLElement).textContent = mensagem;
  regiao.appendChild(item);

  window.setTimeout(() => {
    item.classList.add('saindo');
    window.setTimeout(() => item.remove(), 300);
  }, 4000);
}
