'use client';
// Portada compacta (T1.18): en la primera vista el menú queda retraído (solo logo, co-marca y GrTE).
// Se despliega con cualquier movimiento (scroll, mouse, toque o teclado) y no se vuelve a retraer al subir:
// solo se retrae si la página está arriba y pasan ~5 s sin movimiento ni el puntero sobre el header.
// Marca <html data-menu="retraido|visible">; el CSS hace el fundido. Con teclado, el foco dentro del
// menú lo muestra igual (ver site.css), así que nunca queda inaccesible.
import { useEffect } from 'react';

const ESPERA_MS = 5000; // tiempo quieto arriba antes de retraer
const ARRIBA_PX = 8;    // tolerancia para considerar "de vuelta arriba"

export default function HeroReveal() {
  useEffect(() => {
    const raiz = document.documentElement;
    let reloj: number | undefined;
    let sobreHeader = false;

    const mostrar = () => { raiz.dataset.menu = 'visible'; };
    const programarRetraer = () => {
      window.clearTimeout(reloj);
      reloj = window.setTimeout(() => {
        if (window.scrollY <= ARRIBA_PX && !sobreHeader) raiz.dataset.menu = 'retraido';
      }, ESPERA_MS);
    };
    const alMover = () => {
      mostrar();
      if (window.scrollY <= ARRIBA_PX) programarRetraer();
      else window.clearTimeout(reloj);
    };
    const header = document.querySelector('.hero .c-header');
    const entrar = () => { sobreHeader = true; mostrar(); window.clearTimeout(reloj); };
    const salir = () => { sobreHeader = false; if (window.scrollY <= ARRIBA_PX) programarRetraer(); };

    raiz.dataset.menu = window.scrollY > ARRIBA_PX ? 'visible' : 'retraido';
    window.addEventListener('scroll', alMover, { passive: true });
    window.addEventListener('wheel', alMover, { passive: true });
    window.addEventListener('touchmove', alMover, { passive: true });
    window.addEventListener('pointermove', alMover, { passive: true });
    window.addEventListener('keydown', alMover);
    header?.addEventListener('pointerenter', entrar);
    header?.addEventListener('pointerleave', salir);
    return () => {
      window.clearTimeout(reloj);
      window.removeEventListener('scroll', alMover);
      window.removeEventListener('wheel', alMover);
      window.removeEventListener('touchmove', alMover);
      window.removeEventListener('pointermove', alMover);
      window.removeEventListener('keydown', alMover);
      header?.removeEventListener('pointerenter', entrar);
      header?.removeEventListener('pointerleave', salir);
      delete raiz.dataset.menu;
    };
  }, []);
  return null;
}
