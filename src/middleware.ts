import { defineMiddleware } from 'astro:middleware';
import { readAuthenticatedProfile } from './services/auth';

const isAcademicPath = (pathname: string) =>
  pathname === '/academico' || pathname.startsWith('/academico/');

export const onRequest = defineMiddleware(async (context, next) => {
  if (!isAcademicPath(context.url.pathname)) {
    return next();
  }

  const user = await readAuthenticatedProfile(context.request);
  if (!user) {
    return context.redirect('/entrar');
  }

  if (!user.papeis.every((papel) => papel === 'aluno' || papel === 'responsavel')) {
    return context.redirect('/403');
  }

  context.locals.authenticatedUser = user;
  const response = await next();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
});
