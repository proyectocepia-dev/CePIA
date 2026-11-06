'use client';
// Portada compacta (T1.18): en la primera vista el menú queda retraído (solo logo, co-marca y GrTE) y aparece al
// empezar a bajar. Marca <html data-menu="retraido|visible">; el CSS hace el fundido. Con teclado, el foco dentro
// del menú lo muestra igual (ver site.css), así que nunca queda inaccesible.
import { useEffect } from 'react';

const UMBRAL = 0.12; // fracción del alto de la ventana que hay que bajar para mostrar el menú

export default function HeroReveal() {
  useEffect(() => {
    const raiz = document.documentElement;
    const actualizar = () => {
      raiz.dataset.menu = window.scrollY > window.innerHeight * UMBRAL ? 'visible' : 'retraido';
    };
    actualizar();
    window.addEventListener('scroll', actualizar, { passive: true });
    return () => {
      window.removeEventListener('scroll', actualizar);
      delete raiz.dataset.menu;
    };
  }, []);
  return null;
}
