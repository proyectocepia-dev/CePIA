import Link from 'next/link';
import { fechaCorta, type Noticia } from '@/lib/content';

export default function NewsCard({ n }: { n: Noticia }) {
  return (
    <Link className="c-news-card" href={`/blog/${n.id}`} prefetch={false}>
      <span className="c-chip c-chip--accent">{n.etiqueta}</span>
      <h3 className="t-h4">{n.titulo}</h3>
      <p>{n.resumen}</p>
      <time className="c-meta" dateTime={n.fecha.toISOString().slice(0, 10)}>{fechaCorta(n.fecha)}</time>
    </Link>
  );
}
