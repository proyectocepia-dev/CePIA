import Link from 'next/link';
import PageHero from '@/components/PageHero';

export const metadata = { title: 'GrTE', description: 'Radiotelescopio de bajo costo para estudiantes de colegio.' };

export default function Grte() {
  return (
    <>
      <PageHero title="GrTE" lead="Radiotelescopio de bajo costo para estudiantes de colegio." meta="Instrumentación y educación" crumbs={[{ label: 'GrTE' }]} />
      <main id="contenido">
        <section className="s-night" style={{ paddingTop: 'var(--space-8)' }}>
          <div className="u-container">
            <div className="c-feature c-frame">
              <div className="u-stack">
                <span className="c-chip">Radiotelescopio educativo</span>
                <h2 className="t-h2">Construye, observa y comparte</h2>
                <p>Estudiantes construyen su propio radiotelescopio impreso en 3D, suben sus observaciones y las comparten con otras escuelas. La plataforma vivirá aquí, dentro del sitio de CePIA.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <Link className="c-btn c-btn--dark" href="/contacto">Quiero participar</Link>
                </div>
              </div>
              <figure className="project-image project-image--dark">
                <img src="/img/proyectos/grte.webp" alt="Ilustración de un radiotelescopio educativo genérico" width={1200} height={1500} />
                <figcaption>Ilustración generada con IA; no representa el diseño del GrTE. <Link href="/proyectos/academicos/grte">Conocer el proyecto</Link></figcaption>
              </figure>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
