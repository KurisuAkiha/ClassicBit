import { notFound } from 'next/navigation';
import { games } from '../../../lib/games';
import Console from '../../../components/Console';

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = games.find((g) => g.slug === slug);
  return { title: game ? `${game.nombre} · ClassicBit` : 'ClassicBit' };
}

export default async function JuegoPage({ params }) {
  const { slug } = await params;
  const game = games.find((g) => g.slug === slug);
  if (!game) notFound();
  return <Console game={game} />;
}
