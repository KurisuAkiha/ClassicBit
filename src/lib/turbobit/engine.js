// Lógica de Turbo Bit. No toca el DOM ni el canvas: solo datos y reglas.
import { altoModelo, ANCHO_COCHE, COLORES_ENEMIGOS } from './sprites.js';

export const W = 192;
export const H = 144;
export const CARRETERA = { x: 48, ancho: 96, carriles: 4, anchoCarril: 24 };
export const SALTO_DURACION = 0.8;
export const SALTO_ENFRIAMIENTO = 2.4;

const ATERRIZAJE = 0.25;   // segundos de gracia al caer
const MARGEN = 4;          // distancia entre el borde de la carretera y el coche
const CICLO_DECOR = H + 36;
const PUNTOS_PARA_MAXIMO = 1000;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const centroCarril = (i) => CARRETERA.x + CARRETERA.anchoCarril * i + CARRETERA.anchoCarril / 2;

/* ---------- Creación ---------- */

function sortearDecor(d) {
  const r = Math.random();
  d.tipo = r < 0.55 ? 'arbol' : r < 0.85 ? 'arbusto' : 'roca';
  d.x = Math.round(d.lado === 0 ? rnd(2, 30) : rnd(150, 178));
}

function crearDecor() {
  const lista = [];
  const n = 9;
  for (let lado = 0; lado < 2; lado++) {
    for (let i = 0; i < n; i++) {
      const d = { lado, y: (i / n) * CICLO_DECOR - 18 + rnd(-3, 3) };
      sortearDecor(d);
      lista.push(d);
    }
  }
  return lista;
}

export function nuevoJuego(record = 0) {
  return {
    estado: 'inicio',          // inicio | jugando | pausa | choque | fin
    record,
    nuevoRecord: false,
    guardar: false,            // el componente guarda el récord cuando esto es true
    t: 0,
    puntos: 0,
    distancia: 0,
    esquivados: 0,
    dificultad: 0,
    scroll: 60,                // velocidad del mundo (px/s)
    offset: 0,
    jugador: {
      x: CARRETERA.x + CARRETERA.ancho / 2 - ANCHO_COCHE / 2,
      y: H - 38,
      w: ANCHO_COCHE,
      h: altoModelo('sedan'),
      vx: 0, vy: 0,
      saltoT: -1,              // -1 = en el suelo
      z: 0,
      enfriamiento: 0,
      aterrizaje: 0,
    },
    coches: [],
    kCarril: [0, 1, 2, 3].map(() => rnd(0.42, 0.72)),
    spawnEn: 0.9,
    particulas: [],
    decor: crearDecor(),
    choqueT: 0,
    flash: 0,
    sacudida: 0,
    bloqueo: 0,
    saltoPrev: false,
  };
}

export function iniciar(s) {
  const record = s.record;
  Object.assign(s, nuevoJuego(record));
  s.estado = 'jugando';
  s.scroll = 70;
}

export function alternarPausa(s) {
  if (s.estado === 'jugando') s.estado = 'pausa';
  else if (s.estado === 'pausa') s.estado = 'jugando';
}

// START: inicia, reinicia tras perder o pausa/reanuda
export function pulsarStart(s) {
  if (s.estado === 'inicio') iniciar(s);
  else if (s.estado === 'fin') { if (s.bloqueo <= 0) iniciar(s); }
  else alternarPausa(s);
}

/* ---------- Partículas ---------- */

function chispas(s, x, y, n, colores, vmin, vmax, vida, tam) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = rnd(vmin, vmax);
    s.particulas.push({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      vida: rnd(vida * 0.6, vida), color: colores[Math.floor(Math.random() * colores.length)],
      tam: tam[Math.floor(Math.random() * tam.length)],
    });
  }
}

function moverParticulas(s, dt) {
  const freno = Math.max(0, 1 - 3 * dt);
  for (const p of s.particulas) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= freno; p.vy *= freno;
    p.vida -= dt;
  }
  s.particulas = s.particulas.filter((p) => p.vida > 0);
}

/* ---------- Mundo ---------- */

function avanzarMundo(s, v, dt) {
  s.offset += v * dt;
  for (const d of s.decor) {
    d.y += v * dt;
    if (d.y > H + 18) { d.y -= CICLO_DECOR; sortearDecor(d); }
  }
}

function moverCoches(s, dt) {
  let salieron = 0;
  for (const c of s.coches) {
    c.y += s.scroll * s.kCarril[c.carril] * dt;
    if (c.y > H + 2) c.fuera = true;
  }
  const antes = s.coches.length;
  s.coches = s.coches.filter((c) => !c.fuera);
  salieron = antes - s.coches.length;
  return salieron;
}

function intentarSpawn(s) {
  const maxOcupados = s.dificultad < 0.5 ? 2 : 3;
  const ocupados = new Set();
  for (const c of s.coches) if (c.y < 34) ocupados.add(c.carril);
  if (ocupados.size >= maxOcupados) return false;

  const libres = [0, 1, 2, 3].filter((i) => !ocupados.has(i));
  const carril = libres[Math.floor(Math.random() * libres.length)];
  const r = Math.random();
  const modelo = r < 0.6 ? 'sedan' : r < 0.85 ? 'camioneta' : 'camion';
  const h = altoModelo(modelo);
  s.coches.push({
    modelo,
    color: COLORES_ENEMIGOS[Math.floor(Math.random() * COLORES_ENEMIGOS.length)],
    carril,
    x: Math.round(centroCarril(carril) - ANCHO_COCHE / 2 + rnd(-3, 3)),
    y: -h - 2,
    w: ANCHO_COCHE,
    h,
  });
  return true;
}

