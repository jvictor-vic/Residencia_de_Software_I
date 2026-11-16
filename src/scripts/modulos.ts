export async function carregarModulo<T>(perfil: 'escola' | 'professor' | 'secretaria'): Promise<T> {
  const response = await fetch(`/api/modulos?perfil=${perfil}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(await mensagemErro(response));
  return (await response.json()) as T;
}

export async function salvarModulo<T = unknown>(
  perfil: 'escola' | 'professor' | 'secretaria',
  dados: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`/api/modulos?perfil=${perfil}`, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!response.ok) throw new Error(await mensagemErro(response));
  return (await response.json()) as T;
}

async function mensagemErro(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    return typeof body.error === 'string' ? body.error : 'Não foi possível concluir a operação.';
  } catch {
    return 'Não foi possível conectar ao servidor. Tente novamente.';
  }
}
