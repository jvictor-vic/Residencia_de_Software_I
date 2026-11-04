import { getStore } from '@netlify/blobs';
import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { Aluno, ContaUsuario, Responsavel, criarContaDeAluno } from '@data/users/classes';
import { calcularIdade } from '@utils/calcularIdade';
import { cpfValidator } from '@utils/cpfValidator';
import { senhaSchema } from '@components/CadastroSenha/senhaSchema';

// Autenticação demonstrativa: não usar com dados reais nem como provedor de identidade de produção.
const STORE_NAME = 'educahub-auth-demo';
const SESSION_COOKIE = 'educahub_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_HASH_BYTES = 32;
const PASSWORD_SALT_BYTES = 16;
const SCRYPT_OPTIONS = { N: 32_768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const DUMMY_SALT = randomBytes(PASSWORD_SALT_BYTES);
const EMPTY_HASH = Buffer.alloc(PASSWORD_HASH_BYTES);
const GENEROS = ['Homem Cis', 'Homem Trans', 'Mulher Cis', 'Mulher Trans', 'Não-Binário'] as const;
const RACAS = ['Amarela', 'Branca', 'Indígena', 'Parda', 'Preta'] as const;
const ZONAS = ['Urbana', 'Rural'] as const;
const dataNascimentoSchema = z
  .union([
    z.date(),
    z.string().datetime(),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine(isDataISOValida),
  ])
  .transform((data) => {
    if (data instanceof Date) return data;
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      const [ano, mes, dia] = data.split('-').map(Number);
      return new Date(ano, mes - 1, dia);
    }
    return new Date(data);
  })
  .refine((data) => data.getFullYear() >= 1900);

const store = () => getStore(STORE_NAME, { consistency: 'strong' });

const registrationSchema = z.object({
  aluno: z.object({
    nomeCompleto: z.string().trim().min(3),
    genero: z.enum(GENEROS),
    nomeSocial: z.string().optional(),
    corRaca: z.enum(RACAS),
    nacionalidade: z.string().trim().min(1),
    estadoNatal: z.string().optional(),
    naturalidade: z.string().optional(),
    dataNascimento: dataNascimentoSchema,
    cpf: z.string().min(1),
    zonaMoradia: z.enum(ZONAS),
    cep: z.string().min(9),
    estadoResidencial: z.string().trim().min(1),
    municipioResidencial: z.string().trim().min(1),
    bairroResidencial: z.string().trim().min(1),
    logradouro: z.string().trim().min(3),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    responsavelParentesco: z.string().optional(),
    responsavelCpf: z.string().optional(),
    responsavelNomeCompleto: z.string().optional(),
    responsavelGenero: z.string().optional(),
    responsavelNomeSocial: z.string().optional(),
    responsavelDataNascimento: dataNascimentoSchema.nullable().optional(),
    responsavelEmail: z.string().optional(),
    responsavelTelefone: z.string().optional(),
  }),
  senha: senhaSchema,
  senhaResponsavel: senhaSchema.optional(),
});

const loginSchema = z.object({
  cpf: z.string().min(1).max(32),
  senha: z.string().min(1).max(256),
});

const accountSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/),
  senhaHash: z.string(),
  papeis: z.array(z.enum(['aluno', 'responsavel'])).min(1),
});

const sessionSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/),
  expiresAt: z.number().int().positive(),
});

type JsonRecord = Record<string, unknown>;

export class AuthRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AuthRequestError';
  }
}

function isDataISOValida(data: string): boolean {
  const [ano, mes, dia] = data.split('-').map(Number);
  const dataLocal = new Date(ano, mes - 1, dia);
  return (
    dataLocal.getFullYear() === ano &&
    dataLocal.getMonth() === mes - 1 &&
    dataLocal.getDate() === dia &&
    ano >= 1900
  );
}

