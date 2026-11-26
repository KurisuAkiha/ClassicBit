// Fuente pixelada 3x5 para los textos dentro del canvas (mayúsculas, números y signos).
const FUENTE = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '111101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101111011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
  4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010',
  8: '111101111101111', 9: '111101111001110',
  '!': '010010010000010', '-': '000000111000000', ':': '000010000010000', '.': '000000000000010',
  '>': '100010001010100', '<': '001010100010001', '?': '110001010000010', '/': '001001010100100',
};

function pasada(ctx, str, x, y, esc, color) {
  ctx.fillStyle = color;
  let cx = x;
  for (const ch of str) {
    const g = FUENTE[ch];
    if (g) {
      for (let i = 0; i < 15; i++) {
        if (g[i] === '1') ctx.fillRect(cx + (i % 3) * esc, y + Math.floor(i / 3) * esc, esc, esc);
      }
    }
    cx += 4 * esc;
  }
}

export const anchoTexto = (str, esc) => str.length * 4 * esc - esc;

export function texto(ctx, str, x, y, esc, color, sombra = '#06030d') {
  if (sombra) pasada(ctx, str, x + esc, y + esc, esc, sombra);
  pasada(ctx, str, x, y, esc, color);
}

export function textoCentrado(ctx, ancho, str, y, esc, color, sombra) {
  texto(ctx, str, Math.round((ancho - anchoTexto(str, esc)) / 2), y, esc, color, sombra);
}

// Alineado a la derecha: `xDer` es el borde derecho del texto
export function textoDerecha(ctx, str, xDer, y, esc, color, sombra) {
  texto(ctx, str, xDer - anchoTexto(str, esc), y, esc, color, sombra);
}
