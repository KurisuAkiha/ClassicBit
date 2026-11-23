'use client';
import { useEffect } from 'react';

// Registra el service worker (public/sw.js) solo en producción.
export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);
  return null;
}
