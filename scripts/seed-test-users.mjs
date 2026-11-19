import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'educahub-auth-demo';
const PASSWORD_HASH_BYTES = 32;
const PASSWORD_SALT_BYTES = 16;
const SCRYPT_OPTIONS = { N: 32_768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

const testAccounts = [
  {
    key: 'accounts/00650731506',
    password: 'pRJ4xjs@C#YJ',
    account: {
      cpf: '00650731506',
      papeis: ['aluno', 'responsavel'],
      dadosPessoais: {
        nomeCompleto: 'Helena dos Santos',
        genero: 'Mulher Cis',
        dataNascimento: '1999-02-14',
      },
      perfis: {
        aluno: {
          corRaca: 'Parda',
          nacionalidade: 'Brasil',
          estadoNatal: 'SE',
          naturalidade: 'Aracaju',
          residencia: {
            zonaMoradia: 'Urbana',
            cep: '49000-000',
            estadoResidencial: 'SE',
            municipioResidencial: 'Aracaju',
            bairroResidencial: 'Centro',
            logradouro: 'Rua de Teste',
            numero: '100',
          },
          academico: [
            {
              anoLetivo: 2026,
              modalidade: 'EJA',
              etapa: 'Ensino Fundamental - 8º ano',
              situacao: 'Matriculada',
              escola: 'Escola Municipal de Teste',
            },
          ],
          avisos: [],
        },
        responsavel: {
          telefone: '(79) 90000-0000',
          email: 'helena@example.test',
          tutelados: [{ cpfContaRelacionada: '54622849933', parentesco: 'Mãe' }],
          avisos: [],
        },
      },
    },
  },
  {
    key: 'accounts/54622849933',
    password: 'gSfj#Kto4XWS',
    account: {
      cpf: '54622849933',
      papeis: ['aluno'],
      dadosPessoais: {
        nomeCompleto: 'Miguel dos Santos',
        genero: 'Homem Cis',
        dataNascimento: '2019-03-08',
      },
      perfis: {
        aluno: {
          corRaca: 'Parda',
          nacionalidade: 'Brasil',
          estadoNatal: 'SE',
          naturalidade: 'Aracaju',
          residencia: {
            zonaMoradia: 'Urbana',
            cep: '49000-000',
            estadoResidencial: 'SE',
            municipioResidencial: 'Aracaju',
            bairroResidencial: 'Centro',
            logradouro: 'Rua de Teste',
            numero: '100',
          },
          responsavel: { cpfContaRelacionada: '00650731506', parentesco: 'Mãe' },
          academico: [],
          avisos: [],
        },
      },
    },
  },
];

const isLocalDev = process.env.NETLIFY_DEV === 'true';
const shouldSeedDeploy = process.env.SEED_DEMO_USERS === 'true';

// if (!isLocalDev && !shouldSeedDeploy) {
//  console.info('Skipping test-user seed (SEED_DEMO_USERS is not enabled).');
//  process.exit(0);
// }

let blobStore;

if (isLocalDev) {
  blobStore = getStore(STORE_NAME, { consistency: 'strong' });
} else {
  const siteID = process.envNETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;

  if (!siteID || !token) {
    throw new Error('SITE_ID and NETLIFY_BLOBS_TOKEN are required to seed Blobs during deploy.');
  }

  blobStore = getStore({
    name: STORE_NAME,
    siteID,
    token,
    consistency: 'strong',
  });
}

const storedAccounts = await Promise.all(
  testAccounts.map(({ key }) => blobStore.get(key, { type: 'json' })),
);

if (storedAccounts.some((account) => account !== null)) {
  const allAccountsMatch = await Promise.all(
    testAccounts.map(async ({ account, password }, index) => {
      const stored = storedAccounts[index];
      if (!stored || typeof stored.senhaHash !== 'string') return false;

      const { senhaHash, ...storedAccount } = stored;
      return (
        isDeepStrictEqual(storedAccount, account) && (await verifyPassword(password, senhaHash))
      );
    }),
  );

  if (allAccountsMatch.every(Boolean)) {
    console.info('Local test users already exist; leaving them unchanged.');
    process.exit(0);
  }

  throw new Error(
    'Test-user account keys already exist with different data; refusing to overwrite them.',
  );
}

const createdKeys = [];
try {
  for (const { key, password, account } of testAccounts) {
    const senhaHash = await hashPassword(password);
    const result = await blobStore.setJSON(key, { ...account, senhaHash }, { onlyIfNew: true });
    if (!result.modified) {
      throw new Error(`Could not create test account ${key}; the key already exists.`);
    }
    createdKeys.push(key);
  }
} catch (error) {
  const cleanupFailures = [];
  for (const key of createdKeys.reverse()) {
    try {
      await blobStore.delete(key);
    } catch (cleanupError) {
      cleanupFailures.push(cleanupError);
    }
  }

  if (cleanupFailures.length > 0) {
    console.error('Test-user seed cleanup failed after a partial write.', cleanupFailures);
    throw new Error('Test-user seeding was partial and requires manual review.');
  }
  throw error;
}

console.info('Seeded local test users Helena dos Santos and Miguel dos Santos.');

async function hashPassword(password) {
  const salt = randomBytes(PASSWORD_SALT_BYTES);
  const derivedKey = await deriveKey(password, salt);
  return `scrypt$32768$8$1$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
}

async function verifyPassword(password, encoded) {
  const parts = encoded.split('$');
  if (
    parts.length !== 6 ||
    parts[0] !== 'scrypt' ||
    parts[1] !== '32768' ||
    parts[2] !== '8' ||
    parts[3] !== '1'
  ) {
    return false;
  }

  const salt = Buffer.from(parts[4], 'base64url');
  const expected = Buffer.from(parts[5], 'base64url');
  if (salt.length !== PASSWORD_SALT_BYTES || expected.length !== PASSWORD_HASH_BYTES) {
    return false;
  }

  const actual = await deriveKey(password, salt);
  return timingSafeEqual(actual, expected);
}

function deriveKey(password, salt) {
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
