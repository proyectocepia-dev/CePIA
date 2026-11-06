'use client';
// Portada: el LCT en 3D como lámina técnica. Marco con marcas de corte, rótulo de figura y lecturas en vivo
// de azimut y elevación que salen de la propia escena. Sin visor ni foto: solo carga el modelo.
// - El 3D se descarga cuando el escenario entra en pantalla (en móvil queda bajo los botones).
// - `prefers-reduced-motion: reduce`: la escena se monta quieta en su pose de reposo, sin animación.
// - Sin WebGL o con ahorro de datos: queda solo el marco con la ficha, sin modelo.
// Pensado para reutilizarse (p. ej. en /proyectos/lct): todo lo visual del modelo vive en LctCanvas + lct-config.
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lectura } from './LctCanvas';

const LctCanvas = dynamic(() => import('./LctCanvas'), { ssr: false });

type Estado = 'sin-3d' | 'esperando' | 'cargando' | 'listo';

function soporta3D(): boolean {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

const fmt = (n: number) => n.toFixed(1).replace('.', ',');

export default function HeroLct() {
  const ref = useRef<HTMLElement>(null);
  const azRef = useRef<HTMLSpanElement>(null);
  const elRef = useRef<HTMLSpanElement>(null);
  const [estado, setEstado] = useState<Estado>('esperando');
  const [visible, setVisible] = useState(true);
  const [movimiento, setMovimiento] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!soporta3D()) { setEstado('sin-3d'); return; }
    setMovimiento(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      if (e.isIntersecting) setEstado((s) => (s === 'esperando' ? 'cargando' : s));
    }, { rootMargin: '160px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Las lecturas llegan ~10 veces por segundo: se escriben directo en el DOM, sin re-render de React.
  const alLeer = useCallback((l: Lectura) => {
    if (azRef.current) azRef.current.textContent = `${fmt(l.az)}°`;
    if (elRef.current) elRef.current.textContent = `${fmt(l.el)}°`;
  }, []);
  const alListo = useCallback(() => setEstado('listo'), []);

  return (
    <figure ref={ref} className="lct-stage" data-estado={estado} aria-label="Modelo 3D del Leighton Chajnantor Telescope">
      {(estado === 'cargando' || estado === 'listo') && (
        <div className="lct-stage__canvas" aria-hidden="true">
          <LctCanvas activo={visible} movimiento={movimiento} alListo={alListo} alLeer={alLeer} />
        </div>
      )}
      <span className="lct-stage__marca lct-stage__marca--a" aria-hidden="true" />
      <span className="lct-stage__marca lct-stage__marca--b" aria-hidden="true" />
      <p className="lct-stage__fig" aria-hidden="true">Fig. 01 — LCT</p>
      <p className="lct-stage__carga" aria-hidden="true">Cargando modelo</p>
      <figcaption className="lct-stage__ficha">
        <span className="lct-stage__nombre">Leighton Chajnantor Telescope</span>
        <dl>
          <div><dt>Plato</dt><dd>10,4 m</dd></div>
          <div><dt>Azimut</dt><dd><span ref={azRef}>—</span></dd></div>
          <div><dt>Elevación</dt><dd><span ref={elRef}>—</span></dd></div>
        </dl>
      </figcaption>
    </figure>
  );
}
