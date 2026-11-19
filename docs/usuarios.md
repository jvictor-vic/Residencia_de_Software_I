# Exemplos de usuários

Cada pessoa tem uma conta única em `accounts/<CPF>`. A conta guarda as
credenciais, os papéis, os dados pessoais compartilhados e os perfis específicos
dos papéis. Os papéis permitidos são `aluno`, `responsavel`, `professor`,
`escola` e `secretaria`; os exemplos abaixo detalham os perfis de aluno e
responsável. Cada papel listado precisa ser reconhecido pelo sistema. Os
exemplos usam CPFs e hashes fictícios.

Nome completo, gênero, data de nascimento e nome social são dados da pessoa,
armazenados uma só vez em `dadosPessoais`. Residência, dados acadêmicos e vínculo
com outro responsável são específicos do perfil de aluno; contatos e tutelados
são específicos do perfil de responsável.

Avisos acadêmicos ficam somente em `perfis.aluno.avisos`, no perfil do aluno a
que se destinam. Cada item contém `id`, `canal`, `titulo`, `descricao` e `data`
(data ISO `AAAA-MM-DD`); o canal usa uma das opções definidas em
`getIDsemantico`. O responsável consulta os avisos dos alunos sob tutela sem
copiá-los para seu próprio perfil. Se a mesma conta também tiver perfil de
aluno, seus avisos próprios aparecem junto aos dos tutelados.
O campo `perfis.responsavel.avisos` que ainda aparece nos exemplos antigos não
deve conter cópias desses avisos acadêmicos; a página considera os registros dos
perfis de aluno.

> Usuários aleatórios gerados usando scripts e um agente de IA

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

# Usuários de Teste

> **Somente para desenvolvimento e testes.** Estes dados são fictícios. Ao
> iniciar `npx netlify dev`, o projeto cria as contas automaticamente no Blobs
> local, com as senhas armazenadas como hashes. As chaves existentes nunca são
> sobrescritas; se houver dados diferentes usando esses CPFs, o seed falha para
> permitir revisão manual. Não reutilize as senhas em outros ambientes.

## Helena dos Santos e Miguel dos Santos

Helena tem 27 anos, está matriculada no 8º ano pela modalidade EJA e também
possui o papel de responsável. Miguel, seu filho de 7 anos, tem uma conta
própria de aluno. Os dois perfis se relacionam pelo CPF:

| Usuário           | CPF de teste (login) | Senha de teste |
| ----------------- | -------------------- | -------------- |
| Helena dos Santos | `00650731506`        | `pRJ4xjs@C#YJ` |
| Miguel dos Santos | `54622849933`        | `gSfj#Kto4XWS` |

As senhas respeitam as regras atuais de cadastro. Os CPFs foram gerados para
testes e possuem dígitos verificadores válidos.

```text
accounts/00650731506
{
  "cpf": "00650731506",
  "senhaHash": "<hash gerado pelo servidor a partir da senha de teste>",
  "papeis": ["aluno", "responsavel"],
  "dadosPessoais": {
    "nomeCompleto": "Helena dos Santos",
    "genero": "Mulher Cis",
    "dataNascimento": "1999-02-14"
  },
  "perfis": {
    "aluno": {
      "corRaca": "Parda",
      "nacionalidade": "Brasil",
      "estadoNatal": "SE",
      "naturalidade": "Aracaju",
      "residencia": {
        "zonaMoradia": "Urbana",
        "cep": "49000-000",
        "estadoResidencial": "SE",
        "municipioResidencial": "Aracaju",
        "bairroResidencial": "Centro",
        "logradouro": "Rua de Teste",
        "numero": "100"
      },
      "academico": [
        {
          "anoLetivo": 2026,
          "modalidade": "EJA",
          "etapa": "Ensino Fundamental - 8º ano",
          "situacao": "Matriculada",
          "escola": "Escola Municipal de Teste"
        }
      ],
      "avisos": []
    },
    "responsavel": {
      "telefone": "(79) 90000-0000",
      "email": "helena@example.test",
      "tutelados": [
        {
          "cpfContaRelacionada": "54622849933",
          "parentesco": "Mãe"
        }
      ],
      "avisos": []
    }
  }
}

accounts/54622849933
{
  "cpf": "54622849933",
  "senhaHash": "<hash gerado pelo servidor a partir da senha de teste>",
  "papeis": ["aluno"],
  "dadosPessoais": {
    "nomeCompleto": "Miguel dos Santos",
    "genero": "Homem Cis",
    "dataNascimento": "2019-03-08"
  },
  "perfis": {
    "aluno": {
      "corRaca": "Parda",
      "nacionalidade": "Brasil",
      "estadoNatal": "SE",
      "naturalidade": "Aracaju",
      "residencia": {
        "zonaMoradia": "Urbana",
        "cep": "49000-000",
        "estadoResidencial": "SE",
        "municipioResidencial": "Aracaju",
        "bairroResidencial": "Centro",
        "logradouro": "Rua de Teste",
        "numero": "100"
      },
      "responsavel": {
        "cpfContaRelacionada": "00650731506",
        "parentesco": "Mãe"
      },
      "academico": [],
      "avisos": []
    }
  }
}
```
