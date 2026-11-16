import type { IconeNome } from './icones';

/**
 * Os 5 perfis do sistema (mesmos do EducaSE).
 * Cada perfil define o seu menu lateral e o usuário de demonstração.
 */
export type PerfilId = 'aluno' | 'responsavel' | 'professor' | 'escola' | 'secretaria';

export interface ItemMenu {
  rotulo: string;
  caminho: string; // relativo ao perfil: "" = início
  icone: IconeNome;
}

export interface Perfil {
  id: PerfilId;
  nome: string;
  descricao: string;
  icone: IconeNome;
  cor: string; // variável CSS
  login: { rotulo: string; exemplo: string; dica: string };
  usuario: { nome: string; detalhe: string; iniciais: string };
  menu: ItemMenu[];
}

// Itens que todos os perfis têm no fim do menu
const comuns: ItemMenu[] = [
  { rotulo: 'Comunicados', caminho: 'comunicados', icone: 'megafone' },
  { rotulo: 'Calendário', caminho: 'calendario', icone: 'calendario' },
  { rotulo: 'Configurações', caminho: 'configuracoes', icone: 'engrenagem' },
];

export const perfis: Record<PerfilId, Perfil> = {
  aluno: {
    id: 'aluno',
    nome: 'Aluno',
    descricao: 'Veja suas notas, frequência, horários e faça pedidos à secretaria.',
    icone: 'capelo',
    cor: 'var(--perfil-aluno)',
    login: {
      rotulo: 'CPF',
      exemplo: '529.982.247-25',
      dica: 'CPF do aluno (quem não tem CPF entra pela matrícula na escola).',
    },
    usuario: {
      nome: 'Ana Clara Souza',
      detalhe: '8º ano B · Matrícula 2026.0815',
      iniciais: 'AC',
    },
    menu: [
      { rotulo: 'Início', caminho: '', icone: 'inicio' },
      { rotulo: 'Notas', caminho: 'notas', icone: 'grafico' },
      { rotulo: 'Frequência', caminho: 'frequencia', icone: 'prancheta' },
      { rotulo: 'Horários', caminho: 'horarios', icone: 'relogio' },
      { rotulo: 'Secretaria Virtual', caminho: 'secretaria', icone: 'arquivo' },
      ...comuns,
    ],
  },
  responsavel: {
    id: 'responsavel',
    nome: 'Responsável',
    descricao: 'Acompanhe as notas, a frequência e os avisos dos seus filhos.',
    icone: 'familia',
    cor: 'var(--perfil-responsavel)',
    login: {
      rotulo: 'CPF',
      exemplo: '123.456.789-09',
      dica: 'Somente números, se preferir.',
    },
    usuario: {
      nome: 'Maria Souza',
      detalhe: 'Responsável por Ana Clara',
      iniciais: 'MS',
    },
    menu: [
      { rotulo: 'Início', caminho: '', icone: 'inicio' },
      { rotulo: 'Boletim', caminho: 'boletim', icone: 'grafico' },
      ...comuns,
    ],
  },
  professor: {
    id: 'professor',
    nome: 'Professor',
    descricao: 'Faça a chamada, lance notas e registre o diário de classe.',
    icone: 'maleta',
    cor: 'var(--perfil-professor)',
    login: {
      rotulo: 'CPF',
      exemplo: '315.728.460-62',
      dica: 'Somente números, se preferir.',
    },
    usuario: {
      nome: 'Carlos Menezes',
      detalhe: 'Professor de Matemática',
      iniciais: 'CM',
    },
    menu: [
      { rotulo: 'Início', caminho: '', icone: 'inicio' },
      { rotulo: 'Chamada', caminho: 'chamada', icone: 'prancheta' },
      { rotulo: 'Lançar notas', caminho: 'notas', icone: 'lapis' },
      { rotulo: 'Diário de classe', caminho: 'diario', icone: 'diario' },
      ...comuns,
    ],
  },
  escola: {
    id: 'escola',
    nome: 'Escola',
    descricao: 'Coordenação e Direção: indicadores, matrículas, turmas e professores.',
    icone: 'escola',
    cor: 'var(--perfil-escola)',
    login: {
      rotulo: 'CPF',
      exemplo: '482.163.597-64',
      dica: 'CPF do diretor ou coordenador.',
    },
    usuario: {
      nome: 'Juliana Prado',
      detalhe: 'Diretora · E. E. Jardim das Mangabeiras',
      iniciais: 'JP',
    },
    menu: [
      { rotulo: 'Início', caminho: '', icone: 'inicio' },
      { rotulo: 'Matrículas', caminho: 'matriculas', icone: 'usuarios' },
      { rotulo: 'Turmas e professores', caminho: 'turmas', icone: 'escola' },
      { rotulo: 'Gestão de turmas', caminho: 'gestao-turmas', icone: 'tarefas' },
      ...comuns,
    ],
  },
  secretaria: {
    id: 'secretaria',
    nome: 'Secretaria',
    descricao: 'Secretaria Estadual/Municipal: panorama da rede e indicadores.',
    icone: 'predio',
    cor: 'var(--perfil-secretaria)',
    login: {
      rotulo: 'CPF',
      exemplo: '736.419.285-91',
      dica: 'CPF do servidor da Secretaria.',
    },
    usuario: {
      nome: 'Roberto Lima',
      detalhe: 'Secretaria de Estado da Educação',
      iniciais: 'RL',
    },
    menu: [
      { rotulo: 'Início', caminho: '', icone: 'inicio' },
      { rotulo: 'Indicadores', caminho: 'indicadores', icone: 'tendencia' },
      { rotulo: 'Escolas', caminho: 'escolas', icone: 'escola' },
      ...comuns,
    ],
  },
};

export const listaPerfis: Perfil[] = Object.values(perfis);

/** Monta a URL de uma página de um perfil, ex.: link("aluno", "notas") → "/aluno/notas/" */
export function link(perfil: PerfilId, caminho = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return caminho ? `${base}/${perfil}/${caminho}/` : `${base}/${perfil}/`;
}

/** URL para qualquer página da raiz do site, respeitando o `base` do Astro */
export function url(caminho = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${caminho}`;
}
