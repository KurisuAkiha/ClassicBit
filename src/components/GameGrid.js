'use client';
import { useEffect, useState } from 'react';
import { games } from '../lib/games';
import GameCard from './GameCard';

export default function GameGrid() {
  const [listo, setListo] = useState(false);

  // Muestra los "esqueletos" un momento antes de pintar las tarjetas
  useEffect(() => {
    const t = setTimeout(() => setListo(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="grid" id="grid">
      {listo
        ? games.map((g) => <GameCard key={g.slug} game={g} />)
        : games.map((g) => (
            <div className="skel" aria-hidden="true" key={g.slug}>
              <i className="s1"></i><i className="s2"></i><i className="s3"></i><i className="s4"></i><i className="s5"></i>
            </div>
          ))}
    </div>
  );
}
