'use client';
import { useEffect, useState } from 'react';

export default function StatusBadge() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const actualizar = () => setOnline(navigator.onLine);
    actualizar();
    window.addEventListener('online', actualizar);
    window.addEventListener('offline', actualizar);
    return () => {
      window.removeEventListener('online', actualizar);
      window.removeEventListener('offline', actualizar);
    };
  }, []);

  return (
    <div className={'status' + (online ? '' : ' off')} id="status">
      {online ? '● EN LÍNEA' : '● SIN CONEXIÓN'}
    </div>
  );
}
