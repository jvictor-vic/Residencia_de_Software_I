# Autenticação demonstrativa

> **Aviso:** esta implementação é exclusivamente demonstrativa e deve ser usada apenas com dados fictícios. Não é um provedor de identidade nem uma solução adequada para proteger dados pessoais reais ou uma aplicação em produção.

## Visão geral

O fluxo é renderizado no servidor Astro e persiste em Netlify Blobs. O navegador envia credenciais aos endpoints Astro; o código que acessa Blobs e calcula/verifica hashes está em `src/services/auth.ts` e não deve ser importado por módulos executados no cliente.

As páginas e endpoints são:

| Rota                 | Método/uso       | Comportamento                                                               |
| -------------------- | ---------------- | --------------------------------------------------------------------------- |
| `/cadastrar`         | Página           | Formulário de cadastro do aluno e, para menores, do responsável             |
| `/entrar`            | Página           | Formulário de login por CPF e senha                                         |
| `/api/auth/register` | `POST`           | Valida e cria conta(s) e perfil(is)                                         |
| `/api/auth/login`    | `POST`           | Verifica credenciais, cria sessão e envia cookie                            |
| `/api/auth/logout`   | `POST`           | Invalida sessão e limpa cookie                                              |
| `/painel`            | Página protegida | Verifica a sessão no servidor; sem sessão válida redireciona para `/entrar` |

As páginas e endpoints que dependem de autenticação não são pré-renderizados. As respostas das APIs usam `Cache-Control: no-store`; a página protegida também usa `private, no-store`.

## Contrato dos endpoints

Os endpoints recebem JSON (`Content-Type: application/json`) e limitam o corpo a 32 KiB. Os campos são revalidados no servidor com Zod; validação feita no navegador é apenas feedback para o usuário.

### Cadastro

`POST /api/auth/register` recebe os dados de perfil do aluno e `senha`. Para aluno menor, `aluno` também contém `responsavelParentesco`, `responsavelCpf`, `responsavelNomeCompleto`, `responsavelGenero`, `responsavelDataNascimento`, `responsavelEmail` e `responsavelTelefone`, além de `senhaResponsavel`. Para adulto, o perfil do aluno recebe `responsavelEmail` e `responsavelTelefone` como contatos do perfil associado ao papel de responsável; não se envia `senhaResponsavel`.

O formato de data aceito pelo formulário é `YYYY-MM-DD`. Confirmações de senha e demais valores usados somente para a interface não fazem parte do payload.

Respostas:

- `201`: `{ "ok": true }`;
- `400`: entrada inválida ou dados obrigatórios ausentes;
- `403`: origem da requisição não permitida;
- `409`: CPF/conta/perfil já existente;
- `413`: corpo maior que o limite;
- `415`: tipo de conteúdo não suportado;
- `500`: falha inesperada, com mensagem genérica ao cliente.

### Login e logout

`POST /api/auth/login` recebe `{ "cpf": "...", "senha": "..." }`. Em sucesso retorna `{ "ok": true }` e define o cookie de sessão. CPF inexistente, inválido ou senha incorreta resultam na mesma resposta `401` (`CPF ou senha inválidos.`), evitando confirmar se uma conta existe.

`POST /api/auth/logout` invalida o token atual quando presente e sempre responde com `{ "ok": true }` no caminho normal, removendo o cookie. Em ambos os endpoints, falhas inesperadas retornam erro genérico `500`; as respostas não são cacheadas.

## Cadastro e contas

CPF é normalizado no servidor removendo caracteres não numéricos e armazenado como string de 11 dígitos. O servidor valida o CPF, os campos do cadastro e as senhas, sem confiar em perfil, CPF ou papel fornecido pelo cliente para autorizar uma operação.

### Aluno com menos de 18 anos completos

- O formulário solicita os dados do responsável e uma senha distinta para cada pessoa.
- A senha do aluno e a senha do responsável precisam atender aos requisitos descritos abaixo e suas respectivas confirmações devem coincidir.
- O responsável deve ser adulto, ter CPF válido diferente do CPF do aluno e preencher os dados obrigatórios do fluxo.
- O servidor cria duas contas e dois perfis: aluno e responsável. O perfil do aluno referencia o CPF da conta do responsável; o perfil do responsável inclui o vínculo com o aluno.

### Aluno com 18 anos completos ou mais

- O formulário solicita uma única senha, além de e-mail e telefone para completar o perfil de responsável da mesma pessoa.
- O servidor cria uma conta com os papéis `aluno` e `responsavel`, sem duplicar credenciais.
- O perfil de responsável usa o CPF, nome, gênero, data de nascimento, e-mail e telefone da própria pessoa. Não são enviados nem criados dados de um responsável diferente.

