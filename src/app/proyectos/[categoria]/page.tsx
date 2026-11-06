import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import ProjectCard from '@/components/ProjectCard';
import PubList from '@/components/PubList';
import Pending from '@/components/Pending';
import { categoriaPorId, categorias, proyectos, publicaciones, siglas } from '@/lib/content';

type Props = { params: Promise<{ categoria: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => categorias().map((c) => ({ categoria: c.id }));

export async function generateMetadata({ params }: Props) {
  const c = categoriaPorId((await params).categoria);
  return c ? { title: c.nombre, description: c.resumen } : {};
}

export default async function Categoria({ params }: Props) {
  const c = categoriaPorId((await params).categoria);
  if (!c) notFound();
  const enCategoria = proyectos().filter((p) => p.categoria === c.id || p.etiquetas.includes(c.id));
  const ids = new Set(enCategoria.map((p) => p.id));
  const pubs = publicaciones().filter((p) => p.proyecto && ids.has(p.proyecto));
  // Transferencia Tecnológica separa proyectos activos y pasados (esquema del 26-oct).
  const grupos = c.id === 'transferencia-tecnologica'
    ? [{ titulo: 'Proyectos activos', items: enCategoria.filter((p) => p.estado === 'activo') }, { titulo: 'Proyectos pasados', items: enCategoria.filter((p) => p.estado === 'pasado') }]
    : [{ titulo: 'Proyectos', items: enCategoria }];
  return (
    <>
      <PageHero title={c.nombre} lead={c.resumen} meta={`Proyectos · ${String(c.orden).padStart(2, '0')}`} crumbs={[{ label: 'Proyectos', href: '/proyectos' }, { label: c.nombre }]} />
      <main id="contenido">
        <section className="s-light u-hex-dish" style={{ '--dish-x': '90%', '--dish-y': '20%', '--dish-size': '466px' } as CSSProperties}>
          <div className="u-container prose">
            <span className="c-rule c-meta">Sobre esta línea</span>
            <p style={{ fontSize: 'var(--font-size-xl)', lineHeight: 'var(--font-line-height-snug)' }}>{c.parrafo}</p>
            {c.editorial === 'por-confirmar' && <Pending text="Contenido de esta categoría por confirmar" />}
          </div>
        </section>
        <section className="s-night s-night--deep u-hex">
          <div className="u-container" style={{ display: 'grid', gap: 'var(--space-8)' }}>
            {grupos.map((g) => (
              <div key={g.titulo}>
                <div className="sec-head"><h2 className="t-h3">{g.titulo}</h2></div>
                {g.items.length > 0
                  ? <div className="grid-cards">{g.items.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}</div>
                  : <p className="muted">Pronto agregaremos proyectos en esta sección.</p>}
              </div>
            ))}
          </div>
        </section>
        {pubs.length > 0 && (
          <section className="s-light">
            <div className="u-container">
              <div className="sec-head"><span className="c-rule c-meta">Publicaciones y conferencias</span><h2 className="t-h2">Publicaciones de esta línea</h2></div>
              <PubList items={pubs} nombres={siglas()} />
            </div>
          </section>
        )}
      </main>
    </>
  );
}
