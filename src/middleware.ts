import { defineMiddleware } from 'astro:middleware';
import { hasModuleRole, readSession } from './services/auth';

const rolesPorModulo = {
  escola: 'escola',
  professor: 'professor',
  secretaria: 'secretaria',
} as const;

export const onRequest = defineMiddleware(async (context, next) => {
  const segmentos = context.url.pathname.split('/').filter(Boolean);
  const role = rolesPorModulo[segmentos[0] as keyof typeof rolesPorModulo];
  if (!role) return next();

  const autorizado = await hasModuleRole(context.request, role);
  if (!autorizado) {
    if (!(await readSession(context.request))) {
      return context.redirect('/entrar', 302);
    }
    return new Response('Acesso negado para este perfil.', {
      status: 403,
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  const response = await next();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
});