export async function registerAccount(input: unknown): Promise<void> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    throw new AuthRequestError('Revise os dados obrigatórios do cadastro.', 400);
  }

  const { aluno: form, senha, senhaResponsavel } = parsed.data;
  const { dataNascimento } = form;
  const idade = calcularIdade(dataNascimento);
  if (dataNascimento > new Date()) {
    throw new AuthRequestError('Informe uma data de nascimento válida.', 400);
  }
  if (idade >= 18 && senhaResponsavel !== undefined) {
    throw new AuthRequestError(
      'Alunos maiores de idade usam uma única senha para os papéis de aluno e responsável.',
      400,
    );
  }

  if (
    form.nacionalidade === 'Brasil' &&
    (!form.estadoNatal?.trim() || !form.naturalidade?.trim())
  ) {
    throw new AuthRequestError(
      'Estado e naturalidade são obrigatórios para alunos brasileiros.',
      400,
    );
  }

  const cpfAluno = normalizeCpf(form.cpf);
  if (!cpfAluno || !cpfValidator(cpfAluno)) {
    throw new AuthRequestError('O CPF do aluno é inválido.', 400);
  }

  let cpfResponsavel: string | undefined;
  let senhaResponsavelHash: string | undefined;
  let dadosResponsavel:
    | {
        nome: string;
        genero: (typeof GENEROS)[number];
        dataNascimento: Date;
        nomeSocial?: string;
        email: string;
        telefone: string;
        parentesco: string;
      }
    | undefined;

  if (idade < 18) {
    if (!senhaResponsavel) {
      throw new AuthRequestError('Defina uma senha para a conta do responsável.', 400);
    }

    const responsavel = form;
    const cpf = normalizeCpf(responsavel.responsavelCpf ?? '');
    const dataNascimentoResponsavel = responsavel.responsavelDataNascimento;
    const generoResponsavel = GENEROS.find((genero) => genero === responsavel.responsavelGenero);

    if (!cpf || !cpfValidator(cpf)) {
      throw new AuthRequestError('O CPF do responsável é inválido.', 400);
    }
    if (cpf === cpfAluno) {
      throw new AuthRequestError(
        'O aluno menor e o responsável precisam ter CPFs diferentes.',
        400,
      );
    }

    if (
      !responsavel.responsavelParentesco?.trim() ||
      !responsavel.responsavelNomeCompleto?.trim() ||
      !generoResponsavel ||
      !dataNascimentoResponsavel ||
      calcularIdade(dataNascimentoResponsavel) < 18 ||
      dataNascimentoResponsavel > new Date() ||
      !responsavel.responsavelEmail?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsavel.responsavelEmail) ||
      !responsavel.responsavelTelefone ||
      ![10, 11].includes(responsavel.responsavelTelefone.replace(/\D/g, '').length)
    ) {
      throw new AuthRequestError('Preencha todos os dados obrigatórios do responsável.', 400);
    }

    cpfResponsavel = cpf;
    dadosResponsavel = {
      nome: responsavel.responsavelNomeCompleto.trim(),
      genero: generoResponsavel,
      dataNascimento: dataNascimentoResponsavel,
      nomeSocial: responsavel.responsavelNomeSocial,
      email: responsavel.responsavelEmail.trim(),
      telefone: responsavel.responsavelTelefone.trim(),
      parentesco: responsavel.responsavelParentesco.trim(),
    };
    senhaResponsavelHash = await hashPassword(senhaResponsavel);
  } else if (
    !form.responsavelEmail?.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.responsavelEmail) ||
    !form.responsavelTelefone ||
    ![10, 11].includes(form.responsavelTelefone.replace(/\D/g, '').length)
  ) {
    throw new AuthRequestError(
      'Informe um e-mail e telefone válidos para completar o perfil de responsável.',
      400,
    );
  }

  const senhaAlunoHash = await hashPassword(senha);
  const contaAluno = criarContaDeAluno(cpfAluno, senhaAlunoHash, dataNascimento);
  const perfis: Array<{ key: string; value: Aluno | Responsavel }> = [
    {
      key: `profiles/aluno/${cpfAluno}`,
      value: new Aluno({
        nomeCompleto: form.nomeCompleto,
        genero: form.genero,
        nomeSocial: form.nomeSocial,
        corRaca: form.corRaca,
        nacionalidade: form.nacionalidade,
        estadoNatal: form.estadoNatal,
        naturalidade: form.naturalidade,
        dataNascimento,
        residencia: {
          zonaMoradia: form.zonaMoradia,
          cep: form.cep,
          estadoResidencial: form.estadoResidencial,
          municipioResidencial: form.municipioResidencial,
          bairroResidencial: form.bairroResidencial,
          logradouro: form.logradouro,
          numero: form.numero,
          complemento: form.complemento,
        },
        responsavel:
          dadosResponsavel && cpfResponsavel
            ? {
                cpfContaRelacionada: cpfResponsavel,
                parentesco: dadosResponsavel.parentesco,
              }
            : undefined,
      }),
    },
  ];

  const accounts: Array<{ key: string; value: ContaUsuario }> = [
    { key: `accounts/${cpfAluno}`, value: contaAluno },
  ];

  if (dadosResponsavel && cpfResponsavel && senhaResponsavelHash) {
    accounts.push({
      key: `accounts/${cpfResponsavel}`,
      value: new ContaUsuario({
        cpf: cpfResponsavel,
        senhaHash: senhaResponsavelHash,
        papeis: ['responsavel'],
      }),
    });
    perfis.push({
      key: `profiles/responsavel/${cpfResponsavel}`,
      value: new Responsavel({
        nomeCompleto: dadosResponsavel.nome,
        genero: dadosResponsavel.genero,
        nomeSocial: dadosResponsavel.nomeSocial,
        dataNascimento: dadosResponsavel.dataNascimento,
        telefone: dadosResponsavel.telefone,
        email: dadosResponsavel.email,
        tutelados: [
          {
            cpfContaRelacionada: cpfAluno,
            parentesco: dadosResponsavel.parentesco,
          },
        ],
      }),
    });
  } else {
    perfis.push({
      key: `profiles/responsavel/${cpfAluno}`,
      value: new Responsavel({
        nomeCompleto: form.nomeCompleto,
        genero: form.genero,
        nomeSocial: form.nomeSocial,
        dataNascimento,
        telefone: form.responsavelTelefone?.trim(),
        email: form.responsavelEmail?.trim(),
      }),
    });
  }

  const blobStore = store();
  const uniqueAccountKeys = [...new Set(accounts.map(({ key }) => key))];
  for (const key of uniqueAccountKeys) {
    if (await blobStore.get(key, { type: 'text' })) {
      throw new AuthRequestError('Já existe uma conta cadastrada com um dos CPFs informados.', 409);
    }
  }

  const createdKeys: string[] = [];
  try {
    // Blobs is key-value storage without relational constraints or multi-key transactions.
    // Conditional writes protect individual keys; rollback is best-effort and may need cleanup.
    for (const profile of perfis) {
      const result = await blobStore.setJSON(profile.key, profile.value, { onlyIfNew: true });
      if (!result.modified) {
        throw new AuthRequestError(
          'Já existe um perfil cadastrado para um dos CPFs informados.',
          409,
        );
      }
      createdKeys.push(profile.key);
    }

    for (const account of accounts) {
      const result = await blobStore.setJSON(account.key, account.value, { onlyIfNew: true });
      if (!result.modified) {
        throw new AuthRequestError(
          'Já existe uma conta cadastrada com um dos CPFs informados.',
          409,
        );
      }
      createdKeys.push(account.key);
    }
  } catch (error) {
    const cleanupFailures: unknown[] = [];
    for (const key of createdKeys.reverse()) {
      try {
        await blobStore.delete(key);
      } catch (cleanupError) {
        cleanupFailures.push(cleanupError);
      }
    }

    if (cleanupFailures.length > 0) {
      console.error(
        'Auth registration cleanup failed after a partial Blob Store write.',
        cleanupFailures,
      );
      throw new Error('O cadastro não foi concluído e precisa de verificação administrativa.');
    }
    throw error;
  }
}

