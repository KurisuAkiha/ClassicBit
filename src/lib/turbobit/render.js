// Dibujo de Turbo Bit en canvas (pixel art). Solo lee el estado del motor.
import {
  W, H, CARRETERA, SALTO_ENFRIAMIENTO,
} from './engine.js';
import {
  COLORES_COCHE, PALETA_FIJA, MODELOS, DECOR, TAM_DECOR,
} from './sprites.js';

const COL = {
  pasto: '#0e4d3a', pastoMota: '#17734f', pastoMota2: '#0a3a2c',
  asfalto: '#2a2145', asfaltoMota: '#352b57', asfaltoMota2: '#231a3a',
  linea: '#c9bfe6', borde: '#f3eaff', rosa: '#ff4fa3', blanco: '#f3eaff',
  amarillo: '#ffd23f', verde: '#47ff9a', azul: '#2ea8ff', morado: '#8b3dff',
  gris: '#a998c9', fondo: '#06030d', panel: '#0a0612',
};

/* ---------- Fuente 3x5 (mayúsculas, números y algunos signos) ---------- */
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
};

function pasadaTexto(ctx, str, x, y, esc, color) {
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

const anchoTexto = (str, esc) => str.length * 4 * esc - esc;

function texto(ctx, str, x, y, esc, color, sombra = COL.fondo) {
  if (sombra) pasadaTexto(ctx, str, x + esc, y + esc, esc, sombra);
  pasadaTexto(ctx, str, x, y, esc, color);
}

function textoCentrado(ctx, str, y, esc, color, sombra) {
  texto(ctx, str, Math.round((W - anchoTexto(str, esc)) / 2), y, esc, color, sombra);
}

/* ---------- Construcción de sprites ---------- */

function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

const espejar = (filas) => filas.map((f) => f + [...f].reverse().join(''));

function crearSprite(filas, paleta) {
  const f = espejar(filas);
  const c = lienzo(f[0].length, f.length);
  const g = c.getContext('2d');
  f.forEach((fila, y) => {
    [...fila].forEach((ch, x) => {
      if (ch !== '.' && paleta[ch]) { g.fillStyle = paleta[ch]; g.fillRect(x, y, 1, 1); }
    });
  });
  return c;
}

// Números pseudoaleatorios con semilla (para que las motas siempre sean iguales)
function semilla(a) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function crearTextura(w, h, base, motas, n, sem) {
  const c = lienzo(w, h);
  const g = c.getContext('2d');
  const r = semilla(sem);
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    g.fillStyle = motas[i % motas.length];
    g.fillRect(Math.floor(r() * w), Math.floor(r() * h), r() < 0.5 ? 1 : 2, 1);
  }
  return c;
}

/* ---------- Render ---------- */

