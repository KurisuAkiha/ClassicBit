// Lógica de Tres en raya. No toca el DOM ni el canvas: solo datos y reglas.
//
// Estados:  menu → jugando ⇄ pausa → fin → (otra partida | menu)
// Modos:    'dos' = dos jugadores (X = J1, O = J2)   |   'ia' = contra la IA (tú = X, IA = O)
import { ganadorDe, elegirJugadaIA } from './ia.js';
import { celdaEn, opcionEn, dentro, BOTONES, celdaRect, TABLERO } from './layout.js';
import { statsVacias } from './stats.js';

export { ganadorDe };

const rnd = (a, b) => a + Math.random() * (b - a);
const otro = (j) => (j === 'X' ? 'O' : 'X');

/* ---------- Creación ---------- */

// `stats` son las estadísticas leídas de localStorage: { ia: {v,d,e}, dos: {v,d,e} }
export function nuevoJuego(stats) {
  return {
    estado: 'menu',            // menu | jugando | pausa | fin
    modo: null,                // 'dos' | 'ia'
    menuSel: 0,                // 0 = dos jugadores, 1 = contra la IA
    tablero: Array(9).fill(null),
    marcas: Array(9).fill(0),  // segundos desde que se puso cada marca (para animarla)
    turno: 'X',
    ronda: 0,                  // alterna quién empieza cada partida
    ganador: null,             // 'X' | 'O' | 'empate'
    linea: null,               // las tres casillas ganadoras
    cursor: 4,
    mostrarCursor: false,      // el cursor se ve con teclado o mouse, no con toque
    hoverBoton: null,
    stats: {
      ia: { ...statsVacias(), ...(stats && stats.ia) },
      dos: { ...statsVacias(), ...(stats && stats.dos) },
    },
    sesion: 0,                 // victorias de esta visita (modo actual)
    guardar: null,             // modo cuyas estadísticas hay que guardar (lo hace el componente)
    esperaIA: 0,
    t: 0,
    finT: 0,
    particulas: [],
    flash: 0,
    sacudida: 0,
  };
}

const esTurnoIA = (s) => s.modo === 'ia' && s.turno === 'O';

/* ---------- Efectos ---------- */

function chispas(s, x, y, n, colores, vmin, vmax, vida, tam, g = 0) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = rnd(vmin, vmax);
    s.particulas.push({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g,
      vida: rnd(vida * 0.6, vida),
      color: colores[Math.floor(Math.random() * colores.length)],
      tam: tam[Math.floor(Math.random() * tam.length)],
    });
  }
}

function moverParticulas(s, dt) {
  const freno = Math.max(0, 1 - 1.5 * dt);
  for (const p of s.particulas) {
    p.vy += p.g * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= freno;
    p.vida -= dt;
  }
  s.particulas = s.particulas.filter((p) => p.vida > 0);
}

const centroCelda = (i) => {
  const r = celdaRect(i);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};

/* ---------- Partidas ---------- */

function iniciarPartida(s) {
  s.tablero = Array(9).fill(null);
  s.marcas = Array(9).fill(0);
  s.ganador = null;
  s.linea = null;
  s.turno = s.ronda % 2 === 0 ? 'X' : 'O'; // se alterna quién empieza
  s.ronda++;
  s.cursor = 4;
  s.finT = 0;
  s.particulas = [];
  s.estado = 'jugando';
  s.esperaIA = esTurnoIA(s) ? rnd(0.7, 1.0) : 0;
}

export function elegirModo(s, modo) {
  s.modo = modo;
  s.ronda = 0;
  s.sesion = 0;
  iniciarPartida(s);
}

// Termina la partida actual sin guardar nada y vuelve al menú de modos
export function volverMenu(s) {
  s.estado = 'menu';
  s.modo = null;
  s.tablero = Array(9).fill(null);
  s.ganador = null;
  s.linea = null;
  s.particulas = [];
  s.esperaIA = 0;
}

export function nuevaPartida(s) {
  if (s.modo) iniciarPartida(s);
}

// ↻ de la consola: durante la partida la empieza de nuevo (sin contarla ni cambiar quién empieza)
export function reiniciar(s) {
  if (!s.modo) return;
  if (s.estado === 'jugando' || s.estado === 'pausa') s.ronda = Math.max(0, s.ronda - 1);
  iniciarPartida(s);
}

function terminar(s, resultado) {
  s.estado = 'fin';
  s.ganador = resultado.ganador;
  s.linea = resultado.linea;
  s.finT = 0;

  // Las estadísticas siempre son desde el punto de vista de X (J1 / tú)
  const st = s.stats[s.modo];
  if (s.ganador === 'empate') st.e++;
  else if (s.ganador === 'X') { st.v++; s.sesion++; } else st.d++;
  s.guardar = s.modo;

  if (s.ganador === 'empate') {
    chispas(s, TABLERO.x + TABLERO.tam / 2, TABLERO.y + TABLERO.tam / 2, 16, ['#2ea8ff', '#9adcff', '#ffffff'], 25, 70, 0.8, [1, 2]);
    s.flash = 0.08;
  } else {
    const alegre = s.modo === 'dos' || s.ganador === 'X';
    const c = centroCelda(s.linea[1]);
    if (alegre) {
      chispas(s, c.x, c.y, 46, ['#ffd23f', '#ff4fa3', '#47ff9a', '#2ea8ff', '#ffffff'], 40, 130, 1.8, [1, 2, 2], 110);
      s.flash = 0.12;
    } else {
      chispas(s, c.x, c.y, 26, ['#5c5578', '#a998c9', '#8b3dff'], 20, 70, 1.5, [2, 3], 50);
      s.sacudida = 0.4;
    }
  }
}

