'use client';
import { useEffect, useRef } from 'react';
import './tresenraya.css';
import {
  nuevoJuego, actualizar, tocar, pasar, moverMenu, moverCursor, confirmar,
  atras, reiniciar, pulsarStart, alternarPausa,
} from '../../lib/tresenraya/engine.js';
import { crearRender } from '../../lib/tresenraya/render.js';
import { W, H } from '../../lib/tresenraya/layout.js';
import { leerStats, guardarModo } from '../../lib/tresenraya/stats.js';

// Teclado → dirección del cursor / del menú
const DIRECCIONES = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};

// Recibe de la consola las mismas propiedades que los demás juegos:
//   teclas   → botones de pantalla mantenidos (aquí solo se usan si la consola los muestra)
//   acciones → ref donde registramos start / pausa / reiniciar
//   onPuntos → victorias de esta visita   |   onRecord → victorias acumuladas del modo
//   onEstado → para que la consola cambie el ícono de pausa
// Las estadísticas NO usan lib/records.js: tienen su propio almacenamiento (lib/tresenraya/stats.js).
export default function TresEnRaya({ teclas, acciones, onPuntos, onRecord, onEstado }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dibujar = crearRender(canvas);
    // Siempre se empieza en el menú: nunca se restaura una partida en curso
    const s = nuevoJuego(leerStats());
    let raf = 0;
    let ultimo = 0;
    let puntosMostrados = -1;
    let recordMostrado = -1;
    let estadoMostrado = '';
    let teclasPrevias = {};

    /* ---- Acciones de la consola ---- */
    acciones.current = {
      start: () => pulsarStart(s),
      pausa: () => alternarPausa(s),
      reiniciar: () => reiniciar(s),
    };

    /* ---- Teclado ---- */
    function alPresionar(e) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const dir = DIRECCIONES[e.code];
      if (dir) {
        e.preventDefault(); // evita que la página se desplace
        if (s.estado === 'menu') moverMenu(s, dir[0] + dir[1]);
        else if (s.estado === 'jugando') moverCursor(s, dir[0], dir[1]);
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        confirmar(s);
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        alternarPausa(s);
      } else if (e.code === 'KeyR') {
        reiniciar(s);
      } else if (e.code === 'KeyM' || e.code === 'Backspace') {
        e.preventDefault();
        atras(s);
      }
    }
    window.addEventListener('keydown', alPresionar);

    /* ---- Toque y mouse sobre el canvas ---- */
    // Convierte la posición del puntero a píxeles del canvas (el canvas usa object-fit: contain)
    function aCanvas(e) {
      const r = canvas.getBoundingClientRect();
      const esc = Math.min(r.width / W, r.height / H);
      const ox = (r.width - W * esc) / 2;
      const oy = (r.height - H * esc) / 2;
      return { x: (e.clientX - r.left - ox) / esc, y: (e.clientY - r.top - oy) / esc };
    }
    function alTocar(e) {
      e.preventDefault();
      const p = aCanvas(e);
      s.mostrarCursor = e.pointerType === 'mouse';
      tocar(s, p.x, p.y);
    }
    function alMover(e) {
      if (e.pointerType !== 'mouse') return;
      const p = aCanvas(e);
      pasar(s, p.x, p.y);
    }
    canvas.addEventListener('pointerdown', alTocar);
    canvas.addEventListener('pointermove', alMover);

    /* ---- Pausa automática al salir de la pestaña ---- */
    function pausarSiSale() {
      if (s.estado === 'jugando') alternarPausa(s);
    }
    function alCambiarVisibilidad() {
      if (document.hidden) pausarSiSale();
    }
    window.addEventListener('blur', pausarSiSale);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);

    // Evita el "tirón para recargar" en móviles mientras se juega
    const antes = document.documentElement.style.overscrollBehavior;
    document.documentElement.style.overscrollBehavior = 'none';

    /* ---- Bucle ---- */
    function cuadro(ahora) {
      raf = requestAnimationFrame(cuadro);
      const dt = Math.min(0.05, (ahora - ultimo) / 1000 || 0);
      ultimo = ahora;

      // Botones de pantalla de la consola (si están visibles): flechas, A = confirmar, B = menú
      const t = teclas.current;
      const nueva = (k) => t[k] && !teclasPrevias[k];
      if (nueva('a')) confirmar(s);
      if (nueva('b')) atras(s);
      for (const [k, d] of [['up', [0, -1]], ['down', [0, 1]], ['left', [-1, 0]], ['right', [1, 0]]]) {
        if (!nueva(k)) continue;
        if (s.estado === 'menu') moverMenu(s, d[0] + d[1]);
        else if (s.estado === 'jugando') moverCursor(s, d[0], d[1]);
      }
      teclasPrevias = { ...t };

      actualizar(s, dt);

      // Al terminar una partida se guardan las estadísticas de ese modo
      if (s.guardar) {
        guardarModo(s.guardar, s.stats[s.guardar]);
        s.guardar = null;
      }

      const record = s.stats[s.modo || 'ia'].v;
      if (s.sesion !== puntosMostrados) { puntosMostrados = s.sesion; onPuntos(s.sesion); }
      if (record !== recordMostrado) { recordMostrado = record; onRecord(record); }
      if (s.estado !== estadoMostrado) { estadoMostrado = s.estado; onEstado(s.estado); }

      dibujar(s);
    }
    raf = requestAnimationFrame(cuadro);

    /* ---- Limpieza al salir del juego (la partida en curso simplemente se descarta) ---- */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', alPresionar);
      window.removeEventListener('blur', pausarSiSale);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      canvas.removeEventListener('pointerdown', alTocar);
      canvas.removeEventListener('pointermove', alMover);
      document.documentElement.style.overscrollBehavior = antes;
      acciones.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      aria-label="Tres en raya: elige un modo y toca una casilla para jugar"
    />
  );
}
