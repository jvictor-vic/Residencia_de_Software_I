import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  alunos8B,
  alunosPorTurma,
  escolasRede,
  frequenciaRegiao,
  indicadoresPedagogicos,
  indicadoresEscola,
  matriculas,
  matriculasPorMes,
  notasMat8B,
  panoramaRede,
  professoresEscola,
  diarioProfessor,
  turmasEscola,
  turmasProfessor,
} from '@data/dados';
import { readModuleProfile, AuthRequestError } from './auth';
import { media, situacaoNota } from './moduloDomain';

const STORE = 'educahub-modulos-demo';
const REDE_ID = 'rede-sergipe-demo';
const DEMO_ESCOLA_ID = 'escola-e-e-jardim-das-mangabeiras';
const db = () => getStore(STORE, { consistency: 'strong' });
const slug = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const escolaSchema = z.object({
  nome: z.string().trim().min(2).max(140),
  municipio: z.string().trim().min(2).max(100),
  uf: z.string().trim().length(2),
  regiao: z.string().trim().min(2).max(80),
  endereco: z.string().trim().max(240).optional(),
  inep: z.string().trim().max(8).optional(),
  cnpj: z.string().trim().max(20).optional(),
  responsavel: z.string().trim().max(140).optional(),
  email: z.string().trim().max(160).optional(),
  telefone: z.string().trim().max(24).optional(),
  etapas: z.string().trim().max(160).optional(),
  dependencia: z.string().trim().max(100).optional(),
  anexos: z
    .array(
      z.object({
        categoria: z.string().max(60),
        nome: z.string().max(180),
        tipo: z.string().max(120),
        bytes: z.number().nonnegative(),
      }),
    )
    .max(12)
    .default([]),
});

const attendanceSchema = z.object({
  turmaId: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  presencas: z.array(z.object({ estudanteId: z.string().min(1), presente: z.boolean() })).min(1),
});

const gradeSchema = z.object({
  turmaId: z.string().min(1),
  disciplina: z.string().trim().min(1).max(80),
  unidade: z.number().int().min(1).max(4),
  notas: z
    .array(z.object({ estudanteId: z.string().min(1), valor: z.number().min(0).max(10) }))
    .min(1),
});

const diarySchema = z.object({
  turmaId: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  conteudo: z.string().trim().min(1).max(2000),
  observacao: z.string().trim().max(1000).optional().default(''),
});

async function setIfMissing<T>(key: string, value: T): Promise<void> {
  await db().setJSON(key, value, { onlyIfNew: true });
}

async function appendIndex(key: string, id: string): Promise<void> {
  const store = db();
  const current = (await store.get(key, { type: 'json' })) as string[] | null;
  if (!current?.includes(id)) await store.setJSON(key, [...(current ?? []), id]);
}

async function removeIndex(key: string, id: string): Promise<void> {
  const current = await ids(key);
  if (current.includes(id))
    await db().setJSON(
      key,
      current.filter((item) => item !== id),
    );
}

async function writeIndexedRecord(
  key: string,
  id: string,
  value: unknown,
  indexKeys: string[],
): Promise<void> {
  const result = await db().setJSON(key, value, { onlyIfNew: true });
  if (!result.modified)
    throw new AuthRequestError('O registro já existe. Atualize a tela e tente novamente.', 409);
  const written: string[] = [];
  try {
    for (const indexKey of indexKeys) {
      await appendIndex(indexKey, id);
      written.push(indexKey);
    }
  } catch (error) {
    const failures: unknown[] = [];
    for (const indexKey of written) {
      try {
        await removeIndex(indexKey, id);
      } catch (cleanupError) {
        failures.push(cleanupError);
      }
    }
    try {
      await db().delete(key);
    } catch (cleanupError) {
      failures.push(cleanupError);
    }
    if (failures.length)
      console.error('Falha ao compensar gravação parcial de módulo.', { key, id, failures });
    throw error;
  }
}

async function upsertIndex(key: string, values: string[]): Promise<void> {
  await db().setJSON(key, [...new Set(values)]);
}

async function ids(key: string): Promise<string[]> {
  return ((await db().get(key, { type: 'json' })) as string[] | null) ?? [];
}