function choca(a, b) {
  const ax = a.x + 1, ay = a.y + 2, aw = a.w - 2, ah = a.h - 4;
  const bx = b.x + 1, by = b.y + 2, bw = b.w - 2, bh = b.h - 4;
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function chocar(s, enemigo) {
  const j = s.jugador;
  s.estado = 'choque';
  s.choqueT = 0;
  s.flash = 0.15;
  s.sacudida = 0.5;
  s.nuevoRecord = s.puntos > s.record;
  s.guardar = true;
  j.vx = 0; j.vy = 0;
  const cx = (j.x + enemigo.x) / 2 + 6;
  const cy = (j.y + enemigo.y) / 2 + 10;
  chispas(s, cx, cy, 30, ['#ffd23f', '#ff4fa3', '#ffffff', '#ff8a3d'], 30, 120, 1, [1, 2, 2, 3]);
}

/* ---------- Bucle ---------- */

function jugar(s, dt, inp) {
  const j = s.jugador;

  // Dificultad y velocidad
  s.dificultad = clamp(s.puntos / PUNTOS_PARA_MAXIMO, 0, 1);
  const objetivo = lerp(75, 195, s.dificultad);
  s.scroll += (objetivo - s.scroll) * Math.min(1, dt * 1.5);
  avanzarMundo(s, s.scroll, dt);
  s.distancia += s.scroll * dt;

  // Movimiento del jugador (con algo de inercia, estilo arcade)
  const ax = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  const ay = (inp.down ? 1 : 0) - (inp.up ? 1 : 0);
  const suave = Math.min(1, 14 * dt);
  j.vx += (ax * 82 - j.vx) * suave;
  j.vy += (ay * 66 - j.vy) * suave;
  j.x = clamp(j.x + j.vx * dt, CARRETERA.x + MARGEN, CARRETERA.x + CARRETERA.ancho - MARGEN - j.w);
  j.y = clamp(j.y + j.vy * dt, 6, H - j.h - 4);

  // Salto
  if (inp.jump && !s.saltoPrev && j.saltoT < 0 && j.enfriamiento <= 0) {
    j.saltoT = 0;
    j.enfriamiento = SALTO_ENFRIAMIENTO;
    chispas(s, j.x + j.w / 2, j.y + j.h - 2, 6, ['#a998c9', '#f3eaff'], 15, 40, 0.35, [1, 2]);
  }
  s.saltoPrev = !!inp.jump;

  if (j.saltoT >= 0) {
    j.saltoT += dt;
    if (j.saltoT >= SALTO_DURACION) {
      j.saltoT = -1;
      j.aterrizaje = ATERRIZAJE;
      chispas(s, j.x + j.w / 2, j.y + j.h / 2, 8, ['#a998c9', '#f3eaff'], 15, 45, 0.35, [1, 2]);
    }
  }
  j.z = j.saltoT >= 0 ? Math.sin((Math.PI * j.saltoT) / SALTO_DURACION) * 9 : 0;
  if (j.enfriamiento > 0) j.enfriamiento = Math.max(0, j.enfriamiento - dt);
  if (j.aterrizaje > 0) j.aterrizaje -= dt;

  // Tráfico
  s.spawnEn -= dt;
  if (s.spawnEn <= 0) {
    const ok = intentarSpawn(s);
    s.spawnEn = ok ? lerp(1.1, 0.4, s.dificultad) * rnd(0.7, 1.3) : 0.15;
  }
  s.esquivados += moverCoches(s, dt);

  // Puntos
  s.puntos = Math.floor(s.distancia / 12) + s.esquivados * 5;

  // Colisiones (el salto y la caída dan invulnerabilidad)
  const invulnerable = j.saltoT >= 0 || j.aterrizaje > 0;
  if (!invulnerable) {
    for (const c of s.coches) {
      if (choca(j, c)) { chocar(s, c); break; }
    }
  }
}

export function actualizar(s, dt, inp = {}) {
  if (s.estado === 'pausa') return;
  s.t += dt;
  if (s.flash > 0) s.flash -= dt;
  if (s.sacudida > 0) s.sacudida -= dt;
  if (s.bloqueo > 0) s.bloqueo -= dt;

  if (s.estado === 'inicio') {
    avanzarMundo(s, 55, dt);
  } else if (s.estado === 'jugando') {
    jugar(s, dt, inp);
  } else if (s.estado === 'choque') {
    s.choqueT += dt;
    s.scroll = Math.max(0, s.scroll - 220 * dt);
    avanzarMundo(s, s.scroll, dt);
    moverCoches(s, dt);
    if (s.choqueT > 1.1) { s.estado = 'fin'; s.bloqueo = 0.6; }
  }
  moverParticulas(s, dt);
}
