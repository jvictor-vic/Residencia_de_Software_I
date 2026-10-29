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
  - GET [nome e bandeira](https://countries.dev/countries?fields=name,flag,translations);
  - Docs: [countriesnow.space](https://countries.dev/docs/api/countries)
- Estado => Select:
  - GET [Nome e id](https://servicodados.ibge.gov.br/api/v1/localidades/estados)
  - Docs: [servicodados.ibge.gov.br](https://servicodados.ibge.gov.br/api/docs/localidades#api-UFs)
- Naturalidade (Cidade) => Select:
  - GET [Nome e id](https://servicodados.ibge.gov.br/api/v1/localidades/estados/28/municipios)
  - Docs: [servicodados.ibge.gov.br](https://servicodados.ibge.gov.br/api/v1/localidades#api-Municipios-estadosUFMunicipiosGet)

- Data de Nascimento

- CPF

## Dados do Responsável

- Parentesco => Select:
  - Mãe;
  - Pai;
  - Tio / Tia;
  - Avô / Avó;
  - Diretor de Abrigo;
  - Tutor;

- CPF

- Nome Completo => String;

- Gênero => Select:
  - Homem Cis;
  - Homem Trans;
  - Mulher Cis;
  - Mulher Trans;
  - Não Binário;

- Nome Social (se gênero for diferente de "Homem Cis" ou "Mulher Cis") => String;

- Data de Nascimento

- Email

- Telefone

## Dados Residenciais

- Zona de Moradia => Select:
  - Urbana
  - Rural

- CEP => Number
  - Get [Estado, Municipio, Bairro e Logradouro](https://brasilapi.com.br/docs#tag/CEP-V2)
  - Docs: [brasilapi.com.br](https://brasilapi.com.br/docs#tag/CEP-V2)

- Estado => Preenchido pelo CEP

- Municipio => Preenchido pelo CEP

- Bairro => Preenchido pelo CEP

- Logradouro => String

- Numero (opcional) => Número Inteiro

- Complemento (opcional) => String
