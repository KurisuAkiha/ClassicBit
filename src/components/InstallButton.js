'use client';
import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    const guardar = (e) => {
      e.preventDefault();
      setEvento(e);
    };
    window.addEventListener('beforeinstallprompt', guardar);
    return () => window.removeEventListener('beforeinstallprompt', guardar);
  }, []);

  if (!evento) return null;

  return (
    <button
      className="btn alt"
      onClick={() => {
        evento.prompt();
        setEvento(null);
      }}
    >
      Instalar app
    </button>
  );
}