async function readRecords<T>(index: string, prefix: string): Promise<T[]> {
  const store = db();
  const keys = await ids(index);
  const records = await Promise.all(
    keys.map((id) => store.get(`${prefix}/${id}`, { type: 'json' })),
  );
  return records.filter((record): record is T => record !== null);
}

/** Each fixture has a stable key. Partial initialization can be safely retried. */
export async function initializeModuleFixtures(): Promise<void> {
  const schoolRecords = escolasRede.map((item) => ({ ...item }));
  for (const school of schoolRecords) {
    await setIfMissing(`schools/${school.id}`, school);
    await appendIndex('indexes/schools/all', school.id);
    await appendIndex(`indexes/schools/region/${slug(school.regiao)}`, school.id);
  }

  const classes = turmasEscola.map((turma) => {
    const professorId = turmaProfessorId(turma.nome);
    const professorClass = turmasProfessor.find((item) => item.id === professorId);
    return {
      id: professorId,
      escolaId: DEMO_ESCOLA_ID,
      nome: turma.nome,
      serie: turma.nome.split(' ano')[0] + ' ano',
      turno: turma.turno,
      sala: professorClass?.sala ?? '',
      horario: professorClass?.horario ?? '',
      capacidade: Math.max(turma.alunos, 35),
      alunos: turma.alunos,
      regente: turma.regente,
      frequencia: turma.frequencia,
    };
  });
  for (const turma of classes) {
    await setIfMissing(`classes/${turma.id}`, turma);
    await appendIndex(`indexes/classes/school/${turma.escolaId}`, turma.id);
    const seeded = await db().get(`fixtures/v1/class-roster/${turma.id}`, { type: 'text' });
    if (!seeded) {
      const names = turma.id === 'turma-8b' ? alunos8B : (alunosPorTurma[turma.nome] ?? []);
      for (const [i, nome] of names.entries()) {
        const estudanteId =
          turma.id === 'turma-8b'
            ? studentIdFromName(nome)
            : `estudante-${turma.id}-${String(i + 1).padStart(3, '0')}`;
        await setIfMissing(`students/${estudanteId}`, {
          id: estudanteId,
          nome,
          turmaId: turma.id,
          escolaId: turma.escolaId,
        });
        await appendIndex(`indexes/students/class/${turma.id}`, estudanteId);
      }
      await db().set(`fixtures/v1/class-roster/${turma.id}`, 'ready', { onlyIfNew: true });
    }
  }

  for (const [i, item] of matriculas.entries()) {
    const id = `matricula-fixture-${String(i + 1).padStart(3, '0')}`;
    await setIfMissing(`enrollments/${id}`, {
      id,
      escolaId: DEMO_ESCOLA_ID,
      ...item,
      demonstrativa: true,
    });
    await appendIndex(`indexes/enrollments/school/${DEMO_ESCOLA_ID}`, id);
  }
  for (const [i, item] of professoresEscola.entries()) {
    const id = `professor-fixture-${String(i + 1).padStart(3, '0')}`;
    await setIfMissing(`teachers/${id}`, { id, escolaId: DEMO_ESCOLA_ID, ...item });
    await appendIndex(`indexes/teachers/school/${DEMO_ESCOLA_ID}`, id);
  }
  for (const [i, item] of diarioProfessor.entries()) {
    const id = `diario-fixture-${String(i + 1).padStart(3, '0')}`;
    await setIfMissing(`diaries/${id}`, {
      id,
      professorCpf: '52998224725',
      turmaId: turmaProfessorId(item.turma),
      ...item,
    });
    await appendIndex('indexes/diaries/professor/52998224725', id);
  }
  await setIfMissing(`indicators/school/${DEMO_ESCOLA_ID}`, {
    ...indicadoresEscola,
    matriculasPorMes,
  });
  await setIfMissing(`indicators/network/${REDE_ID}`, {
    panoramaRede,
    frequenciaRegiao,
    indicadoresPedagogicos,
    matriculasPorMes,
  });
  await setIfMissing('indexes/teacher-classes/52998224725', ['turma-8b']);

  for (const [nome, unidades] of Object.entries(notasMat8B)) {
    const estudanteId = studentIdFromName(nome);
    const id = `turma-8b-matematica-${estudanteId}`;
    await setIfMissing(`grades/${id}`, {
      id,
      turmaId: 'turma-8b',
      estudanteId,
      disciplina: 'Matemática',
      unidades,
      professorCpf: '52998224725',
    });
    await appendIndex('indexes/grades/class/turma-8b', id);
  }
}

