import PageHero from '@/components/PageHero';
import NewsCard from '@/components/NewsCard';
import { noticias } from '@/lib/content';

export const metadata = { title: 'Blog' };

export default function Blog() {
  return (
    <>
      <PageHero title="Blog" lead="Noticias del centro, sus proyectos y su equipo." crumbs={[{ label: 'Blog' }]} />
      <main id="contenido">
        <section className="s-light">
          <div className="u-container grid-cards">{noticias().map((n) => <NewsCard key={n.id} n={n} />)}</div>
        </section>
      </main>
    </>
  );
}
