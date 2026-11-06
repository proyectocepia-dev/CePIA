import Link from 'next/link';
import PageHero from '@/components/PageHero';

export const metadata = { title: 'GrTE', description: 'Radiotelescopio de bajo costo para estudiantes de colegio.' };

export default function Grte() {
  return (
    <>
      <PageHero title="GrTE" lead="Radiotelescopio de bajo costo para estudiantes de colegio." meta="Plataforma en desarrollo" crumbs={[{ label: 'GrTE' }]} />
      <main id="contenido">
        <section className="s-night" style={{ paddingTop: 'var(--space-8)' }}>
          <div className="u-container">
            <div className="c-feature c-frame">
              <div className="u-stack">
                <span className="c-chip">Próximamente</span>
                <h2 className="t-h2">Construye, observa y comparte</h2>
                <p>Estudiantes construyen su propio radiotelescopio impreso en 3D, suben sus observaciones y las comparten con otras escuelas. La plataforma vivirá aquí, dentro del sitio de CePIA.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <Link className="c-btn c-btn--dark" href="/contacto">Quiero participar</Link>
                </div>
              </div>
              <p className="t-small" style={{ opacity: 0.85 }}>Espacio reservado para la plataforma GrTE. Su contenido, el acceso con login y los datos los entrega el equipo que la desarrolla.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