function turmaProfessorId(nome: string): string {
  const normalized = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const match = normalized.match(/(\d+).*?ano\s+([ab])$/);
  return match ? `turma-${match[1]}${match[2]}` : `turma-${slug(nome)}`;
}

function studentIdFromName(nome: string): string {
  return `estudante-8b-${slug(nome)}`;
}

type Role = 'escola' | 'professor' | 'secretaria';
type Principal = { cpf: string; role: Role; profile: Record<string, unknown> };

async function principal(request: Request, role: Role): Promise<Principal> {
  const result = await readModuleProfile(request, role);
  if (!result) throw new AuthRequestError('Acesso negado para este perfil.', 403);
  return { cpf: result.cpf, role, profile: result.profile as unknown as Record<string, unknown> };
}

function assertSchool(principal: Principal, escolaId: string): void {
  const profile = principal.profile as { escolaId?: string; escolaIds?: string[] };
  const allowed = profile.escolaId === escolaId || profile.escolaIds?.includes(escolaId);
  if (!allowed) throw new AuthRequestError('A escola informada não pertence ao seu perfil.', 403);
}

async function assertTeacherClass(
  user: Principal,
  classId: string,
  discipline?: string,
): Promise<void> {
  const profile = user.profile as {
    escolaId: string;
    atribuicoes: { turmaId: string; disciplina: string }[];
  };
  const assignment = profile.atribuicoes.find(
    (item) => item.turmaId === classId && (!discipline || item.disciplina === discipline),
  );
  const turma = (await db().get(`classes/${classId}`, { type: 'json' })) as {
    escolaId?: string;
  } | null;
  if (!assignment || !turma || turma.escolaId !== profile.escolaId)
    throw new AuthRequestError('Turma ou disciplina não atribuída a este professor.', 403);
}

export async function readModuleData(
  request: Request,
  role: Role,
): Promise<Record<string, unknown>> {
  const user = await principal(request, role);
  await initializeModuleFixtures();
  const store = db();
  if (role === 'secretaria') {
    if (user.profile.redeId !== REDE_ID) throw new AuthRequestError('Rede não autorizada.', 403);
    const schools = await readRecords('indexes/schools/all', 'schools');
    const network = await store.get(`indicators/network/${REDE_ID}`, { type: 'json' });
    return { escolas: schools, rede: network };
  }
  if (role === 'escola') {
    const escolaIds = (user.profile.escolaIds as string[] | undefined) ?? [
      user.profile.escolaId as string,
    ];
    const turmas: unknown[] = [];
    const matriculasDaEscola: unknown[] = [];
    const professores: unknown[] = [];
    for (const escolaId of escolaIds) {
      assertSchool(user, escolaId);
      turmas.push(...(await readRecords(`indexes/classes/school/${escolaId}`, 'classes')));
      matriculasDaEscola.push(
        ...(await readRecords(`indexes/enrollments/school/${escolaId}`, 'enrollments')),
      );
      professores.push(...(await readRecords(`indexes/teachers/school/${escolaId}`, 'teachers')));
    }
    const indicadores = await Promise.all(
      escolaIds.map((id) => store.get(`indicators/school/${id}`, { type: 'json' })),
    );
    const turmasComDados = await Promise.all(
      (turmas as { id: string }[]).map(async (turma) => {
        const students = await readRecords<{ id: string; nome: string }>(
          `indexes/students/class/${turma.id}`,
          'students',
        );
        const assignments = (await store.get(`assignments/class/${turma.id}`, {
          type: 'json',
        })) as Record<string, string> | null;
        return {
          ...turma,
          alunos: students.length,
          alunosLista: students,
          professores: assignments ?? {},
        };
      }),
    );
    const resumoBase = (indicadores[0] ?? indicadoresEscola) as Record<string, unknown>;
    const indicadoresAtualizados = {
      ...resumoBase,
      matriculados: turmasComDados.reduce((total, turma) => total + Number(turma.alunos), 0),
      professores: professores.length,
      turmasAtivas: turmasComDados.length,
    };
    return {
      turmas: turmasComDados,
      matriculas: matriculasDaEscola,
      professores,
      indicadores: indicadoresAtualizados,
      matriculasPorMes: resumoBase.matriculasPorMes ?? matriculasPorMes,
    };
  }
  const profile = user.profile as {
    escolaId: string;
    atribuicoes: { turmaId: string; disciplina: string }[];
  };
  const turmas = await Promise.all(
    profile.atribuicoes.map(async ({ turmaId: id }) => {
      await assertTeacherClass(user, id);
      const turma = (await store.get(`classes/${id}`, { type: 'json' })) as Record<
        string,
        unknown
      > | null;
      const estudantes = await readRecords<{ id: string; nome: string }>(
        `indexes/students/class/${id}`,
        'students',
      );
      return turma ? { ...turma, estudantes } : null;
    }),
  );
  const diarios = await readRecords(`indexes/diaries/professor/${user.cpf}`, 'diaries');
  const chamadas = await readRecords(`indexes/attendance/professor/${user.cpf}`, 'attendance');
  const turmaPrincipal = turmas.find(Boolean) as
    { estudantes?: { id: string; nome: string }[] } | undefined;
  const estudantes = turmaPrincipal?.estudantes ?? [];
  const notas: unknown[] = [];
  for (const assignment of profile.atribuicoes)
    notas.push(...(await readRecords(`indexes/grades/class/${assignment.turmaId}`, 'grades')));
  return { turmas, estudantes, atribuicoes: profile.atribuicoes, diarios, notas, chamadas };
}

