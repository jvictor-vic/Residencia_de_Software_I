import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

const baseUrl = process.env.EDUCAHUB_TEST_URL;

test(
  'autentica, autoriza e persiste operações usando Netlify Blobs local',
  { skip: !baseUrl && 'Defina EDUCAHUB_TEST_URL para apontar para npx netlify dev.' },
  async () => {
    const origin = new URL(baseUrl!).origin;
    const login = await fetch(new URL('/api/auth/login', origin), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({ cpf: '529.982.247-25', senha: 'Professor123!' }),
    });
    assert.equal(login.status, 200, 'a conta fictícia de professor deve autenticar');
    const cookie = login.headers.get('set-cookie')?.split(';', 1)[0];
    assert.ok(cookie, 'o login deve emitir o cookie de sessão');
    assert.match(login.headers.get('set-cookie') ?? '', /HttpOnly/i);

    const moduleUrl = new URL('/api/modulos?perfil=professor', origin);
    const read = await fetch(moduleUrl, { headers: { Cookie: cookie } });
    assert.equal(read.status, 200, 'o professor deve ler os dados vinculados');
    const initial = (await read.json()) as { turmas: unknown[]; diarios: { conteudo: string }[] };
    assert.ok(initial.turmas.length > 0);

    const marker = `teste de integração ${randomUUID()}`;
    const write = await fetch(moduleUrl, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        Origin: origin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operacao: 'diario:salvar',
        turmaId: 'turma-8b',
        data: '2099-12-31',
        conteudo: marker,
        observacao: 'Verificação local demonstrativa',
      }),
    });
    assert.equal(write.status, 200, 'o diário deve ser salvo no Blob');
    const reread = await fetch(moduleUrl, { headers: { Cookie: cookie } });
    assert.equal(reread.status, 200);
    const persisted = (await reread.json()) as { diarios: { conteudo: string }[] };
    assert.ok(persisted.diarios.some((diario) => diario.conteudo === marker));

    const forbidden = await fetch(new URL('/api/modulos?perfil=secretaria', origin), {
      headers: { Cookie: cookie },
    });
    assert.notEqual(forbidden.status, 200, 'o professor não pode acessar dados da Secretaria');

    const invalidGrade = await fetch(moduleUrl, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        Origin: origin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operacao: 'notas:salvar',
        turmaId: 'turma-8b',
        disciplina: 'Matemática',
        unidade: 1,
        notas: [{ estudanteId: 'estudante-8b-ana-clara-souza', valor: 11 }],
      }),
    });
    assert.notEqual(invalidGrade.status, 200, 'nota acima de 10 deve ser rejeitada');

    const anonymous = await fetch(new URL('/escola', origin), { redirect: 'manual' });
    assert.equal(anonymous.status, 302, 'página protegida deve redirecionar sem sessão');
    assert.equal(anonymous.headers.get('location'), '/entrar');
  },
);
