import { defineAction } from 'astro:actions';
import { z } from 'zod';
import { cpfValidator } from '../utils/cpfValidator';
import { calcularIdade } from '../utils/calcularIdade';

export const server = {
  validarCPF: defineAction({
    input: z.object({
      cpf: z.string().min(1, { message: 'O CPF é obrigatório.' }),
    }),
    handler: async ({ cpf }) => {
      // 1. Validação matemática do CPF
      const isMatematicamenteValido = cpfValidator(cpf);

      if (!isMatematicamenteValido) {
        return {
          valido: false,
          message: 'CPF inválido.',
        };
      }
    },
  }),

  verificarMenorIdade: defineAction({
    input: z.object({
      dataNascimento: z.string(),
    }),
    handler: async ({ dataNascimento }) => {
      const idade = calcularIdade(dataNascimento);
      return {
        idade,
        isMenorDeIdade: idade < 18,
      };
    },
  }),
};
