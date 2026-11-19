import iconSeduc from '@assets/icons/materias/seduc.svg';
import iconEspanhol from '@assets/icons/materias/espanhol.svg';
import iconHistoria from '@assets/icons/materias/historia.svg';
import iconQuimica from '@assets/icons/materias/quimica.svg';
import iconBiologia from '@assets/icons/materias/biologia.svg';
import iconEdf from '@assets/icons/materias/edf.svg';
import iconEscola from '@assets/icons/materias/escola.svg';
import iconFilosofia from '@assets/icons/materias/filosofia.svg';
import iconGeografia from '@assets/icons/materias/geografia.svg';
import iconCiencias from '@assets/icons/materias/ciencias.svg';
import iconSociologia from '@assets/icons/materias/sociologia.svg';
import iconIngles from '@assets/icons/materias/ingles.svg';
import iconFisica from '@assets/icons/materias/fisica.svg';
import iconArte from '@assets/icons/materias/arte.svg';
import iconPortugues from '@assets/icons/materias/portugues.svg';
import iconReligioso from '@assets/icons/materias/religioso.svg';
import iconMatematica from '@assets/icons/materias/matemática.svg';

export const CANAIS_AVISO = [
  'seduc',
  'espanhol',
  'historia',
  'quimica',
  'biologia',
  'edf',
  'escola',
  'filosofia',
  'geografia',
  'ciencias',
  'sociologia',
  'ingles',
  'fisica',
  'arte',
  'portugues',
  'religioso',
  'matematica',
] as const;

export type options = (typeof CANAIS_AVISO)[number];

export default function getIDsemantico(referencia: options) {
  switch (referencia) {
    case 'seduc':
      return {
        canal: 'Secretaria Estadual',
        bg: 'var(--id-00-bg)',
        fg: 'var(--id-00-fg)',
        pattern: 'pattern-id-00',
        icon: iconSeduc,
      };
    case 'espanhol':
      return {
        canal: 'Lingua Espanhola',
        bg: 'var(--id-01-bg)',
        fg: 'var(--id-01-fg)',
        pattern: 'pattern-id-01',
        icon: iconEspanhol,
      };
    case 'historia':
      return {
        canal: 'História',
        bg: 'var(--id-02-bg)',
        fg: 'var(--id-02-fg)',
        pattern: 'pattern-id-02',
        icon: iconHistoria,
      };
    case 'quimica':
      return {
        canal: 'Química',
        bg: 'var(--id-03-bg)',
        fg: 'var(--id-03-fg)',
        pattern: 'pattern-id-03',
        icon: iconQuimica,
      };
    case 'biologia':
      return {
        canal: 'Biologia',
        bg: 'var(--id-04-bg)',
        fg: 'var(--id-04-fg)',
        pattern: 'pattern-id-04',
        icon: iconBiologia,
      };
    case 'edf':
      return {
        canal: 'Educação Física',
        bg: 'var(--id-05-bg)',
        fg: 'var(--id-05-fg)',
        pattern: 'pattern-id-05',
        icon: iconEdf,
      };
    case 'escola':
      return {
        canal: 'Coordenação',
        bg: 'var(--id-06-bg)',
        fg: 'var(--id-06-fg)',
        pattern: 'pattern-id-06',
        icon: iconEscola,
      };
    case 'filosofia':
      return {
        canal: 'Filosofia',
        bg: 'var(--id-07-bg)',
        fg: 'var(--id-07-fg)',
        pattern: 'pattern-id-07',
        icon: iconFilosofia,
      };
    case 'geografia':
      return {
        canal: 'Geografia',
        bg: 'var(--id-08-bg)',
        fg: 'var(--id-08-fg)',
        pattern: 'pattern-id-08',
        icon: iconGeografia,
      };
    case 'ciencias':
      return {
        canal: 'Ciências',
        bg: 'var(--id-09-bg)',
        fg: 'var(--id-09-fg)',
        pattern: 'pattern-id-09',
        icon: iconCiencias,
      };
    case 'sociologia':
      return {
        canal: 'Sociologia',
        bg: 'var(--id-10-bg)',
        fg: 'var(--id-10-fg)',
        pattern: 'pattern-id-10',
        icon: iconSociologia,
      };
    case 'ingles':
      return {
        canal: 'Lingua Inglesa',
        bg: 'var(--id-11-bg)',
        fg: 'var(--id-11-fg)',
        pattern: 'pattern-id-11',
        icon: iconIngles,
      };
    case 'fisica':
      return {
        canal: 'Física',
        bg: 'var(--id-12-bg)',
        fg: 'var(--id-12-fg)',
        pattern: 'pattern-id-12',
        icon: iconFisica,
      };
    case 'arte':
      return {
        canal: 'Artes',
        bg: 'var(--id-13-bg)',
        fg: 'var(--id-13-fg)',
        pattern: 'pattern-id-13',
        icon: iconArte,
      };
    case 'portugues':
      return {
        canal: 'Lingua Portuguesa',
        bg: 'var(--id-14-bg)',
        fg: 'var(--id-14-fg)',
        pattern: 'pattern-id-14',
        icon: iconPortugues,
      };
    case 'religioso':
      return {
        canal: 'Ensino Religioso',
        bg: 'var(--id-15-bg)',
        fg: 'var(--id-15-fg)',
        pattern: 'pattern-id-15',
        icon: iconReligioso,
      };
    case 'matematica':
      return {
        canal: 'Matemática',
        bg: 'var(--id-16-bg)',
        fg: 'var(--id-16-fg)',
        pattern: 'pattern-id-16',
        icon: iconMatematica,
      };
  }
}
