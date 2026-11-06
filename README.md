# Sitio CePIA

Sitio del Centro para la Instrumentación Astronómica (Universidad de Concepción). Boceto navegable del Hito 1, en Next.js.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # todas las páginas se generan estáticas
npm start        # sirve el build
```

Requiere Node 20.9 o superior.

- Mapa del sitio y rutas: `plan/MAPA-DEL-SITIO.md` (carpeta del proyecto). Rutas en `src/app/`.
- Modelo de contenido: `docs/MODELO-DE-CONTENIDO.md`. Stack: `docs/ADR-002-stack.md`.
- Sistema de diseño: `src/styles/tokens.css` y `cepia.css` vienen de `design-system/`; no editarlos aquí. Lo propio del sitio va en `site.css`.
- Contenido: Markdown en `content/`, JSON en `src/data/`, leídos en `src/lib/content.ts`. Lo que falta confirmar con el centro va con `editorial: por-confirmar`.
- Capa inmersiva (3D, parallax, video): reglas en `docs/ADR-002-stack.md`. El LCT 3D de la portada está en `docs/LCT-3D.md`.
