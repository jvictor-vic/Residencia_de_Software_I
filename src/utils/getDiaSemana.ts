const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;
const DIAS_SEMANA_CURTO = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'] as const;

type DiaSemana = (typeof DIAS_SEMANA)[number];
type DiaSemanaCurto = (typeof DIAS_SEMANA_CURTO)[number];

export default function getDiaSemana(
  data: Date | string,
  type: 'longo' | 'curto',
): DiaSemana | DiaSemanaCurto {
  const dataNormalizada =
    typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data) ? `${data}T00:00:00` : data;

  const dataObj = dataNormalizada instanceof Date ? dataNormalizada : new Date(dataNormalizada);

  if (Number.isNaN(dataObj.getTime())) {
    throw new Error('Data inválida fornecida para getDiaSemana.');
  }

  switch (type) {
    case 'longo':
      return DIAS_SEMANA[dataObj.getDay()];
    case 'curto':
      return DIAS_SEMANA_CURTO[dataObj.getDay()];
  }
}
