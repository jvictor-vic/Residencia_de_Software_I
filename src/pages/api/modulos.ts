import type { APIRoute } from 'astro';
import {
  errorResponse,
  isSameOriginRequest,
  jsonResponse,
  readJsonBody,
} from '../../services/auth';
import { moduleRole, readModuleData, writeModuleData } from '../../services/modulos';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const role = moduleRole(new URL(request.url).searchParams.get('perfil'));
  if (!role) return jsonResponse({ error: 'Perfil inválido.' }, 400);
  try {
    return jsonResponse(await readModuleData(request, role), 200, {
      'Cache-Control': 'private, no-store',
    });
  } catch (error) {
    return errorResponse(error, { 'Cache-Control': 'private, no-store' });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!isSameOriginRequest(request))
    return jsonResponse({ error: 'Requisição de outra origem não permitida.' }, 403);
  const role = moduleRole(new URL(request.url).searchParams.get('perfil'));
  if (!role) return jsonResponse({ error: 'Perfil inválido.' }, 400);
  try {
    return jsonResponse(await writeModuleData(request, role, await readJsonBody(request)), 200, {
      'Cache-Control': 'private, no-store',
    });
  } catch (error) {
    return errorResponse(error, { 'Cache-Control': 'private, no-store' });
  }
};
