import { calcularIdade } from '@utils/calcularIdade';

export const PAPEIS_USUARIO = ['aluno', 'responsavel'] as const;
export type PapelUsuario = (typeof PAPEIS_USUARIO)[number];
export type DataNascimentoISO = string;
export type Genero = 'Homem Cis' | 'Homem Trans' | 'Mulher Cis' | 'Mulher Trans' | 'Não-Binário';
export type CorRaca = 'Amarela' | 'Branca' | 'Indígena' | 'Parda' | 'Preta';
export type ZonaMoradia = 'Urbana' | 'Rural';

export interface DadosPessoaisUsuario {
  nomeCompleto: string;
  genero: Genero;
  dataNascimento: Date | string;
  nomeSocial?: string;
}

export interface DadosContaUsuario {
  cpf: string;
  senhaHash: string;
  papeis: readonly PapelUsuario[];
  dadosPessoais: DadosPessoaisUsuario;
  perfis: {
    aluno?: DadosAluno;
    responsavel?: DadosResponsavel;
  };
}

export class ContaUsuario {
  readonly cpf: string;
  readonly senhaHash: string;
  readonly papeis: readonly PapelUsuario[];
  readonly dadosPessoais: DadosPessoaisUsuario & { dataNascimento: DataNascimentoISO };
  readonly perfis: {
    aluno?: Aluno;
    responsavel?: Responsavel;
  };

  constructor({ cpf, senhaHash, papeis, dadosPessoais, perfis }: DadosContaUsuario) {
    if (!senhaHash.trim()) {
      throw new Error('O hash da senha é obrigatório.');
    }

    const papeisUnicos = [...new Set(papeis)];
    if (papeisUnicos.length === 0) {
      throw new Error('A conta deve ter ao menos um papel.');
    }
    if (papeisUnicos.some((papel) => !PAPEIS_USUARIO.includes(papel))) {
      throw new Error('A conta contém um papel inválido.');
    }

    const aluno = perfis.aluno ? new Aluno(perfis.aluno) : undefined;
    const responsavel = perfis.responsavel ? new Responsavel(perfis.responsavel) : undefined;
    if (papeisUnicos.includes('aluno') !== Boolean(aluno)) {
      throw new Error('O papel de aluno deve corresponder a um perfil de aluno.');
    }
    if (papeisUnicos.includes('responsavel') !== Boolean(responsavel)) {
      throw new Error('O papel de responsável deve corresponder a um perfil de responsável.');
    }

    const dadosPessoaisNormalizados = {
      ...dadosPessoais,
      dataNascimento: serializarDataNascimento(dadosPessoais.dataNascimento),
    };
    if (
      aluno &&
      calcularIdade(dadosPessoaisNormalizados.dataNascimento) < 18 &&
      !aluno.responsavel
    ) {
      throw new Error('Dados do responsável são obrigatórios para alunos menores de 18 anos.');
    }

    this.cpf = normalizarCpf(cpf);
    this.senhaHash = senhaHash;
    this.papeis = papeisUnicos;
    this.dadosPessoais = dadosPessoaisNormalizados;
    this.perfis = { aluno, responsavel };
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
  corRaca: CorRaca;
  nacionalidade: string;
  residencia: ResidenciaAluno;
  estadoNatal?: string;
  naturalidade?: string;
  responsavel?: VinculoFamiliar;
  academico?: unknown[]; //histórico academico em ordem cronológica inversa
  avisos?: unknown[]; //lista de avisos
}

export class Aluno {
  readonly corRaca: CorRaca;
  readonly nacionalidade: string;
  readonly residencia: ResidenciaAluno;
  readonly estadoNatal?: string;
  readonly naturalidade?: string;
  readonly responsavel?: VinculoFamiliar;
  readonly academico: unknown[];
  readonly avisos: unknown[];

  constructor(dados: DadosAluno) {
    if (
      dados.nacionalidade === 'Brasil' &&
      (!dados.estadoNatal?.trim() || !dados.naturalidade?.trim())
    ) {
      throw new Error('Estado e naturalidade são obrigatórios para alunos brasileiros.');
    }

    this.corRaca = dados.corRaca;
    this.nacionalidade = dados.nacionalidade;
    this.residencia = { ...dados.residencia };
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
  telefone?: string;
  email?: string;
  tutelados?: VinculoFamiliar[];
  avisos?: unknown[];
}

export class Responsavel {
  readonly telefone?: string;
  readonly email?: string;
  readonly tutelados: VinculoFamiliar[];
  readonly avisos: unknown[];

  constructor(dados: DadosResponsavel) {
    this.telefone = dados.telefone;
    this.email = dados.email;
    this.tutelados = (dados.tutelados ?? []).map((tutelado) => ({
      ...tutelado,
      cpfContaRelacionada: normalizarCpf(tutelado.cpfContaRelacionada),
    }));
    this.avisos = [...(dados.avisos ?? [])];
  }
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
