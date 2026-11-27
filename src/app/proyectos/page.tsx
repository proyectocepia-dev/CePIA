import Link from 'next/link';
import PageHero from '@/components/PageHero';
import PubList from '@/components/PubList';
import CategoryCoverflow from '@/components/CategoryCoverflow';
import { categorias, proyectos, publicaciones, siglas } from '@/lib/content';

export const metadata = { title: 'Proyectos' };

export default function Proyectos() {
  const todos = proyectos();
  const lct = todos.find((p) => p.id === 'lct');
  const portada: Record<string, string> = { 'milimetricas-submm': 'mmics', atmosfera: 'radiometros', colaboraciones: 'eht-titans', 'transferencia-tecnologica': 'radiowood', academicos: 'grte' };
  const imagenCategoria = (id: string) => todos.find((p) => p.id === portada[id]);
  const contar = (id: string) => todos.filter((p) => p.categoria === id).length;
  return (
    <>
      <PageHero tema="proyectos" title="Proyectos" lead="Instrumentación para la astronomía, organizada en cinco líneas de trabajo." crumbs={[{ label: 'Proyectos' }]} />
      <main id="contenido">

        <section className="s-night s-night--deep" aria-labelledby="lineas">
          <div className="u-container">
            <div className="sec-head">
              <span className="c-rule c-meta">Líneas de trabajo</span>
              <h2 id="lineas" className="t-h2">Categorías</h2>
            </div>
            <CategoryCoverflow items={[
              ...categorias().map((c) => ({ id: c.id, href: `/proyectos/${c.id}`, nombre: c.nombre, resumen: c.resumen, imagen: imagenCategoria(c.id)?.imagen, imagenTipo: imagenCategoria(c.id)?.imagenTipo, provisional: imagenCategoria(c.id)?.editorial === 'por-confirmar', meta: `${contar(c.id)} ${contar(c.id) === 1 ? 'proyecto' : 'proyectos'}` })),
              // El LCT va como un elemento más de la lista (sin bloque destacado): solo se destaca en la portada.
              ...(lct ? [{ id: lct.id, href: '/proyectos/lct', nombre: lct.titulo, resumen: lct.resumen, imagen: lct.imagen, imagenTipo: lct.imagenTipo, meta: 'Proyecto propio' }] : []),
            ]} />
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
