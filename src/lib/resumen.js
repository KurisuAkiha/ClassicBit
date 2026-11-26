// Número que muestran las tarjetas del inicio junto a cada juego.
// Casi todos usan el sistema de récords (lib/records.js). Tres en raya tiene sus propias
// estadísticas, así que muestra sus victorias contra la IA desde su propio almacenamiento.
import { getRecord } from './records';
import { victoriasIA } from './tresenraya/stats.js';

const lectores = {
  'tres-en-raya': victoriasIA,
};

export function getResumen(slug) {
  const leer = lectores[slug];
  return leer ? leer() : getRecord(slug);
}
