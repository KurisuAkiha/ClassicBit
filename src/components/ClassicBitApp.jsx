'use client';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { GAMES } from '@/lib/games';
import { setRecord } from '@/lib/records';
import Home from './Home';
import GameView from './GameView';

function subscribe(cb) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

const DEFAULT_TITLE = 'ClassicBit · Mini librería de juegos';

// Navegación por hash (#culebrita, #juegos...) igual que en el HTML original.
export default function ClassicBitApp() {
  const hash = useSyncExternalStore(subscribe, () => location.hash.slice(1), () => '');
  const game = GAMES.find((g) => g.slug === hash) || null;
  const prevGame = useRef(null);

  useEffect(() => {
    window.ClassicBit = { setRecord };
  }, []);

  useEffect(() => {
    if (game) {
      document.title = `${game.name} · ClassicBit`;
      window.scrollTo(0, 0);
    } else {
      document.title = DEFAULT_TITLE;
      if (prevGame.current) {
        // Volvimos desde un juego: el home se acaba de montar, hay que hacer scroll a mano.
        const target = hash && document.getElementById(hash);
        if (target) target.scrollIntoView();
        else window.scrollTo(0, 0);
      }
    }
    prevGame.current = game;
  }, [game, hash]);

  return game ? <GameView game={game} /> : <Home />;
}
