import Hero from '../components/Hero';
import GameGrid from '../components/GameGrid';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <main id="inicio">
      <Hero />

      <section id="juegos" className="wrap">
        <h2>Elige tu juego</h2>
        <GameGrid />
      </section>

      <section id="offline" className="band">
        <div className="wrap">
          <div><b>SIN INTERNET</b>Los juegos se guardan en tu dispositivo.</div>
          <div><b>SIN DESCARGAS</b>Ábrela desde el navegador con un enlace.</div>
          <div><b>INSTALABLE</b>Agrégala a tu pantalla de inicio.</div>
        </div>
      </section>

      <Contact />
    </main>
  );
}
