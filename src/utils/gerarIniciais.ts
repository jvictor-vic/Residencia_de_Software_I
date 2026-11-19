export function gerarIniciais(nome: string): string {
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return '';

  const primeiraLetra = Array.from(palavras[0])[0];
  const ultimaPalavra = palavras.length > 1 ? palavras[palavras.length - 1] : palavras[0];
  const segundaLetra =
    palavras.length > 1 ? Array.from(ultimaPalavra)[0] : Array.from(ultimaPalavra)[1];

  return `${primeiraLetra}${segundaLetra ?? ''}`.toLocaleUpperCase('pt-BR');
}
