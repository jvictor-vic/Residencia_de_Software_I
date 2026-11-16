import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { media, percentual, situacaoNota } from './moduloDomain.ts';

describe('regras demonstrativas dos módulos', () => {
  it('calcula média aritmética e trata zero como nota válida', () => {
    assert.equal(media([0, 6, 9]), 5);
    assert.equal(media([8, 9]), 8.5);
  });

  it('ignora unidades vazias e mantém resultado vazio quando não há nota', () => {
    assert.equal(media([null, 7, null]), 7);
    assert.equal(media([null, null]), null);
  });

  it('classifica a média mínima 6 e valores abaixo dela', () => {
    assert.equal(situacaoNota(null), 'sem-nota');
    assert.equal(situacaoNota(5.9), 'recuperacao');
    assert.equal(situacaoNota(6), 'aprovado');
  });

  it('calcula percentual sem dividir por zero', () => {
    assert.equal(percentual(3, 4), 75);
    assert.equal(percentual(0, 0), 100);
  });
});
