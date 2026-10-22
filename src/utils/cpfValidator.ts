export function cpfValidator(cpfStr: string): boolean {
  // Mantém apenas os números
  const cpf = cpfStr.replace(/\D/g, '');

  // Valida tamanho e rejeita números com todos os dígitos iguais
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  // Converte a string em um array de números para evitar parseInt repetidos
  const digitos = cpf.split('').map(Number);

  // Função para calcular e validar os dígitos verificadores
  const validarDigito = (comprimento: number, pesoInicial: number): boolean => {
    let soma = 0;

    for (let i = 0; i < comprimento; i++) {
      soma += digitos[i] * (pesoInicial - i);
    }

    const resto = (soma * 10) % 11;
    const digitoEsperado = resto === 10 || resto === 11 ? 0 : resto;

    return digitoEsperado === digitos[comprimento];
  };

  // Valida o 1º e 2º digitos verificadores
  return validarDigito(9, 10) && validarDigito(10, 11);
}
