// Dibujo de Culebrita 2.0 en canvas (pixel art). Solo lee el estado del motor.
import {
  W, H, CELDA, COLS, FILAS, DASH_ENFRIAMIENTO, pasoActual,
} from './engine.js';
import {
  PALETA, PALETA_B, PALETA_CABEZA, CUERPO_A, CUERPO_B, CABEZA, FRUTAS_SPRITES, ROCA,
} from './sprites.js';
import { texto, textoCentrado } from './fuente.js';

const COL = {
  piso1: '#150c26', piso2: '#1a1030', pisoMota: '#241845',
  ladrillo: '#2c2058', ladrilloLuz: '#4a3a8a', mortero: '#120820',
  rosa: '#ff4fa3', blanco: '#f3eaff', amarillo: '#ffd23f', verde: '#47ff9a',
  azul: '#2ea8ff', morado: '#8b3dff', gris: '#a998c9', fondo: '#06030d', panel: '#0a0612',
};

/* ---------- Construcción de sprites ---------- */

function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function crearSprite(filas, paleta) {
  const c = lienzo(filas[0].length, filas.length);
  const g = c.getContext('2d');
  filas.forEach((fila, y) => {
    [...fila].forEach((ch, x) => {
      if (ch !== '.' && paleta[ch]) { g.fillStyle = paleta[ch]; g.fillRect(x, y, 1, 1); }
    });
  });
  return c;
}

// Gira las filas de un sprite 90° a la derecha
function girar(filas) {
  const n = filas.length;
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => filas[n - 1 - c][r]).join(''));
}

function semilla(a) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Fondo fijo: piso, paredes y barra de estado ---------- */

function ladrillo(g, x, y, variante) {
  g.fillStyle = COL.ladrillo; g.fillRect(x, y, CELDA, CELDA);
  g.fillStyle = COL.ladrilloLuz; g.fillRect(x, y, CELDA, 1);
  g.fillStyle = COL.mortero;
  g.fillRect(x, y + 3, CELDA, 1);
  g.fillRect(x, y + 7, CELDA, 1);
  g.fillRect(x + (variante ? 3 : 1), y, 1, 3);
  g.fillRect(x + (variante ? 1 : 5), y + 4, 1, 3);
  g.fillStyle = COL.ladrilloLuz;
  g.fillRect(x + (variante ? 4 : 2), y + 4, 2, 1);
}

function crearFondo() {
  const c = lienzo(W, H);
  const g = c.getContext('2d');
  const r = semilla(11);

  for (let cy = 0; cy < FILAS; cy++) {
    for (let cx = 0; cx < COLS; cx++) {
      g.fillStyle = (cx + cy) % 2 ? COL.piso1 : COL.piso2;
      g.fillRect(cx * CELDA, cy * CELDA, CELDA, CELDA);
      if (r() < 0.25) {
        g.fillStyle = COL.pisoMota;
        g.fillRect(cx * CELDA + Math.floor(r() * 7), cy * CELDA + Math.floor(r() * 7), 1, 1);
      }
    }
  }

  // Paredes de ladrillo (arriba, izquierda y derecha)
  for (let cx = 0; cx < COLS; cx++) ladrillo(g, cx * CELDA, 0, cx % 2);
  for (let cy = 1; cy < FILAS - 1; cy++) {
    ladrillo(g, 0, cy * CELDA, cy % 2);
    ladrillo(g, (COLS - 1) * CELDA, cy * CELDA, (cy + 1) % 2);
  }

  // Línea de neón rosa en el borde interior
  g.fillStyle = COL.rosa;
  g.fillRect(CELDA - 1, CELDA - 1, W - 2 * CELDA + 2, 1);
  g.fillRect(CELDA - 1, CELDA - 1, 1, H - 2 * CELDA + 2);
  g.fillRect(W - CELDA, CELDA - 1, 1, H - 2 * CELDA + 2);
  g.fillRect(CELDA - 1, H - CELDA, W - 2 * CELDA + 2, 1);

  // Barra de estado (abajo)
  g.fillStyle = COL.panel; g.fillRect(0, H - CELDA, W, CELDA);
  g.fillStyle = COL.morado; g.fillRect(0, H - CELDA, W, 1);
  return c;
}

/* ---------- Render ---------- */

