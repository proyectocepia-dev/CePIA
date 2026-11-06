import PageHero from '@/components/PageHero';
import Pending from '@/components/Pending';
import { infraestructura } from '@/lib/content';

export const metadata = { title: 'Infraestructura' };

const bloques = [
  { id: 'dependencias', titulo: 'Dependencias', bajada: 'Dónde trabaja el centro.' },
  { id: 'equipamiento', titulo: 'Equipamiento disponible', bajada: 'Equipos del laboratorio disponibles para proyectos y colaboraciones.' },
  { id: 'equipos-desarrollados', titulo: 'Equipos desarrollados', bajada: 'Instrumentos diseñados y construidos por el equipo de CePIA.' },
] as const;

export default function Infraestructura() {
  const items = infraestructura();
  return (
    <>
      <PageHero title="Infraestructura" lead="Laboratorios, equipamiento e instrumentos desarrollados por el centro." crumbs={[{ label: 'Infraestructura' }]}>
        <ul className="anchor-nav">{bloques.map((b) => <li key={b.id}><a href={`#${b.id}`}>{b.titulo}</a></li>)}</ul>
      </PageHero>
      <main id="contenido">
        {bloques.map((b, i) => (
          <section key={b.id} id={b.id} className={`block ${i % 2 ? 's-rest u-hex' : 's-light'}`} aria-labelledby={`h-${b.id}`}>
            <div className="u-container">
              <div className="sec-head">
                <span className="c-rule c-meta">{String(i + 1).padStart(2, '0')}</span>
                <h2 id={`h-${b.id}`} className="t-h2">{b.titulo}</h2>
                <p className="muted">{b.bajada}</p>
              </div>
              <ul className="item-list">
                {items.filter((x) => x.bloque === b.id).map((x) => (
                  <li key={x.id}>
                    <h3>{x.nombre}</h3>
                    <p>{x.descripcion}</p>
                    {x.editorial === 'por-confirmar' && <Pending />}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
        <section className="s-night" style={{ paddingBlock: 'var(--space-7)' }}>
          <div className="u-container"><Pending text="Fotos de infraestructura y equipos: por seleccionar con el centro" /></div>
        </section>
      </main>
    </>
  );
}
