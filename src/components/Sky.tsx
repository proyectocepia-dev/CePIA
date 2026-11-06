'use client';
// Cielo vivo, pensado para no trabar el scroll: las estrellas se dibujan UNA vez en lienzos por profundidad
// y todo el movimiento lo hace el compositor del navegador (CSS). El scroll mueve las capas con
// animation-timeline: view() donde existe; en navegadores sin eso, un fallback liviano escribe --p (0 a 1).
// El titileo es la opacidad de una capa aparte. Fuera de pantalla las animaciones se pausan.
import { useEffect, useRef } from 'react';

type Variante = 'hero' | 'page' | 'band' | 'stars';

function aleatorio(semilla: number) {
  let s = semilla;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const TINTES = ['244,241,234', '244,241,234', '244,241,234', '194,241,240', '255,214,170'];

export default function Sky({ variante = 'hero', estrellas = 220, semilla = 7 }: { variante?: Variante; estrellas?: number; semilla?: number }) {
  const raiz = useRef<HTMLDivElement>(null);
  const lejos = useRef<HTMLCanvasElement>(null);
  const cerca = useRef<HTMLCanvasElement>(null);
  const brillo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const tactil = window.matchMedia('(pointer: coarse)').matches;
    const total = tactil ? Math.round(estrellas * 0.6) : estrellas;

    const pintar = () => {
      const r = el.getBoundingClientRect();
      const w = Math.ceil(r.width), h = Math.ceil(r.height * 1.3);   // 30% extra: margen para el paralaje
      const rnd = aleatorio(semilla);
      const capas = [lejos.current, cerca.current, brillo.current];
      const ctxs = capas.map((cv) => {
        if (!cv) return null;
        cv.width = w; cv.height = h;
        const c = cv.getContext('2d');
        c?.clearRect(0, 0, w, h);
        return c;
      });
      for (let i = 0; i < total; i++) {
        const x = rnd() * w, y = rnd() * h, t = TINTES[Math.floor(rnd() * TINTES.length)];
        const z = rnd(), a = 0.35 + rnd() * 0.5;
        const capa = z < 0.62 ? 0 : z < 0.9 ? 1 : 2;               // la mayoría lejos; pocas titilan
        const c = ctxs[capa];
        if (!c) continue;
        const rad = capa === 0 ? 0.4 + rnd() * 0.5 : 0.7 + rnd() * 0.9;
        c.fillStyle = `rgba(${t},${a.toFixed(2)})`;
        c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill();
        if (capa === 2) {                                           // halo suave en las brillantes
          c.fillStyle = `rgba(${t},${(a * 0.14).toFixed(2)})`;
          c.beginPath(); c.arc(x, y, rad * 4, 0, Math.PI * 2); c.fill();
        }
      }
    };

    pintar();
    let ancho = el.offsetWidth, espera = 0;
    const ro = new ResizeObserver(() => {
      if (Math.abs(el.offsetWidth - ancho) < 2) return;            // la barra del móvil cambia el alto; no repintar por eso
      ancho = el.offsetWidth;
      clearTimeout(espera); espera = window.setTimeout(pintar, 180);
    });
    ro.observe(el);

    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-off', !e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);

    // Fallback sin scroll-timeline: un único listener pasivo que escribe --p como máximo una vez por cuadro.
    let quitar = () => {};
    const sinTimeline = !CSS.supports('animation-timeline: view()');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (sinTimeline && !quieto && variante !== 'stars') {
      let pendiente = false;
      const medir = () => {
        pendiente = false;
        const r = el.getBoundingClientRect(), vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        el.style.setProperty('--p', Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))).toFixed(3));
      };
      const alScroll = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(medir); } };
      medir();
      window.addEventListener('scroll', alScroll, { passive: true });
      quitar = () => window.removeEventListener('scroll', alScroll);
    }

    return () => { ro.disconnect(); io.disconnect(); clearTimeout(espera); quitar(); };
  }, [variante, estrellas, semilla]);

  return (
    <div ref={raiz} className={`sky sky--${variante}`} aria-hidden="true">
      {variante !== 'stars' && <div className="sky__nebula sky__nebula--a" />}
      {(variante === 'hero' || variante === 'page') && <div className="sky__nebula sky__nebula--b" />}
      {variante !== 'stars' && (
        <div className="sky__aurora"><span /><span /></div>
      )}
      <canvas ref={lejos} className="sky__stars sky__stars--far" />
      <canvas ref={cerca} className="sky__stars sky__stars--near" />
      <canvas ref={brillo} className="sky__stars sky__stars--twinkle" />
    </div>
  );
}
