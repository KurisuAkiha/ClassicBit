// Dibujo de Tres en raya en canvas (pixel art). Solo lee el estado del motor.
import {
  W, H, CELDA, PASO, TABLERO, BOTONES, OPCIONES, celdaRect,
} from './layout.js';
import { texto, textoCentrado, textoDerecha, anchoTexto } from './fuente.js';

const COL = {
  piso1: '#150c26', piso2: '#1a1030', pisoMota: '#241845',
  panel: '#0a0612', borde: '#2a1850', morado: '#8b3dff',
  rosa: '#ff4fa3', azul: '#2ea8ff', azulOsc: '#1b6fb3',
  amarillo: '#ffd23f', verde: '#47ff9a', blanco: '#f3eaff', gris: '#a998c9', fondo: '#06030d',
};

// Colores de las marcas: contorno, sombra, base y brillo
const PALETA_X = { k: '#5a1038', d: '#c2306f', b: '#ff4fa3', l: '#ffc2e0' };
const PALETA_O = { k: '#0d3a66', d: '#1b6fb3', b: '#2ea8ff', l: '#b8e6ff' };

// Tamaños de la animación al poner una marca (efecto "rebote")
const TAMANOS_MARCA = [6, 10, 14, 18, 22, 24, 22, 20];
const PASO_ANIM = 0.045;

/* ---------- Construcción de sprites ---------- */

function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// Máscara de una X (dos diagonales gruesas) o una O (anillo) de n x n píxeles
function mascara(tipo, n) {
  const m = Array.from({ length: n }, () => Array(n).fill(false));
  const c = (n - 1) / 2;
  const grosor = Math.max(2, Math.round(n * 0.2));
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (tipo === 'X') {
        const d = Math.min(Math.abs(x - y), Math.abs(x + y - (n - 1)));
        m[y][x] = d < grosor * 0.75 + 0.5;
      } else {
        const r = Math.hypot(x - c, y - c);
        m[y][x] = r <= n / 2 - 0.3 && r >= n / 2 - 0.3 - grosor;
      }
    }
  }
  return m;
}

function crearMarca(tipo, n, pal) {
  const cv = lienzo(n, n);
  const g = cv.getContext('2d');
  const m = mascara(tipo, n);
  const on = (x, y) => y >= 0 && y < n && x >= 0 && x < n && m[y][x];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!m[y][x]) continue;
      let col = pal.b;
      if (!on(x - 1, y) || !on(x + 1, y) || !on(x, y - 1) || !on(x, y + 1)) col = pal.k; // contorno
      else if (!on(x - 2, y - 1) || !on(x - 1, y - 2) || !on(x - 1, y - 1)) col = pal.l;  // brillo arriba-izquierda
      else if (!on(x + 2, y + 1) || !on(x + 1, y + 2) || !on(x + 1, y + 1)) col = pal.d;  // sombra abajo-derecha
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  return cv;
}

function semilla(a) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Fondo fijo: piso, marco y tablero ---------- */

function crearFondo() {
  const cv = lienzo(W, H);
  const g = cv.getContext('2d');
  const r = semilla(5);

  for (let cy = 0; cy < H / 8; cy++) {
    for (let cx = 0; cx < W / 8; cx++) {
      g.fillStyle = (cx + cy) % 2 ? COL.piso1 : COL.piso2;
      g.fillRect(cx * 8, cy * 8, 8, 8);
      if (r() < 0.2) {
        g.fillStyle = COL.pisoMota;
        g.fillRect(cx * 8 + Math.floor(r() * 7), cy * 8 + Math.floor(r() * 7), 1, 1);
      }
    }
  }
  // Marco de pantalla
  g.fillStyle = COL.borde;
  g.fillRect(0, 0, W, 2); g.fillRect(0, H - 2, W, 2); g.fillRect(0, 0, 2, H); g.fillRect(W - 2, 0, 2, H);
  g.fillStyle = COL.morado;
  g.fillRect(2, 2, W - 4, 1); g.fillRect(2, H - 3, W - 4, 1); g.fillRect(2, 2, 1, H - 4); g.fillRect(W - 3, 2, 1, H - 4);
  return cv;
}

