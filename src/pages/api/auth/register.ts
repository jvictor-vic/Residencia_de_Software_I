import type { APIRoute } from 'astro';
import {
  AuthRequestError,
  errorResponse,
  isSameOriginRequest,
  readJsonBody,
  registerAccount,
} from '../../../services/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!isSameOriginRequest(request)) {
    return errorResponse(new AuthRequestError('Requisição de outra origem não permitida.', 403));
  }

  try {
    await registerAccount(await readJsonBody(request));
    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
};
