import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import { fechaCorta, noticias, proyectoPorId, rutaProyecto } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => noticias().map((n) => ({ slug: n.id }));

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const n = noticias().find((x) => x.id === slug);
  return n ? { title: n.titulo, description: n.resumen } : {};
}

export default async function Noticia({ params }: Props) {
  const { slug } = await params;
  const n = noticias().find((x) => x.id === slug);
  if (!n) notFound();
  const proyecto = n.proyecto ? proyectoPorId(n.proyecto) : undefined;
  return (
    <>
      <PageHero title={n.titulo} meta={`${n.etiqueta} · ${fechaCorta(n.fecha)}`} crumbs={[{ label: 'Blog', href: '/blog' }, { label: 'Noticia' }]} />
      <main id="contenido">
        <section className="s-light">
          <article className="u-container prose">
            <p style={{ fontSize: 'var(--font-size-xl)', lineHeight: 'var(--font-line-height-snug)' }}>{n.resumen}</p>
            <div dangerouslySetInnerHTML={{ __html: n.html }} />
            {proyecto && <p>Proyecto relacionado: <Link href={rutaProyecto(proyecto)}>{proyecto.titulo}</Link></p>}
          </article>
        </section>
      </main>
    </>
  );
}
