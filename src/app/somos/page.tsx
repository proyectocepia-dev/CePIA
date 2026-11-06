import type { CSSProperties } from 'react';
import PageHero from '@/components/PageHero';
import Pending from '@/components/Pending';
import { personas } from '@/lib/content';

export const metadata = { title: 'Somos' };

const iniciales = (n: string) => n.replace(/^Dr\.\s*/, '').split(' ').map((w) => w[0]).slice(0, 2).join('');

export default function Somos() {
  return (
    <>
      <PageHero title="Somos" lead="Un laboratorio de la Universidad de Concepción que diseña instrumentación para la astronomía y otras disciplinas." crumbs={[{ label: 'Somos' }]} />
      <main id="contenido">
        <section className="s-light u-hex-dish" style={{ '--dish-x': '92%', '--dish-y': '10%', '--dish-size': '466px' } as CSSProperties}>
          <div className="u-container u-grid-2" style={{ alignItems: 'start' }}>
            <div className="prose">
              <span className="c-rule c-meta">El centro</span>
              <p><strong>CePIA</strong> pertenece al Departamento de Astronomía de la Universidad de Concepción e integra el Centro de Astrofísica y Tecnologías Afines (CATA). Su equipo reúne a académicos, ingenieros y estudiantes de pregrado y postgrado de áreas como la eléctrica, la electrónica y la mecánica.</p>
              <p>Diseña y desarrolla soluciones instrumentales para proyectos astronómicos y para otras disciplinas, y promueve la transferencia tecnológica hacia la industria.</p>
              <Pending text="Proyectos adjudicados (proyectos de gestión) y vínculos: por recibir del centro" />
            </div>
            <div className="prose">
              <span className="c-rule c-meta">Misión</span>
              <p>Contribuir a la formación de profesionales de alto nivel desde la Región del Biobío, generando conocimiento científico y desarrollo tecnológico en distintas áreas de la instrumentación astronómica, en un ambiente interdisciplinario y de colaboración con actores nacionales e internacionales.</p>
              <span className="c-rule c-meta">Visión</span>
              <p>Ser un centro autosustentable que haga investigación de frontera y desarrolle tecnologías de vanguardia en instrumentación científica, con impacto en la academia, la sociedad y la industria.</p>
              <Pending text="Misión y visión 2024: confirmar vigencia" />
            </div>
          </div>
        </section>
        <section className="s-rest u-hex" aria-labelledby="equipo">
          <div className="u-container">
            <div className="sec-head">
              <span className="c-rule c-meta">Equipo</span>
              <h2 id="equipo" className="t-h2">Quiénes trabajan en CePIA</h2>
              <Pending text="Descripción del equipo y foto del director: por recibir del centro" />
            </div>
            <ul className="people">
              {personas().map((p) => (
                <li key={p.id}>
                  {p.foto ? <img className="avatar" src={p.foto} alt="" /> : <span className="avatar" aria-hidden="true">{iniciales(p.nombre)}</span>}
                  <strong>{p.nombre}</strong>
                  <span>{p.rol}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
