// Geometría de la pantalla de Tres en raya (canvas de 192 x 144).
// La usan el motor (para saber dónde se toca) y el render (para dibujar).
export const W = 192;
export const H = 144;

export const CELDA = 30;
export const LINEA = 2;
export const PASO = CELDA + LINEA;
export const TABLERO = { x: 12, y: 28, tam: 3 * CELDA + 2 * LINEA };

export const celdaRect = (i) => ({
  x: TABLERO.x + (i % 3) * PASO,
  y: TABLERO.y + Math.floor(i / 3) * PASO,
  w: CELDA,
  h: CELDA,
});

// Botones del panel derecho
export const BOTONES = {
  otra: { x: 122, y: 90, w: 58, h: 14 },
  menu: { x: 122, y: 106, w: 58, h: 14 },
};

// Opciones del menú: 0 = dos jugadores, 1 = contra la IA
export const OPCIONES = [
  { x: 26, y: 40, w: 140, h: 30 },
  { x: 26, y: 78, w: 140, h: 30 },
];

export const dentro = (r, x, y) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

// Casilla (0-8) que corresponde a un punto del canvas, o -1 si cae fuera del tablero.
// Las líneas entre casillas cuentan como parte de la casilla de arriba/izquierda.
export function celdaEn(x, y) {
  const rx = x - TABLERO.x;
  const ry = y - TABLERO.y;
  if (rx < 0 || ry < 0 || rx >= TABLERO.tam || ry >= TABLERO.tam) return -1;
  return Math.min(2, Math.floor(ry / PASO)) * 3 + Math.min(2, Math.floor(rx / PASO));
}

export function opcionEn(x, y) {
  return OPCIONES.findIndex((r) => dentro(r, x, y));
}
