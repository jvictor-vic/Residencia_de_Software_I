# EducaHub

## Stack e Arquitetura

### Stack de Tecnologias

- **Framework:** [Astro](https://astro.build) - Responsável pela renderização estática, roteamento baseado em arquivos e arquitetura de componentes;
- **Biblioteca:** [ReactJS](https://react.dev) - Utilizado em componentes dinâmicos, e com lógicas mais complexas;
- **Estilização:** CSS Vanilla (para estilos globais e layouts base) e [CSS Modules](https://github.com) (para garantir o escopo local nos componentes React).
- **DevOps:** Versionamento de código com **Git** e **GitHub**. Pipeline **CI/CD** via **GitHub Actions**. Deploy pelo **Netlify**.

---

### Arquitetura de Ilhas / Islands Architecture

A arquitetura do projeto adota o padrão de **Ilhas do Astro**. Isso significa que o site é entregue ao navegador como HTML estático.

As interfaces dinâmicas como os **componentes ReactJS** funcionam como "ilhas" isoladas de interatividade. O JavaScript dos componentes só é carregado e hidratado no cliente apenas quando necessário.

---

### Estrutura de Pastas

```text
src/
├── assets/             # Diretório de mídias estáticas (imagens, videos, etc.)
├── components/
│   ├── react/          # Componentes dinâmicos, estilização por CSS Modules
│   │   ├── Button.jsx
│   │   └── Button.module.css
│   └── astro           # Componentes estáticos, estilização por CSS Vanilla
├── layouts/            # Layouts de tipos de página
├── pages/              # Rotas e páginas da aplicação
├── global.css          # Estilos globais
└── variables.css       # Variáveis css globais
```

---

### Ambiente de Desenvolvimento

Para garantir a consistência do código entre os desenvolvedores, utilizamos o seguinte ecossistema:

- **IDE:** [Visual Studio Code (VSCode)](https://visualstudio.com) com a extensão oficial do **Astro**.
- **Formatação:** [Prettier](https://prettier.io) para padronização automática do estilo de código no salvamento.
- **Controle de Versão:** **Git** para versionamento local e **GitHub** para hospedagem do repositório e colaboração.

---

### CI/CD & Deploy

O projeto possui uma pipeline automatizada de Integração Contínua e Entrega Contínua (CI/CD) acionada a cada alteração ou pull request nas branches principais do GitHub:

1. **Linting:** O [ESLint](https://eslint.org) analisa o código em busca de erros, padrões inadequados ou más práticas.
2. **Test Build:** Uma build de teste (`astro check && astro build`) é executada para validar que o projeto compila perfeitamente sem quebras de tipagem ou sintaxe.
3. **Deploy Automatizado:** Após a pipeline de validação, o deploy é realizado automaticamente na **Netlify** através do adaptador oficial `@astrojs/netlify`.

## Pré requisitos, Instalação e Execução

### Pré requisitos

#### Obrigatório

- **[Node.js](https://nodejs.org/pt-br/download)** >=22.12.0
- **[Extensão "Astro" para VSCode](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode)**

#### Recomendados

- **[Extensão "Prettier" para VSCode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)**
- **[Extensão "ESLint" para VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)**

### Instalação

Para instalar os pacotes localmente execute no terminal

```bash
npm install
```

### Execução do Ambiente de Desenvolvimento

Para subir o servidor de documento execute no terminal

```bash
npm run dev
# ou
npm run dev -- --host
# para expor servidor para outros dispositivos na rede, útil para acessar pelo celular
```