export async function login(input: unknown): Promise<{ cookie: string }> {
  const parsed = loginSchema.safeParse(input);
  const cpf = parsed.success ? normalizeCpf(parsed.data.cpf) : '';
  const senha = parsed.success ? parsed.data.senha : '';
  let account: z.infer<typeof accountSchema> | null = null;

  if (cpf && cpfValidator(cpf)) {
    const stored = await store().get(`accounts/${cpf}`, { type: 'json' });
    if (stored !== null) {
      account = accountSchema.parse(stored);
    }
  }

  const senhaValida = account
    ? await verifyPassword(senha, account.senhaHash)
    : await verifyAgainstDummy(senha);
  if (!parsed.success || !cpf || !cpfValidator(cpf) || !account || !senhaValida) {
    throw new AuthRequestError('CPF ou senha inválidos.', 401);
  }

  const token = randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const result = await store().setJSON(
    `sessions/${hashToken(token)}`,
    { cpf: account.cpf, expiresAt },
    { onlyIfNew: true },
  );
  if (!result.modified) {
    throw new Error('Não foi possível criar uma sessão. Tente novamente.');
  }

  return { cookie: sessionCookie(token, SESSION_TTL_SECONDS) };
}

export async function logout(request: Request): Promise<string> {
  const token = getCookie(request.headers.get('cookie'), SESSION_COOKIE);
  if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) {
    await store().delete(`sessions/${hashToken(token)}`);
  }
  return sessionCookie('', 0);
}

