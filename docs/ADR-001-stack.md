# ADR-001 · Stack del sitio (T1.2)

Fecha: 2026-10-26 · Estado: **reemplazado por ADR-002** el mismo día (Astro descartado).

## Decisión
- **Astro 7.3.8** (versión fijada), sitio estático, sin framework de UI. Requiere Node 22.12 o superior.
- **CSS del sistema de diseño** tal cual: `src/styles/tokens.css` (generado desde `tokens.json`) + `cepia.css` (componentes base) + `site.css` (estilos propios del sitio). Sin Tailwind.
- **Tipografía pública: Barlow** (Google Fonts) e IBM Plex Mono. Apex New no se publica hasta tener licencia web.
- **Contenido en archivos del repo** (colecciones de Astro: Markdown y JSON) durante el boceto.
- **Sanity en el Hito 2 (T2.1)**: los mismos campos pasan a esquemas de Sanity y se cambian los *loaders* de las colecciones. Las páginas no cambian.
- **Vercel** para publicar; formulario con función de Vercel + Resend en el Hito 2 (T2.3).

## Por qué
- Sitio de contenido, casi sin interacción: lo estático es rápido, barato y dura años con poca mantención.
- Partir con archivos deja avanzar la maqueta sin esperar cuentas ni CMS, y el modelo de contenido queda probado con datos reales antes de migrar.
- Se usa 7.3.8 y no 7.4.x porque 7.4.2 exige Node 22.23.4.
