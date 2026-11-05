# Exemplos de usuários

Cada pessoa tem uma conta única em `accounts/<CPF>`. A conta guarda as
credenciais, os papéis, os dados pessoais compartilhados e os perfis específicos
dos papéis. Os papéis permitidos atualmente são `aluno` e `responsavel`; cada
papel listado precisa ter seu perfil correspondente. Os exemplos usam CPFs e
hashes fictícios.

Nome completo, gênero, data de nascimento e nome social são dados da pessoa,
armazenados uma só vez em `dadosPessoais`. Residência, dados acadêmicos e vínculo
com outro responsável são específicos do perfil de aluno; contatos e tutelados
são específicos do perfil de responsável.

## Aluno menor de idade

O aluno e seu responsável têm contas próprias, pois cada pessoa faz login com
seu CPF. O perfil do aluno referencia a conta do responsável:

```text
accounts/<CPF_ALUNO>
{
  "cpf": "<CPF_ALUNO>",
  "senhaHash": "<hash gerado pelo servidor>",
  "papeis": ["aluno"],
  "dadosPessoais": {
    "nomeCompleto": "Estudante de Exemplo",
    "genero": "Não-Binário",
    "nomeSocial": "Alex",
    "dataNascimento": "2012-05-10"
  },
  "perfis": {
    "aluno": {
      "corRaca": "Parda",
      "nacionalidade": "Brasil",
      "estadoNatal": "SP",
      "naturalidade": "São Paulo",
      "residencia": {
        "zonaMoradia": "Urbana",
        "cep": "01000-000",
        "estadoResidencial": "SP",
        "municipioResidencial": "São Paulo",
        "bairroResidencial": "Centro",
        "logradouro": "Rua de Exemplo",
        "numero": "10"
      },
      "responsavel": {
        "cpfContaRelacionada": "<CPF_RESPONSAVEL>",
        "parentesco": "Mãe"
      },
      "academico": [],
      "avisos": []
    }
  }
}
```

O responsável tem seu próprio documento de conta e perfil:

```text
accounts/<CPF_RESPONSAVEL>
{
  "cpf": "<CPF_RESPONSAVEL>",
  "senhaHash": "<hash gerado pelo servidor>",
  "papeis": ["responsavel"],
  "dadosPessoais": {
    "nomeCompleto": "Responsável de Exemplo",
    "genero": "Mulher Cis",
    "dataNascimento": "1985-03-22"
  },
  "perfis": {
    "responsavel": {
      "telefone": "(11) 99999-0000",
      "email": "responsavel@example.test",
      "tutelados": [
        {
          "cpfContaRelacionada": "<CPF_ALUNO>",
          "parentesco": "Mãe"
        }
      ],
      "avisos": []
    }
  }
}
```

## Aluno adulto e responsável

Quando o aluno tem 18 anos completos ou mais, uma só conta e um só login reúnem
os dois papéis. Os dados pessoais compartilhados aparecem uma vez, e cada papel
mantém apenas seus campos específicos:

```text
accounts/<CPF_ADULTO>
{
  "cpf": "<CPF_ADULTO>",
  "senhaHash": "<hash gerado pelo servidor>",
  "papeis": ["aluno", "responsavel"],
  "dadosPessoais": {
    "nomeCompleto": "Estudante Adulto de Exemplo",
    "genero": "Homem Cis",
    "dataNascimento": "2000-08-15"
  },
  "perfis": {
    "aluno": {
      "corRaca": "Branca",
      "nacionalidade": "Brasil",
      "estadoNatal": "SP",
      "naturalidade": "São Paulo",
      "residencia": {
        "zonaMoradia": "Urbana",
        "cep": "01000-000",
        "estadoResidencial": "SP",
        "municipioResidencial": "São Paulo",
        "bairroResidencial": "Centro",
        "logradouro": "Rua de Exemplo",
        "numero": "20"
      },
      "academico": [],
      "avisos": []
    },
    "responsavel": {
      "telefone": "(11) 99999-0001",
      "email": "aluno@example.test",
      "tutelados": [],
      "avisos": []
    }
  }
}
```

`<CPF_...>` e os demais valores são marcadores ilustrativos, não dados válidos
para autenticação. No cadastro, o servidor valida e normaliza os CPFs e gera o
hash da senha; não envie ou armazene a senha em texto puro.
