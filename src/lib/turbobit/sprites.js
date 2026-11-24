// Sprites pixel art de Turbo Bit.
// Cada fila solo describe la mitad IZQUIERDA del sprite; el render la espeja.
//   .  transparente   k  contorno   b  carrocería   d  carrocería oscura
//   x  detalle        w  ventana    h  faro         r  luz trasera
//   t  llanta         g/G remolque

export const ANCHO_COCHE = 12;

export const COLORES_COCHE = {
  amarillo: { b: '#ffd23f', d: '#d9a514', x: '#ff4fa3' }, // jugador
  rosa:     { b: '#ff4fa3', d: '#c2306f', x: '#ffa3d0' },
  azul:     { b: '#2ea8ff', d: '#1b6fb3', x: '#9adcff' },
  verde:    { b: '#47ff9a', d: '#1fa862', x: '#b4ffd7' },
  morado:   { b: '#8b3dff', d: '#5a22b3', x: '#c9a6ff' },
  blanco:   { b: '#f3eaff', d: '#a998c9', x: '#ffffff' },
  rojo:     { b: '#ff5a4f', d: '#b3322a', x: '#ffb0aa' },
};

export const COLORES_ENEMIGOS = ['rosa', 'azul', 'verde', 'morado', 'blanco', 'rojo'];

export const PALETA_FIJA = {
  k: '#120820', t: '#06030d', w: '#8fdcff', h: '#ffffff',
  r: '#ff3b3b', g: '#d9d2ec', G: '#9d90c4',
};

const rep = (fila, n) => Array(n).fill(fila);

const FRONTAL = ['..kkkk', '.kbbbb', '.khbbb', 'tkbbbb', 'tkbxbb', 'tkbbbb'];
const PARABRISAS = ['.kwwww', '.kwwww'];
const TRASERA = ['.krrbb', '.kkkkk', '..kkkk'];

// Remolque del camión: 14 filas de láminas con llantas
const remolque = [];
for (let i = 0; i < 14; i++) {
  const llanta = (i >= 3 && i <= 5) || (i >= 9 && i <= 11);
  remolque.push((llanta ? 't' : '.') + 'k' + (i % 2 ? 'GGGG' : 'gggg'));
}

export const MODELOS = {
  sedan: {
    filas: [
      ...FRONTAL, ...PARABRISAS,
      ...rep('.kdddd', 3), '.kwwww',
      '.kbbbb', 'tkbbbb', 'tkbbbb', 'tkbbbb', '.kbbbb',
      ...TRASERA,
    ],
  },
  camioneta: {
    filas: [
      ...FRONTAL, ...PARABRISAS,
      '.kdddd', 'tkdddd', 'tkdddd', '.kdxdd', '.kdddd', '.kdddd', 'tkdddd', 'tkdddd', '.kdddd', '.kdddd',
      ...TRASERA,
    ],
  },
  camion: {
    filas: [
      ...FRONTAL, ...PARABRISAS, '.kbbbb', '.kbbbb', '..kkkk',
      ...remolque,
      ...TRASERA,
    ],
  },
};

export const altoModelo = (m) => MODELOS[m].filas.length;

// Decoración de los costados (cada una con su propia paleta)
export const DECOR = {
  arbol: {
    pal: { k: '#0a3524', g: '#1f7a4d', l: '#3fbf7a' },
    filas: [
      '...kkk', '..kggg', '.kgggg', '.kggll', 'kgglll', 'kgglll',
      'kggggl', 'kggggg', '.kgggg', '.kkggg', '..kkkk', '....kk',
    ],
  },
  arbusto: {
    pal: { k: '#0a3524', g: '#1f7a4d', l: '#3fbf7a' },
    filas: ['..kk', '.kgg', 'kggl', 'kggl', '.kgg', '..kk'],
  },
  roca: {
    pal: { k: '#120820', s: '#8d86a6', S: '#5c5578' },
    filas: ['.kk', 'kss', 'ksS', '.kk'],
  },
};

export const TAM_DECOR = { arbol: [12, 12], arbusto: [8, 6], roca: [6, 4] };
