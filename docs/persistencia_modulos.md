# Persistência demonstrativa dos módulos

> As contas, escolas, estudantes, matrículas, indicadores e registros deste fluxo são fictícios. Esta demonstração não deve receber dados pessoais reais nem ser usada em produção.

## Contas de demonstração

O primeiro pedido de login cria, de forma idempotente, três contas fictícias no store `educahub-auth-demo`. As senhas são processadas com `scrypt` e salt aleatório; o Blob contém somente o hash. As credenciais servem apenas para navegar pelas telas demonstrativas:

| Perfil     | CPF de demonstração | Senha de demonstração |
| ---------- | ------------------- | --------------------- |
| Professor  | `529.982.247-25`    | `Professor123!`       |
| Escola     | `111.444.777-35`    | `Escola123!`          |
| Secretaria | `123.456.789-09`    | `Secretaria123!`      |

As contas usam cookie `HttpOnly`, `SameSite=Lax`, expiração de sete dias e `Secure` em produção. O token aleatório aparece somente no cookie; o store guarda seu hash. O middleware protege `/escola/*`, `/professor/*` e `/secretaria/*`. A API repete a validação de papel e vínculo antes de ler ou gravar dados.

## Stores e índices

O store `educahub-modulos-demo` contém registros JSON. IDs de fixtures são estáveis e sua carga usa `onlyIfNew`; os índices são listas de IDs atualizadas sem duplicar entradas. A inicialização de cada lista de estudantes deixa um marcador `fixtures/v1/class-roster/{turmaId}` para que uma exclusão ou realocação confirmada não seja revertida no próximo pedido.

| Prefixo                                                 | Índice de consulta                                                                                                |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `schools/{id}`                                          | `indexes/schools/all`, `indexes/schools/region/{regiao}`                                                          |
| `classes/{id}`                                          | `indexes/classes/school/{escolaId}`                                                                               |
| `students/{id}`                                         | `indexes/students/class/{turmaId}`                                                                                |
| `enrollments/{id}`                                      | `indexes/enrollments/school/{escolaId}`                                                                           |
| `teachers/{id}`                                         | `indexes/teachers/school/{escolaId}`                                                                              |
| `attendance/{professorCpf}-{turmaId}-{data}`            | `indexes/attendance/professor/{cpf}`, `indexes/attendance/class/{turmaId}`, `indexes/attendance/period/{YYYY-MM}` |
| `grades/{turmaId}-{disciplina}-{estudanteId}`           | `indexes/grades/class/{turmaId}`, `indexes/grades/period/{unidade}`                                               |
| `diaries/{turmaId}-{data}-{professorCpf}`               | `indexes/diaries/professor/{cpf}`, `indexes/diaries/period/{YYYY-MM}`                                             |
| `indicators/{schoolId}` e `indicators/network/{redeId}` | chaves diretas                                                                                                    |

As datas das chaves de chamada e diário estão em `YYYY-MM-DD`. A região, UF e município são campos separados. A lista de escolas é um recorte demonstrativo; o panorama continua apresentando o total fictício de 112 escolas.

## Falhas parciais

Blobs não oferece transação entre chaves. Criações indexadas gravam o registro antes dos índices. Se um índice falhar, o serviço tenta remover os índices já escritos e excluir o registro; se a compensação também falhar, registra as chaves afetadas no log do servidor e retorna erro, sem mostrar sucesso. Atualizações de sala, atribuição, chamada e nota alteram uma chave de registro por vez. Remoção e realocação de estudantes guardam cópias anteriores e tentam restaurar registros e índices se uma etapa falhar. Uma falha de compensação exige comparar os registros dos prefixos com os IDs dos índices correspondentes.

As listas de índices usam leitura e gravação de JSON e não são uma operação transacional concorrente. A demonstração não oferece garantias de consistência para gravações simultâneas.

## Anexos demonstrativos

O cadastro da Secretaria persiste no Blob os metadados selecionados (categoria, nome, tipo e tamanho). O conteúdo binário não é enviado nem armazenado; a tela informa isso antes da submissão e após o cadastro. O cadastro não representa autorização oficial de funcionamento.

## Execução

Com `npx netlify dev` em execução, defina `EDUCAHUB_TEST_URL=http://localhost:8888` e rode `npm run test:integration` para validar login, autorização, validação de nota e persistência em Blobs. No PowerShell, use `$env:EDUCAHUB_TEST_URL='http://localhost:8888'; npm run test:integration`.

Use `npx netlify dev` para testar login e operações com Netlify Blobs. `npm run dev` isolado não valida o armazenamento. A pré-matrícula pública permanece separada e não cria contas ou matrículas da Escola.
