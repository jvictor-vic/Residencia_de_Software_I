import type { IconeNome } from './icones';

/**
 * Matérias da matriz curricular de Sergipe (BNCC) — ver docs/lista_materias.md.
 * Cada matéria tem COR + ÍCONE + PADRÃO, para que ninguém dependa só da cor
 * para identificá-la (acessibilidade para daltonismo).
 * As cores são as "Cores de Identificação" da identidade visual (src/variables.css):
 * fundo pastel no tema claro / tom escuro no tema escuro, sempre com ícone em var(--fg).
 */
export type Padrao =
  | 'pontos'
  | 'diagonal'
  | 'diagonal-inv'
  | 'horizontal'
  | 'vertical'
  | 'grade'
  | 'xadrez'
  | 'cruzado';

export interface Materia {
  id: string;
  nome: string;
  area: string;
  cor: string;
  icone: IconeNome;
  padrao: Padrao;
}

export const materias = {
  portugues: {
    id: 'portugues',
    nome: 'Língua Portuguesa',
    area: 'Linguagens',
    cor: 'var(--id-00-bg)',
    icone: 'livro',
    padrao: 'diagonal',
  },
  matematica: {
    id: 'matematica',
    nome: 'Matemática',
    area: 'Matemática',
    cor: 'var(--id-10-bg)',
    icone: 'calculadora',
    padrao: 'grade',
  },
  ciencias: {
    id: 'ciencias',
    nome: 'Ciências',
    area: 'Ciências da Natureza',
    cor: 'var(--id-06-bg)',
    icone: 'folha',
    padrao: 'pontos',
  },
  historia: {
    id: 'historia',
    nome: 'História',
    area: 'Ciências Humanas',
    cor: 'var(--id-01-bg)',
    icone: 'ampulheta',
    padrao: 'horizontal',
  },
  geografia: {
    id: 'geografia',
    nome: 'Geografia',
    area: 'Ciências Humanas',
    cor: 'var(--id-08-bg)',
    icone: 'globo',
    padrao: 'xadrez',
  },
  arte: {
    id: 'arte',
    nome: 'Arte',
    area: 'Linguagens',
    cor: 'var(--id-14-bg)',
    icone: 'paleta',
    padrao: 'cruzado',
  },
  edfisica: {
    id: 'edfisica',
    nome: 'Educação Física',
    area: 'Linguagens',
    cor: 'var(--id-02-bg)',
    icone: 'atividade',
    padrao: 'vertical',
  },
  ingles: {
    id: 'ingles',
    nome: 'Língua Inglesa',
    area: 'Linguagens',
    cor: 'var(--id-11-bg)',
    icone: 'idiomas',
    padrao: 'diagonal-inv',
  },
  espanhol: {
    id: 'espanhol',
    nome: 'Língua Espanhola',
    area: 'Linguagens',
    cor: 'var(--id-03-bg)',
    icone: 'idiomas',
    padrao: 'pontos',
  },
  religioso: {
    id: 'religioso',
    nome: 'Ensino Religioso',
    area: 'Ensino Religioso',
    cor: 'var(--id-13-bg)',
    icone: 'coracao',
    padrao: 'horizontal',
  },
  biologia: {
    id: 'biologia',
    nome: 'Biologia',
    area: 'Ciências da Natureza',
    cor: 'var(--id-05-bg)',
    icone: 'dna',
    padrao: 'pontos',
  },
  fisica: {
    id: 'fisica',
    nome: 'Física',
    area: 'Ciências da Natureza',
    cor: 'var(--id-09-bg)',
    icone: 'raio',
    padrao: 'vertical',
  },
  quimica: {
    id: 'quimica',
    nome: 'Química',
    area: 'Ciências da Natureza',
    cor: 'var(--id-12-bg)',
    icone: 'frasco',
    padrao: 'cruzado',
  },
  filosofia: {
    id: 'filosofia',
    nome: 'Filosofia',
    area: 'Ciências Humanas',
    cor: 'var(--id-16-bg)',
    icone: 'lampada',
    padrao: 'horizontal',
  },
  sociologia: {
    id: 'sociologia',
    nome: 'Sociologia',
    area: 'Ciências Humanas',
    cor: 'var(--id-15-bg)',
    icone: 'usuarios',
    padrao: 'xadrez',
  },
} satisfies Record<string, Materia>;

export type MateriaId = keyof typeof materias;
