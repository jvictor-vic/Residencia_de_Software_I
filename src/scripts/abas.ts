/**
 * Abas acessíveis (padrão WAI-ARIA "Tabs"):
 * - clique ou setas ← → trocam de aba; Home/End vão para a primeira/última.
 * Marcação esperada:
 *   <div data-abas>
 *     <div role="tablist"> <button role="tab" aria-controls="painel-x">…</button> </div>
 *     <div role="tabpanel" id="painel-x">…</div>
 *   </div>
 */
export function iniciarAbas(): void {
  document.querySelectorAll<HTMLElement>('[data-abas]').forEach((raiz) => {
    const abas = [...raiz.querySelectorAll<HTMLButtonElement>("[role='tab']")];

    function selecionar(aba: HTMLButtonElement, focar = false) {
      abas.forEach((a) => {
        const ativa = a === aba;
        a.setAttribute('aria-selected', String(ativa));
        a.tabIndex = ativa ? 0 : -1;
        const painel = document.getElementById(a.getAttribute('aria-controls') ?? '');
        if (painel) painel.hidden = !ativa;
      });
      if (focar) aba.focus();
    }

    abas.forEach((aba, i) => {
      aba.addEventListener('click', () => selecionar(aba));
      aba.addEventListener('keydown', (e) => {
        let alvo: number | null = null;
        if (e.key === 'ArrowRight') alvo = (i + 1) % abas.length;
        if (e.key === 'ArrowLeft') alvo = (i - 1 + abas.length) % abas.length;
        if (e.key === 'Home') alvo = 0;
        if (e.key === 'End') alvo = abas.length - 1;
        if (alvo !== null) {
          e.preventDefault();
          selecionar(abas[alvo], true);
        }
      });
    });

    const inicial = abas.find((a) => a.getAttribute('aria-selected') === 'true') ?? abas[0];
    if (inicial) selecionar(inicial);
  });
}