// Pone la marca del turno actual (sin comprobar quién la pone)
function poner(s, i) {
  if (s.estado !== 'jugando' || s.tablero[i]) return false;
  s.tablero[i] = s.turno;
  s.marcas[i] = 0;
  const c = centroCelda(i);
  chispas(s, c.x, c.y, 8, s.turno === 'X' ? ['#ff4fa3', '#ffa3d0', '#ffffff'] : ['#2ea8ff', '#9adcff', '#ffffff'], 20, 60, 0.4, [1, 2]);

  const r = ganadorDe(s.tablero);
  if (r) { terminar(s, r); return true; }
  s.turno = otro(s.turno);
  if (esTurnoIA(s)) s.esperaIA = rnd(0.55, 0.95);
  return true;
}

// Jugada de una persona (se ignora si es el turno de la IA)
export function colocar(s, i) {
  if (i < 0 || i > 8 || esTurnoIA(s)) return false;
  return poner(s, i);
}

/* ---------- Entradas ---------- */

// d < 0 (arriba / izquierda) elige la primera opción; d > 0 (abajo / derecha) la segunda
export function moverMenu(s, d) {
  s.menuSel = d < 0 ? 0 : 1;
}

export function moverCursor(s, dx, dy) {
  s.mostrarCursor = true;
  const x = (((s.cursor % 3) + dx) % 3 + 3) % 3;
  const y = ((Math.floor(s.cursor / 3) + dy) % 3 + 3) % 3;
  s.cursor = y * 3 + x;
}

// Enter / espacio / botón A
export function confirmar(s) {
  if (s.estado === 'menu') elegirModo(s, s.menuSel === 0 ? 'dos' : 'ia');
  else if (s.estado === 'jugando') { s.mostrarCursor = true; colocar(s, s.cursor); }
  else if (s.estado === 'fin' && s.finT > 0.5) nuevaPartida(s);
  else if (s.estado === 'pausa') s.estado = 'jugando';
}

export function alternarPausa(s) {
  if (s.estado === 'jugando') s.estado = 'pausa';
  else if (s.estado === 'pausa') s.estado = 'jugando';
}

// START: elige el modo, pausa/reanuda o juega otra partida
export function pulsarStart(s) {
  if (s.estado === 'jugando' || s.estado === 'pausa') alternarPausa(s);
  else confirmar(s);
}

// Botón B / tecla M: regresa al menú de modos
export function atras(s) {
  if (s.estado !== 'menu') volverMenu(s);
}

// Toque o clic en el canvas (x, y en píxeles del canvas)
export function tocar(s, x, y) {
  if (s.estado === 'menu') {
    const o = opcionEn(x, y);
    if (o >= 0) { s.menuSel = o; confirmar(s); }
  } else if (s.estado === 'jugando') {
    if (dentro(BOTONES.menu, x, y)) { volverMenu(s); return; }
    const i = celdaEn(x, y);
    if (i >= 0) { s.cursor = i; colocar(s, i); }
  } else if (s.estado === 'fin') {
    if (s.finT <= 0.5) return;
    if (dentro(BOTONES.otra, x, y)) nuevaPartida(s);
    else if (dentro(BOTONES.menu, x, y)) volverMenu(s);
  } else if (s.estado === 'pausa') {
    s.estado = 'jugando';
  }
}

// Mouse encima (solo para resaltar)
export function pasar(s, x, y) {
  s.mostrarCursor = true;
  s.hoverBoton = null;
  if (s.estado === 'menu') {
    const o = opcionEn(x, y);
    if (o >= 0) s.menuSel = o;
  } else if (s.estado === 'jugando') {
    const i = celdaEn(x, y);
    if (i >= 0) s.cursor = i;
    if (dentro(BOTONES.menu, x, y)) s.hoverBoton = 'menu';
  } else if (s.estado === 'fin') {
    if (dentro(BOTONES.otra, x, y)) s.hoverBoton = 'otra';
    else if (dentro(BOTONES.menu, x, y)) s.hoverBoton = 'menu';
  }
}

/* ---------- Bucle ---------- */

export function actualizar(s, dt) {
  if (s.estado === 'pausa') return;
  s.t += dt;
  if (s.flash > 0) s.flash -= dt;
  if (s.sacudida > 0) s.sacudida -= dt;
  for (let i = 0; i < 9; i++) if (s.tablero[i]) s.marcas[i] += dt;
  moverParticulas(s, dt);

  if (s.estado === 'jugando' && esTurnoIA(s)) {
    s.esperaIA -= dt;
    if (s.esperaIA <= 0) {
      const i = elegirJugadaIA(s.tablero, 'O');
      if (i >= 0) poner(s, i);
    }
  } else if (s.estado === 'fin') {
    s.finT += dt;
  }
}
