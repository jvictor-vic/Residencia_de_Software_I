export function media(notas: (number | null)[]): number | null {
  const validas = notas.filter((nota): nota is number => nota !== null);
  if (!validas.length) return null;
  return Math.round((validas.reduce((total, nota) => total + nota, 0) / validas.length) * 10) / 10;
}

export function situacaoNota(valor: number | null): 'aprovado' | 'recuperacao' | 'sem-nota' {
  if (valor === null) return 'sem-nota';
  return valor >= 6 ? 'aprovado' : 'recuperacao';
}

export function percentual(presencas: number, total: number): number {
  return total === 0 ? 100 : Math.round((presencas / total) * 100);
}
