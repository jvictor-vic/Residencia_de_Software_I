## Dados Pessoais do Aluno

- Nome Completo => String;

- Gênero => Select:
  - Homem Cis;
  - Homem Trans;
  - Mulher Cis;
  - Mulher Trans;
  - Não Binário;

- Nome Social (se gênero for diferente de "Homem Cis" ou "Mulher Cis") => String;

- Cor / Raça => Select:
  - Amarela;
  - Branca;
  - Indígena;
  - Parda;
  - Preta;

- Nacionalidade (país) => Select:
  - GET [nome e bandeira](https://countriesnow.space/api/v0.1/countries/flag/images);
  - Docs: [countriesnow.space](https://documenter.getpostman.com/view/1134062/T1LJjU52#5de05268-5370-48c5-a812-93b4959fd91c)
- Estado => Select:
  - GET [Nome e id](https://servicodados.ibge.gov.br/api/v1/localidades/estados)
  - Docs: [servicodados.ibge.gov.br](https://servicodados.ibge.gov.br/api/docs/localidades#api-UFs)
  - Naturalidade (Cidade) => Select:
  - GET [Nome](https://servicodados.ibge.gov.br/api/v1/localidades/estados/28/municipios)
  - Docs: [servicodados.ibge.gov.br](https://servicodados.ibge.gov.br/api/v1/localidades#api-Municipios-estadosUFMunicipiosGet)

- Data de Nascimento

- CPF
