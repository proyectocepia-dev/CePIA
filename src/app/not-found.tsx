import Link from 'next/link';
import PageHero from '@/components/PageHero';

export const metadata = { title: 'Página no encontrada' };

export default function NotFound() {
  return (
    <>
      <PageHero title="Esta página no existe" lead="Puede que haya cambiado de lugar con el sitio nuevo." meta="Error 404">
        <p><Link className="c-btn c-btn--primary" href="/">Volver al inicio</Link></p>
      </PageHero>
      <main id="contenido" />
    </>
  );
}
