type options =
  | 'seduc'
  | 'espanhol'
  | 'historia'
  | 'quimica'
  | 'biologia'
  | 'edf'
  | 'escola'
  | 'filosofia'
  | 'geografia'
  | 'ciencias'
  | 'sociologia'
  | 'ingles'
  | 'fisica'
  | 'arte'
  | 'portugues'
  | 'religioso'
  | 'matematica';

export default function getIDsemantico(referencia: options) {
  switch (referencia) {
    case 'seduc':
      return {
        bg: 'var(--id-00-bg)',
        fg: 'var(--id-00-fg)',
        pattern: 'pattern-id-00',
      };
    case 'espanhol':
      return {
        bg: 'var(--id-01-bg)',
        fg: 'var(--id-01-fg)',
        pattern: 'pattern-id-01',
      };
    case 'historia':
      return {
        bg: 'var(--id-02-bg)',
        fg: 'var(--id-02-fg)',
        pattern: 'pattern-id-02',
      };
    case 'quimica':
      return {
        bg: 'var(--id-03-bg)',
        fg: 'var(--id-03-fg)',
        pattern: 'pattern-id-03',
      };
    case 'biologia':
      return {
        bg: 'var(--id-04-bg)',
        fg: 'var(--id-04-fg)',
        pattern: 'pattern-id-04',
      };
    case 'edf':
      return {
        bg: 'var(--id-05-bg)',
        fg: 'var(--id-05-fg)',
        pattern: 'pattern-id-05',
      };
    case 'escola':
      return {
        bg: 'var(--id-06-bg)',
        fg: 'var(--id-06-fg)',
        pattern: 'pattern-id-06',
      };
    case 'filosofia':
      return {
        bg: 'var(--id-07-bg)',
        fg: 'var(--id-07-fg)',
        pattern: 'pattern-id-07',
      };
    case 'geografia':
      return {
        bg: 'var(--id-08-bg)',
        fg: 'var(--id-08-fg)',
        pattern: 'pattern-id-08',
      };
    case 'ciencias':
      return {
        bg: 'var(--id-09-bg)',
        fg: 'var(--id-09-fg)',
        pattern: 'pattern-id-09',
      };
    case 'sociologia':
      return {
        bg: 'var(--id-10-bg)',
        fg: 'var(--id-10-fg)',
        pattern: 'pattern-id-10',
      };
    case 'ingles':
      return {
        bg: 'var(--id-11-bg)',
        fg: 'var(--id-11-fg)',
        pattern: 'pattern-id-11',
      };
    case 'fisica':
      return {
        bg: 'var(--id-12-bg)',
        fg: 'var(--id-12-fg)',
        pattern: 'pattern-id-12',
      };
    case 'arte':
      return {
        bg: 'var(--id-13-bg)',
        fg: 'var(--id-13-fg)',
        pattern: 'pattern-id-13',
      };
    case 'portugues':
      return {
        bg: 'var(--id-14-bg)',
        fg: 'var(--id-14-fg)',
        pattern: 'pattern-id-14',
      };
    case 'religioso':
      return {
        bg: 'var(--id-15-bg)',
        fg: 'var(--id-15-fg)',
        pattern: 'pattern-id-15',
      };
    case 'matematica':
      return {
        bg: 'var(--id-16-bg)',
        fg: 'var(--id-16-fg)',
        pattern: 'pattern-id-16',
      };
  }
}
