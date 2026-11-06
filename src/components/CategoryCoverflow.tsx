'use client';
import Link from 'next/link';
import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';

export type CoverflowItem = { id: string; nombre: string; resumen: string; n: number; imagen?: string };

const ARTE = ['art-1', 'art-2', 'art-3'];

/** Carrusel coverflow 3D de las líneas de trabajo (T1.19). Solo CSS 3D: anima transform y opacity. */
export default function CategoryCoverflow({ items }: { items: CoverflowItem[] }) {
  const total = items.length;
  const [activo, setActivo] = useState(Math.floor(total / 2));
  const inicioX = useRef<number | null>(null);
  const ir = useCallback((i: number) => setActivo(((i % total) + total) % total), [total]);

  const teclas = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(activo + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); ir(activo - 1); }
  };
  const bajar = (e: PointerEvent) => { inicioX.current = e.clientX; };
  const soltar = (e: PointerEvent) => {
    if (inicioX.current === null) return;
    const dx = e.clientX - inicioX.current;
    inicioX.current = null;
    if (Math.abs(dx) > 40) ir(activo + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="coverflow" role="region" aria-roledescription="carrusel" aria-label="Líneas de trabajo" onKeyDown={teclas}>
      <ul className="coverflow__track" onPointerDown={bajar} onPointerUp={soltar} onPointerCancel={() => { inicioX.current = null; }}>
        {items.map((c, i) => {
          let d = i - activo;
          if (d > total / 2) d -= total;
          if (d < -total / 2) d += total;
          const centro = d === 0;
          return (
            <li
              key={c.id}
              className="coverflow__item"
              data-activo={centro}
              style={{ '--d': d, '--ad': Math.abs(d) } as CSSProperties}
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${total}: ${c.nombre}`}
              aria-hidden={!centro}
            >
              <Link
                href={`/proyectos/${c.id}`}
                prefetch={false}
                tabIndex={centro ? 0 : -1}
                draggable={false}
                className={`coverflow__card ${ARTE[i % ARTE.length]}`}
                onClick={(e) => { if (!centro) { e.preventDefault(); ir(i); } }}
              >
                {c.imagen && <img src={c.imagen} alt="" loading="lazy" draggable={false} />}
                <span className="coverflow__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="coverflow__body">
                  <span className="c-meta">{c.n} {c.n === 1 ? 'proyecto' : 'proyectos'}</span>
                  <h3>{c.nombre}</h3>
                  <p>{c.resumen}</p>
                  <span className="coverflow__go c-btn--arrow">Ver línea </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="coverflow__controls">
        <button type="button" className="coverflow__arrow" onClick={() => ir(activo - 1)} aria-label="Línea anterior">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="coverflow__dots">
          {items.map((c, i) => (
            <button key={c.id} type="button" aria-label={`Ir a ${c.nombre}`} aria-current={i === activo} onClick={() => ir(i)} />
          ))}
        </div>
        <button type="button" className="coverflow__arrow" onClick={() => ir(activo + 1)} aria-label="Línea siguiente">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <p className="u-sr-only" aria-live="polite">{items[activo]?.nombre}</p>
    </div>
  );
}
