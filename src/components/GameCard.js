'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import GameIcon from './GameIcon';
import { getRecord } from '../lib/records';

export default function GameCard({ game }) {
  const [record, setRecord] = useState(0);
  useEffect(() => setRecord(getRecord(game.slug)), [game.slug]);

  return (
    <article className="card" style={{ '--c': game.color }}>
      <div className="screen">
        <GameIcon slug={game.slug} />
      </div>
      <h3>{game.nombre}</h3>
      <p>{game.descripcion}</p>
      <span className="tag">{game.jugadores}</span>
      <span className="rec">{game.etiquetaRecord}: <b>{record}</b></span>
      <Link className="btn" href={`/juego/${game.slug}`}>Jugar</Link>
    </article>
  );
}
