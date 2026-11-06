'use client';
// Scroll de instrumento: Lenis suaviza la rueda en escritorio (en táctil se deja el scroll nativo del sistema)
// y una regla lateral muestra en qué bloque está la vista, como la elevación de un telescopio que baja del cenit
// al horizonte. Cada marca de la regla lleva a su bloque. Con "reducir movimiento" no hay suavizado.
// Rendimiento: las posiciones de los bloques se miden solo al cargar y al cambiar el tamaño; durante el scroll
// se compara scrollY con esas posiciones (sin leer el layout) y React solo se actualiza al cambiar de bloque.
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';   // tipo solamente: el código se descarga solo en escritorio

type Marca = { label: string; pos: number; top: number; el: HTMLElement };

export default function ObservationHud() {
  const ruta = usePathname();
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [activa, setActiva] = useState(0);
  const indicador = useRef<HTMLSpanElement>(null);
  const elev = useRef<HTMLSpanElement>(null);
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;     // táctil: scroll nativo, sin capa extra
    let vivo = true;
    import('lenis').then(({ default: L }) => {
      if (vivo) lenis.current = new L({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true, anchors: { offset: -24 }, autoRaf: true });
    });
    return () => { vivo = false; lenis.current?.destroy(); lenis.current = null; };
  }, []);

  useEffect(() => {
    if (!window.matchMedia('(min-width: 1081px)').matches) return;  // la regla solo existe en escritorio
    let espera = 0;
    const leer = () => {
      const alto = document.documentElement.scrollHeight;
      const bloques = Array.from(document.querySelectorAll<HTMLElement>('header.s-hero, main > section'));
      setMarcas(bloques.map((el) => {
        const h = el.querySelector('h1, h2');
        const top = el.getBoundingClientRect().top + window.scrollY;
        return { el, top, label: (h?.textContent ?? '').trim() || 'Inicio', pos: top / alto };
      }));
    };
    leer();
    const ro = new ResizeObserver(() => { clearTimeout(espera); espera = window.setTimeout(leer, 250); });
    ro.observe(document.body);
    return () => { ro.disconnect(); clearTimeout(espera); };
  }, [ruta]);

  useEffect(() => {
    if (!marcas.length) return;
    let pendiente = false, ultima = -1;
    const medir = () => {
      pendiente = false;
      const y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (indicador.current) indicador.current.style.transform = `translate3d(0, ${(p * 100).toFixed(2)}cqh, 0)`;
      if (elev.current) elev.current.textContent = `${Math.round(90 - p * 90)}°`;
      const linea = y + window.innerHeight * 0.4;
      let i = 0;
      for (let k = 0; k < marcas.length; k++) if (marcas[k].top <= linea) i = k;
      if (i !== ultima) { ultima = i; setActiva(i); }
    };
    const alScroll = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(medir); } };
    medir();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, [marcas]);

  const ir = (m: Marca) => {
    if (lenis.current) lenis.current.scrollTo(m.el, { offset: 0, duration: 1.2 });
    else m.el.scrollIntoView({ behavior: 'smooth' });
  };

  if (marcas.length < 2) return null;
  return (
    <nav className="hud" aria-label="Recorrido de la página">
      <div className="hud__read" aria-hidden="true">
        <span className="hud__k">Elev</span><span ref={elev} className="hud__v">90°</span>
      </div>
      <div className="hud__rule">
        <span ref={indicador} className="hud__dot" aria-hidden="true" />
        {marcas.map((m, k) => (
          <button key={k} type="button" className={`hud__mark${k === activa ? ' is-on' : ''}`} style={{ top: `${(m.pos * 100).toFixed(2)}%` }} onClick={() => ir(m)} aria-current={k === activa ? 'location' : undefined}>
            <span className="hud__label">{m.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
