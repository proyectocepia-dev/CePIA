import Link from 'next/link';
import Logo from './Logo';
import Sky from './Sky';
import { nav } from '@/lib/nav';

export default function Footer() {
  const proyectos = nav.find((n) => n.href === '/proyectos')?.children ?? [];
  return (
    <footer className="c-footer u-hex">
      <Sky variante="stars" estrellas={120} semilla={41} />
      <div className="c-footer__mark" aria-hidden="true"><Logo /></div>
      <div className="u-container foot-grid">
        <div className="foot-top">
          <div className="c-cobrand c-cobrand--foot">
            <span style={{ width: 89, color: 'var(--color-neutral-0)', opacity: 0.9 }}><Logo label="CePIA" /></span>
            <span className="c-cobrand__sep" aria-hidden="true"></span>
            <img className="c-cobrand__udec" src="/img/udec-blanco.png" alt="Universidad de Concepción" width={240} height={95} />
          </div>
        </div>
        <div className="foot-cols">
          <div>
            <h2>Sitio</h2>
            <ul>{nav.filter((n) => n.href !== '/').map((n) => <li key={n.href}><Link href={n.href} prefetch={false}>{n.label}</Link></li>)}</ul>
          </div>
          <div>
            <h2>Proyectos</h2>
            <ul>{proyectos.map((n) => <li key={n.href}><Link href={n.href} prefetch={false}>{n.label}</Link></li>)}</ul>
          </div>
          <div>
            <h2>Contacto</h2>
            <ul>
              <li>Av. Esteban Iturra s/n, Barrio Universitario, Universidad de Concepción</li>
              <li><Link href="/contacto" prefetch={false}>Escríbenos</Link></li>
              <li><a href="https://www.instagram.com/cepiaudec" target="_blank" rel="noopener">Instagram @cepiaudec</a></li>
            </ul>
          </div>
        </div>
        <div className="c-rule c-meta" style={{ paddingBottom: 'var(--space-9)' }}>Centro para la Instrumentación Astronómica, Universidad de Concepción</div>
      </div>
    </footer>
  );
}
