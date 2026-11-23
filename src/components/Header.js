import Link from 'next/link';
import StatusBadge from './StatusBadge';

export default function Header() {
  return (
    <header>
      <div className="wrap">
        <Link className="brand" href="/">
          <img className="logo" alt="" width="32" height="32" src="/icons/logo.png" />
          Classic<span>Bit</span>
        </Link>
        <nav aria-label="Principal">
          <Link href="/#juegos">🎮 Juegos</Link>
          <Link href="/#contacto">💬 Contacto</Link>
        </nav>
        <StatusBadge />
      </div>
    </header>
  );
}
