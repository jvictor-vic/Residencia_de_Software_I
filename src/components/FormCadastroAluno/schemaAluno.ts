import { z } from 'zod';

const generosEnum = [
  'Homem Cis',
  'Homem Trans',
  'Mulher Cis',
  'Mulher Trans',
  'Não-Binário',
] as const;

const racasEnum = ['Amarela', 'Branca', 'Indígena', 'Parda', 'Preta'] as const;

export const alunoSchema = z
  .object({
    // Nome completo: obrigatório, string não nula
    nomeCompleto: z.string().min(3, { message: 'O nome completo é obrigatório.' }),

    genero: z.enum(generosEnum, {
      message: 'Selecione um gênero válido.',
    }),

    // Nome social: opcional, string não nula
    nomeSocial: z.string().optional(),

    corRaca: z.enum(racasEnum, {
      message: 'Selecione uma opção de cor/raça.',
    }),

    nacionalidade: z.string().min(1, { message: 'Selecione a nacionalidade.' }),
    estadoNatal: z.string().optional(),
    naturalidade: z.string().optional(),

    // Data de nascimento: obrigatório, objeto date
    dataNascimento: z.date({
      message: 'Selecione uma data de nascimento válida.',
    }),

    // CPF: obrigatório, padrão xxx.xxx.xxx-xx
    cpf: z
      .string()
      .min(1, { message: 'O CPF é obrigatório.' })
      .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
        message: 'Formato de CPF inválido (xxx.xxx.xxx-xx).',
      }),
  })
  .refine(
    (data) => {
      // Se a nacionalidade for Brasil, o campo estadoNatal precisa estar preenchido
      if (data.nacionalidade === 'Brasil') {
        return !!data.estadoNatal && data.estadoNatal.trim() !== '';
      } else {
        return true;
      }
    },
    {
      message: 'O estado natal é obrigatório para brasileiros.',
      path: ['estadoNatal'],
    },
  )
  .refine(
    (data) => {
      // Se a nacionalidade for Brasil, o campo naturalidade precisa estar preenchida
      if (data.nacionalidade === 'Brasil') {
        return !!data.naturalidade && data.naturalidade.trim() !== '';
      }
      return true;
    },
    {
      message: 'A naturalidade (cidade) é obrigatória para brasileiros.',
      path: ['naturalidade'],
    },
  );

export type AlunoFormData = z.infer<typeof alunoSchema>;
