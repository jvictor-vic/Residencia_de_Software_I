export function calcularIdade(dataNascimento: Date | string): number {
  const dataNasc = new Date(dataNascimento);

  if (isNaN(dataNasc.getTime())) {
    return 0;
  }

  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNasc.getFullYear();
  const diferencaMeses = hoje.getMonth() - dataNasc.getMonth();

  // Checa se o mes do aniversário ainda não passou
  // ou se o mes for o atual, considera se o dia já passou
  if (diferencaMeses < 0 || (diferencaMeses === 0 && hoje.getDate() < dataNasc.getDate())) {
    idade--;
  }

  return Math.max(0, idade);
  // retorna idade completa
  // ou 0 se a data de nascimento for inválida
}
