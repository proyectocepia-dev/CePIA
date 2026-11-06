// Menú principal: 7 entradas del esquema del 26-oct (plan/MAPA-DEL-SITIO.md).
export type NavItem = { label: string; href: string; children?: NavItem[] };

export const nav: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Somos', href: '/somos' },
  {
    label: 'Proyectos',
    href: '/proyectos',
    children: [
      { label: 'LCT', href: '/proyectos/lct' },
      { label: 'Milimétricas/Submm', href: '/proyectos/milimetricas-submm' },
      { label: 'Atmósfera', href: '/proyectos/atmosfera' },
      { label: 'Colaboraciones', href: '/proyectos/colaboraciones' },
      { label: 'Transferencia Tecnológica', href: '/proyectos/transferencia-tecnologica' },
      { label: 'Académicos', href: '/proyectos/academicos' },
      { label: 'Publicaciones', href: '/proyectos/publicaciones' },
    ],
  },
  { label: 'Infraestructura', href: '/infraestructura' },
  { label: 'Vinculación', href: '/vinculacion' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
];

/** Sección activa: coincide la ruta exacta o un prefijo (Proyectos incluye sus subpáginas). */
export function isActive(href: string, path: string) {
  const p = path.replace(/\/$/, '') || '/';
  return href === '/' ? p === '/' : p === href || p.startsWith(href + '/');
}
