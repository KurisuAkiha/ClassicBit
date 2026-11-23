import Link from 'next/link';
import InstallButton from './InstallButton';

export default function Hero() {
  return (
    <section className="hero wrap">
      <img
        className="hero-logo"
        alt="Logo de ClassicBit: consola retro con una culebrita en pantalla"
        width="112"
        height="112"
        src="/icons/logo.png"
      />
      <h1>Classic<em>Bit</em></h1>
      <p>Tu mini librería de juegos retro. Sin descargas y sin internet: ábrela, instálala y juega donde quieras.</p>
      <Link className="btn" href="/#juegos">▶ Jugar ahora</Link>
      <InstallButton />
      <div className="blink">PRESIONA START</div>
    </section>
  );
}