export async function readSession(request: Request): Promise<{ cpf: string } | null> {
  const token = getCookie(request.headers.get('cookie'), SESSION_COOKIE);
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return null;
  }

  const key = `sessions/${hashToken(token)}`;
  const stored = await store().get(key, { type: 'json' });
  if (stored === null) {
    return null;
  }

  const session = sessionSchema.parse(stored);
  if (session.expiresAt <= Date.now()) {
    // Blob records have no TTL; expired sessions are rejected and removed when read.
    await store().delete(key);
    return null;
  }
  return { cpf: session.cpf };
}

export async function readJsonBody(request: Request): Promise<JsonRecord> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim();
  if (contentType !== 'application/json') {
    throw new AuthRequestError('Envie os dados no formato JSON.', 415);
  }

  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > 32_768) {
    throw new AuthRequestError('A requisição excede o tamanho permitido.', 413);
  }

  const reader = request.body?.getReader();
  if (!reader) {
    throw new AuthRequestError('Envie os dados no corpo da requisição.', 400);
  }

  const decoder = new TextDecoder();
  let body = '';
  let bytesRead = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > 32_768) {
      await reader.cancel();
      throw new AuthRequestError('A requisição excede o tamanho permitido.', 413);
    }
    body += decoder.decode(value, { stream: true });
  }
  body += decoder.decode();

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new AuthRequestError('O corpo da requisição não contém JSON válido.', 400);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new AuthRequestError('Envie um objeto JSON válido.', 400);
  }
  return parsed as JsonRecord;
}

export function jsonResponse(body: JsonRecord, status = 200, extraHeaders?: HeadersInit): Response {
  const headers = new Headers(extraHeaders);
  headers.set('Cache-Control', 'no-store');
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(body), { status, headers });
}

export function errorResponse(error: unknown, extraHeaders?: HeadersInit): Response {
  if (error instanceof AuthRequestError) {
    return jsonResponse({ error: error.message }, error.status, extraHeaders);
  }

  console.error('Authentication endpoint failed.', error);
  return jsonResponse(
    { error: 'Não foi possível concluir a operação. Tente novamente.' },
    500,
    extraHeaders,
  );
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(PASSWORD_SALT_BYTES);
  const derivedKey = await deriveKey(password, salt);
  return `scrypt$32768$8$1$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
}

async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const parts = encoded.split('$');
  if (
    parts.length !== 6 ||
    parts[0] !== 'scrypt' ||
    parts[1] !== '32768' ||
    parts[2] !== '8' ||
    parts[3] !== '1'
  ) {
    await verifyAgainstDummy(password);
    return false;
  }

  const salt = Buffer.from(parts[4], 'base64url');
  const expected = Buffer.from(parts[5], 'base64url');
  if (salt.length !== PASSWORD_SALT_BYTES || expected.length !== PASSWORD_HASH_BYTES) {
    await verifyAgainstDummy(password);
    return false;
  }

  const actual = await deriveKey(password, salt);
  return timingSafeEqual(actual, expected);
}

async function verifyAgainstDummy(password: string): Promise<boolean> {
  const actual = await deriveKey(password, DUMMY_SALT);
  return timingSafeEqual(actual, EMPTY_HASH);
}

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(password, salt, PASSWORD_HASH_BYTES, SCRYPT_OPTIONS, (error, key) => {
      if (error) {
        reject(error);
      } else {
        resolve(key);
      }
    });
  });
}

function normalizeCpf(value: string): string {
  const cpf = value.replace(/\D/g, '');
  return /^\d{11}$/.test(cpf) ? cpf : '';
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function getCookie(cookieHeader: string | null, name: string): string | null {
  const entry = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return entry ? entry.slice(name.length + 1) : null;
}

function sessionCookie(token: string, maxAge: number): string {
  const secure = import.meta.env.PROD || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const value = token ? `${SESSION_COOKIE}=${token}` : `${SESSION_COOKIE}=`;
  return `${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie(): string {
  return sessionCookie('', 0);
}
