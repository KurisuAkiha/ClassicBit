// Inteligencia artificial de Tres en raya.
// Es competente pero no perfecta: casi siempre gana cuando puede y bloquea cuando
// debe, juega bien la estrategia la mayor parte del tiempo y de vez en cuando falla.
// Así puede ganarte, pero también puede perder.

export const LINEAS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// Probabilidades (ajustadas con simulaciones, ver pruebas)
export const NIVEL = {
  ganar: 0.9,        // aprovecha una victoria inmediata
  bloquear: 0.78,    // bloquea una victoria inmediata del rival
  estrategia: 0.55,  // juega el mejor movimiento (si no, juega una casilla libre al azar)
};

const otro = (j) => (j === 'X' ? 'O' : 'X');
const libres = (t) => t.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);

export function ganadorDe(t) {
  for (const l of LINEAS) {
    const [a, b, c] = l;
    if (t[a] && t[a] === t[b] && t[a] === t[c]) return { ganador: t[a], linea: l };
  }
  return t.every(Boolean) ? { ganador: 'empate', linea: null } : null;
}

// Casillas donde `jugador` ganaría de inmediato
export function jugadasGanadoras(t, jugador) {
  return libres(t).filter((i) => {
    const copia = t.slice();
    copia[i] = jugador;
    const r = ganadorDe(copia);
    return r && r.ganador === jugador;
  });
}

// Minimax completo (el tablero es pequeño): +1 gana `yo`, -1 gana el rival, 0 empate.
// Se memoriza cada posición, así que solo se calcula una vez.
const memo = new Map();

function valor(t, turno, yo) {
  const clave = t.map((v) => v || '-').join('') + turno + yo;
  if (memo.has(clave)) return memo.get(clave);

  let resultado;
  const r = ganadorDe(t);
  if (r) {
    resultado = r.ganador === 'empate' ? 0 : r.ganador === yo ? 1 : -1;
  } else {
    resultado = turno === yo ? -2 : 2;
    for (const i of libres(t)) {
      t[i] = turno;
      const v = valor(t, otro(turno), yo);
      t[i] = null;
      resultado = turno === yo ? Math.max(resultado, v) : Math.min(resultado, v);
    }
  }
  memo.set(clave, resultado);
  return resultado;
}

// Preferencia de posición para variar las aperturas: centro y esquinas antes que bordes
const PESO = [3, 1, 3, 1, 4, 1, 3, 1, 3];

function pesada(lista, azar) {
  const total = lista.reduce((a, i) => a + PESO[i], 0);
  let r = azar() * total;
  for (const i of lista) { r -= PESO[i]; if (r <= 0) return i; }
  return lista[lista.length - 1];
}

function mejorMovimiento(t, yo, azar) {
  let mejorV = -2;
  let candidatas = [];
  for (const i of libres(t)) {
    const copia = t.slice();
    copia[i] = yo;
    const v = valor(copia, otro(yo), yo);
    if (v > mejorV) { mejorV = v; candidatas = [i]; } else if (v === mejorV) candidatas.push(i);
  }
  return pesada(candidatas, azar);
}

const aleatoria = (lista, azar) => lista[Math.floor(azar() * lista.length)];

/**
 * Devuelve la casilla (0-8) donde juega `yo` ('X' u 'O').
 * `azar` es opcional (por defecto Math.random) para poder probarla de forma determinista.
 */
export function elegirJugadaIA(tablero, yo, azar = Math.random, nivel = NIVEL) {
  const vacias = libres(tablero);
  if (vacias.length === 0) return -1;

  const propias = jugadasGanadoras(tablero, yo);
  if (propias.length && azar() < nivel.ganar) return aleatoria(propias, azar);

  const rivales = jugadasGanadoras(tablero, otro(yo));
  if (rivales.length && azar() < nivel.bloquear) return aleatoria(rivales, azar);

  if (azar() < nivel.estrategia) return mejorMovimiento(tablero, yo, azar);
  return aleatoria(vacias, azar);
}
