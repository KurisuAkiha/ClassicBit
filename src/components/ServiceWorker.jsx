'use client';
import { useEffect } from 'react';

// Registra el service worker solo en producción (npm run build && npm start).
// En desarrollo lo desregistra para que el caché no te muestre versiones viejas.
export default function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      if (window.caches) {
        caches.keys().then((ks) => ks.filter((k) => k.startsWith('classicbit-')).forEach((k) => caches.delete(k)));
      }
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        // Guarda en caché lo que ya cargó esta página (JS, CSS, fuente) para que funcione sin internet.
        const urls = performance
          .getEntriesByType('resource')
          .map((r) => r.name)
          .filter((u) => u.startsWith(location.origin));
        reg.active?.postMessage({ type: 'CACHE_URLS', urls });
      })
      .catch(() => {});
  }, []);

  return null;
}
