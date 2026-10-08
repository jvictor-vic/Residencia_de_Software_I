## Tratamento de Erros

### UX e UI

- **Campos Inválidos em Formulários** => Identificar utilizando cor semântica e outra identificação visual clara, além de bloquear o envio do formulário, no lugar redirecionar o usuário ao campo inválido;
- **Componentes Bloqueados** => Identificar componentes bloqueados, caso a interação esteja bloqueada ou não seja possível;
- **Estados Vazios** => Identificar estados vazios e retornar respostas que façam sentido (Ex.: Não existe atividade registrada na atividade, exibir "Nenhuma atividade disponível no momento");
- **Fallbacks e Degradação Graciosa** => Se um serviço ou componente falhar, manter layout e telas, e identificar componentes ainda em carregamento;
- **Fallback de Carregamento** => Utilizar skeletons ou spinners para tratar a latência inicial e estados pendentes antes da hidratação de componentes;
- **Error Boundaries (React)** => Capturar exceções não tratadas durante o ciclo de renderização de componentes React. Impedindo que uma falha em um componente React quebre o restante da página estática do Astro;
- **Requisições Duplicadas** => Desativar botões de chamada após clique, usar _Debounce_ em situações que o conteúdo possa ser alterado;
- **Erros Não Bloqueantes** => Se ocorrer error que não bloqueam usuário (Ex.: salvar um arquivo temporário, consultar um serviço secundário), comunicar com notificação _toast_ não intrusiva. Realizar retry automático ou manual;
- **Modo Offline** => Informar perda de conexão com um ícone de status no header;

### Comunicação com API

- **Status da Resposta** => Interceptar (`.catch()`) e exibir status da requisição para o usuário, o que significa e o que fazer;
- **Retentativa Automática** => Tentar novamente requisições que falharam por problemas de rede (status HTPP 5xx);
- **Gerenciamento de Cache** => Cachear dados persistentes, seja em escopo de sessão ou permanente (como tokens);

### Roteamento

- **Páginas de Erro Globais** => página 404 (não encontrado) e 500 (erro de rede ou servidor) claras indicando o erro;
- **Páginas sem Permissão para acesso** => página 403 exibir mensagem de acesso não permitido;
- **Usuário não Autorizado** => status 401, se o usuário não estiver logado, redirecionar para login;

### Handlers Globais

- **Erros de runtime** => `window.onerror` ou `window.addEventListener('error')` para capturar erros não tratados e falhas no carregamento de assets e scripts;
- **Promises rejeitadas** => `window.addEventListener('unhandledrejection')` para capturar Promises rejeitadas sem um bloco `.catch()`;
