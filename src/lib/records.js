// Récords guardados en el dispositivo (localStorage).
// Los juegos usarán setRecord('culebrita', puntos) al terminar la partida.
const KEY = 'classicbit-record-';

export function getRecord(slug) {
  try {
    return parseInt(localStorage.getItem(KEY + slug), 10) || 0;
  } catch {
    return 0;
  }
}

export function setRecord(slug, valor) {
  if (valor > getRecord(slug)) {
    try {
      localStorage.setItem(KEY + slug, String(valor));
    } catch {}
  }
}
