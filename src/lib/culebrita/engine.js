// Lógica de Culebrita 2.0. No toca el DOM ni el canvas: solo datos y reglas.
import { FRUTAS } from './sprites.js';

export const CELDA = 8;
export const COLS = 24;
export const FILAS = 18;
export const W = COLS * CELDA;   // 192
export const H = FILAS * CELDA;  // 144

// Zona jugable: el borde del tablero son las paredes (y abajo la barra de estado)
const MIN_X = 1, MAX_X = COLS - 2;
const MIN_Y = 1, MAX_Y = FILAS - 2;

const PASO_INICIAL = 0.17;   // segundos por casilla
const PASO_MIN = 0.07;
const FRUTAS_POR_NIVEL = 5;
const NIVEL_ROCAS = 3;       // desde este nivel aparecen rocas
const MAX_ROCAS = 12;

export const DASH_DURACION = 0.7;
export const DASH_ENFRIAMIENTO = 3.0;
const DASH_FACTOR = 0.45;    // el paso se multiplica por esto (más rápido)
const ESTRELLA_VIDA = 7;

const DIRS = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};

const rnd = (a, b) => a + Math.random() * (b - a);
const entre = (a, b) => Math.floor(rnd(a, b + 1));
const igual = (a, b) => a.x === b.x && a.y === b.y;
const opuesta = (a, b) => a.x === -b.x && a.y === -b.y;

/* ---------- Creación ---------- */

export function nuevoJuego(record = 0, demo = true) {
  const s = {
    estado: 'inicio',        // inicio | jugando | pausa | choque | fin
    demo,                    // en la pantalla de inicio la culebra juega sola
    record,
    nuevoRecord: false,
    guardar: false,          // el componente guarda el récord cuando esto es true
    t: 0,
    puntos: 0,
    comidas: 0,
    nivel: 1,
    dir: { x: 1, y: 0 },
    cola: [],                // direcciones pendientes (máximo 2)
    serp: [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }],
    prev: [],                // posición de cada segmento en el paso anterior (animación)
    crecer: 0,
    acc: 0,
    frutas: [],
    rocas: [],
    dash: { activo: 0, enfriamiento: 0 },
    particulas: [],
    textos: [],
    flash: 0,
    sacudida: 0,
    aviso: 0,
    choqueT: 0,
    bloqueo: 0,
    prevInp: {},
  };
  s.prev = s.serp.map((p) => ({ ...p }));
  colocarFruta(s);
  return s;
}

export function iniciar(s) {
  const record = s.record;
  Object.assign(s, nuevoJuego(record, false));
  s.estado = 'jugando';
}

export function alternarPausa(s) {
  if (s.estado === 'jugando') s.estado = 'pausa';
  else if (s.estado === 'pausa') s.estado = 'jugando';
}

// START: inicia, reinicia tras perder, o pausa/reanuda
export function pulsarStart(s) {
  if (s.estado === 'inicio') iniciar(s);
  else if (s.estado === 'fin') { if (s.bloqueo <= 0) iniciar(s); }
  else alternarPausa(s);
}

/* ---------- Ayudas del tablero ---------- */

const dentro = (x, y) => x >= MIN_X && x <= MAX_X && y >= MIN_Y && y <= MAX_Y;

function ocupada(s, x, y) {
  return (
    s.serp.some((p) => p.x === x && p.y === y) ||
    s.rocas.some((r) => r.x === x && r.y === y) ||
    s.frutas.some((f) => f.x === x && f.y === y)
  );
}

function celdaLibreAleatoria(s) {
  for (let i = 0; i < 300; i++) {
    const x = entre(MIN_X, MAX_X), y = entre(MIN_Y, MAX_Y);
    if (!ocupada(s, x, y)) return { x, y };
  }
  for (let y = MIN_Y; y <= MAX_Y; y++) {
    for (let x = MIN_X; x <= MAX_X; x++) if (!ocupada(s, x, y)) return { x, y };
  }
  return null; // tablero lleno
}

function colocarFruta(s) {
  const c = celdaLibreAleatoria(s);
  if (!c) return;
  s.frutas.push({ ...c, tipo: Math.random() < 0.78 ? 'manzana' : 'cereza', principal: true });
}

function colocarEstrella(s) {
  if (s.frutas.some((f) => f.tipo === 'estrella')) return;
  const c = celdaLibreAleatoria(s);
  if (c) s.frutas.push({ ...c, tipo: 'estrella', vida: ESTRELLA_VIDA });
}

