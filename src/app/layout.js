import { Press_Start_2P } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import PwaRegister from '../components/PwaRegister';

const fuente = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-px' });

export const metadata = {
  title: 'ClassicBit · Mini librería de juegos',
  description: 'Tu mini librería de juegos retro. Sin descargas y sin internet.',
  manifest: '/manifest.json',
  icons: { icon: '/icons/logo.png', apple: '/icons/icon-192.png' },
};

export const viewport = {
  themeColor: '#0a0612',
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={fuente.variable}>
      <body>
        <Header />
        {children}
        <footer>© 2026 ClassicBit · Universidad Tecnológica de Tabasco</footer>
        <PwaRegister />
      </body>
    </html>
  );
}
