import type { APIRoute } from 'astro';
import {
  AuthRequestError,
  errorResponse,
  isSameOriginRequest,
  jsonResponse,
  login,
  readJsonBody,
} from '../../../services/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!isSameOriginRequest(request)) {
    return errorResponse(new AuthRequestError('Requisição de outra origem não permitida.', 403));
  }

  try {
    const { cookie } = await login(await readJsonBody(request));
    return jsonResponse({ ok: true }, 200, { 'Set-Cookie': cookie });
  } catch (error) {
    return errorResponse(error);
  }
};
