import type { Publicacion } from '@/lib/content';

export default function PubList({ items, nombres = {} }: { items: Publicacion[]; nombres?: Record<string, string> }) {
  return (
    <ul className="pub-list">
      {items.map((p) => (
        <li key={p.id} data-proyecto={p.proyecto ?? ''}>
          <a href={p.enlace} rel="noopener">{p.titulo}</a>
          <span className="pub-meta">
            <span>{p.autores}</span>
            <span>{p.medio}, {p.anio}</span>
            {p.proyecto && <span className="c-chip c-chip--accent">{nombres[p.proyecto] ?? p.proyecto}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
