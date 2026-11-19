# Dados do usuário nas páginas acadêmicas

As rotas em `/academico`, `/professor`, `escola` e `/secretaria` são renderizadas no servidor. O middleware valida a sessão e carrega a conta e seus perfis antes de renderizar a página.

## Fluxo dos dados

1. O navegador envia o cookie de sessão na requisição.
2. `src/middleware.ts` valida a sessão e chama `readAuthenticatedProfile`.
3. Os dados encontrados são atribuídos a `context.locals.authenticatedUser`.
4. O layout `src/layouts/{tipo usuário}.astro` lê os dados no frontmatter, verifica o
   acesso e compõe o cabeçalho da página.
5. A página também pode ler `Astro.locals.authenticatedUser` no seu próprio
   frontmatter.

## Acessando dados na página

Dados pessoais compartilhados ficam em `dadosPessoais`. Os dados específicos
ficam em `perfis.{TipeUsuario}`. Uma conta pode ter um ou ambos os perfis.

```astro
---
const usuario = Astro.locals.authenticatedUser;
const nome = usuario?.dadosPessoais.nomeSocial || usuario?.dadosPessoais.nomeCompleto;
const aluno = usuario?.perfis.aluno;
const responsavel = usuario?.perfis.responsavel;
---

<h1>Olá, {nome}</h1>
{aluno && <p>Dados do perfil de aluno disponíveis.</p>}
{responsavel && <p>Dados do perfil de responsável disponíveis.</p>}
```

## Proteção e cache

Sem sessão válida, o middleware redireciona para `/entrar`. O layout também
verifica a presença do usuário e aceita apenas os papéis `aluno` e `responsavel`.
As respostas acadêmicas usam `Cache-Control: private, no-store` para evitar
cache compartilhado de dados pessoais.

`Astro.locals` existe somente durante a requisição e deve ser usado no servidor.
Não envie credenciais ou dados pessoais ao navegador sem necessidade.