export function crearRender(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const fondo = crearFondo();

  const cuerpoA = crearSprite(CUERPO_A, PALETA);
  const cuerpoB = crearSprite(CUERPO_B, { ...PALETA, ...PALETA_B });
  // cabezas: arriba, derecha, abajo, izquierda
  const cabezas = [];
  let filas = CABEZA;
  for (let i = 0; i < 4; i++) { cabezas.push(crearSprite(filas, { ...PALETA, ...PALETA_CABEZA })); filas = girar(filas); }
  const frutas = {};
  for (const k of Object.keys(FRUTAS_SPRITES)) frutas[k] = crearSprite(FRUTAS_SPRITES[k], PALETA);
  const roca = crearSprite(ROCA, PALETA);

  const indiceDir = (d) => (d.y === -1 ? 0 : d.x === 1 ? 1 : d.y === 1 ? 2 : 3);
  const lerp = (a, b, t) => a + (b - a) * t;

  function tablero(s) {
    ctx.drawImage(fondo, 0, 0);

    // Rocas (parpadean antes de volverse sólidas)
    for (const r of s.rocas) {
      if (!r.activa && Math.floor(s.t * 10) % 2 === 0) continue;
      ctx.drawImage(roca, r.x * CELDA, r.y * CELDA);
    }

    // Frutas con un pequeño rebote y destello
    for (const f of s.frutas) {
      if (f.vida !== undefined && f.vida < 2 && Math.floor(s.t * 8) % 2 === 0) continue;
      const bob = Math.round(Math.sin(s.t * 5 + f.x) * 1);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#000000';
      ctx.fillRect(f.x * CELDA + 2, f.y * CELDA + 7, 4, 1);
      ctx.globalAlpha = 1;
      ctx.drawImage(frutas[f.tipo], f.x * CELDA, f.y * CELDA + bob - 1);
      if (Math.floor(s.t * 4 + f.x) % 4 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(f.x * CELDA + 6, f.y * CELDA + bob, 1, 1);
      }
    }

    // Culebra (animada entre una casilla y la siguiente)
    const choque = s.estado === 'choque';
    if (choque && s.choqueT > 0.7) return;
    if (choque && Math.floor(s.choqueT * 14) % 2 === 0) return;

    const a = Math.min(1, Math.max(0, s.acc / pasoActual(s)));
    const pos = (i) => {
      const p = s.serp[i], q = s.prev[i] || p;
      return [Math.round(lerp(q.x, p.x, a) * CELDA), Math.round(lerp(q.y, p.y, a) * CELDA)];
    };
    for (let i = s.serp.length - 1; i >= 1; i--) {
      const [x, y] = pos(i);
      ctx.drawImage(i % 2 ? cuerpoA : cuerpoB, x, y);
    }
    const [hx, hy] = pos(0);
    ctx.drawImage(cabezas[indiceDir(s.dir)], hx, hy);

    // Lengua que entra y sale
    if (s.estado === 'jugando' && Math.floor(s.t * 6) % 5 === 0) {
      ctx.fillStyle = COL.rosa;
      const d = s.dir;
      const cx = hx + 3 + (d.x === 1 ? 6 : d.x === -1 ? -3 : 0);
      const cy = hy + 3 + (d.y === 1 ? 6 : d.y === -1 ? -3 : 0);
      ctx.fillRect(cx, cy, d.x !== 0 ? 3 : 2, d.y !== 0 ? 3 : 2);
    }
  }

  function barra(s) {
    const y = H - CELDA;
    const listo = s.dash.activo <= 0 && s.dash.enfriamiento <= 0;
    const pct = 1 - s.dash.enfriamiento / DASH_ENFRIAMIENTO;
    texto(ctx, 'DASH', 4, y + 2, 1, s.dash.activo > 0 ? COL.azul : listo ? COL.verde : COL.gris);
    ctx.fillStyle = '#2a1850'; ctx.fillRect(24, y + 3, 36, 3);
    ctx.fillStyle = s.dash.activo > 0 ? COL.azul : listo ? COL.verde : COL.amarillo;
    ctx.fillRect(24, y + 3, Math.round(36 * pct), 3);
    if (s.dash.activo > 0) texto(ctx, 'X2', 64, y + 2, 1, COL.amarillo);
    texto(ctx, 'NIV ' + s.nivel, W - 4 - 7 * 4 + 1, y + 2, 1, COL.blanco);
  }

  function panel(x, y, w, h, borde) {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = COL.panel; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = borde;
    ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y + h - 2, w, 2);
    ctx.fillRect(x, y, 2, h); ctx.fillRect(x + w - 2, y, 2, h);
  }

  function pantallas(s) {
    const parpadeo = Math.floor(s.t * 2) % 2 === 0;
    if (s.estado === 'inicio') {
      panel(24, 30, 144, 84, COL.verde);
      textoCentrado(ctx, W, 'CULEBRITA', 38, 2, COL.verde);
      textoCentrado(ctx, W, '2.0', 54, 3, COL.rosa);
      textoCentrado(ctx, W, 'COME FRUTAS Y CRECE', 78, 1, COL.gris);
      if (parpadeo) textoCentrado(ctx, W, 'PRESIONA START', 94, 1, COL.amarillo);
    } else if (s.estado === 'pausa') {
      panel(52, 52, 88, 40, COL.azul);
      textoCentrado(ctx, W, 'PAUSA', 64, 2, COL.amarillo);
    } else if (s.estado === 'fin') {
      panel(28, 22, 136, 100, COL.rosa);
      textoCentrado(ctx, W, 'GAME OVER', 31, 2, COL.rosa);
      textoCentrado(ctx, W, 'PUNTOS ' + s.puntos, 56, 1, COL.blanco);
      textoCentrado(ctx, W, 'RECORD ' + Math.max(s.record, s.puntos), 68, 1, COL.azul);
      textoCentrado(ctx, W, 'NIVEL ' + s.nivel, 80, 1, COL.verde);
      if (s.nuevoRecord && parpadeo) textoCentrado(ctx, W, 'NUEVO RECORD!', 94, 1, COL.verde);
      if (s.bloqueo <= 0 && parpadeo) textoCentrado(ctx, W, 'PRESIONA START', 108, 1, COL.amarillo);
    } else if (s.estado === 'jugando' && s.aviso > 0 && Math.floor(s.aviso * 8) % 2 === 0) {
      textoCentrado(ctx, W, 'NIVEL ' + s.nivel, 66, 2, COL.amarillo);
    }
  }

  return function dibujar(s) {
    ctx.fillStyle = COL.fondo;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    if (s.sacudida > 0) ctx.translate(Math.round(Math.random() * 4 - 2), Math.round(Math.random() * 4 - 2));
    tablero(s);
    for (const p of s.particulas) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.tam, p.tam);
    }
    ctx.restore();

    for (const t of s.textos) {
      const txt = t.txt;
      texto(ctx, txt, Math.round(t.x - (txt.length * 4 - 1) / 2), Math.round(t.y), 1, t.color);
    }

    barra(s);
    pantallas(s);

    if (s.flash > 0) {
      ctx.globalAlpha = Math.min(0.7, s.flash / 0.15);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  };
}
