// Aquí vive la lista de juegos. Para agregar uno nuevo: añade un objeto aquí
// y su ícono en components/GameIcon.js
export const games = [
  {
    slug: 'tres-en-raya',
    nombre: 'Tres en raya',
    color: 'var(--blue)',
    descripcion: 'El clásico duelo de X y O. Dos jugadores o contra la máquina.',
    jugadores: '1–2 JUGADORES',
    etiquetaRecord: 'VICTORIAS',
    controles: 'touch',
    ayuda: 'Toca una casilla (o haz clic con el mouse) para poner tu marca. Alinea tres para ganar.',
  },
  {
    slug: 'culebrita',
    nombre: 'La culebrita',
    color: 'var(--green)',
    descripcion: 'Come, crece y no te muerdas la cola. Cada punto cuenta.',
    jugadores: '1 JUGADOR',
    etiquetaRecord: 'RÉCORD',
    controles: 'dash',
    botonA: 'DASH',
    teclaA: 'dash',
    ayuda: 'Usa la cruceta para moverte. DASH te da un impulso corto. Come y crece sin chocar.',
  },
  {
    slug: 'turbo-bit',
    nombre: 'Turbo Bit',
    color: 'var(--pink)',
    descripcion: 'Esquiva el tráfico desde arriba y rompe tu récord.',
    jugadores: '1 JUGADOR',
    etiquetaRecord: 'RÉCORD',
    controles: 'dash',
    botonA: 'SALTO',
    teclaA: 'jump',
    ayuda: 'Mueve el carro en las 4 direcciones con la cruceta y esquiva el tráfico. SALTO te deja pasar por encima de los carros.',
  },
];
