import type { APIRoute } from 'astro';
import {
  AuthRequestError,
  clearSessionCookie,
  errorResponse,
  isSameOriginRequest,
  jsonResponse,
  logout,
} from '../../../services/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!isSameOriginRequest(request)) {
    return errorResponse(new AuthRequestError('Requisição de outra origem não permitida.', 403));
  }

  try {
    return jsonResponse({ ok: true }, 200, { 'Set-Cookie': await logout(request) });
  } catch (error) {
    return errorResponse(error, { 'Set-Cookie': clearSessionCookie() });
  }
};
