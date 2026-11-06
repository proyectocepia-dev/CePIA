// Encabezado oscuro de páginas interiores; la cabecera del sitio flota encima.
import Link from 'next/link';
import type { ReactNode } from 'react';
import Logo from './Logo';
import Header from './Header';
import Graticule from './Graticule';
import Reticle from './Reticle';
import Sky from './Sky';

type Crumb = { label: string; href?: string };

export default function PageHero({ title, lead, meta, crumbs = [], children }: { title: string; lead?: string; meta?: string; crumbs?: Crumb[]; children?: ReactNode }) {
  return (
    <header className="s-hero page-hero">
      <Sky variante="page" estrellas={160} semilla={11} />
      <Graticule />
      <Header />
      <div className="c-watermark" aria-hidden="true"><Logo variant="iso" /></div>
      <div className="page-hero__reticle"><Reticle compacto /></div>
      <div className="u-container page-hero__inner">
        {crumbs.length > 0 && (
          <nav aria-label="Ruta"><ol className="crumbs">
            <li><Link href="/">Inicio</Link></li>
            {crumbs.map((c) => <li key={c.label}>{c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}</li>)}
          </ol></nav>
        )}
        {meta && <span className="c-meta">{meta}</span>}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </header>
  );
}
