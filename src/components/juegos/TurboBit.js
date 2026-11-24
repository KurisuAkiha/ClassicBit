'use client';
import { useEffect, useRef } from 'react';
import './turbobit.css';
import { W, H, nuevoJuego, iniciar, pulsarStart, alternarPausa, actualizar } from '../../lib/turbobit/engine.js';
import { crearRender } from '../../lib/turbobit/render.js';
import { getRecord, setRecord } from '../../lib/records';

const SLUG = 'turbo-bit';

// Teclas del teclado → acciones del juego
const MAPA = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  Space: 'jump',
};

// Recibe de la consola:
//   teclas   → ref con los botones de pantalla que se mantienen presionados
//   acciones → ref donde registramos start / pausa / reiniciar
//   onPuntos, onRecord, onEstado → avisan a la consola para actualizar su HUD
export default function TurboBit({ teclas, acciones, onPuntos, onRecord, onEstado }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dibujar = crearRender(canvas);
    const s = nuevoJuego(getRecord(SLUG));
    const teclado = {};
    let raf = 0;
    let ultimo = 0;
    let puntosMostrados = -1;
    let estadoMostrado = '';

    onRecord(s.record);

    /* ---- Acciones de la consola ---- */
    acciones.current = {
      start: () => pulsarStart(s),
      pausa: () => alternarPausa(s),
      reiniciar: () => iniciar(s),
    };

    /* ---- Teclado ---- */
    function alPresionar(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const accion = MAPA[e.code];
      if (accion) {
        e.preventDefault(); // evita que la página se desplace
        teclado[accion] = true;
      } else if (!e.repeat) {
        if (e.code === 'Enter') { e.preventDefault(); pulsarStart(s); }
        else if (e.code === 'KeyP' || e.code === 'Escape') alternarPausa(s);
        else if (e.code === 'KeyR') iniciar(s);
      }
    }
    function alSoltar(e) {
      const accion = MAPA[e.code];
      if (accion) { e.preventDefault(); teclado[accion] = false; }
    }
    // Si se pierde el foco o se cambia de pestaña, se pausa y se sueltan las teclas
    function pausarSiSale() {
      for (const k of Object.keys(teclado)) teclado[k] = false;
      if (s.estado === 'jugando') alternarPausa(s);
    }
    function alCambiarVisibilidad() {
      if (document.hidden) pausarSiSale();
    }

    window.addEventListener('keydown', alPresionar);
    window.addEventListener('keyup', alSoltar);
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

      const t = teclas.current;
      actualizar(s, dt, {
        up: teclado.up || t.up,
        down: teclado.down || t.down,
        left: teclado.left || t.left,
        right: teclado.right || t.right,
        jump: teclado.jump || t.jump,
      });

      // Al chocar se guarda el récord con el sistema que ya tiene ClassicBit
      if (s.guardar) {
        s.guardar = false;
        setRecord(SLUG, s.puntos);
        s.record = getRecord(SLUG);
        onRecord(s.record);
      }
      if (s.puntos !== puntosMostrados) { puntosMostrados = s.puntos; onPuntos(s.puntos); }
      if (s.estado !== estadoMostrado) { estadoMostrado = s.estado; onEstado(s.estado); }

      dibujar(s);
    }
    raf = requestAnimationFrame(cuadro);

    /* ---- Limpieza al salir del juego ---- */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', alPresionar);
      window.removeEventListener('keyup', alSoltar);
      window.removeEventListener('blur', pausarSiSale);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
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
      aria-label="Turbo Bit: juego de carreras visto desde arriba"
    />
  );
}
