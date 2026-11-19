import { defineMiddleware } from 'astro:middleware';
import { hasModuleRole, readAuthenticatedProfile } from './services/auth';

const ALLOWED_ROLES = ['aluno', 'responsavel', 'professor', 'escola', 'secretaria'] as const;
type Role = (typeof ALLOWED_ROLES)[number];

const ROLE_TO_BASE_PATH: Record<Role, string> = {
  aluno: '/academico',
  responsavel: '/academico',
  professor: '/professor',
  escola: '/escola',
  secretaria: '/secretaria',
};

const MODULE_PREFIXES = ['/academico', '/professor', '/escola', '/secretaria'] as const;

function getTargetModule(pathname: string): string | null {
  return (
    MODULE_PREFIXES.find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ??
    null
  );
}

function isAllowedRole(role: string): role is Role {
  return (ALLOWED_ROLES as readonly string[]).includes(role);
}

function forbiddenResponse(message = 'Acesso negado para este perfil.') {
  return new Response(message, {
    status: 403,
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const targetModule = getTargetModule(pathname);

  // Rotas públicas ou fora dos módulos protegidos seguem normalmente
  if (!targetModule) {
    return next();
  }

  const user = await readAuthenticatedProfile(context.request);

  // Sem sessão válida -> manda para login
  if (!user) {
    return context.redirect('/entrar', 302);
  }

  // Disponibiliza o usuário autenticado para páginas e API routes (context.locals)
  context.locals.authenticatedUser = user;

  const userRoles = Array.isArray(user.papeis) ? user.papeis : [];
  const validRoles = userRoles.filter(isAllowedRole);

  // Usuário sem role ou sem nenhuma role da lista permitida -> 403
  if (validRoles.length === 0) {
    return forbiddenResponse();
  }

  // Verifica se o usuário tem permissão para o módulo da rota acessada
  const hasAccessToModule =
    targetModule === '/academico'
      ? validRoles.some((role) => role === 'aluno' || role === 'responsavel')
      : await hasModuleRole(context.request, targetModule.slice(1) as Role);

  if (!hasAccessToModule) {
    // Opcional: se quiser enviar o usuário para a home do papel dele em vez de 403 direto,
    // use ROLE_TO_BASE_PATH[validRoles[0]]. Para 403 estrito conforme a regra:
    return forbiddenResponse();
  }

  const response = await next();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
});
