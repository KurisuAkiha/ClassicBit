'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import GameIcon from './GameIcon';
import { juegos } from './juegos';
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

function IconoPausa({ pausado }) {
  return (
    <svg viewBox="0 0 10 10" width="12" height="12" aria-hidden="true">
      {pausado ? (
        <polygon points="2,1 9,5 2,9" fill="currentColor" />
      ) : (
        <>
          <rect x="2" y="1" width="2" height="8" fill="currentColor" />
          <rect x="6" y="1" width="2" height="8" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export default function Console({ game }) {
  const Juego = juegos[game.slug];

  const [record, setRecord] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [pausado, setPausado] = useState(false);

  // Botones de pantalla que están presionados (los lee el juego en cada cuadro)
  const teclas = useRef({});
  // Funciones que registra el juego: start, pausa, reiniciar
  const acciones = useRef({});

  useEffect(() => setRecord(getRecord(game.slug)), [game.slug]);

  // Un botón que cuenta como "mantenido" mientras el dedo o el mouse lo presionan
  const mantener = (k) => {
    const soltar = () => { teclas.current[k] = false; };
    return {
      onPointerDown(e) {
        e.preventDefault();
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
        teclas.current[k] = true;
      },
      onPointerUp: soltar,
      onPointerCancel: soltar,
      onLostPointerCapture: soltar,
      onContextMenu: (e) => e.preventDefault(),
    };
  };

  return (
    <main id="juego" data-ctrl={game.controles} style={{ '--c': game.color }}>
      <section className="wrap game">
        <div className="gbar">
          <Link className="btn alt" href="/#juegos">← Volver</Link>
          <h2>{game.nombre}</h2>
        </div>

        <div className="hud">
          <div>PUNTOS <b>{String(puntos).padStart(3, '0')}</b></div>
          <div>{game.etiquetaRecord} <b>{record}</b></div>
          <div>
            <button
              className="mini"
              aria-label={pausado ? 'Reanudar' : 'Pausa'}
              onClick={() => acciones.current.pausa?.()}
            >
              <IconoPausa pausado={pausado} />
            </button>
            <button className="mini" aria-label="Reiniciar" onClick={() => acciones.current.reiniciar?.()}>↻</button>
          </div>
        </div>

        <div className="console">
          <div className="bezel">
            <div className="btitle">
              <span><i className="led"></i>POWER</span>
              <span>CLASSICBIT</span>
            </div>

            {Juego ? (
              <div className="stage activo" id="stage">
                <Juego
                  teclas={teclas}
                  acciones={acciones}
                  onPuntos={setPuntos}
                  onRecord={setRecord}
                  onEstado={(e) => setPausado(e === 'pausa')}
                />
              </div>
            ) : (
              <div className="stage" id="stage">
                <GameIcon slug={game.slug} />
                <div className="blink soon">PRÓXIMAMENTE</div>
                <div>Aquí irá el juego</div>
              </div>
            )}
          </div>

          <div className="left">
            <div className="dpad" aria-label="Controles">
              <button className="key up" data-key="up" aria-label="Arriba" {...mantener('up')}><Flecha dir="up" /></button>
              <button className="key left" data-key="left" aria-label="Izquierda" {...mantener('left')}><Flecha dir="left" /></button>
              <button className="key right" data-key="right" aria-label="Derecha" {...mantener('right')}><Flecha dir="right" /></button>
              <button className="key down" data-key="down" aria-label="Abajo" {...mantener('down')}><Flecha dir="down" /></button>
            </div>
            <div className="grille" aria-hidden="true"></div>
          </div>

          <div className="right">
            <button className="key start" data-key="start" onClick={() => acciones.current.start?.()}>START</button>
            <div className="ab">
              <button className="key" data-key="b" aria-label="Botón B" {...mantener('b')}>B</button>
              <button
                className="key"
                data-key={game.teclaA || 'a'}
                aria-label={game.botonA || 'Botón A'}
                {...mantener(game.teclaA || 'a')}
              >
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
