'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import GameIcon from './GameIcon';
import SnakeGame from './SnakeGame';
import { getRecord } from '../lib/records';

// Flecha en SVG (así se ve igual en todos los dispositivos, sin emojis)
function Flecha({ dir }) {
  const giro = { up: 0, right: 90, down: 180, left: 270 }[dir];
  return (
    <svg viewBox="0 0 10 10" width="22" height="22" aria-hidden="true" style={{ transform: `rotate(${giro}deg)` }}>
      <polygon points="5,1 9,9 1,9" fill="currentColor" />
    </svg>
  );
}

export default function Console({ game }) {
  const [record, setRecord] = useState(0);
  useEffect(() => setRecord(getRecord(game.slug)), [game.slug]);

  return (
    <main id="juego" data-ctrl={game.controles} style={{ '--c': game.color }}>
      <section className="wrap game">
        <div className="gbar">
          <Link className="btn alt" href="/#juegos">← Volver</Link>
          <h2>{game.nombre}</h2>
        </div>

        <div className="hud">
          <div>PUNTOS <b>000</b></div>
          <div>{game.etiquetaRecord} <b>{record}</b></div>
          <div>
            <button className="mini" aria-label="Pausa">⏸</button>
            <button className="mini" aria-label="Reiniciar">↻</button>
          </div>
        </div>

        <div className="console">
          <div className="bezel">
            <div className="btitle">
              <span><i className="led"></i>POWER</span>
              <span>CLASSICBIT</span>
            </div>

            {/* AQUÍ se montará el juego (canvas o componente) */}

     <div className="stage" id="stage">
  {game.slug === 'culebrita' ? (
    <SnakeGame />
  ) : (
    <>
      <GameIcon slug={game.slug} />
      <div className="blink soon">PRÓXIMAMENTE</div>
      <div>Aquí irá el juego</div>
    </>
  )}
</div>
</div>

          <div className="left">
            <div className="dpad" aria-label="Controles">
              <button className="key up" data-key="up" aria-label="Arriba"><Flecha dir="up" /></button>
              <button className="key left" data-key="left" aria-label="Izquierda"><Flecha dir="left" /></button>
              <button className="key right" data-key="right" aria-label="Derecha"><Flecha dir="right" /></button>
              <button className="key down" data-key="down" aria-label="Abajo"><Flecha dir="down" /></button>
            </div>
            <div className="grille" aria-hidden="true"></div>
          </div>

          <div className="right">
            <button className="key start" data-key="start">START</button>
            <div className="ab">
              <button className="key" data-key="b" aria-label="Botón B">B</button>
              <button className="key" data-key={game.teclaA || 'a'} aria-label={game.botonA || 'Botón A'}>
                {game.botonA || 'A'}
              </button>
            </div>
          </div>
        </div>

        <p className="how">{game.ayuda}</p>
      </section>
    </main>
  );
}
