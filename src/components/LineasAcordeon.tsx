'use client';
import Link from 'next/link';
import { useState } from 'react';

export type LineaItem = { id: string; nombre: string; resumen: string; imagen?: string };

/** Acordeón horizontal de las líneas de trabajo en la portada (T1.20). En móvil se apila en filas. */
export default function LineasAcordeon({ items }: { items: LineaItem[] }) {
  const [activo, setActivo] = useState(0);
  return (
    <ul className="acordeon">
      {items.map((c, i) => {
        const abierto = i === activo;
        return (
          <li key={c.id} className="acordeon__panel" data-activo={abierto} data-imagen={c.imagen ? '' : undefined} onMouseEnter={() => setActivo(i)}>
            {c.imagen && <img className="acordeon__img" src={c.imagen} alt="" loading="lazy" decoding="async" />}
            <button
              type="button"
              className="acordeon__tab"
              aria-expanded={abierto}
              aria-controls={`linea-${c.id}`}
              onClick={() => setActivo(i)}
              onFocus={() => setActivo(i)}
            >
              <span className="acordeon__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3>{c.nombre}</h3>
            </button>
            <div id={`linea-${c.id}`} className="acordeon__body" aria-hidden={!abierto}>
              <p>{c.resumen}</p>
              <Link href={`/proyectos/${c.id}`} prefetch={false} tabIndex={abierto ? 0 : -1} className="acordeon__go c-btn--arrow">Ver línea </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