function agregarRocas(s, n) {
  const cab = s.serp[0];
  for (let k = 0; k < n && s.rocas.length < MAX_ROCAS; k++) {
    for (let intento = 0; intento < 80; intento++) {
      const x = entre(MIN_X + 1, MAX_X - 1), y = entre(MIN_Y + 1, MAX_Y - 1);
      if (ocupada(s, x, y)) continue;
      if (Math.abs(x - cab.x) + Math.abs(y - cab.y) < 5) continue;
      // no justo delante de la cabeza
      if (s.dir.x !== 0 && y === cab.y && Math.sign(x - cab.x) === s.dir.x) continue;
      if (s.dir.y !== 0 && x === cab.x && Math.sign(y - cab.y) === s.dir.y) continue;
      // sin rocas pegadas entre sí (para no crear trampas)
      if (s.rocas.some((r) => Math.abs(r.x - x) <= 1 && Math.abs(r.y - y) <= 1)) continue;
      s.rocas.push({ x, y, activa: false, espera: 1.0 }); // parpadea 1 s antes de ser sólida
      break;
    }
  }
}

/* ---------- Efectos ---------- */

function chispas(s, x, y, n, colores, vmin, vmax, vida, tam) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = rnd(vmin, vmax);
    s.particulas.push({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      vida: rnd(vida * 0.6, vida),
      color: colores[Math.floor(Math.random() * colores.length)],
      tam: tam[Math.floor(Math.random() * tam.length)],
    });
  }
}

function moverEfectos(s, dt) {
  const freno = Math.max(0, 1 - 3 * dt);
  for (const p of s.particulas) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= freno; p.vy *= freno;
    p.vida -= dt;
  }
  s.particulas = s.particulas.filter((p) => p.vida > 0);
  for (const t of s.textos) { t.y -= 14 * dt; t.vida -= dt; }
  s.textos = s.textos.filter((t) => t.vida > 0);
}

const centro = (c) => ({ x: c.x * CELDA + CELDA / 2, y: c.y * CELDA + CELDA / 2 });

/* ---------- Dificultad ---------- */

export function pasoBase(s) {
  if (s.demo) return 0.13;
  return Math.max(PASO_MIN, PASO_INICIAL - 0.009 * (s.nivel - 1));
}

// Duración real de un paso (el dash lo acorta)
export function pasoActual(s) {
  return pasoBase(s) * (s.dash.activo > 0 ? DASH_FACTOR : 1);
}

/* ---------- Entrada ---------- */

function encolar(s, d) {
  const ultima = s.cola.length ? s.cola[s.cola.length - 1] : s.dir;
  if (igual(d, ultima) || opuesta(d, ultima)) return;
  if (s.cola.length >= 2) return;
  s.cola.push(d);
}

function procesarEntrada(s, inp) {
  const nueva = (k) => inp[k] && !s.prevInp[k];
  for (const k of ['up', 'down', 'left', 'right']) if (nueva(k)) encolar(s, DIRS[k]);
  if (nueva('dash') && s.dash.activo <= 0 && s.dash.enfriamiento <= 0) {
    s.dash.activo = DASH_DURACION;
    s.dash.enfriamiento = DASH_ENFRIAMIENTO;
    const c = centro(s.serp[0]);
    chispas(s, c.x, c.y, 10, ['#2ea8ff', '#ffffff'], 20, 60, 0.4, [1, 2]);
  }
}

/* ---------- Demo (la culebra juega sola en la pantalla de inicio) ---------- */

function libreParaIA(s, x, y) {
  if (!dentro(x, y)) return false;
  if (s.rocas.some((r) => r.x === x && r.y === y)) return false;
  return !s.serp.slice(0, -1).some((p) => p.x === x && p.y === y);
}

function decidirIA(s) {
  const cab = s.serp[0];
  const meta = s.frutas[0] || cab;
  const giroIzq = { x: s.dir.y, y: -s.dir.x };
  const giroDer = { x: -s.dir.y, y: s.dir.x };
  let mejor = null, mejorD = Infinity;
  for (const d of [s.dir, giroIzq, giroDer]) {
    const nx = cab.x + d.x, ny = cab.y + d.y;
    if (!libreParaIA(s, nx, ny)) continue;
    const dist = Math.abs(meta.x - nx) + Math.abs(meta.y - ny);
    if (dist < mejorD) { mejorD = dist; mejor = d; }
  }
  return mejor || s.dir;
}

/* ---------- Un paso del juego ---------- */

function morir(s) {
  if (s.demo) { // en la demo simplemente se reinicia
    const record = s.record;
    Object.assign(s, nuevoJuego(record, true));
    return;
  }
  s.estado = 'choque';
  s.choqueT = 0;
  s.flash = 0.15;
  s.sacudida = 0.5;
  s.nuevoRecord = s.puntos > s.record;
  s.guardar = true;
  const cab = centro(s.serp[0]);
  chispas(s, cab.x, cab.y, 26, ['#ffffff', '#ff4fa3', '#ffd23f'], 30, 110, 0.9, [1, 2, 3]);
  for (const seg of s.serp.slice(1)) {
    const c = centro(seg);
    chispas(s, c.x, c.y, 2, ['#2bd47a', '#7dffb8', '#1c9e5a'], 15, 70, 1.0, [2, 3]);
  }
}

