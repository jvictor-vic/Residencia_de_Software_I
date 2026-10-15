import { z } from 'zod';

// Lista de gêneros permitidos
const generosEnum = [
  'Homem Cis',
  'Homem Trans',
  'Mulher Cis',
  'Mulher Trans',
  'Não-Binário',
] as const;

// Lista de raça/cor permitidas
const racasEnum = ['Amarela', 'Branca', 'Indígena', 'Parda', 'Preta'] as const;

export const alunoSchema = z
  .object({
    nomeCompleto: z
      .string()
      .min(3, { message: 'O nome completo deve ter pelo menos 3 caracteres.' })
      .max(150, { message: 'O nome é muito longo.' }),

    // Corrigido para utilizar { message: '...' } diretamente
    genero: z.enum(generosEnum, {
      message: 'Selecione um gênero válido.',
    }),

    nomeSocial: z.string().optional(),

    // Corrigido para utilizar { message: '...' } diretamente
    corRaca: z.enum(racasEnum, {
      message: 'Selecione uma opção de cor/raça.',
    }),

    nacionalidade: z.string().min(1, { message: 'Selecione a nacionalidade.' }),

    estadoNatal: z.string().min(1, { message: 'Selecione o estado natal.' }),

    naturalidade: z.string().min(1, { message: 'Selecione a cidade de naturalidade.' }),

    dataNascimento: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'Use o formato DD/MM/AAAA.' })
      .refine(
        (val) => {
          const [dia, mes, ano] = val.split('/').map(Number);
          const data = new Date(ano, mes - 1, dia);
          return (
            data.getFullYear() === ano &&
            data.getMonth() === mes - 1 &&
            data.getDate() === dia &&
            ano >= 1900 &&
            data <= new Date()
          );
        },
        { message: 'Data de nascimento inválida.' },
      ),

    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
      message: 'Formato de CPF inválido (xxx.xxx.xxx-xx).',
    }),
  })
  .superRefine((data, ctx) => {
    const generosComNomeSocial = ['Homem Trans', 'Mulher Trans', 'Não-Binário'];

    if (generosComNomeSocial.includes(data.genero)) {
      if (!data.nomeSocial || data.nomeSocial.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'O nome social é obrigatório para o gênero selecionado.',
          path: ['nomeSocial'],
        });
      }
    }
  });

export type AlunoFormData = z.infer<typeof alunoSchema>;
