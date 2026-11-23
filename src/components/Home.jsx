'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { GAMES } from '@/lib/games';
import { useRecord } from '@/lib/records';
import GameIcon from './GameIcons';

function GameCard({ game }) {
  const record = useRecord(game.slug);
  return (
    <article className="card" style={{ '--c': game.color }}>
      <div className="screen">
        <GameIcon slug={game.slug} />
      </div>
      <h3>{game.name}</h3>
      <p>{game.desc}</p>
      <span className="tag">{game.tag}</span>
      <span className="rec">
        {game.recLabel}: <b>{record}</b>
      </span>
      <a className="btn" href={'#' + game.slug}>Jugar</a>
    </article>
  );
}

function InstallButton() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!prompt) return null;
  return (
    <button
      className="btn alt"
      onClick={() => {
        prompt.prompt();
        setPrompt(null);
      }}
    >
      Instalar app
    </button>
  );
}

function ContactForm() {
  const [ok, setOk] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('classicbit-feedback') || '[]');
    } catch {
      list = [];
    }
    list.push({
      nombre: d.get('nombre'),
      tipo: d.get('tipo'),
      mensaje: d.get('mensaje'),
      fecha: new Date().toISOString(),
    });
    try {
      localStorage.setItem('classicbit-feedback', JSON.stringify(list));
    } catch {}
    setOk('¡Gracias! Tu mensaje fue guardado.');
    form.reset();
  }

  return (
    <form className="fb" onSubmit={onSubmit}>
      <label>
        Tu nombre (opcional)
        <input type="text" name="nombre" maxLength={40} autoComplete="name" />
      </label>
      <label>
        Tipo de mensaje
        <select name="tipo">
          <option>Comentario</option>
          <option>Sugerencia</option>
          <option>Reportar un error</option>
        </select>
      </label>
      <label>
        Mensaje
        <textarea name="mensaje" maxLength={500} required />
      </label>
      <button className="btn" type="submit">Enviar</button>
      <p className="ok" role="status">{ok}</p>
    </form>
  );
}

export default function Home() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 700); // skeleton de carga, como el original
    return () => clearTimeout(t);
  }, []);

  return (
    <main id="inicio">
      <section className="hero wrap">
        <Image
          className="hero-logo"
          src="/logo.png"
          alt="Logo de ClassicBit: consola retro con una culebrita en pantalla"
          width={112}
          height={112}
          unoptimized
        />
        <h1>Classic<em>Bit</em></h1>
        <p>Tu mini librería de juegos retro. Sin descargas y sin internet: ábrela, instálala y juega donde quieras.</p>
        <a className="btn" href="#juegos">▶ Jugar ahora</a>
        <InstallButton />
        <div className="blink">PRESIONA START</div>
      </section>

      <section id="juegos" className="wrap">
        <h2>Elige tu juego</h2>
        <div className={'grid' + (ready ? ' ready' : '')} id="grid">
          {GAMES.map((g) => (
            <div className="skel" aria-hidden="true" key={'s-' + g.slug}>
              <i className="s1" /><i className="s2" /><i className="s3" /><i className="s4" /><i className="s5" />
            </div>
          ))}
          {GAMES.map((g) => (
            <GameCard game={g} key={g.slug} />
          ))}
        </div>
      </section>

      <section id="offline" className="band">
        <div className="wrap">
          <div><b>SIN INTERNET</b>Los juegos se guardan en tu dispositivo.</div>
          <div><b>SIN DESCARGAS</b>Ábrela desde el navegador con un enlace.</div>
          <div><b>INSTALABLE</b>Agrégala a tu pantalla de inicio.</div>
        </div>
      </section>

      <section id="contacto" className="contact wrap">
        <h2>Contacto</h2>
        <p className="lead">¿Encontraste un error o tienes una idea para un nuevo juego? Cuéntanos.</p>
        <ContactForm />
      </section>
    </main>
  );
}
