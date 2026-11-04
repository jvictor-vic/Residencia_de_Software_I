import { z } from 'zod';

export const senhaSchema = z
  .string()
  .min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  .max(16, { message: 'A senha deve ter no máximo 16 caracteres.' })
  .regex(/\p{Lu}/u, { message: 'A senha deve conter pelo menos uma letra maiúscula.' })
  .regex(/\p{Ll}/u, { message: 'A senha deve conter pelo menos uma letra minúscula.' })
  .regex(/\p{N}/u, { message: 'A senha deve conter pelo menos um número.' })
  .regex(/[^\p{L}\p{N}\s]/u, {
    message: 'A senha deve conter pelo menos um caractere especial.',
  });
