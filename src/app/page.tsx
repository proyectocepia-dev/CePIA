import Link from 'next/link';
import Header from '@/components/Header';
import Logo from '@/components/Logo';
import NewsCard from '@/components/NewsCard';
import Graticule from '@/components/Graticule';
import HeroLct from '@/components/lct/HeroLct';
import HeroReveal from '@/components/HeroReveal';
import Sky from '@/components/Sky';
import LineasAcordeon from '@/components/LineasAcordeon';
import CategoryCoverflow, { type CoverflowItem } from '@/components/CategoryCoverflow';
import { categorias, noticias, proyectos, rutaProyecto } from '@/lib/content';

/** Orden del slider de destacados: el LCT queda al centro y GrTE a su derecha. */
const DESTACADOS = ['eht-titans', 'radiometros', 'lct', 'grte', 'mmics'];

export default function Inicio() {
  const cats = categorias();
  const ultimas = noticias().slice(0, 3);
  const todos = proyectos();
  const destacados: CoverflowItem[] = DESTACADOS.flatMap((id) => {
    const p = todos.find((x) => x.id === id);
    if (!p) return [];
    return [{ id: p.id, href: id === 'grte' ? '/grte' : rutaProyecto(p), nombre: p.titulo, resumen: p.resumen, meta: p.sigla, imagen: p.imagen }];
  });
  return (
    <>
      <header className="s-hero hero">
        <Sky variante="hero" estrellas={260} />
        <Graticule />
        <Header />
        <HeroReveal />
        <div className="c-watermark" aria-hidden="true"><Logo variant="iso" /></div>
        <div className="u-container hero__inner">
          <div className="hero__copy">
            <h1>Instrumentos para observar el universo</h1>
            <p className="hero__sub">Centro para la Instrumentación Astronómica de la Universidad de Concepción</p>
            <p className="hero__text">Diseñamos y desarrollamos instrumentación para la astronomía y llevamos esa tecnología a otras disciplinas.</p>
            <div className="hero__actions">
              <Link className="c-btn c-btn--primary" href="/proyectos">Ver proyectos</Link>
              <Link className="c-btn c-btn--ghost" href="/proyectos/lct">Conocer el LCT</Link>
            </div>
          </div>
          <div className="hero__stage">
            <HeroLct />
          </div>
          <dl className="readout">
            <div><dt>Sede</dt><dd>Concepción <span>36°49′S 73°03′O</span></dd></div>
            <div><dt>Sitio de observación</dt><dd>Llano de Chajnantor <span>23°01′S 67°45′O</span></dd></div>
            <div><dt>Leighton Chajnantor Telescope</dt><dd>Plato de 10,4 m</dd></div>
            <div><dt>Bandas</dt><dd>Milimétrica y submilimétrica</dd></div>
          </dl>
        </div>
      </header>
      <main id="contenido">
        <section className="s-light home-featured" aria-labelledby="destacados">
          <div className="u-container">
            <div className="sec-head sec-head--row">
              <h2 id="destacados" className="t-h2">Proyectos destacados</h2>
              <p className="muted">El traslado del LCT a Chajnantor, la red de radiotelescopios escolares y otros proyectos del centro.</p>
            </div>
            <CategoryCoverflow tono="claro" etiqueta="Proyectos destacados" cta="Ver proyecto" items={destacados} />
          </div>
        </section>

        <section className="s-night s-night--deep" aria-labelledby="lineas">
          <div className="u-container">
            <div className="sec-head sec-head--row">
              <h2 id="lineas" className="t-h2">Líneas de trabajo</h2>
              <Link href="/proyectos">Todos los proyectos</Link>
            </div>
            <LineasAcordeon items={cats.map((c) => ({ id: c.id, nombre: c.nombre, resumen: c.resumen }))} />
          </div>
        </section>

        <section className="s-rest" aria-labelledby="blog">
          <div className="u-container">
            <div className="sec-head sec-head--row">
              <h2 id="blog" className="t-h2">Noticias recientes</h2>
              <Link href="/blog">Ver todas las noticias</Link>
            </div>
            <div className="grid-cards grid-cards--fit">{ultimas.map((n) => <NewsCard key={n.id} n={n} />)}</div>
          </div>
        </section>
      </main>
    </>
  );
}
