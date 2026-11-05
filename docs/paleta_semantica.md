# Paleta Semântica

- **Descrição:** Paleta de cores semânticas e padrões de fundo para identificar os canais de mensagem e aviso (seduc, coordenação/direção, matérias).

- **Justificativa:** Facilita a identificação da origem das mensagens ou avisos. Permite identificar a origem sem precisar ler o título ou identificação do autor. Os padrões de fundo permitem que usuários com dificuldade em processar cores (como pessoas daltônicas ou com acromatopsia, portadores de Transtorno do Processamento Sensorial).

## Implementação

1. Foi definido valores iniciais de **matiz**, **saturação** e **luminosidade**.
   - **Cor Clara**: hsl(0, 70%, 65%);
   - **Cor Escura**: hsl(0, 70%, 35%);

2. Depois foi feito a rotação da matiz com passo 20°. Resultando em 17 matizes diferentes;

3. Cada par de cor foi atribuido a um id de 00 a 16, e adicionado ao [variables.css](src\variables.css) como `--id--nn-bg` e `--id--nn-fg`;

4. Atribuimos classe `.pattern-id-nn` para cada id e adicionamos um padrão de fundo nos [estilos globais](src\global.css). Utilizamos de referência padrões de dois tons de [css-pattern.com](https://css-pattern.com/);

5. Criamos a função [getIDsemantico](src\utils\getIDsemantico.ts) como camada de abstração para receber as variáveis das cores semânticas e classe com o padrão de fundo utilizando os nomes das referências.

### Motivo

- Decompor cores, padrões e abstração para simplificar o fluxo e permitir o reuso em outros contextos.
- Abstrair a utilização para manter a lógica com código limpo e simples de manter ou modificar. Cada id é atribuido uma referencia que pode ser substituida ou incrementada.

## Utilizando a paleta semântica

Importar o [getIDsemantico](src\utils\getIDsemantico.ts), passar a referencia para função `getIDsemantico(referencia)`.
A função retorna um objeto com três valores:

- bg: variável css da cor de plano de fundo;
- fg: variável css da cor do primeiro plano;
- pattern: classe css com o padrão de fundo;

### Referências de cada id

- seduc => 00
- espanhol => 01
- historia => 02
- quimica => 03
- biologia => 04
- edf => 05
- escola (Coordenação/Direção) => 06
- filosofia => 07
- geografia => 08
- ciencias => 09
- sociologia => 10
- ingles => 11
- fisica => 12
- arte => 13
- portugues => 14
- religioso => 15
- matematica => 16

### Exemplo: aplicando o padrão de fundo em um container

Em um componente Astro, use `pattern` como classe CSS e aplique as cores retornadas pela função:

```astro
---
import getIDsemantico from '../utils/getIDsemantico';

const estiloSemantico = getIDsemantico('escola');
---

<div
  class={estiloSemantico.pattern}
  style={`background-color: ${estiloSemantico.bg}; color: ${estiloSemantico.fg};`}
>
  Aviso da coordenação
</div>
```
