import { calcularIdade } from '@utils/calcularIdade';

export type PapelUsuario = 'aluno' | 'responsavel';
export type DataNascimentoISO = string;
export type Genero = 'Homem Cis' | 'Homem Trans' | 'Mulher Cis' | 'Mulher Trans' | 'Não-Binário';
export type CorRaca = 'Amarela' | 'Branca' | 'Indígena' | 'Parda' | 'Preta';
export type ZonaMoradia = 'Urbana' | 'Rural';

export interface DadosContaUsuario {
  cpf: string;
  senhaHash: string;
  papeis: readonly PapelUsuario[];
}

export class ContaUsuario {
  readonly cpf: string;
  readonly senhaHash: string;
  readonly papeis: readonly PapelUsuario[];

  constructor({ cpf, senhaHash, papeis }: DadosContaUsuario) {
    if (!senhaHash.trim()) {
      throw new Error('O hash da senha é obrigatório.');
    }

    const papeisUnicos = [...new Set(papeis)];
    if (papeisUnicos.length === 0) {
      throw new Error('A conta deve ter ao menos um papel.');
    }

    this.cpf = normalizarCpf(cpf);
    this.senhaHash = senhaHash;
    this.papeis = papeisUnicos;
  }
}

export interface ResidenciaAluno {
  zonaMoradia: ZonaMoradia;
  cep: string;
  estadoResidencial: string;
  municipioResidencial: string;
  bairroResidencial: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
}

export interface VinculoFamiliar {
  cpfContaRelacionada: string;
  parentesco: string;
}

export interface DadosAluno {
  nomeCompleto: string;
  genero: Genero;
  corRaca: CorRaca;
  nacionalidade: string;
  dataNascimento: Date | string;
  residencia: ResidenciaAluno;
  nomeSocial?: string;
  estadoNatal?: string;
  naturalidade?: string;
  responsavel?: VinculoFamiliar;
  academico?: unknown[]; //histórico academico em ordem cronológica inversa
  avisos?: unknown[]; //lista de avisos
}

export class Aluno {
  readonly nomeCompleto: string;
  readonly genero: Genero;
  readonly corRaca: CorRaca;
  readonly nacionalidade: string;
  readonly dataNascimento: DataNascimentoISO;
  readonly residencia: ResidenciaAluno;
  readonly nomeSocial?: string;
  readonly estadoNatal?: string;
  readonly naturalidade?: string;
  readonly responsavel?: VinculoFamiliar;
  readonly academico: unknown[];
  readonly avisos: unknown[];

  constructor(dados: DadosAluno) {
    const dataNascimento = serializarDataNascimento(dados.dataNascimento);
    if (
      dados.nacionalidade === 'Brasil' &&
      (!dados.estadoNatal?.trim() || !dados.naturalidade?.trim())
    ) {
      throw new Error('Estado e naturalidade são obrigatórios para alunos brasileiros.');
    }

    if (calcularIdade(dataNascimento) < 18 && !dados.responsavel) {
      throw new Error('Dados do responsável são obrigatórios para alunos menores de 18 anos.');
    }

    this.nomeCompleto = dados.nomeCompleto;
    this.genero = dados.genero;
    this.corRaca = dados.corRaca;
    this.nacionalidade = dados.nacionalidade;
    this.dataNascimento = dataNascimento;
    this.residencia = { ...dados.residencia };
    this.nomeSocial = dados.nomeSocial;
    this.estadoNatal = dados.estadoNatal;
    this.naturalidade = dados.naturalidade;

    if (dados.responsavel) {
      this.responsavel = {
        cpfContaRelacionada: normalizarCpf(dados.responsavel.cpfContaRelacionada),
        parentesco: dados.responsavel.parentesco,
      };
    }

    this.academico = [...(dados.academico ?? [])];
    this.avisos = [...(dados.avisos ?? [])];
  }
}

export interface DadosResponsavel {
  nomeCompleto: string;
  genero: Genero;
  dataNascimento: Date | string;
  telefone?: string;
  email?: string;
  nomeSocial?: string;
  tutelados?: VinculoFamiliar[];
  avisos?: unknown[];
}

export class Responsavel {
  readonly nomeCompleto: string;
  readonly genero: Genero;
  readonly dataNascimento: DataNascimentoISO;
  readonly telefone?: string;
  readonly email?: string;
  readonly nomeSocial?: string;
  readonly tutelados: VinculoFamiliar[];
  readonly avisos: unknown[];

  constructor(dados: DadosResponsavel) {
    this.nomeCompleto = dados.nomeCompleto;
    this.genero = dados.genero;
    this.dataNascimento = serializarDataNascimento(dados.dataNascimento);
    this.telefone = dados.telefone;
    this.email = dados.email;
    this.nomeSocial = dados.nomeSocial;
    this.tutelados = (dados.tutelados ?? []).map((tutelado) => ({
      ...tutelado,
      cpfContaRelacionada: normalizarCpf(tutelado.cpfContaRelacionada),
    }));
    this.avisos = [...(dados.avisos ?? [])];
  }
}

export function criarContaDeAluno(
  cpf: string,
  senhaHash: string,
  dataNascimento: Date | string,
): ContaUsuario {
  const idade = calcularIdade(dataNascimento);
  const papeis: PapelUsuario[] = idade >= 18 ? ['aluno', 'responsavel'] : ['aluno'];

  return new ContaUsuario({ cpf, senhaHash, papeis });
}

function normalizarCpf(cpf: string): string {
  const cpfNormalizado = cpf.replace(/[.\-\s]/g, '');
  if (!/^\d{11}$/.test(cpfNormalizado)) {
    throw new Error('O CPF deve conter 11 dígitos.');
  }

  return cpfNormalizado;
}

function serializarDataNascimento(data: Date | string): DataNascimentoISO {
  if (data instanceof Date) {
    if (Number.isNaN(data.getTime())) {
      throw new Error('A data de nascimento é inválida.');
    }

    const ano = String(data.getFullYear()).padStart(4, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    const dataUTC = new Date(`${data}T00:00:00.000Z`);
    if (dataUTC.toISOString().slice(0, 10) !== data) {
      throw new Error('A data de nascimento é inválida.');
    }

    return data;
  }

  const dataParseada = new Date(data);
  if (Number.isNaN(dataParseada.getTime())) {
    throw new Error('A data de nascimento é inválida.');
  }

  return dataParseada.toISOString().slice(0, 10);
}
