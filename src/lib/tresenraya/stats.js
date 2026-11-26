// Estadísticas de Tres en raya. Almacenamiento PROPIO e independiente del sistema
// de récords (lib/records.js): una clave por modalidad, con victorias, derrotas y empates.
//
//   classicbit-tresenraya-stats-ia   → {"v":3,"d":1,"e":2}   (contra la IA)
//   classicbit-tresenraya-stats-2j   → {"v":2,"d":2,"e":1}   (dos jugadores: v = J1, d = J2)
//
// Solo se guardan partidas terminadas. Nunca se guarda una partida en curso.

const PREFIJO = 'classicbit-tresenraya-stats-';
export const MODOS = ['ia', 'dos'];
const SUFIJO = { ia: 'ia', dos: '2j' };

export const statsVacias = () => ({ v: 0, d: 0, e: 0 });

const entero = (n) => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);

function leerModo(modo) {
  try {
    const crudo = localStorage.getItem(PREFIJO + SUFIJO[modo]);
    if (!crudo) return statsVacias();
    const o = JSON.parse(crudo);
    return { v: entero(o.v), d: entero(o.d), e: entero(o.e) };
  } catch {
    return statsVacias(); // sin localStorage o dato dañado
  }
}

// Devuelve { ia: {v,d,e}, dos: {v,d,e} }
export function leerStats() {
  return { ia: leerModo('ia'), dos: leerModo('dos') };
}

export function guardarModo(modo, stats) {
  try {
    localStorage.setItem(PREFIJO + SUFIJO[modo], JSON.stringify({
      v: entero(stats.v), d: entero(stats.d), e: entero(stats.e),
    }));
  } catch {}
}

// Victorias del jugador contra la IA (es el número que muestra la tarjeta del inicio)
export function victoriasIA() {
  return leerModo('ia').v;
}