function crearTablero() {
  const cv = lienzo(TABLERO.tam + 8, TABLERO.tam + 8);
  const g = cv.getContext('2d');
  const o = 4; // margen del marco alrededor del tablero
  g.fillStyle = COL.fondo; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = COL.morado;
  g.fillRect(0, 0, cv.width, 2); g.fillRect(0, cv.height - 2, cv.width, 2);
  g.fillRect(0, 0, 2, cv.height); g.fillRect(cv.width - 2, 0, 2, cv.height);
  g.fillStyle = COL.borde;
  g.fillRect(2, 2, cv.width - 4, 1); g.fillRect(2, cv.height - 3, cv.width - 4, 1);
  g.fillRect(2, 2, 1, cv.height - 4); g.fillRect(cv.width - 3, 2, 1, cv.height - 4);
  // casillas
  for (let i = 0; i < 9; i++) {
    g.fillStyle = (i + Math.floor(i / 3)) % 2 ? COL.piso1 : COL.piso2;
    g.fillRect(o + (i % 3) * PASO, o + Math.floor(i / 3) * PASO, CELDA, CELDA);
  }
  // líneas del tablero (2 px: color claro + sombra)
  for (const k of [1, 2]) {
    const p = o + k * PASO - 2;
    g.fillStyle = COL.azul; g.fillRect(p, o, 1, TABLERO.tam); g.fillRect(o, p, TABLERO.tam, 1);
    g.fillStyle = COL.azulOsc; g.fillRect(p + 1, o, 1, TABLERO.tam); g.fillRect(o, p + 1, TABLERO.tam, 1);
  }
  return cv;
}

/* ---------- Render ---------- */

