import Link from 'next/link';
import PageHero from '@/components/PageHero';
import PubList from '@/components/PubList';
import CategoryCoverflow from '@/components/CategoryCoverflow';
import { categorias, proyectos, publicaciones, siglas } from '@/lib/content';

export const metadata = { title: 'Proyectos' };

export default function Proyectos() {
  const todos = proyectos();
  const contar = (id: string) => todos.filter((p) => p.categoria === id).length;
  return (
    <>
      <PageHero title="Proyectos" lead="Instrumentación para la astronomía, organizada en cinco líneas de trabajo y el LCT." crumbs={[{ label: 'Proyectos' }]} />
      <main id="contenido">
        <section className="s-night" aria-labelledby="lct" style={{ paddingTop: 'var(--space-8)' }}>
          <div className="u-container">
            <Link className="feature-link" href="/proyectos/lct" style={{ minHeight: 466 }}>
              <img src="/img/lct-radiotelescopio.jpg" alt="" loading="lazy" />
              <span className="c-chip c-chip--accent">Proyecto destacado</span>
              <h2 id="lct">Leighton Chajnantor Telescope</h2>
              <p>Traslado y renovación del radiotelescopio submilimétrico Leighton, de 10,4 m, desde Hawái al llano de Chajnantor, junto a Caltech y ShNU.</p>
              <span className="c-btn--arrow">Conocer el LCT </span>
            </Link>
          </div>
        </section>

        <section className="s-night s-night--deep" aria-labelledby="lineas">
          <div className="u-container">
            <div className="sec-head">
              <span className="c-rule c-meta">Líneas de trabajo</span>
              <h2 id="lineas" className="t-h2">Categorías</h2>
            </div>
            <CategoryCoverflow items={categorias().map((c) => ({ id: c.id, nombre: c.nombre, resumen: c.resumen, n: contar(c.id) }))} />
          </div>
        </section>

        <section className="s-light" aria-labelledby="pubs">
          <div className="u-container">
            <div className="sec-head">
              <span className="c-rule c-meta">Publicaciones y conferencias</span>
              <h2 id="pubs" className="t-h2">Publicaciones recientes</h2>
            </div>
            <PubList items={publicaciones().slice(0, 5)} nombres={siglas()} />
            <p style={{ marginTop: 'var(--space-6)' }}><Link href="/proyectos/publicaciones">Ver todas las publicaciones</Link></p>
          </div>
        </section>
      </main>
    </>
  );
}
