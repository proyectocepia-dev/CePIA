import PageHero from '@/components/PageHero';
import Pending from '@/components/Pending';
import { socios } from '@/lib/content';

export const metadata = { title: 'Vinculación' };

const bloques = [
  { id: 'empresas', titulo: 'Empresas e industria', bajada: 'Trabajo con observatorios, la industria forestal y ferias del sector.' },
  { id: 'educacion', titulo: 'Establecimientos educacionales', bajada: 'Convenios con educación media y superior, y prácticas para estudiantes.' },
  { id: 'id', titulo: 'Vinculación I+D', bajada: 'Universidades y centros de investigación nacionales e internacionales.' },
] as const;

export default function Vinculacion() {
  const items = socios();
  return (
    <>
      <PageHero title="Vinculación" lead="Con quiénes trabajamos: industria, educación e investigación." crumbs={[{ label: 'Vinculación' }]}>
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
              <ul className="chips">{items.filter((s) => s.bloque === b.id).map((s) => <li key={s.id}>{s.nombre}</li>)}</ul>
            </div>
          </section>
        ))}
        <section className="s-night" style={{ paddingBlock: 'var(--space-7)' }}>
          <div className="u-container"><Pending text="Descripción de cada convenio y logos con permiso: por recibir" /></div>
        </section>
      </main>
    </>
  );
}