export function crearRender(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const fondo = crearFondo();
  const tablero = crearTablero();

  const marcas = { X: {}, O: {} };
  const tamanos = [...new Set([...TAMANOS_MARCA, 12, 14, 16])];
  for (const n of tamanos) {
    marcas.X[n] = crearMarca('X', n, PALETA_X);
    marcas.O[n] = crearMarca('O', n, PALETA_O);
  }

  const marca = (j, n, cx, cy, alfa = 1) => {
    if (alfa < 1) ctx.globalAlpha = alfa;
    ctx.drawImage(marcas[j][n], Math.round(cx - n / 2), Math.round(cy - n / 2));
    ctx.globalAlpha = 1;
  };

  const tamanoAnim = (edad) => TAMANOS_MARCA[Math.min(TAMANOS_MARCA.length - 1, Math.floor(edad / PASO_ANIM))];

  /* --- Piezas de interfaz --- */

  function marcoRect(r, color, grosor = 2) {
    ctx.fillStyle = color;
    ctx.fillRect(r.x, r.y, r.w, grosor); ctx.fillRect(r.x, r.y + r.h - grosor, r.w, grosor);
    ctx.fillRect(r.x, r.y, grosor, r.h); ctx.fillRect(r.x + r.w - grosor, r.y, grosor, r.h);
  }

  function panel(x, y, w, h, borde, alfa = 0.88) {
    ctx.globalAlpha = alfa;
    ctx.fillStyle = COL.panel; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
    marcoRect({ x, y, w, h }, borde);
  }

  function boton(r, etiqueta, color, resaltado) {
    ctx.fillStyle = resaltado ? color : COL.panel;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    marcoRect(r, color);
    texto(ctx, etiqueta, r.x + Math.round((r.w - anchoTexto(etiqueta, 1)) / 2), r.y + 5, 1, resaltado ? COL.fondo : color, resaltado ? null : COL.fondo);
  }

  const etiquetas = (s) => (s.modo === 'dos'
    ? { v: 'J1', d: 'J2', e: 'EMP' }
    : { v: 'VICT', d: 'DERR', e: 'EMP' });

  const quienJuega = (s) => {
    if (s.modo === 'dos') return s.turno === 'X' ? 'J1' : 'J2';
    return s.turno === 'X' ? 'TU' : 'IA';
  };

  /* --- Menú --- */

  function menu(s) {
    textoCentrado(ctx, W, 'TRES EN RAYA', 10, 2, COL.rosa, COL.azulOsc);
    marca('X', 14, 22, 15);
    marca('O', 14, 170, 15);
    textoCentrado(ctx, W, 'ELIGE UN MODO', 27, 1, COL.gris);

    const nombres = ['2 JUGADORES', 'CONTRA IA'];
    const lineas = [
      (st) => `J1 ${st.v}  J2 ${st.d}  EMP ${st.e}`,
      (st) => `VICT ${st.v}  DERR ${st.d}  EMP ${st.e}`,
    ];
    const stats = [s.stats.dos, s.stats.ia];
    OPCIONES.forEach((r, i) => {
      const sel = s.menuSel === i;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = sel ? '#2a1850' : COL.panel;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.globalAlpha = 1;
      marcoRect(r, sel ? COL.amarillo : COL.borde);
      textoCentrado(ctx, W, nombres[i], r.y + 6, 2, sel ? COL.blanco : COL.gris);
      textoCentrado(ctx, W, lineas[i](stats[i]), r.y + 20, 1, sel ? COL.azul : COL.gris);
      if (sel && Math.floor(s.t * 3) % 2 === 0) texto(ctx, '>', r.x + 6, r.y + 11, 2, COL.amarillo);
    });
    if (Math.floor(s.t * 2) % 2 === 0) textoCentrado(ctx, W, 'TOCA UNA OPCION O START', 118, 1, COL.amarillo);
  }

  /* --- Partida --- */

  function lineaGanadora(s) {
    const a = celdaRect(s.linea[0]), c = celdaRect(s.linea[2]);
    const x0 = a.x + CELDA / 2, y0 = a.y + CELDA / 2, x1 = c.x + CELDA / 2, y1 = c.y + CELDA / 2;
    const p = Math.min(1, Math.max(0, (s.finT - 0.15) / 0.4));
    const largo = Math.hypot(x1 - x0, y1 - y0);
    const pasos = Math.floor(largo * p);
    for (let k = 0; k <= pasos; k++) {
      const x = x0 + ((x1 - x0) * k) / largo, y = y0 + ((y1 - y0) * k) / largo;
      ctx.fillStyle = '#7a4a00'; ctx.fillRect(Math.round(x - 3), Math.round(y - 3), 6, 6);
    }
    for (let k = 0; k <= pasos; k++) {
      const x = x0 + ((x1 - x0) * k) / largo, y = y0 + ((y1 - y0) * k) / largo;
      ctx.fillStyle = COL.amarillo; ctx.fillRect(Math.round(x - 2), Math.round(y - 2), 4, 4);
    }
    for (let k = 0; k <= pasos; k++) {
      const x = x0 + ((x1 - x0) * k) / largo, y = y0 + ((y1 - y0) * k) / largo;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x - 1), Math.round(y - 1), 2, 2);
    }
  }

  function esquinas(r, color) {
    ctx.fillStyle = color;
    const l = 6;
    ctx.fillRect(r.x, r.y, l, 2); ctx.fillRect(r.x, r.y, 2, l);
    ctx.fillRect(r.x + r.w - l, r.y, l, 2); ctx.fillRect(r.x + r.w - 2, r.y, 2, l);
    ctx.fillRect(r.x, r.y + r.h - 2, l, 2); ctx.fillRect(r.x, r.y + r.h - l, 2, l);
    ctx.fillRect(r.x + r.w - l, r.y + r.h - 2, l, 2); ctx.fillRect(r.x + r.w - 2, r.y + r.h - l, 2, l);
  }

  function tableroJuego(s) {
    ctx.drawImage(tablero, TABLERO.x - 4, TABLERO.y - 4);

    const fin = s.estado === 'fin';
    const ganadoras = fin && s.linea ? s.linea : [];

    // casillas ganadoras: parpadeo de fondo
    if (ganadoras.length && s.finT > 0.15) {
      const col = s.ganador === 'X' ? '#ff4fa3' : '#2ea8ff';
      ctx.globalAlpha = Math.floor(s.finT * 5) % 2 === 0 ? 0.3 : 0.14;
      ctx.fillStyle = col;
      for (const i of ganadoras) { const r = celdaRect(i); ctx.fillRect(r.x, r.y, r.w, r.h); }
      ctx.globalAlpha = 1;
    }

    // cursor / casilla señalada y vista previa de la marca
    const turnoHumano = s.estado === 'jugando' && !(s.modo === 'ia' && s.turno === 'O');
    if (turnoHumano && s.mostrarCursor && !s.tablero[s.cursor]) {
      const r = celdaRect(s.cursor);
      ctx.globalAlpha = 0.12; ctx.fillStyle = COL.amarillo; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.globalAlpha = 1;
      marca(s.turno, 20, r.x + CELDA / 2, r.y + CELDA / 2, 0.28);
      esquinas(r, COL.amarillo);
    }

    // marcas
    for (let i = 0; i < 9; i++) {
      const j = s.tablero[i];
      if (!j) continue;
      const r = celdaRect(i);
      let cy = r.y + CELDA / 2;
      const n = tamanoAnim(s.marcas[i]);
      if (ganadoras.includes(i) && s.finT > 0.15) cy += Math.round(Math.sin(s.finT * 10 + i) * 1.5); // saltito de celebración
      marca(j, n, r.x + CELDA / 2, cy);
    }

    if (fin && s.linea) lineaGanadora(s);
  }

  function panelLateral(s) {
    const x = 116, w = 70;
    panel(x, 24, w, 100, COL.borde, 0.7);
    const fin = s.estado === 'fin';
    const e = etiquetas(s);

    texto(ctx, s.modo === 'dos' ? '2 JUGADORES' : 'CONTRA IA', 122, 29, 1, COL.azul);

    if (!fin) {
      texto(ctx, 'TURNO', 122, 39, 1, COL.gris);
      marca(s.turno, 12, 128, 53);
      const quien = quienJuega(s);
      const pensando = s.modo === 'ia' && s.turno === 'O';
      const txt = pensando ? quien + '.'.repeat(Math.floor(s.t * 3) % 4) : quien;
      texto(ctx, txt, 138, 50, 1, s.turno === 'X' ? COL.rosa : COL.azul);
    } else {
      let msg, col;
      if (s.ganador === 'empate') { msg = 'EMPATE'; col = COL.azul; }
      else if (s.modo === 'dos') { msg = s.ganador === 'X' ? 'GANA J1' : 'GANA J2'; col = s.ganador === 'X' ? COL.rosa : COL.azul; }
      else if (s.ganador === 'X') { msg = 'GANAS!'; col = COL.verde; }
      else { msg = 'PIERDES'; col = COL.rosa; }
      if (s.finT > 0.45) {
        texto(ctx, msg, 116 + Math.round((70 - anchoTexto(msg, 2)) / 2), 38, 2, col);
      }
    }

    // marcador
    const st = s.stats[s.modo];
    ctx.fillStyle = COL.borde; ctx.fillRect(122, 63, 58, 1);
    texto(ctx, e.v, 122, 67, 1, COL.verde); textoDerecha(ctx, String(st.v), 180, 67, 1, COL.blanco);
    texto(ctx, e.d, 122, 74, 1, COL.rosa); textoDerecha(ctx, String(st.d), 180, 74, 1, COL.blanco);
    texto(ctx, e.e, 122, 81, 1, COL.azul); textoDerecha(ctx, String(st.e), 180, 81, 1, COL.blanco);
  }

  function pantallaPartida(s) {
    textoCentrado(ctx, W, 'TRES EN RAYA', 9, 2, COL.rosa, COL.azulOsc);
    tableroJuego(s);
    panelLateral(s);
  }

  return function dibujar(s) {
    ctx.drawImage(fondo, 0, 0);
    ctx.save();
    if (s.sacudida > 0) ctx.translate(Math.round(Math.random() * 4 - 2), Math.round(Math.random() * 4 - 2));

    if (s.estado === 'menu') menu(s);
    else pantallaPartida(s);

    for (const p of s.particulas) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.tam, p.tam);
    }
    ctx.restore();

    if (s.estado === 'jugando' || s.estado === 'pausa') boton(BOTONES.menu, 'MENU', COL.gris, s.hoverBoton === 'menu');
    if (s.estado === 'fin' && s.finT > 0.5) {
      boton(BOTONES.otra, 'OTRA', COL.verde, s.hoverBoton === 'otra');
      boton(BOTONES.menu, 'MENU', COL.gris, s.hoverBoton === 'menu');
    }

    if (s.estado === 'pausa') {
      panel(34, 52, 124, 40, COL.azul, 0.92);
      textoCentrado(ctx, W, 'PAUSA', 58, 2, COL.amarillo);
      textoCentrado(ctx, W, 'TOCA O PRESIONA START', 78, 1, COL.gris);
    }

    if (s.flash > 0) {
      ctx.globalAlpha = Math.min(0.5, s.flash / 0.12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    }
  };
}
