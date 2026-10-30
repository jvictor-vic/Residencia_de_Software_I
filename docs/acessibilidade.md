## Decisões Tomadas

- Tema padrão claro por padrão (diminui efeito halo, importante para pessoas comproblemas de visão, como astigmatismo. Mais facil leitura em ambientes claros);
- Não utilizar gradientes em partes de conteúdo;

## Requisitos de Acessibilidade

- Relações Mínimas de Contraste (WCAG AA e AAA): Manter razão de contraste mínima de 4.5:1, idealmente 7:1;
- Implementar suporte nativo a temas claros e escuros (Dark Mode), oferecendo alternativas para usuários com fotofobia ou sensibilidade à luz;
- Evitar o Uso de Preto Puro sobre Branco Puro, para reduzir fadiga visual e mitigar descon
- Não Depender Exclusivamente da Cor: A cor jamais deve ser a única maneira de transmitir informação, indicar ações, solicitar respostas ou distinguir elementos visuais;
- Adequação para Daltonismo: Projetar interfaces assumindo a incapacidade do usuário de distinguir certos matizes (utilizaremos padrões geométricos com duas cores, mesma matiz diferente luminosidade);
- Simplificação de Fundos: Utilizar fundos de cor sólida, evitando estampas, padrões, listras, gradientes complexos ou imagens de fundo que dificultem o foco no conteúdo em primeiro plano;
- Tipografia de tamanho de fonte minimo 16px sem serifa e espaçamento de texto que obedeça as seguintes propriedades de estilo:
  - Line height (line spacing) to at least 1.5 times the font size;
  - Spacing following paragraphs to at least 2 times the font size;
  - Letter spacing (tracking) to at least 0.12 times the font size;
  - Word spacing to at least 0.16 times the font size.
- Elementos interativos de no mínimo 45px x 45px (acessibilidade para pessoas com controle motor afetado);
- Permitir navegabilidade apenas por teclado;
- Estado de foco (:focus) e de hover (:hover), utilizar bordas de no mínimo 2px solid para identificar elementos ativos;

## Botão de Informação

Componente flutuante / Botão flutuante, permitindo:

- Leitura de Conteudo: Text-To-Voice (TTV) ler o conteúdo, para usuários analfabetos;
- Explicação de Funcionalidade: Explica melhor o que é o conteúdo sendo lido, ou explica como fazer aquilo;
- Leitura de Explicação: Text-To-Voice (TTV) ler a explicação, para usuários analfabetos;

## Instruções

- Utilizar tags semânticas HTML;
- Descrever elementos mais complexos (dificeis de resumir) utilizando aria-description, será útil para:
  - Ferramentas de acessibilidade;
  - Componente Botão de Informação;
- Testar navegação por teclado;
- Checar estados de foco (:focus) e de hover (:hover), utilizar border ou outiline de no mínimo 2px solid para identificar elementos ativos;
- Utilizar padrões geométricos nos background de cores semânticas (cores que identificam algo);

## Referências

- https://www.w3.org/WAI/WCAG22/quickref/?versions=2.1&showtechniques=143#principle1
- https://designsystem.digital.gov/design-tokens/color/overview/#color-and-accessibility
- https://www.accessibility-developer-guide.com/knowledge/
- https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- https://www.accessibility-developer-guide.com/knowledge/
