# ADR-002 · Stack del sitio (reemplaza ADR-001)

Fecha: 2026-10-26 · Estado: aceptado. Astro queda descartado.

## Decisión
- **Next.js 16.4.3 (App Router) + React 19.3**, versiones fijadas. Todas las páginas se generan estáticas en el build (`generateStaticParams`, `dynamicParams = false`). Node 20.9 o superior.
- **CSS del sistema de diseño** tal cual: `src/styles/tokens.css` (generado desde `tokens.json`) + `cepia.css` (componentes base) + `site.css` (estilos propios del sitio), importados en `src/app/layout.tsx`. Sin Tailwind.
- **Tipografía pública: Barlow** (Google Fonts) e IBM Plex Mono. Apex New no se publica hasta tener licencia web.
- **Contenido en archivos del repo** durante el boceto: Markdown con front matter en `content/` y JSON en `src/data/`, leídos y validados con zod en `src/lib/content.ts` (mismos campos que el boceto Astro).
- **Etapa posterior (experiencia inmersiva):** React Three Fiber + drei para 3D (modelos `.glb` low-poly de Blender, Draco/meshopt, texturas KTX2), GSAP ScrollTrigger + Lenis para parallax y escenas por scroll, video corto comprimido (Higgsfield → ffmpeg, MP4/WebM + póster). Se agregan como componentes cliente con carga diferida (`next/dynamic`, `ssr: false`) y nunca bloquean el texto.
- **Sanity en el Hito 2 (T2.1)**: los mismos campos pasan a esquemas de Sanity y se cambia el lector de `src/lib/content.ts`. Las páginas no cambian.
- **Vercel** para publicar; formulario con route handler + Resend en el Hito 2 (T2.3).

## Por qué
- El sitio debe soportar video, parallax, cuerpos 3D y un recorrido por el laboratorio. React tiene el ecosistema más grande para 3D y scroll (R3F, drei, GSAP), y Next.js es la plataforma nativa de Vercel.
- Las páginas siguen siendo estáticas: rápidas, buen SEO y poca mantención, con la capa inmersiva encima.

## Reglas de la capa inmersiva
- Legibilidad primero: cuerpo ≥18 px, contraste AA; ningún efecto tapa texto sin velo.
- `prefers-reduced-motion: reduce` apaga parallax, video automático y animación 3D (se muestra la imagen fija).
- Carga progresiva: el 3D y el video se cargan al entrar en pantalla, con póster o imagen de respaldo; presupuesto de peso por página.
- Nada en base64; imágenes y video livianos.
