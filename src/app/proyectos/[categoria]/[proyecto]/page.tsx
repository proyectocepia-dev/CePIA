import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import PubList from '@/components/PubList';
import NewsCard from '@/components/NewsCard';
import Pending from '@/components/Pending';
import { categoriaPorId, noticias, proyectos, publicaciones, siglas } from '@/lib/content';

type Props = { params: Promise<{ categoria: string; proyecto: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => proyectos().filter((p) => p.categoria).map((p) => ({ categoria: p.categoria!, proyecto: p.id }));

const buscar = async (params: Props['params']) => {
  const { categoria, proyecto } = await params;
  return proyectos().find((p) => p.id === proyecto && p.categoria === categoria);
};

export async function generateMetadata({ params }: Props) {
  const d = await buscar(params);
  return d ? { title: d.titulo, description: d.resumen } : {};
}

export default async function Ficha({ params }: Props) {
  const d = await buscar(params);
  if (!d) notFound();
  const cat = categoriaPorId(d.categoria!)!;
  const pubs = publicaciones().filter((x) => x.proyecto === d.id);
  const notas = noticias().filter((n) => n.proyecto === d.id);
  return (
    <>
      <PageHero title={d.titulo} lead={d.resumen} meta={[d.sigla, d.banda].filter(Boolean).join(' · ')} crumbs={[{ label: 'Proyectos', href: '/proyectos' }, { label: cat.nombre, href: `/proyectos/${cat.id}` }, { label: d.sigla }]} />
      <main id="contenido">
        <section className="s-light">
          <div className="u-container split">
            <div className="prose">
              <div dangerouslySetInnerHTML={{ __html: d.html }} />
              {d.editorial === 'por-confirmar' && <Pending text="Ficha por confirmar con el centro" />}
            </div>
            <aside className="facts" aria-label="Datos del proyecto">
              <dl>
                <div><dt>Línea</dt><dd><Link href={`/proyectos/${cat.id}`}>{cat.nombre}</Link></dd></div>
                <div><dt>Estado</dt><dd>{d.estado === 'activo' ? 'Activo' : 'Finalizado'}</dd></div>
                <div><dt>Rol de CePIA</dt><dd>{d.rol === 'propio' ? 'Proyecto propio' : 'Colaboración'}</dd></div>
                {d.socios.length > 0 && <div><dt>Socios</dt><dd>{d.socios.join(', ')}</dd></div>}
                {d.banda && <div><dt>Banda</dt><dd>{d.banda}</dd></div>}
              </dl>
            </aside>
          </div>
        </section>
        {pubs.length > 0 && (
          <section className="s-rest">
            <div className="u-container">
              <div className="sec-head"><span className="c-rule c-meta">Publicaciones y conferencias</span></div>
              <PubList items={pubs} nombres={siglas()} />
            </div>
          </section>
        )}
        {notas.length > 0 && (
          <section className="s-rest u-hex">
            <div className="u-container">
              <div className="sec-head"><span className="c-rule c-meta">Blog</span></div>
              <div className="grid-cards">{notas.map((n) => <NewsCard key={n.id} n={n} />)}</div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
