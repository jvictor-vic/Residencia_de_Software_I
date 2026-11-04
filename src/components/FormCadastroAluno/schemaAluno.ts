import { z } from 'zod';
import { calcularIdade } from '@utils/calcularIdade';
import { senhaSchema } from '@components/CadastroSenha/senhaSchema';

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
    // Etapa 1 - Dados do Aluno
    nomeCompleto: z.string().min(3, { message: 'O nome completo é obrigatório.' }),

    genero: z.enum(generosEnum, {
      message: 'Selecione um gênero válido.',
    }),

    nomeSocial: z.string().optional(),

    corRaca: z.enum(racasEnum, {
      message: 'Selecione uma opção de cor/raça.',
    }),

    nacionalidade: z.string().min(1, { message: 'Selecione a nacionalidade.' }),
    estadoNatal: z.string().optional(),
    naturalidade: z.string().optional(),

    dataNascimento: z.date({
      message: 'Selecione uma data de nascimento válida.',
    }),

    cpf: z
      .string()
      .min(1, { message: 'O CPF é obrigatório.' })
      .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
        message: 'Formato de CPF inválido (xxx.xxx.xxx-xx).',
      }),

    // Etapa 2 - Dados do Responsável (Condicional se menor de 18 anos))
    responsavelParentesco: z.string().optional(),
    responsavelCpf: z.string().optional(),
    responsavelNomeCompleto: z.string().optional(),
    responsavelGenero: z.string().optional(),
    responsavelNomeSocial: z.string().optional(),
    responsavelDataNascimento: z.date().optional().nullable(),
    responsavelEmail: z.string().optional(),
    responsavelTelefone: z.string().optional(),

    // Etapa 3: Dados Residenciais
    zonaMoradia: z.string().min(1, { message: 'Selecione a zona de moradia.' }),
    cep: z.string().min(9, { message: 'CEP inválido.' }),
    estadoResidencial: z.string().min(1, { message: 'Estado é obrigatório.' }),
    municipioResidencial: z.string().min(1, { message: 'Município é obrigatório.' }),
    bairroResidencial: z.string().min(1, { message: 'Bairro é obrigatório.' }),
    logradouro: z.string().min(3, { message: 'Logradouro é obrigatório.' }),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    senhaAluno: senhaSchema,
    confirmarSenhaAluno: z.string().min(1, { message: 'Confirme a senha do aluno.' }),
    senhaResponsavel: z.string().optional(),
    confirmarSenhaResponsavel: z.string().optional(),
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
  )
  .refine(
    (data) => {
      if (data.dataNascimento) {
        const idade = calcularIdade(data.dataNascimento);
        if (idade < 18) {
          return (
            !!data.responsavelParentesco &&
            !!data.responsavelCpf &&
            data.responsavelCpf.length >= 14 &&
            !!data.responsavelNomeCompleto &&
            !!data.responsavelGenero &&
            !!data.responsavelDataNascimento &&
            !!data.responsavelEmail &&
            !!data.responsavelTelefone
          );
        }
      }
      return true;
    },
    {
      message: 'Preencha todos os dados obrigatórios do responsável.',
      path: ['responsavelNomeCompleto'],
    },
  )
  .superRefine((data, context) => {
    if (data.senhaAluno !== data.confirmarSenhaAluno) {
      context.addIssue({
        code: 'custom',
        message: 'As senhas do aluno não coincidem.',
        path: ['confirmarSenhaAluno'],
      });
    }

    if (calcularIdade(data.dataNascimento) >= 18) {
      if (
        !data.responsavelEmail?.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.responsavelEmail)
      ) {
        context.addIssue({
          code: 'custom',
          message: 'Informe um e-mail válido para a conta de responsável.',
          path: ['responsavelEmail'],
        });
      }

      const telefone = data.responsavelTelefone?.replace(/\D/g, '') ?? '';
      if (![10, 11].includes(telefone.length)) {
        context.addIssue({
          code: 'custom',
          message: 'Informe um telefone válido para a conta de responsável.',
          path: ['responsavelTelefone'],
        });
      }
      return;
    }

    const cpfAluno = data.cpf.replace(/\D/g, '');
    const cpfResponsavel = data.responsavelCpf?.replace(/\D/g, '');
    if (cpfResponsavel && cpfAluno === cpfResponsavel) {
      context.addIssue({
        code: 'custom',
        message: 'O aluno menor e o responsável precisam ter CPFs diferentes.',
        path: ['responsavelCpf'],
      });
    }

    const senhaResponsavelValida = senhaSchema.safeParse(data.senhaResponsavel);
    if (!senhaResponsavelValida.success) {
      for (const issue of senhaResponsavelValida.error.issues) {
        context.addIssue({
          code: 'custom',
          message: issue.message,
          path: ['senhaResponsavel'],
        });
      }
    }

    if (!data.confirmarSenhaResponsavel) {
      context.addIssue({
        code: 'custom',
        message: 'Confirme a senha do responsável.',
        path: ['confirmarSenhaResponsavel'],
      });
    } else if (data.senhaResponsavel !== data.confirmarSenhaResponsavel) {
      context.addIssue({
        code: 'custom',
        message: 'As senhas do responsável não coincidem.',
        path: ['confirmarSenhaResponsavel'],
      });
    }
  });

export type AlunoFormData = z.infer<typeof alunoSchema>;