function comer(s, idx, nx, ny) {
  const f = s.frutas.splice(idx, 1)[0];
  const info = FRUTAS[f.tipo];
  s.crecer += info.crece;
  const c = centro({ x: nx, y: ny });
  chispas(s, c.x, c.y, 14, [info.color, '#ffffff', info.color], 25, 75, 0.55, [1, 2]);

  if (f.principal) colocarFruta(s);
  if (s.demo) return;

  const mult = s.dash.activo > 0 ? 2 : 1;
  const pts = info.puntos * mult;
  s.puntos += pts;
  s.comidas++;
  s.textos.push({
    x: c.x, y: c.y - 6, vida: 0.9,
    txt: '+' + pts, color: f.tipo === 'estrella' ? '#ffd23f' : mult === 2 ? '#2ea8ff' : '#ffffff',
  });

  if (s.comidas % 3 === 0 && Math.random() < 0.6) colocarEstrella(s);

  const nivel = 1 + Math.floor(s.comidas / FRUTAS_POR_NIVEL);
  if (nivel > s.nivel) {
    s.nivel = nivel;
    s.aviso = 1.4;
    if (nivel >= NIVEL_ROCAS) agregarRocas(s, 2);
  }
}

function tick(s) {
  if (s.demo) { s.cola = [decidirIA(s)]; if (s.serp.length > 18) { morir(s); return; } }

  // Dirección: toma la primera pendiente que no sea un giro de 180°
  while (s.cola.length) {
    const d = s.cola.shift();
    if (!opuesta(d, s.dir)) { s.dir = d; break; }
  }

  const cab = s.serp[0];
  const nx = cab.x + s.dir.x, ny = cab.y + s.dir.y;
  const crece = s.crecer > 0;
  const cuerpo = crece ? s.serp : s.serp.slice(0, -1); // la cola se aparta si no crece

  if (
    !dentro(nx, ny) ||
    s.rocas.some((r) => r.activa && r.x === nx && r.y === ny) ||
    cuerpo.some((p) => p.x === nx && p.y === ny)
  ) { morir(s); return; }

  const vieja = s.serp;
  s.serp = [{ x: nx, y: ny }, ...vieja];
  if (crece) s.crecer--; else s.serp.pop();
  s.prev = s.serp.map((p, i) => ({ ...(vieja[i] || p) }));

  const idx = s.frutas.findIndex((f) => f.x === nx && f.y === ny);
  if (idx >= 0) comer(s, idx, nx, ny);

  if (s.dash.activo > 0) {
    const c = centro(s.serp[0]);
    chispas(s, c.x - s.dir.x * 6, c.y - s.dir.y * 6, 2, ['#2ea8ff', '#ffffff'], 5, 20, 0.3, [1]);
  }
}

/* ---------- Bucle ---------- */

export function actualizar(s, dt, inp = {}) {
  if (s.estado === 'pausa') return;
  s.t += dt;
  if (s.flash > 0) s.flash -= dt;
  if (s.sacudida > 0) s.sacudida -= dt;
  if (s.aviso > 0) s.aviso -= dt;
  if (s.bloqueo > 0) s.bloqueo -= dt;
  moverEfectos(s, dt);

  if (s.estado === 'jugando' || s.estado === 'inicio') {
    if (!s.demo) procesarEntrada(s, inp);

    if (s.dash.activo > 0) s.dash.activo = Math.max(0, s.dash.activo - dt);
    if (s.dash.enfriamiento > 0) s.dash.enfriamiento = Math.max(0, s.dash.enfriamiento - dt);

    for (const f of s.frutas) if (f.vida !== undefined) f.vida -= dt;
    s.frutas = s.frutas.filter((f) => f.vida === undefined || f.vida > 0);

    for (const r of s.rocas) {
      if (r.activa) continue;
      r.espera -= dt;
      if (r.espera <= 0) {
        if (s.serp.some((p) => p.x === r.x && p.y === r.y)) r.espera = 0.3; // se vuelve sólida cuando esté libre
        else r.activa = true;
      }
    }

    s.acc += dt;
    let pasos = 0;
    while (s.acc >= pasoActual(s) && pasos++ < 3 && (s.estado === 'jugando' || s.estado === 'inicio')) {
      s.acc -= pasoActual(s);
      tick(s);
    }
    if (s.estado === 'choque') s.acc = 0;
  } else if (s.estado === 'choque') {
    s.choqueT += dt;
    if (s.choqueT > 1.1) { s.estado = 'fin'; s.bloqueo = 0.6; }
  }

  s.prevInp = { up: !!inp.up, down: !!inp.down, left: !!inp.left, right: !!inp.right, dash: !!inp.dash };
}
