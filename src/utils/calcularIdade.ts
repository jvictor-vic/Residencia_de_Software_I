export function calcularIdade(dataNascimento: Date | string): number {
  const dataNasc = parseDataNascimento(dataNascimento);

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

function parseDataNascimento(dataNascimento: Date | string): Date {
  if (typeof dataNascimento === 'string') {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataNascimento);
    if (partes) {
      const [, ano, mes, dia] = partes;
      const dataLocal = new Date(Number(ano), Number(mes) - 1, Number(dia));
      if (
        dataLocal.getFullYear() !== Number(ano) ||
        dataLocal.getMonth() !== Number(mes) - 1 ||
        dataLocal.getDate() !== Number(dia)
      ) {
        return new Date(Number.NaN);
      }

      return dataLocal;
    }
  }

  return new Date(dataNascimento);
}