async function writeModuleDataValidated(
  request: Request,
  role: Role,
  input: unknown,
): Promise<Record<string, unknown>> {
  const user = await principal(request, role);
  await initializeModuleFixtures();
  const data = z.record(z.string(), z.unknown()).parse(input);
  const store = db();

  if (role === 'escola') {
    const escolaId = z
      .string()
      .min(1)
      .parse(data.escolaId ?? DEMO_ESCOLA_ID);
    assertSchool(user, escolaId);
    if (data.operacao === 'matricula:create') {
      const values = z
        .object({
          aluno: z.string().trim().min(2).max(120),
          responsavel: z.string().trim().min(2).max(120),
          turmaId: z.string().min(1),
        })
        .parse(data);
      const turma = (await store.get(`classes/${values.turmaId}`, { type: 'json' })) as {
        escolaId?: string;
      } | null;
      if (!turma || turma.escolaId !== escolaId)
        throw new AuthRequestError('Turma inválida para esta escola.', 403);
      const id = `matricula-${randomUUID()}`;
      const record = {
        id,
        escolaId,
        ...values,
        turma: (turma as { nome: string }).nome,
        data: new Date().toISOString().slice(0, 10),
        status: 'analise',
        demonstrativa: true,
      };
      await writeIndexedRecord(`enrollments/${id}`, id, record, [
        `indexes/enrollments/school/${escolaId}`,
      ]);
      return { ok: true, registro: record };
    }
    if (data.operacao === 'turma:sala') {
      const values = z
        .object({ turmaId: z.string().min(1), sala: z.string().trim().max(80) })
        .parse(data);
      const key = `classes/${values.turmaId}`;
      const turma = (await store.get(key, { type: 'json' })) as Record<string, unknown> | null;
      if (!turma || turma.escolaId !== escolaId)
        throw new AuthRequestError('Turma inválida para esta escola.', 403);
      if (
        (await ids(`indexes/students/class/${values.turmaId}`).then((items) => items.length)) >=
        Number(turma.capacidade)
      )
        throw new AuthRequestError('A turma atingiu a capacidade demonstrativa configurada.', 409);
      const updated = { ...turma, sala: values.sala };
      await store.setJSON(key, updated);
      return { ok: true, turma: updated };
    }
    if (data.operacao === 'professor:atribuir') {
      const values = z
        .object({
          turmaId: z.string().min(1),
          disciplina: z.string().trim().min(1).max(80),
          professor: z.string().trim().min(1).max(140),
        })
        .parse(data);
      const key = `classes/${values.turmaId}`;
      const turma = (await store.get(key, { type: 'json' })) as Record<string, unknown> | null;
      if (!turma || turma.escolaId !== escolaId)
        throw new AuthRequestError('Turma inválida para esta escola.', 403);
      const assignmentsKey = `assignments/class/${values.turmaId}`;
      const assignments = (await store.get(assignmentsKey, { type: 'json' })) as Record<
        string,
        string
      > | null;
      const updated = { ...(assignments ?? {}), [values.disciplina]: values.professor };
      await store.setJSON(assignmentsKey, updated);
      return { ok: true, atribuicoes: updated };
    }
    if (data.operacao === 'professor:remover') {
      const values = z
        .object({ turmaId: z.string().min(1), disciplina: z.string().trim().min(1).max(80) })
        .parse(data);
      const key = `classes/${values.turmaId}`;
      const turma = (await store.get(key, { type: 'json' })) as { escolaId?: string } | null;
      if (!turma || turma.escolaId !== escolaId)
        throw new AuthRequestError('Turma inválida para esta escola.', 403);
      const assignmentsKey = `assignments/class/${values.turmaId}`;
      const assignments = (await store.get(assignmentsKey, { type: 'json' })) as Record<
        string,
        string
      > | null;
      if (assignments) {
        delete assignments[values.disciplina];
        await store.setJSON(assignmentsKey, assignments);
      }
      return { ok: true };
    }
    if (data.operacao === 'professor:adicionar') {
      const values = z
        .object({
          nome: z.string().trim().min(3).max(140),
          disciplina: z.string().trim().min(1).max(80),
        })
        .parse(data);
      const existing = await readRecords<{ nome: string; disciplina: string }>(
        `indexes/teachers/school/${escolaId}`,
        'teachers',
      );
      if (
        existing.some(
          (teacher) => teacher.nome === values.nome && teacher.disciplina === values.disciplina,
        )
      )
        throw new AuthRequestError('Este professor já está cadastrado nesta disciplina.', 409);
      const id = `professor-${randomUUID()}`;
      const record = { id, escolaId, ...values, turmas: 0, diario: 'em-dia' };
      await writeIndexedRecord(`teachers/${id}`, id, record, [
        `indexes/teachers/school/${escolaId}`,
      ]);
      return { ok: true, professor: record };
    }
    if (data.operacao === 'aluno:adicionar') {
      const values = z
        .object({ turmaId: z.string().min(1), nome: z.string().trim().min(2).max(120) })
        .parse(data);
      const key = `classes/${values.turmaId}`;
      const turma = (await store.get(key, { type: 'json' })) as Record<string, unknown> | null;
      if (!turma || turma.escolaId !== escolaId)
        throw new AuthRequestError('Turma inválida para esta escola.', 403);
      const id = `estudante-${randomUUID()}`;
      await writeIndexedRecord(
        `students/${id}`,
        id,
        { id, nome: values.nome, turmaId: values.turmaId, escolaId },
        [`indexes/students/class/${values.turmaId}`],
      );
      return { ok: true, estudante: { id, nome: values.nome } };
    }
    if (data.operacao === 'alunos:remover') {
      const values = z
        .object({ turmaId: z.string().min(1), estudanteIds: z.array(z.string().min(1)).min(1) })
        .parse(data);
      const turma = (await store.get(`classes/${values.turmaId}`, { type: 'json' })) as {
        escolaId?: string;
      } | null;
      if (!turma || turma.escolaId !== escolaId)
        throw new AuthRequestError('Turma inválida para esta escola.', 403);
      const all = await ids(`indexes/students/class/${values.turmaId}`);
      const removal = new Set(values.estudanteIds);
      if ([...removal].some((id) => !all.includes(id)))
        throw new AuthRequestError('A lista contém estudantes fora da turma.', 403);
      const snapshots = await Promise.all(
        [...removal].map(async (id) => ({
          id,
          value: await store.get(`students/${id}`, { type: 'json' }),
        })),
      );
      try {
        for (const id of removal) await store.delete(`students/${id}`);
        await upsertIndex(
          `indexes/students/class/${values.turmaId}`,
          all.filter((id) => !removal.has(id)),
        );
      } catch (error) {
        const failures: unknown[] = [];
        for (const snapshot of snapshots) {
          try {
            if (snapshot.value !== null)
              await store.setJSON(`students/${snapshot.id}`, snapshot.value);
          } catch (cleanupError) {
            failures.push(cleanupError);
          }
        }
        try {
          await upsertIndex(`indexes/students/class/${values.turmaId}`, all);
        } catch (cleanupError) {
          failures.push(cleanupError);
        }
        if (failures.length)
          console.error('Falha ao compensar remoção de estudantes.', {
            turmaId: values.turmaId,
            failures,
          });
        throw error;
      }
      return { ok: true };
    }
    if (data.operacao === 'alunos:realocar') {
      const values = z
        .object({
          origemId: z.string().min(1),
          destinoId: z.string().min(1),
          estudanteIds: z.array(z.string().min(1)).min(1),
        })
        .parse(data);
      const [origem, destino] = (await Promise.all([
        store.get(`classes/${values.origemId}`, { type: 'json' }),
        store.get(`classes/${values.destinoId}`, { type: 'json' }),
      ])) as [Record<string, unknown> | null, Record<string, unknown> | null];
      if (!origem || !destino || origem.escolaId !== escolaId || destino.escolaId !== escolaId)
        throw new AuthRequestError('Turmas inválidas para esta escola.', 403);
      const originIds = await ids(`indexes/students/class/${values.origemId}`);
      if (values.estudanteIds.some((id) => !originIds.includes(id)))
        throw new AuthRequestError('A lista contém estudantes fora da turma de origem.', 403);
      const destinoIds = await ids(`indexes/students/class/${values.destinoId}`);
      if (destinoIds.length + values.estudanteIds.length > Number(destino.capacidade))
        throw new AuthRequestError(
          'A turma de destino não tem capacidade para todos os estudantes selecionados.',
          409,
        );
      const snapshots = await Promise.all(
        values.estudanteIds.map(async (id) => ({
          id,
          value: (await store.get(`students/${id}`, { type: 'json' })) as Record<
            string,
            unknown
          > | null,
        })),
      );
      if (snapshots.some((snapshot) => snapshot.value === null))
        throw new AuthRequestError('Não foi possível localizar todos os estudantes da turma.', 409);
      try {
        for (const { id, value } of snapshots)
          await store.setJSON(`students/${id}`, { ...value!, turmaId: values.destinoId });
        await upsertIndex(
          `indexes/students/class/${values.origemId}`,
          originIds.filter((id) => !values.estudanteIds.includes(id)),
        );
        await upsertIndex(`indexes/students/class/${values.destinoId}`, [
          ...destinoIds,
          ...values.estudanteIds,
        ]);
      } catch (error) {
        const failures: unknown[] = [];
        for (const snapshot of snapshots) {
          try {
            await store.setJSON(`students/${snapshot.id}`, snapshot.value);
          } catch (cleanupError) {
            failures.push(cleanupError);
          }
        }
        try {
          await upsertIndex(`indexes/students/class/${values.origemId}`, originIds);
        } catch (cleanupError) {
          failures.push(cleanupError);
        }
        try {
          await upsertIndex(`indexes/students/class/${values.destinoId}`, destinoIds);
        } catch (cleanupError) {
          failures.push(cleanupError);
        }
        if (failures.length)
          console.error('Falha ao compensar realocação de estudantes.', { values, failures });
        throw error;
      }
      return { ok: true };
    }
  }

  if (role === 'professor') {
    const classId = z.string().min(1).parse(data.turmaId);
    const discipline = typeof data.disciplina === 'string' ? data.disciplina : undefined;
    await assertTeacherClass(
      user,
      classId,
      data.operacao === 'notas:salvar' ? discipline : undefined,
    );
    if (data.operacao === 'chamada:salvar') {
      const values = attendanceSchema.parse(data);
      const studentIds = await ids(`indexes/students/class/${classId}`);
      if (values.presencas.some((item) => !studentIds.includes(item.estudanteId)))
        throw new AuthRequestError('A chamada contém estudante fora da turma.', 403);
      const id = `${user.cpf}-${classId}-${values.data}`;
      const record = {
        id,
        turmaId: classId,
        professorCpf: user.cpf,
        data: values.data,
        presencas: values.presencas,
      };
      if (await store.get(`attendance/${id}`, { type: 'text' })) {
        await store.setJSON(`attendance/${id}`, record);
      } else {
        await writeIndexedRecord(`attendance/${id}`, id, record, [
          `indexes/attendance/professor/${user.cpf}`,
          `indexes/attendance/class/${classId}`,
          `indexes/attendance/period/${values.data.slice(0, 7)}`,
        ]);
      }
      return {
        ok: true,
        chamada: record,
        presentes: values.presencas.filter((p) => p.presente).length,
        faltas: values.presencas.filter((p) => !p.presente).length,
      };
    }
    if (data.operacao === 'notas:salvar') {
      const values = gradeSchema.parse(data);
      await assertTeacherClass(user, classId, values.disciplina);
      const studentIds = await ids(`indexes/students/class/${classId}`);
      if (values.notas.some((item) => !studentIds.includes(item.estudanteId)))
        throw new AuthRequestError('As notas incluem estudante fora da turma.', 403);
      const results = [];
      for (const item of values.notas) {
        const id = `${classId}-${slug(values.disciplina)}-${item.estudanteId}`;
        const old = (await store.get(`grades/${id}`, { type: 'json' })) as {
          unidades?: (number | null)[];
        } | null;
        const unidades = [...(old?.unidades ?? [null, null, null, null])];
        unidades[values.unidade - 1] = item.valor;
        const mediaFinal = media(unidades);
        const record = {
          id,
          turmaId: classId,
          estudanteId: item.estudanteId,
          disciplina: values.disciplina,
          unidades,
          professorCpf: user.cpf,
          media: mediaFinal,
          situacao: situacaoNota(mediaFinal),
        };
        if (await store.get(`grades/${id}`, { type: 'text' }))
          await store.setJSON(`grades/${id}`, record);
        else
          await writeIndexedRecord(`grades/${id}`, id, record, [
            `indexes/grades/class/${classId}`,
            `indexes/grades/period/${values.unidade}`,
          ]);
        results.push(record);
      }
      return { ok: true, notas: results };
    }
    if (data.operacao === 'diario:salvar') {
      const values = diarySchema.parse(data);
      const id = `${classId}-${values.data}-${user.cpf}`;
      const record = {
        id,
        turmaId: classId,
        professorCpf: user.cpf,
        data: values.data,
        conteudo: values.conteudo,
        observacao: values.observacao,
      };
      if (await store.get(`diaries/${id}`, { type: 'text' }))
        await store.setJSON(`diaries/${id}`, record);
      else
        await writeIndexedRecord(`diaries/${id}`, id, record, [
          `indexes/diaries/professor/${user.cpf}`,
          `indexes/diaries/period/${values.data.slice(0, 7)}`,
        ]);
      return { ok: true, diario: record };
    }
  }

  if (role === 'secretaria' && data.operacao === 'escola:cadastrar') {
    if (user.profile.redeId !== REDE_ID) throw new AuthRequestError('Rede não autorizada.', 403);
    const values = escolaSchema.parse(data);
    const id = `escola-${randomUUID()}`;
    const record = {
      id,
      ...values,
      alunos: 0,
      ideb: 0,
      criadoEm: new Date().toISOString(),
      demonstrativa: true,
    };
    await writeIndexedRecord(`schools/${id}`, id, record, [
      'indexes/schools/all',
      `indexes/schools/region/${slug(values.regiao)}`,
    ]);
    return {
      ok: true,
      escola: record,
      aviso:
        'Os metadados dos arquivos foram registrados; o conteúdo dos arquivos não foi enviado.',
    };
  }
  throw new AuthRequestError('Operação inválida para este perfil.', 400);
}

export async function writeModuleData(
  request: Request,
  role: Role,
  input: unknown,
): Promise<Record<string, unknown>> {
  try {
    return await writeModuleDataValidated(request, role, input);
  } catch (error) {
    if (error instanceof z.ZodError)
      throw new AuthRequestError('Os dados enviados são inválidos.', 400);
    throw error;
  }
}

export function moduleRole(value: string | null): Role | null {
  return value === 'escola' || value === 'professor' || value === 'secretaria' ? value : null;
}
