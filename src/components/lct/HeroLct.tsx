'use client';
// Portada: visor del LCT. Muestra la foto dentro del visor y, si el equipo lo permite, monta encima el
// modelo 3D (React Three Fiber). El 3D se descarga solo cuando el visor está en pantalla, nunca en
// `prefers-reduced-motion: reduce`, con ahorro de datos o sin WebGL: ahí queda la foto fija.
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import Reticle from '@/components/Reticle';

const LctCanvas = dynamic(() => import('./LctCanvas'), { ssr: false });

type Estado = 'foto' | 'cargando' | 'listo';

function puedeMontar3D(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function HeroLct({ foto }: { foto: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<Estado>('foto');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || !puedeMontar3D()) return;
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      if (e.isIntersecting) setEstado((s) => (s === 'foto' ? 'cargando' : s));
    }, { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="lct-stage" data-estado={estado}>
      <Reticle foto={foto} />
      {estado !== 'foto' && (
        <div className="lct-stage__canvas" aria-hidden="true">
          <LctCanvas activo={visible} alListo={() => setEstado('listo')} />
        </div>
      )}
    </div>
  );
}
