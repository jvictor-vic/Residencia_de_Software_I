/**
 * Dados de DEMONSTRAÇÃO (fictícios).
 * Ainda não existe back-end: tudo que aparece nas telas vem daqui.
 * Quando houver uma API, basta trocar estes objetos por chamadas `fetch`.
 */
import type { MateriaId } from './materias';
import type { PerfilId } from './perfis';
import type { DadosEscola } from './users/classes';

export const ESCOLA = 'E. E. Jardim das Mangabeiras';
export const MEDIA_MINIMA = 6;
export const FREQUENCIA_MINIMA = 75;

// ---------------------------------------------------------------------------
// Regras de negócio simples (reutilizadas em várias telas)
// ---------------------------------------------------------------------------
export { media, situacaoNota, percentual } from '../services/moduloDomain';

export function formatarNota(n: number | null): string {
  return n === null ? '—' : n.toFixed(1).replace('.', ',');
}

/** Texto sem acentos e em minúsculas — para a busca achar "propria" em "Propriá" */
export function paraBusca(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Aluno (Ana Clara — 8º ano B)
// ---------------------------------------------------------------------------
export interface Boletim {
  materia: MateriaId;
  professor: string;
  unidades: (number | null)[]; // U1..U4 (null = ainda não lançada)
  aulas: number;
  faltas: number;
}

export const boletimAna: Boletim[] = [
  {
    materia: 'portugues',
    professor: 'Helena Costa',
    unidades: [8.5, 7.8, 9.0, null],
    aulas: 128,
    faltas: 4,
  },
  {
    materia: 'matematica',
    professor: 'Carlos Menezes',
    unidades: [6.0, 5.5, 7.2, null],
    aulas: 128,
    faltas: 6,
  },
  {
    materia: 'ciencias',
    professor: 'Paulo Andrade',
    unidades: [9.2, 8.8, 9.5, null],
    aulas: 96,
    faltas: 2,
  },
  {
    materia: 'historia',
    professor: 'Renata Lopes',
    unidades: [7.0, 8.0, 7.5, null],
    aulas: 64,
    faltas: 3,
  },
  {
    materia: 'geografia',
    professor: 'Renata Lopes',
    unidades: [5.0, 6.0, 5.2, null],
    aulas: 64,
    faltas: 5,
  },
  {
    materia: 'ingles',
    professor: 'Mark Oliveira',
    unidades: [9.0, 9.5, 8.7, null],
    aulas: 64,
    faltas: 1,
  },
  {
    materia: 'arte',
    professor: 'Lívia Santos',
    unidades: [10, 9.0, 9.5, null],
    aulas: 32,
    faltas: 0,
  },
  {
    materia: 'edfisica',
    professor: 'Diego Ramos',
    unidades: [8.0, 7.0, 8.0, null],
    aulas: 64,
    faltas: 17,
  },
  {
    materia: 'religioso',
    professor: 'Lívia Santos',
    unidades: [9.0, 9.0, 10, null],
    aulas: 32,
    faltas: 1,
  },
];

/** Grade semanal de horários */
export const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'] as const;
export const HORARIOS = [
  '07:00 – 07:50',
  '07:50 – 08:40',
  '08:40 – 09:30',
  '09:50 – 10:40',
  '10:40 – 11:30',
];
export const gradeAna: MateriaId[][] = [
  // cada linha = um horário; cada coluna = um dia (seg → sex)
  ['portugues', 'matematica', 'ciencias', 'portugues', 'historia'],
  ['portugues', 'matematica', 'ciencias', 'matematica', 'geografia'],
  ['ingles', 'geografia', 'portugues', 'ciencias', 'matematica'],
  ['historia', 'edfisica', 'arte', 'ingles', 'portugues'],
  ['matematica', 'edfisica', 'religioso', 'ciencias', 'ciencias'],
];

/** Pedidos já feitos na Secretaria Virtual */
export const pedidosAna = [
  {
    protocolo: '2026-00981',
    tipo: 'Declaração de matrícula',
    data: '14/10/2026',
    status: 'concluido' as const,
  },
  {
    protocolo: '2026-01107',
    tipo: 'Atualização cadastral',
    data: '27/10/2026',
    status: 'analise' as const,
  },
];

export const tiposPedido = [
  'Declaração de matrícula',
  'Histórico escolar',
  'Transferência',
  'Atualização cadastral',
  '2ª via de boletim',
];

// ---------------------------------------------------------------------------
// Responsável (Maria — mãe da Ana Clara e do Pedro)
// ---------------------------------------------------------------------------
export const filhos = [
  {
    nome: 'Ana Clara Souza',
    turma: '8º ano B',
    iniciais: 'AC',
    boletim: boletimAna,
    alertas: [
      {
        tipo: 'perigo' as const,
        titulo: 'Frequência baixa em Educação Física',
        texto: '17 faltas em 64 aulas (73%). O mínimo é 75%.',
      },
      {
        tipo: 'alerta' as const,
        titulo: 'Tarefa atrasada de Geografia',
        texto: 'Mapa das regiões de Sergipe — prazo era 27/10.',
      },
    ],
  },
  {
    nome: 'Pedro Souza',
    turma: '5º ano A',
    iniciais: 'PS',
    boletim: [
      {
        materia: 'portugues',
        professor: 'Sandra Melo',
        unidades: [8.0, 8.5, 9.0, null],
        aulas: 160,
        faltas: 3,
      },
      {
        materia: 'matematica',
        professor: 'Sandra Melo',
        unidades: [9.0, 9.5, 9.0, null],
        aulas: 160,
        faltas: 3,
      },
      {
        materia: 'ciencias',
        professor: 'Sandra Melo',
        unidades: [7.5, 8.0, 8.5, null],
        aulas: 64,
        faltas: 1,
      },
      {
        materia: 'historia',
        professor: 'Sandra Melo',
        unidades: [8.0, 7.0, 8.0, null],
        aulas: 48,
        faltas: 1,
      },
      {
        materia: 'geografia',
        professor: 'Sandra Melo',
        unidades: [8.5, 8.0, 9.0, null],
        aulas: 48,
        faltas: 0,
      },
      {
        materia: 'arte',
        professor: 'Lívia Santos',
        unidades: [10, 10, 9.5, null],
        aulas: 32,
        faltas: 0,
      },
      {
        materia: 'edfisica',
        professor: 'Diego Ramos',
        unidades: [9.0, 9.0, 9.0, null],
        aulas: 64,
        faltas: 2,
      },
    ] satisfies Boletim[],
    alertas: [] as {
      tipo: 'perigo' | 'alerta';
      titulo: string;
      texto: string;
    }[],
  },
];

// ---------------------------------------------------------------------------
// Professor (Carlos — Matemática)
// ---------------------------------------------------------------------------
export const turmasProfessor = [
  {
    id: '8a',
    nome: '8º ano A',
    alunos: 31,
    horario: 'Seg e Qua · 07:00',
    sala: 'Sala 12',
    chamadaFeita: true,
    notasPendentes: 0,
  },
  {
    id: '8b',
    nome: '8º ano B',
    alunos: 29,
    horario: 'Seg e Ter · 07:50',
    sala: 'Sala 14',
    chamadaFeita: false,
    notasPendentes: 29,
  },
  {
    id: '9a',
    nome: '9º ano A',
    alunos: 33,
    horario: 'Qui e Sex · 10:40',
    sala: 'Sala 03',
    chamadaFeita: false,
    notasPendentes: 4,
  },
];

export const alunos8B = [
  'Ana Clara Souza',
  'Bruno Henrique Alves',
  'Camila Ferreira',
  'Daniel Batista',
  'Eduarda Nunes',
  'Felipe Cardoso',
  'Gabriela Rocha',
  'Heitor Mendonça',
  'Isabela Moura',
  'João Victor Lima',
  'Larissa Teles',
  'Matheus Prado',
  'Nicole Barreto',
  'Otávio Fontes',
  'Rafaela Dantas',
];

/** Notas já lançadas (U1, U2, U3) da turma 8º B em Matemática — U4 é a lançar */
export const notasMat8B: Record<string, (number | null)[]> = {
  'Ana Clara Souza': [6.0, 5.5, 7.2],
  'Bruno Henrique Alves': [4.5, 5.0, 6.0],
  'Camila Ferreira': [8.0, 8.5, 9.0],
  'Daniel Batista': [7.0, 6.5, 6.0],
  'Eduarda Nunes': [9.5, 9.0, 10],
  'Felipe Cardoso': [5.0, 4.0, 5.5],
  'Gabriela Rocha': [7.5, 8.0, 7.0],
  'Heitor Mendonça': [6.5, 7.0, 6.0],
  'Isabela Moura': [8.5, 9.0, 8.0],
  'João Victor Lima': [3.5, 5.0, 4.5],
  'Larissa Teles': [7.0, 7.5, 8.0],
  'Matheus Prado': [6.0, 6.0, 6.5],
  'Nicole Barreto': [9.0, 8.5, 9.5],
  'Otávio Fontes': [5.5, 6.0, 5.0],
  'Rafaela Dantas': [8.0, 7.0, 7.5],
};

export const diarioProfessor = [
  {
    data: '29/10/2026',
    turma: '8º ano A',
    conteudo: 'Sistemas de equações do 1º grau — método da substituição.',
    observacao: 'Turma participativa. Exercícios 1 a 8 da página 112 para casa.',
  },
  {
    data: '28/10/2026',
    turma: '9º ano A',
    conteudo: 'Teorema de Pitágoras — demonstração com áreas.',
    observacao: 'Usamos papel quadriculado. 4 alunos ainda sem nota da U3.',
  },
  {
    data: '27/10/2026',
    turma: '8º ano B',
    conteudo: 'Revisão de produtos notáveis para a avaliação.',
    observacao: 'Avaliação marcada para 05/11.',
  },
];

// ---------------------------------------------------------------------------
// Escola (Direção / Coordenação)
// ---------------------------------------------------------------------------
export const indicadoresEscola = {
  matriculados: 842,
  professores: 38,
  turmasAtivas: 26,
  frequenciaMedia: 91,
};

export const matriculasPorMes = [
  { rotulo: 'Jan', valor: 312 },
  { rotulo: 'Fev', valor: 268 },
  { rotulo: 'Mar', valor: 94 },
  { rotulo: 'Abr', valor: 41 },
  { rotulo: 'Mai', valor: 28 },
  { rotulo: 'Jun', valor: 19 },
  { rotulo: 'Jul', valor: 35 },
  { rotulo: 'Ago', valor: 22 },
  { rotulo: 'Set', valor: 14 },
  { rotulo: 'Out', valor: 9 },
];

export type StatusMatricula = 'confirmada' | 'analise' | 'pendente';

export const matriculas: {
  aluno: string;
  turma: string;
  data: string;
  status: StatusMatricula;
  responsavel: string;
}[] = [
  {
    aluno: 'Lucas Gabriel Santos',
    turma: '6º ano A',
    data: '28/10/2026',
    status: 'analise',
    responsavel: 'Cláudia Santos',
  },
  {
    aluno: 'Sofia Meneses',
    turma: '7º ano B',
    data: '27/10/2026',
    status: 'pendente',
    responsavel: 'Jorge Meneses',
  },
  {
    aluno: 'Enzo Carvalho',
    turma: '9º ano A',
    data: '25/10/2026',
    status: 'confirmada',
    responsavel: 'Patrícia Carvalho',
  },
  {
    aluno: 'Valentina Rezende',
    turma: '6º ano B',
    data: '24/10/2026',
    status: 'confirmada',
    responsavel: 'Marcos Rezende',
  },
  {
    aluno: 'Arthur Nogueira',
    turma: '8º ano A',
    data: '22/10/2026',
    status: 'pendente',
    responsavel: 'Simone Nogueira',
  },
  {
    aluno: 'Helena Vasconcelos',
    turma: '7º ano A',
    data: '21/10/2026',
    status: 'analise',
    responsavel: 'Ricardo Vasconcelos',
  },
  {
    aluno: 'Miguel Tavares',
    turma: '9º ano B',
    data: '18/10/2026',
    status: 'confirmada',
    responsavel: 'Fernanda Tavares',
  },
  {
    aluno: 'Alice Bezerra',
    turma: '6º ano A',
    data: '15/10/2026',
    status: 'confirmada',
    responsavel: 'Thiago Bezerra',
  },
  {
    aluno: 'Davi Lucas Pereira',
    turma: '8º ano B',
    data: '11/10/2026',
    status: 'analise',
    responsavel: 'Joana Pereira',
  },
  {
    aluno: 'Laura Cristina Melo',
    turma: '7º ano B',
    data: '08/10/2026',
    status: 'confirmada',
    responsavel: 'Sérgio Melo',
  },
];

export const turmasEscola = [
  {
    nome: '6º ano A',
    turno: 'Manhã',
    alunos: 34,
    regente: 'Sandra Melo',
    frequencia: 93,
  },
  {
    nome: '6º ano B',
    turno: 'Tarde',
    alunos: 32,
    regente: 'Paulo Andrade',
    frequencia: 90,
  },
  {
    nome: '7º ano A',
    turno: 'Manhã',
    alunos: 33,
    regente: 'Helena Costa',
    frequencia: 92,
  },
  {
    nome: '7º ano B',
    turno: 'Tarde',
    alunos: 30,
    regente: 'Renata Lopes',
    frequencia: 88,
  },
  {
    nome: '8º ano A',
    turno: 'Manhã',
    alunos: 31,
    regente: 'Carlos Menezes',
    frequencia: 94,
  },
  {
    nome: '8º ano B',
    turno: 'Manhã',
    alunos: 29,
    regente: 'Mark Oliveira',
    frequencia: 89,
  },
  {
    nome: '9º ano A',
    turno: 'Manhã',
    alunos: 33,
    regente: 'Diego Ramos',
    frequencia: 91,
  },
  {
    nome: '9º ano B',
    turno: 'Tarde',
    alunos: 30,
    regente: 'Lívia Santos',
    frequencia: 86,
  },
];

export const professoresEscola = [
  {
    nome: 'Carlos Menezes',
    disciplina: 'Matemática',
    turmas: 3,
    diario: 'em-dia' as const,
  },
  {
    nome: 'Helena Costa',
    disciplina: 'Língua Portuguesa',
    turmas: 4,
    diario: 'em-dia' as const,
  },
  {
    nome: 'Renata Lopes',
    disciplina: 'História',
    turmas: 5,
    diario: 'atrasado' as const,
  },
  {
    nome: 'Paulo Andrade',
    disciplina: 'Ciências',
    turmas: 4,
    diario: 'em-dia' as const,
  },
  {
    nome: 'Mark Oliveira',
    disciplina: 'Língua Inglesa',
    turmas: 6,
    diario: 'atrasado' as const,
  },
  {
    nome: 'Diego Ramos',
    disciplina: 'Educação Física',
    turmas: 6,
    diario: 'em-dia' as const,
  },
  { nome: 'Sandra Melo', disciplina: 'Língua Portuguesa', turmas: 4, diario: 'em-dia' as const },
  { nome: 'João Pedro Almeida', disciplina: 'Matemática', turmas: 3, diario: 'em-dia' as const },
  { nome: 'André Luiz Barros', disciplina: 'Matemática', turmas: 2, diario: 'em-dia' as const },
  { nome: 'Beatriz Carvalho', disciplina: 'Ciências', turmas: 4, diario: 'em-dia' as const },
  { nome: 'Eduardo Freitas', disciplina: 'Ciências', turmas: 3, diario: 'atrasado' as const },
  { nome: 'Thiago Oliveira', disciplina: 'História', turmas: 4, diario: 'em-dia' as const },
  { nome: 'Marcos Vinícius Rocha', disciplina: 'Geografia', turmas: 4, diario: 'em-dia' as const },
  { nome: 'Juliana Martins', disciplina: 'Geografia', turmas: 3, diario: 'em-dia' as const },
  { nome: 'Camila Nascimento', disciplina: 'Língua Inglesa', turmas: 4, diario: 'em-dia' as const },
  { nome: 'Rafael Costa', disciplina: 'Educação Física', turmas: 3, diario: 'em-dia' as const },
  { nome: 'Lívia Santos', disciplina: 'Arte', turmas: 5, diario: 'em-dia' as const },
  { nome: 'Patrícia Gomes', disciplina: 'Ensino Religioso', turmas: 3, diario: 'em-dia' as const },
];

/** Nomes inteiramente fictícios usados para preencher as listas de demonstração das turmas. */
const nomesAlunosDemo = [
  'Ana Clara Souza',
  'Bruno Henrique Alves',
  'Camila Ferreira',
  'Daniel Batista',
  'Eduarda Nunes',
  'Felipe Cardoso',
  'Gabriela Rocha',
  'Heitor Mendonça',
  'Isabela Moura',
  'João Victor Lima',
  'Larissa Teles',
  'Matheus Prado',
  'Nicole Barreto',
  'Otávio Fontes',
  'Rafaela Dantas',
  'Alice Bezerra',
  'Davi Lucas Pereira',
  'Laura Cristina Melo',
  'Miguel Tavares',
  'Sofia Meneses',
  'Enzo Carvalho',
  'Valentina Rezende',
  'Arthur Nogueira',
  'Helena Vasconcelos',
  'Mariana Costa',
  'Pedro Henrique Santos',
  'Luiza Martins',
  'Gabriel Oliveira',
  'Beatriz Almeida',
  'Lucas Rodrigues',
  'Manuela Ribeiro',
  'Vitor Hugo Carvalho',
  'Isadora Barros',
  'Samuel Ferreira',
  'Clara Monteiro',
  'Caio Mendes',
  'Yasmin Cardoso',
  'Nicolas Araújo',
  'Melissa Freitas',
  'Gustavo Lima',
];

const sobrenomesDemo = [
  'Alves',
  'Batista',
  'Cardoso',
  'Nunes',
  'Rocha',
  'Moura',
  'Lima',
  'Teles',
  'Prado',
  'Dantas',
  'Bezerra',
  'Pereira',
  'Melo',
  'Tavares',
  'Meneses',
  'Carvalho',
  'Rezende',
  'Vasconcelos',
  'Ribeiro',
  'Monteiro',
];
export const alunosPorTurma: Record<string, string[]> = Object.fromEntries(
  turmasEscola.map((turma, turmaIndex) => {
    return [
      turma.nome,
      Array.from({ length: turma.alunos }, (_, indice) => {
        const primeiroNome =
          nomesAlunosDemo[(indice + turmaIndex * 5) % nomesAlunosDemo.length].split(' ')[0];
        const sobrenome = sobrenomesDemo[(indice * 7 + turmaIndex * 3) % sobrenomesDemo.length];
        return `${primeiroNome} ${sobrenome}`;
      }),
    ];
  }),
);

// ---------------------------------------------------------------------------
// Secretaria (rede estadual)
// ---------------------------------------------------------------------------
export const panoramaRede = {
  escolas: 112,
  alunos: 48320,
  servidores: 3904,
  vagas: 2150,
};

export const frequenciaRegiao = [
  { rotulo: 'Grande Aracaju', valor: 92 },
  { rotulo: 'Leste', valor: 89 },
  { rotulo: 'Agreste', valor: 87 },
  { rotulo: 'Sul', valor: 88 },
  { rotulo: 'Alto Sertão', valor: 83 },
  { rotulo: 'Baixo São Francisco', valor: 85 },
];

export const indicadoresPedagogicos = [
  {
    nome: 'IDEB – Anos finais',
    atual: 4.1,
    meta: 4.6,
    max: 10,
    unidade: '',
    melhorQuandoMaior: true,
  },
  {
    nome: 'Alfabetização até o 2º ano',
    atual: 61,
    meta: 70,
    max: 100,
    unidade: '%',
    melhorQuandoMaior: true,
  },
  {
    nome: 'Distorção idade-série',
    atual: 24,
    meta: 18,
    max: 100,
    unidade: '%',
    melhorQuandoMaior: false,
  },
  {
    nome: 'Taxa de aprovação',
    atual: 86,
    meta: 90,
    max: 100,
    unidade: '%',
    melhorQuandoMaior: true,
  },
];

export type ResumoEscolaRede = DadosEscola & { alunos: number; ideb: number };

const escolasRedeDados = [
  {
    nome: 'E. E. Jardim das Mangabeiras',
    municipio: 'Aracaju',
    regiao: 'Grande Aracaju',
    alunos: 842,
    ideb: 4.6,
  },
  {
    nome: 'Colégio Estadual Rio Sergipe',
    municipio: 'Nossa Senhora do Socorro',
    regiao: 'Grande Aracaju',
    alunos: 1104,
    ideb: 4.7,
  },
  {
    nome: 'E. E. Professora Dulce Amado',
    municipio: 'Lagarto',
    regiao: 'Agreste',
    alunos: 690,
    ideb: 4.6,
  },
  {
    nome: 'E. E. Vale do Cotinguiba',
    municipio: 'Laranjeiras',
    regiao: 'Leste',
    alunos: 410,
    ideb: 3.9,
  },
  {
    nome: 'Colégio Estadual Caatinga Viva',
    municipio: 'Nossa Senhora da Glória',
    regiao: 'Alto Sertão',
    alunos: 755,
    ideb: 3.6,
  },
  {
    nome: 'E. E. Foz do Velho Chico',
    municipio: 'Propriá',
    regiao: 'Baixo São Francisco',
    alunos: 520,
    ideb: 3.8,
  },
  {
    nome: 'E. E. Mangue Seco',
    municipio: 'Estância',
    regiao: 'Sul',
    alunos: 615,
    ideb: 4.1,
  },
  {
    nome: 'E. E. Serra de Itabaiana',
    municipio: 'Itabaiana',
    regiao: 'Agreste',
    alunos: 980,
    ideb: 4.8,
  },
  {
    nome: 'E. E. Professora Maria das Dores',
    municipio: 'Aracaju',
    regiao: 'Grande Aracaju',
    alunos: 735,
    ideb: 4.6,
  },
  {
    nome: 'Colégio Estadual do Povoado Estiva',
    municipio: 'São Cristóvão',
    regiao: 'Grande Aracaju',
    alunos: 468,
    ideb: 4.0,
  },
  {
    nome: 'E. E. Padre José de Anchieta',
    municipio: 'Itabaiana',
    regiao: 'Agreste',
    alunos: 812,
    ideb: 4.7,
  },
  {
    nome: 'Colégio Estadual do Centro-Sul',
    municipio: 'Tobias Barreto',
    regiao: 'Centro-Sul',
    alunos: 594,
    ideb: 3.9,
  },
  {
    nome: 'E. E. Professora Ana Ribeiro',
    municipio: 'Simão Dias',
    regiao: 'Centro-Sul',
    alunos: 523,
    ideb: 4.1,
  },
  {
    nome: 'Colégio Estadual Costa dos Coqueiros',
    municipio: 'Barra dos Coqueiros',
    regiao: 'Grande Aracaju',
    alunos: 677,
    ideb: 4.8,
  },
  {
    nome: 'E. E. Quilombola do Mocambo',
    municipio: 'Porto da Folha',
    regiao: 'Alto Sertão',
    alunos: 286,
    ideb: 3.7,
  },
  {
    nome: 'Colégio Estadual José Rollemberg Leite',
    municipio: 'Nossa Senhora da Glória',
    regiao: 'Alto Sertão',
    alunos: 901,
    ideb: 4.0,
  },
  {
    nome: 'E. E. Caminhos do São Francisco',
    municipio: 'Canindé de São Francisco',
    regiao: 'Alto Sertão',
    alunos: 642,
    ideb: 3.8,
  },
  {
    nome: 'Colégio Estadual Professora Nair Andrade',
    municipio: 'Estância',
    regiao: 'Sul',
    alunos: 788,
    ideb: 4.6,
  },
  {
    nome: 'E. E. do Vale do Japaratuba',
    municipio: 'Japaratuba',
    regiao: 'Leste',
    alunos: 436,
    ideb: 3.9,
  },
  {
    nome: 'Colégio Estadual Maria da Glória',
    municipio: 'Propriá',
    regiao: 'Baixo São Francisco',
    alunos: 571,
    ideb: 4.1,
  },
  {
    nome: 'E. E. Doutor Augusto Franco',
    municipio: 'Nossa Senhora do Socorro',
    regiao: 'Grande Aracaju',
    alunos: 1042,
    ideb: 4.7,
  },
  {
    nome: 'Colégio Estadual das Serras',
    municipio: 'Ribeirópolis',
    regiao: 'Agreste',
    alunos: 508,
    ideb: 4.0,
  },
];

export const escolasRede: ResumoEscolaRede[] = escolasRedeDados.map((escola) => ({
  ...escola,
  id: `escola-${escola.nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`,
  uf: 'SE',
}));

// ---------------------------------------------------------------------------
// Comunicados, calendário e notificações (compartilhados entre perfis)
// ---------------------------------------------------------------------------
export type OrigemComunicado = 'Secretaria' | 'Escola' | 'Turma';

export const comunicados: {
  id: number;
  origem: OrigemComunicado;
  titulo: string;
  data: string;
  texto: string;
}[] = [
  {
    id: 1,
    origem: 'Escola',
    titulo: 'Reunião de pais e mestres — 4ª unidade',
    data: '29/10/2026',
    texto:
      'Será no dia 07/11 (sábado), às 8h, no auditório. Vamos apresentar o resultado da 3ª unidade.',
  },
  {
    id: 2,
    origem: 'Secretaria',
    titulo: 'Período de rematrícula 2027',
    data: '26/10/2026',
    texto:
      'A rematrícula da rede estadual acontece de 03/11 a 28/11 pela Secretaria Virtual ou na escola.',
  },
  {
    id: 3,
    origem: 'Turma',
    titulo: '8º ano B: avaliação de Matemática',
    data: '24/10/2026',
    texto: 'A avaliação da 4ª unidade será no dia 05/11. Conteúdo: produtos notáveis e fatoração.',
  },
  {
    id: 4,
    origem: 'Escola',
    titulo: 'Feira de Ciências',
    data: '20/10/2026',
    texto: 'Inscrições dos projetos até 13/11 com o professor de Ciências. Apresentações em 21/11.',
  },
  {
    id: 5,
    origem: 'Secretaria',
    titulo: 'Feriado: Dia do Servidor Público',
    data: '16/10/2026',
    texto: 'Não haverá aula no dia 30/10 (sexta-feira). As aulas voltam normalmente na segunda.',
  },
  {
    id: 6,
    origem: 'Turma',
    titulo: '8º ano B: passeio ao Museu da Gente Sergipana',
    data: '10/10/2026',
    texto: 'Autorizações assinadas devem ser entregues até 06/11 à coordenação.',
  },
];

export type TipoEvento = 'avaliacao' | 'evento' | 'feriado' | 'reuniao' | 'prazo';
export type Tom = 'sucesso' | 'alerta' | 'perigo' | 'info' | 'neutro';

/** Como cada tipo de evento aparece (cor/ícone do selo + texto) */
export const infoEvento: Record<TipoEvento, { tom: Tom; texto: string }> = {
  avaliacao: { tom: 'alerta', texto: 'Avaliação' },
  feriado: { tom: 'info', texto: 'Feriado' },
  prazo: { tom: 'perigo', texto: 'Prazo' },
  reuniao: { tom: 'neutro', texto: 'Reunião' },
  evento: { tom: 'sucesso', texto: 'Evento' },
};

export const eventos: {
  dia: number;
  mes: number;
  titulo: string;
  tipo: TipoEvento;
}[] = [
  {
    dia: 30,
    mes: 10,
    titulo: 'Feriado — Dia do Servidor Público',
    tipo: 'feriado',
  },
  { dia: 2, mes: 11, titulo: 'Feriado — Finados', tipo: 'feriado' },
  { dia: 3, mes: 11, titulo: 'Início da rematrícula 2027', tipo: 'prazo' },
  {
    dia: 5,
    mes: 11,
    titulo: 'Avaliação de Matemática (8º B)',
    tipo: 'avaliacao',
  },
  {
    dia: 6,
    mes: 11,
    titulo: 'Entrega das autorizações do passeio',
    tipo: 'prazo',
  },
  { dia: 7, mes: 11, titulo: 'Reunião de pais e mestres', tipo: 'reuniao' },
  {
    dia: 12,
    mes: 11,
    titulo: 'Avaliação de Português (8º B)',
    tipo: 'avaliacao',
  },
  {
    dia: 13,
    mes: 11,
    titulo: 'Fim das inscrições da Feira de Ciências',
    tipo: 'prazo',
  },
  { dia: 20, mes: 11, titulo: 'Feriado — Consciência Negra', tipo: 'feriado' },
  { dia: 21, mes: 11, titulo: 'Feira de Ciências', tipo: 'evento' },
  {
    dia: 26,
    mes: 11,
    titulo: 'Avaliação de Ciências (8º B)',
    tipo: 'avaliacao',
  },
  { dia: 28, mes: 11, titulo: 'Fim da rematrícula 2027', tipo: 'prazo' },
];

export const notificacoes: Record<
  PerfilId,
  {
    id: string;
    titulo: string;
    quando: string;
    icone: 'megafone' | 'grafico' | 'calendario' | 'alerta' | 'arquivo' | 'mensagem';
  }[]
> = {
  aluno: [
    {
      id: 'a1',
      titulo: 'Nota da 3ª unidade de Matemática lançada: 7,2',
      quando: 'há 2 horas',
      icone: 'grafico',
    },
    {
      id: 'a2',
      titulo: 'Seu pedido de atualização cadastral está em análise',
      quando: 'ontem',
      icone: 'arquivo',
    },
    {
      id: 'a3',
      titulo: 'Avaliação de Matemática em 05/11',
      quando: 'há 3 dias',
      icone: 'calendario',
    },
  ],
  responsavel: [
    {
      id: 'r1',
      titulo: 'Ana Clara está com frequência baixa em Ed. Física',
      quando: 'hoje',
      icone: 'alerta',
    },
    {
      id: 'r2',
      titulo: 'Reunião de pais e mestres no dia 07/11',
      quando: 'ontem',
      icone: 'megafone',
    },
    {
      id: 'r3',
      titulo: 'Novas notas lançadas para Pedro',
      quando: 'há 4 dias',
      icone: 'grafico',
    },
  ],
  professor: [
    {
      id: 'p1',
      titulo: 'Chamada do 8º ano B ainda não foi feita hoje',
      quando: 'agora',
      icone: 'alerta',
    },
    {
      id: 'p2',
      titulo: 'Prazo de notas da 4ª unidade: 04/12',
      quando: 'ontem',
      icone: 'calendario',
    },
    {
      id: 'p3',
      titulo: 'Coordenação: nova mensagem',
      quando: 'há 2 dias',
      icone: 'mensagem',
    },
  ],
  escola: [
    {
      id: 'e1',
      titulo: '3 matrículas aguardando análise',
      quando: 'hoje',
      icone: 'arquivo',
    },
    {
      id: 'e2',
      titulo: '2 professores com diário atrasado',
      quando: 'ontem',
      icone: 'alerta',
    },
    {
      id: 'e3',
      titulo: 'Secretaria: período de rematrícula 2027',
      quando: 'há 4 dias',
      icone: 'megafone',
    },
  ],
  secretaria: [
    {
      id: 's1',
      titulo: 'Alto Sertão abaixo de 85% de frequência',
      quando: 'hoje',
      icone: 'alerta',
    },
    {
      id: 's2',
      titulo: 'Relatório do IDEB 2025 disponível',
      quando: 'há 2 dias',
      icone: 'grafico',
    },
  ],
};
