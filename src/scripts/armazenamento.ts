/**
 * Acesso "seguro" ao localStorage.
 * Em janela anônima ou com cookies bloqueados o localStorage pode lançar erro,
 * então tudo fica dentro de try/catch e o site continua funcionando sem ele.
 */
export function ler<T>(chave: string, padrao: T): T {
  try {
    const valor = localStorage.getItem(`educahub:${chave}`);
    return valor === null ? padrao : (JSON.parse(valor) as T);
  } catch {
    return padrao;
  }
}

export function gravar(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(`educahub:${chave}`, JSON.stringify(valor));
  } catch {
    /* sem armazenamento: ignora */
  }
}

export function remover(chave: string): void {
  try {
    localStorage.removeItem(`educahub:${chave}`);
  } catch {
    /* ignora */
  }
}
