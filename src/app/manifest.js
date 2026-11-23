export default function manifest() {
  return {
    name: 'ClassicBit · Mini librería de juegos',
    short_name: 'ClassicBit',
    description: 'Tu mini librería de juegos retro. Sin descargas y sin internet.',
    lang: 'es',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#0a0612',
    theme_color: '#0a0612',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
