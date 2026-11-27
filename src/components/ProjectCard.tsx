import Link from 'next/link';
import { rutaProyecto, type Proyecto } from '@/lib/content';

export default function ProjectCard({ p, i = 0 }: { p: Proyecto; i?: number }) {
  const art = ['art-1', 'art-2', 'art-3'][i % 3];
  return (
    <Link className="c-project-card" href={rutaProyecto(p)} prefetch={false}>
      <div className={`c-project-card__art ${art}`}>
        {p.imagen ? <img src={p.imagen} alt="" loading="lazy" width={1200} height={1500} /> : <span>{p.sigla}</span>}
      </div>
      {p.imagenCredito && <span className="project-image-note">Foto: {p.imagenCredito} · {p.imagenLicencia}</span>}
      <span className="card-top">
        <span className="c-chip c-chip--accent">{p.rol === 'colaboracion' ? 'Colaboración' : p.estado === 'pasado' ? 'Finalizado' : 'Activo'}</span>
        {p.banda && <span className="c-meta">{p.banda}</span>}
      </span>
      <h3 className="t-h4">{p.titulo}</h3>
      <p>{p.resumen}</p>
    </Link>
  );
}
