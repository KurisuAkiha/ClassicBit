'use client';
import Image from 'next/image';
import { useSyncExternalStore } from 'react';

function subscribe(cb) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

export default function Header() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

  return (
    <header>
      <div className="wrap">
        <a className="brand" href="#inicio">
          <Image className="logo" src="/logo.png" alt="" width={32} height={32} unoptimized />
          Classic<span>Bit</span>
        </a>
        <nav aria-label="Principal">
          <a href="#juegos">🎮 Juegos</a>
          <a href="#contacto">💬 Contacto</a>
        </nav>
        <div className={'status' + (online ? '' : ' off')} id="status">
          {online ? '● EN LÍNEA' : '● SIN CONEXIÓN'}
        </div>
      </div>
    </header>
  );
}