O cadastro rejeita CPF(s) já utilizados e retorna um erro explícito ao formulário. Não há criação silenciosa de credenciais para outra pessoa.

## Requisitos das senhas

As senhas de cadastro precisam ter:

- de 6 a 16 caracteres;
- ao menos uma letra maiúscula;
- ao menos uma letra minúscula;
- ao menos um número;
- ao menos um caractere especial.

A confirmação é validada pelo formulário e não é enviada à API. No login, a senha é verificada no servidor e não retorna ao navegador, nem é gravada em `localStorage` ou `sessionStorage`.

## Armazenamento no Netlify Blobs

O store usado pelo serviço chama-se `educahub-auth-demo`. As chaves seguem estes formatos:

| Chave                        | Conteúdo                                                             |
| ---------------------------- | -------------------------------------------------------------------- |
| `accounts/{cpf}`             | CPF, hash da senha e papéis da conta                                 |
| `profiles/aluno/{cpf}`       | Perfil do aluno, endereço e vínculo com responsável quando aplicável |
| `profiles/responsavel/{cpf}` | Perfil do responsável e lista de vínculos                            |
| `sessions/{sha256-do-token}` | CPF da conta e horário de expiração da sessão                        |

Datas de nascimento são serializadas como strings `YYYY-MM-DD`. Senhas nunca são armazenadas em texto puro: o serviço gera hashes com `scrypt`, salt aleatório e comparação de hash em tempo constante. O token aleatório da sessão é enviado apenas pelo cookie; o Blob guarda seu SHA-256, o CPF associado e a expiração.

Blobs é armazenamento chave-valor, não um banco relacional: não há transação atômica entre a gravação de perfil(is) e conta(s), nem restrições relacionais. O cadastro usa gravações condicionais por chave (`onlyIfNew`) e tenta remover gravações anteriores se uma etapa falhar; essa compensação é best-effort e pode falhar, exigindo verificação administrativa. Registros de sessão também não recebem TTL automático: sessões expiradas são rejeitadas e removidas quando consultadas.

## Sessão, cookie e autorização

Após login bem-sucedido, o servidor cria um token aleatório de 32 bytes e o envia no cookie `educahub_session`, com:

- `HttpOnly`, para impedir leitura pelo JavaScript da página;
- `SameSite=Lax`;
- `Path=/`;
- duração máxima de sete dias;
- `Secure` em produção.

O token não é retornado no corpo JSON. Para cada pedido autenticado, o servidor deve validar o cookie e ler a sessão com `readSession`. Logout exclui o registro de sessão e devolve o cookie expirado. As rotas API verificam a origem da requisição quando o cabeçalho `Origin` está presente.

Uma sessão válida identifica o CPF; ela não deve ser interpretada como prova de um papel solicitado pelo cliente. Uma rota que exija um papel específico precisa carregar o estado associado à conta no servidor e verificar o papel lá. Não autorize operações com base em CPF, papel ou ID recebido do navegador.

## Configuração e execução

### Desenvolvimento local

1. Instale as dependências do projeto:

   ```bash
   npm install
   ```

2. Execute pela Netlify CLI, que fornece o contexto local necessário para o adaptador e Netlify Blobs:

   ```bash
   npx netlify dev
   ```

3. Abra a URL local apresentada pela CLI e teste com dados fictícios.

Não é necessária uma variável contendo senha ou credencial de conta no código. Use o ambiente de desenvolvimento da Netlify para testar Blobs; `npm run dev` isolado não deve ser considerado um teste de persistência do serviço.

### Deploy na Netlify

1. Faça o deploy do site usando o adaptador `@astrojs/netlify` já configurado em `astro.config.mjs`.
2. Confirme que o deploy ocorre no contexto de um site Netlify e que a função SSR consegue acessar Netlify Blobs.
3. Teste cadastro, login, acesso a `/painel` sem cookie, expiração e logout usando apenas dados fictícios.
4. Não reutilize dados de teste como dados de usuários reais.

## Limites e requisitos para produção

Esta demonstração não oferece garantias de consistência entre várias gravações no Blobs, recuperação de senha, verificação de e-mail, MFA, gestão de dispositivos, rate limiting, auditoria completa ou políticas robustas de detecção de abuso. O código de hash, as sessões e as telas são didáticos e não foram submetidos a uma revisão/certificação para proteger dados reais.

Para uma aplicação de produção, use um provedor de identidade ou uma arquitetura de autenticação apropriada, armazenamento transacional com controles de acesso, monitoramento, limites contra abuso e revisão de segurança e privacidade. Não exponha hashes, tokens, perfis privados ou acesso ao Blob Store no bundle do cliente.
