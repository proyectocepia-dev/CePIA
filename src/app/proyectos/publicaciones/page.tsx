import PageHero from '@/components/PageHero';
import PubFilter from '@/components/PubFilter';
import { publicaciones, siglas } from '@/lib/content';

export const metadata = { title: 'Publicaciones y conferencias' };

export default function Publicaciones() {
  return (
    <>
      <PageHero title="Publicaciones y conferencias" lead="Artículos y presentaciones del equipo, con su proyecto asociado." crumbs={[{ label: 'Proyectos', href: '/proyectos' }, { label: 'Publicaciones' }]} />
      <main id="contenido">
        <section className="s-light">
          <div className="u-container"><PubFilter items={publicaciones()} nombres={siglas()} /></div>
        </section>
      </main>
    </>
  );
}
