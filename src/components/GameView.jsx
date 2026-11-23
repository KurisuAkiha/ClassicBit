'use client';
import { useRecord } from '@/lib/records';
import GameIcon from './GameIcons';

export default function GameView({ game }) {
  const record = useRecord(game.slug);
  const b = game.btn || { label: 'A', key: 'a' };

  return (
    <main id="juego" data-ctrl={game.ctrl} style={{ '--c': game.color }}>
      <section className="wrap game">
        <div className="gbar">
          <a className="btn alt" href="#juegos">◀ Volver</a>
          <h2>{game.name}</h2>
        </div>

        <div className="hud">
          <div>PUNTOS <b>000</b></div>
          <div>{game.recLabel} <b>{record}</b></div>
          <div>
            <button className="mini" aria-label="Pausa">⏸</button>
            <button className="mini" aria-label="Reiniciar">↻</button>
          </div>
        </div>

        <div className="console">
          <div className="bezel">
            <div className="btitle">
              <span><i className="led" />POWER</span>
              <span>CLASSICBIT</span>
            </div>
            {/* #stage: aquí se montará el juego (canvas o componente) */}
            <div className="stage" id="stage">
              <div><GameIcon slug={game.slug} /></div>
              <div className="blink soon">PRÓXIMAMENTE</div>
              <div>Aquí irá el juego</div>
            </div>
          </div>

          <div className="left">
            <div className="dpad" aria-label="Controles">
              <button className="key up" data-key="up" aria-label="Arriba">▲</button>
              <button className="key left" data-key="left" aria-label="Izquierda">◀</button>
              <button className="key right" data-key="right" aria-label="Derecha">▶</button>
              <button className="key down" data-key="down" aria-label="Abajo">▼</button>
            </div>
            <div className="grille" aria-hidden="true" />
          </div>

          <div className="right">
            <button className="key start" data-key="start">START</button>
            <div className="ab">
              <button className="key" data-key="b" aria-label="Botón B">B</button>
              <button className="key" data-key={b.key} aria-label={b.label === 'A' ? 'Botón A' : b.label}>{b.label}</button>
            </div>
          </div>
        </div>

        <p className="how">{game.how}</p>
      </section>
    </main>
  );
}
