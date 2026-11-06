'use client';
// Enlaces del menú: marcan la sección activa con aria-current según la ruta.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { nav, isActive } from '@/lib/nav';

function useCur() {
  const path = usePathname() ?? '/';
  return (href: string) => (isActive(href, path) ? ('page' as const) : undefined);
}

export function DesktopNav() {
  const cur = useCur();
  return (
    <ul className="c-nav">
      {nav.map((item) => (
        <li key={item.href}>
          <Link href={item.href} aria-current={cur(item.href)}>{item.label}</Link>
          {item.children && (
            <ul className="c-sub">
              {item.children.map((c) => <li key={c.href}><Link href={c.href} aria-current={cur(c.href)}>{c.label}</Link></li>)}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export function MobileNav() {
  const cur = useCur();
  return (
    <details className="menu-toggle">
      <summary>Menú</summary>
      <div className="menu-panel">
        <ul>
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={cur(item.href)}>{item.label}</Link>
              {item.children && <ul>{item.children.map((c) => <li key={c.href}><Link href={c.href} aria-current={cur(c.href)}>{c.label}</Link></li>)}</ul>}
            </li>
          ))}
          <li><Link href="/grte">GrTE · radiotelescopio de bajo costo</Link></li>
        </ul>
      </div>
    </details>
  );
}