export function crearRender(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Coches (se pintan una sola vez por color y modelo)
  const coches = {};
  for (const color of Object.keys(COLORES_COCHE)) {
    coches[color] = {};
    for (const modelo of Object.keys(MODELOS)) {
      coches[color][modelo] = crearSprite(MODELOS[modelo].filas, { ...PALETA_FIJA, ...COLORES_COCHE[color] });
    }
  }
  const decor = {};
  for (const k of Object.keys(DECOR)) decor[k] = crearSprite(DECOR[k].filas, DECOR[k].pal);

  const pasto = crearTextura(48, 48, COL.pasto, [COL.pastoMota, COL.pastoMota2], 60, 7);
  const asfalto = crearTextura(CARRETERA.ancho, 32, COL.asfalto, [COL.asfaltoMota, COL.asfaltoMota2], 90, 21);

  const rx = CARRETERA.x;
  const rd = CARRETERA.x + CARRETERA.ancho;

  function mundo(s) {
    const off = Math.floor(s.offset);

    // Pasto
    const oy = off % 48;
    for (let y = -48 + oy; y < H; y += 48) {
      ctx.drawImage(pasto, 0, y);
      ctx.drawImage(pasto, rd, y);
    }

    // Decoración
    for (const d of s.decor) {
      ctx.drawImage(decor[d.tipo], Math.round(d.x), Math.round(d.y));
    }

    // Borde de carretera (bordillos a rayas)
    const o16 = off % 16;
    for (let i = -2; i < 20; i++) {
      ctx.fillStyle = i & 1 ? COL.rosa : COL.blanco;
      ctx.fillRect(rx - 4, i * 8 + o16, 4, 8);
      ctx.fillRect(rd, i * 8 + o16, 4, 8);
    }

    // Asfalto
    const o32 = off % 32;
    for (let y = -32 + o32; y < H; y += 32) ctx.drawImage(asfalto, rx, y);

    // Líneas de borde y carriles
    ctx.fillStyle = COL.borde;
    ctx.fillRect(rx + 2, 0, 1, H);
    ctx.fillRect(rd - 3, 0, 1, H);
    ctx.fillStyle = COL.linea;
    for (let c = 1; c < CARRETERA.carriles; c++) {
      const x = rx + c * CARRETERA.anchoCarril - 1;
      for (let i = -2; i < 12; i++) ctx.fillRect(x, i * 16 + o16, 2, 8);
    }

    // Rayas de velocidad (aparecen al acelerar)
    if (s.scroll > 110) {
      ctx.globalAlpha = Math.min(0.35, (s.scroll - 110) / 250);
      ctx.fillStyle = COL.blanco;
      for (let i = 0; i < 7; i++) {
        const x = rx + 6 + ((i * 37) % 84);
        const y = ((i * 53 + s.offset * 1.8) % (H + 20)) - 14;
        ctx.fillRect(x, Math.round(y), 1, 7);
      }
      ctx.globalAlpha = 1;
    }
  }

  function jugador(s) {
    const j = s.jugador;
    if ((s.estado === 'choque' && s.choqueT > 0.12) || s.estado === 'fin') return;
    const x = Math.round(j.x);
    const y = Math.round(j.y);
    const z = Math.round(j.z);

    if (z > 0) {
      // Sombra en el suelo
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 1, y + 3, j.w - 2, j.h - 4);
      ctx.globalAlpha = 1;
    }
    // Parpadeo suave al caer
    if (j.aterrizaje > 0 && Math.floor(s.t * 24) % 2 === 0) return;
    ctx.drawImage(coches.amarillo.sedan, x, y - z);

    if (j.saltoT >= 0) {
      // Rayitas de aire a los lados
      ctx.fillStyle = COL.blanco;
      ctx.fillRect(x - 3, y - z + 5, 1, 5);
      ctx.fillRect(x + j.w + 2, y - z + 5, 1, 5);
      ctx.fillStyle = COL.amarillo;
      ctx.fillRect(x - 1, y - z + j.h + 1, 2, 1);
      ctx.fillRect(x + j.w - 1, y - z + j.h + 1, 2, 1);
    }
  }

  function hud(s) {
    const j = s.jugador;
    const listo = j.enfriamiento <= 0 && j.saltoT < 0;
    const pct = 1 - j.enfriamiento / SALTO_ENFRIAMIENTO;
    texto(ctx, 'SALTO', 3, H - 14, 1, listo ? COL.verde : COL.gris);
    ctx.fillStyle = COL.fondo; ctx.fillRect(2, H - 8, 38, 5);
    ctx.fillStyle = '#2a1850'; ctx.fillRect(3, H - 7, 36, 3);
    ctx.fillStyle = listo ? COL.verde : COL.amarillo;
    ctx.fillRect(3, H - 7, Math.round(36 * pct), 3);
  }

  function panel(x, y, w, h, borde) {
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = COL.panel; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = borde;
    ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y + h - 2, w, 2);
    ctx.fillRect(x, y, 2, h); ctx.fillRect(x + w - 2, y, 2, h);
  }

  function pantallas(s) {
    const parpadeo = Math.floor(s.t * 2) % 2 === 0;
    if (s.estado === 'inicio') {
      panel(22, 30, 148, 78, COL.morado);
      textoCentrado(ctx, 'TURBO BIT', 40, 3, COL.azul, COL.rosa);
      textoCentrado(ctx, 'ESQUIVA EL TRAFICO', 68, 1, COL.gris);
      if (parpadeo) textoCentrado(ctx, 'PRESIONA START', 88, 1, COL.amarillo);
    } else if (s.estado === 'pausa') {
      panel(52, 50, 88, 40, COL.azul);
      textoCentrado(ctx, 'PAUSA', 62, 2, COL.amarillo);
    } else if (s.estado === 'fin') {
      panel(28, 24, 136, 96, COL.rosa);
      textoCentrado(ctx, 'GAME OVER', 33, 2, COL.rosa);
      textoCentrado(ctx, 'PUNTOS ' + s.puntos, 58, 1, COL.blanco);
      textoCentrado(ctx, 'RECORD ' + Math.max(s.record, s.puntos), 70, 1, COL.azul);
      if (s.nuevoRecord && parpadeo) textoCentrado(ctx, 'NUEVO RECORD!', 86, 1, COL.verde);
      if (s.bloqueo <= 0 && parpadeo) textoCentrado(ctx, 'PRESIONA START', 102, 1, COL.amarillo);
    }
  }

  return function dibujar(s) {
    ctx.fillStyle = COL.pasto;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    if (s.sacudida > 0) ctx.translate(Math.round(Math.random() * 4 - 2), Math.round(Math.random() * 4 - 2));

    mundo(s);
    for (const c of s.coches) ctx.drawImage(coches[c.color][c.modelo], Math.round(c.x), Math.round(c.y));
    jugador(s);

    for (const p of s.particulas) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.tam, p.tam);
    }
    ctx.restore();

    if (s.estado === 'jugando' || s.estado === 'pausa') hud(s);
    pantallas(s);

    if (s.flash > 0) {
      ctx.globalAlpha = Math.min(0.7, s.flash / 0.15);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  };
}
