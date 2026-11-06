import PageHero from '@/components/PageHero';
import NewsCard from '@/components/NewsCard';
import { noticias, proyectoPorId } from '@/lib/content';

const lct = () => proyectoPorId('lct')!;

export const generateMetadata = () => ({ title: 'LCT', description: lct().resumen });

export default function Lct() {
  const p = lct();
  const notas = noticias().filter((n) => n.proyecto === 'lct');
  return (
    <>
      <PageHero title={p.titulo} lead={p.resumen} meta="LCT · submilimétrico · 10,4 m" crumbs={[{ label: 'Proyectos', href: '/proyectos' }, { label: 'LCT' }]} />
      <main id="contenido">
        <section className="s-night" style={{ paddingTop: 'var(--space-8)' }}>
          <div className="u-container">
            <figure className="c-media-card c-media-card--bleed" style={{ margin: 0, aspectRatio: '21 / 9' }}>
              <span className="c-media-card__label c-eyebrow">Leighton Chajnantor Telescope</span>
              <img src={p.imagen} alt="Radiotelescopio dentro de su domo abierto bajo un cielo estrellado" />
            </figure>
          </div>
        </section>
        <section className="s-light">
          <div className="u-container split">
            <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
            <aside className="facts" aria-label="Datos del proyecto">
              <dl>
                <div><dt>Estado</dt><dd>Activo</dd></div>
                <div><dt>Instituciones</dt><dd>Universidad de Concepción, {p.socios.join(', ')}</dd></div>
                <div><dt>Destino</dt><dd>Llano de Chajnantor, Región de Antofagasta</dd></div>
                <div><dt>Operación en Concepción</dt><dd>Observatorio WenuLafken</dd></div>
              </dl>
            </aside>
          </div>
        </section>
        {notas.length > 0 && (
          <section className="s-rest u-hex">
            <div className="u-container">
              <div className="sec-head"><span className="c-rule c-meta">Blog</span><h2 className="t-h2">Noticias del LCT</h2></div>
              <div className="grid-cards">{notas.map((n) => <NewsCard key={n.id} n={n} />)}</div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
