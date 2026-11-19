# EducaHub

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Stack e arquitetura](#stack-e-arquitetura)
- [Dependências](#dependências)
- [Aliases de importação](#aliases-de-importação)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Autenticação demonstrativa](#autenticação-demonstrativa)
- [Estrutura de branches](#estrutura-de-branches)
- [Ambiente de desenvolvimento](#ambiente-de-desenvolvimento)
- [Instalação e execução](#instalação-e-execução)
- [Validação, CI/CD e deploy](#validação-cicd-e-deploy)

## Sobre o projeto

O EducaHub é uma aplicação web construída com Astro e React. O código-fonte da aplicação está em `src/`, e a documentação complementar está em `docs/`.

## Stack e arquitetura

- **Framework:** [Astro](https://astro.build), usado para páginas, layouts e renderização;
- **Interface interativa:** [React](https://react.dev), integrado ao Astro para componentes que precisam de interação no navegador;
- **Estilização:** CSS global e CSS Modules;
- **Formulários e validação:** React Hook Form, Zod e `@hookform/resolvers`;
- **Máscaras e animações:** IMask e GSAP;
- **Hospedagem:** Netlify, com adaptador para Astro;
- **Versionamento e automação:** Git, GitHub e GitHub Actions.

O projeto usa a arquitetura de ilhas do Astro: páginas e componentes Astro podem ser renderizados como HTML, enquanto componentes React são hidratados no navegador quando necessário.

## Dependências

As versões instaladas e seus intervalos estão definidos em `package.json`; `package-lock.json` registra a resolução usada pelo npm.

### Aplicação

- `astro`: framework da aplicação;
- `@astrojs/react`, `react` e `react-dom`: integração e componentes React;
- `@astrojs/netlify` e `netlify-cli`: adaptador de deploy e ferramentas locais da Netlify;
- `@netlify/blobs`: armazenamento demonstrativo de contas, perfis e sessões no servidor;
- `react-hook-form`, `@hookform/resolvers` e `zod`: formulários e validação de dados;
- `imask` e `react-imask`: máscaras de entrada;
- `gsap`: animações;

### Desenvolvimento e qualidade

- `eslint`: análise estática;
- `prettier`: formatação e compatibilidade entre formatador e linter.

## Aliases de importação

O `tsconfig.json` configura aliases para importar módulos de `src/` sem precisar usar caminhos relativos longos:

| Alias           | Diretório de destino |
| --------------- | -------------------- |
| `@utils/*`      | `src/utils/*`        |
| `@assets/*`     | `src/assets/*`       |
| `@components/*` | `src/components/*`   |
| `@data/*`       | `src/data/*`         |
| `@services/*`   | `src/services/*`     |

Por exemplo, `@utils/calcularIdade` aponta para `src/utils/calcularIdade`. O alias `@services/*` já está configurado; os módulos correspondentes podem ser adicionados em `src/services/` conforme necessário.

## Estrutura de arquivos

```text
.
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Formatação, lint e build em main/dev
│       └── cd.yml                 # Deploy na Netlify a partir de main
├── docs/                          # Documentação funcional e técnica
├── public/                        # Arquivos públicos servidos sem processamento
├── src/
│   ├── actions/                   # Ações do servidor Astro
│   ├── assets/                    # Imagens, ícones e outros recursos importados
│   ├── components/
│   │   ├── ReactComponent/        # Componentes dinâmicos react
│   │   │   ├── *.mocule.css       # Estilização escopada com CSS Modules
│   │   │   └── *.jsx ou *.tsx     # Código fonte do componente React
│   │   └── *.astro                # Componentes Astro reutilizáveis
│   ├── data/                      # Dados usados pela aplicação
│   ├── layouts/                   # Layouts compartilhados
│   ├── pages/                     # Páginas e rotas Astro
│   │   ├── academico/             # Plataforma do aluno e responsável (rotas protegidas)
│   │   └── api/auth/              # Endpoints de cadastro, login e logout
│   ├── services/                  # Serviços executados no servidor (inclui autenticação)
│   ├── utils/                     # Funções utilitárias e validações
│   ├── global.css                 # Estilos globais
│   └── variables.css              # Variáveis CSS globais
...
```

## Autenticação demonstrativa

O cadastro, login e logout usam endpoints Astro no servidor e Netlify Blobs. A autenticação serve apenas para demonstração com dados fictícios; não use com dados pessoais reais nem como solução de produção. Consulte [docs/autenticacao.md](./docs/autenticacao.md) para o fluxo, estrutura de dados, configuração local/Netlify e limitações.

Para testar o fluxo localmente, inicie o ambiente da Netlify:

```bash
npx netlify dev
```

O servidor Astro isolado (`npm run dev`) pode ser usado para páginas sem Blobs, mas não substitui o ambiente local da Netlify para testar a persistência de autenticação.

## Estrutura de branches

- **`main`**: branch de produção. Alterações enviadas para ela acionam o fluxo de deploy na Netlify.
- **`dev`**: branch de integração para reunir e validar mudanças antes da produção.
- **`feature/<nome-da-feature>`**: branch de trabalho para uma funcionalidade. Deve partir de `dev` e, quando concluída, ser integrada a `dev` por pull request.

Fluxo sugerido: `dev` → `feature/<nome-da-feature>` → pull request para `dev` → pull request de `dev` para `main` após validação.

As validações de CI são executadas em pushes e pull requests direcionados a `main` ou `dev`. O deploy de produção é executado em pushes para `main`.

## Ambiente de desenvolvimento

- **Node.js:** versão `>=22.12.0` ([download](https://nodejs.org/pt-br/download));
- **Editor recomendado:** [Visual Studio Code](https://code.visualstudio.com) com as extensões [Astro](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode), [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) e [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

## Instalação e execução

Clone o repositório, acesse a pasta do projeto e instale as dependências:

```bash
npm install
```

Inicie o servidor local do Astro:

```bash
npm run dev
```

Para executar localmente usando o ambiente de desenvolvimento da Netlify, use:

```bash
npx netlify dev
```

## Validação, CI/CD e deploy

Os comandos disponíveis estão definidos em `package.json`:

```bash
npm run format:check  # Verifica a formatação com Prettier
npm run lint          # Analisa o código com ESLint
npm run build         # Executa astro check e gera a build
npm run preview       # Visualiza localmente a build gerada
```
