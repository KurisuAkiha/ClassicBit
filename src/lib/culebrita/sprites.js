// Sprites pixel art de Culebrita 2.0 (cada celda del tablero mide 8x8 píxeles).
//   k contorno   b base   l brillo   d sombra
//   w blanco     p pupila  r rojo     R rojo oscuro   h brillo fruta
//   g hoja       y dorado  Y dorado oscuro   s piedra   S piedra oscura

export const PALETA = {
  k: '#0b4a2c', b: '#2bd47a', l: '#7dffb8', d: '#1c9e5a',
  w: '#ffffff', p: '#120820',
  r: '#ff3b4f', R: '#b3122e', h: '#ffb3bd',
  g: '#47ff9a', n: '#7a4a12',
  y: '#ffd23f', Y: '#ff9f1c',
  s: '#8d86a6', S: '#5c5578', z: '#3a2f66',
};

// Cuerpo: dos tonos que se alternan para que se note la segmentación
export const CUERPO_A = [
  '.kkkkkk.', 'kllbbbbk', 'klbbbbdk', 'kbbbbbdk',
  'kbbbbbdk', 'kbbbbddk', 'kbdddddk', '.kkkkkk.',
];
export const CUERPO_B = [
  '.kkkkkk.', 'kbbbbbbk', 'kbbbbbdk', 'kbbbbddk',
  'kbbbbddk', 'kbbddddk', 'kddddddk', '.kkkkkk.',
];
// Paleta alternativa para el cuerpo B (un verde un poco más oscuro)
export const PALETA_B = { b: '#25bd6d', l: '#5ff0a0', d: '#178a4f' };

// Cabeza mirando hacia ARRIBA; el render la gira para las otras direcciones
export const CABEZA = [
  '.kkkkkk.', 'klbbbblk', 'kwwbbwwk', 'kwpbbpwk',
  'kbbbbbbk', 'kbbllbbk', 'kbdddddk', '.kkkkkk.',
];
// La cabeza es un verde más claro que el cuerpo
export const PALETA_CABEZA = { b: '#47ff9a', l: '#c4ffe0', d: '#2bd47a' };

export const FRUTAS_SPRITES = {
  manzana: [
    '....ng..', '..rrnrr.', '.rhrrrrR', '.rhrrrrR',
    '.rrrrrrR', '.rrrrrRR', '..rrrRR.', '...RR...',
  ],
  cereza: [
    '....nng.', '...n..n.', '..n...n.', '.rrr.rrr',
    'rhrRrhrR', 'rrrRrrrR', '.rRR.rRR', '........',
  ],
  estrella: [
    '...yy...', '...yy...', 'yyyyyyyy', '.yyhhyy.',
    '..yyyy..', '..yYYy..', '.yy..yy.', '.y....y.',
  ],
};

export const ROCA = [
  '..zzzz..', '.zsssSz.', 'zsssssSz', 'zssssSSz',
  'zssSSSSz', 'zsSSSSSz', '.zSSSSz.', '..zzzz..',
];

// Información de cada coleccionable
export const FRUTAS = {
  manzana:  { puntos: 10, crece: 1, color: '#ff3b4f' },
  cereza:   { puntos: 25, crece: 2, color: '#ff4fa3' },
  estrella: { puntos: 50, crece: 0, color: '#ffd23f' },
};
