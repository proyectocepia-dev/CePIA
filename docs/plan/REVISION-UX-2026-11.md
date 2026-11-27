# Revisión de diseño y UX — sitio CePIA

Fecha: 23-nov-2026 · Revisado sobre `cepia.vercel.app` (commit `7ae919c`) a 1536 px de ancho y en código.
Estado del sitio: boceto navegable del Hito 1. Algunas observaciones son esperables en esta etapa; quedan anotadas para no perderlas.
Archivo complementario: `PROMPTS-IMAGENES-CODEX.md` (imágenes para P1.1).

## Para el agente que implemente (leer primero)

Esta revisión se escribió sobre el commit `7ae919c` y el proyecto local puede ir más adelante. **No implementar nada todavía.**
1. Verificar cada punto contra el código actual y clasificarlo: *vigente*, *ya resuelto* o *cambió*. Ajustar rutas y líneas si se movieron.
2. Evaluar críticamente el plan: prioridades, puntos que sobren o falten, y riesgos (sobre todo en el 3D y en `HeroReveal`).
3. Proponer el orden de implementación en tandas pequeñas, con los archivos que tocará cada una.
4. Esperar la aprobación de Jaime. Cambios quirúrgicos, sin reescribir componentes. Los tokens de `design-system/` no se editan a mano.

---

## Criterio de la revisión (sesgo declarado)

Esta revisión mira el sitio con tres lentes, en este orden:

1. **¿Se ve terminado?** Un visitante (o un reclutador que lo ve en un portafolio) juzga en segundos. Cualquier zona vacía o con texto de relleno pesa más que diez aciertos.
2. **¿Se lee?** Contraste y peso tipográfico antes que estética. Un sitio académico tiene público amplio, no solo pantallas de diseñador.
3. **¿Se entiende sin saber de astronomía?** Siglas y términos técnicos deben explicarse la primera vez.

No se propone cambiar el concepto: la estética de instrumento científico (leyendas "Fig. 01", HUD de plato/azimut/elevación, indicador de elevación ligado al scroll) es el mayor acierto del sitio y todo lo de abajo busca protegerla.

---

## Lo que funciona y no hay que tocar

- Concepto de "instrumento": el diseño cuenta lo que hace CePIA.
- Hero con el LCT 3D girable, titular claro, jerarquía de CTAs correcta (primario "Ver proyectos", secundario "Conocer el LCT").
- Ritmo de secciones oscuras/claras.
- Acordeón de líneas de trabajo con títulos verticales (`LineasAcordeon.tsx`).
- Un solo acento (naranja), tipografía condensada en títulos, retícula ordenada.
- Base de accesibilidad: skip link, un H1, jerarquía H2/H3 coherente, carrusel con `aria-roledescription` y teclado.

---

## Mejoras, por prioridad

### P1 — Lo que hace que se vea inacabado

**1. Carrusel de proyectos sin imágenes**
- Dónde: `src/components/CategoryCoverflow.tsx` (línea ~57: `c.imagen && <img …>`), datos en `content/proyectos/*.md`.
- Problema: solo `lct.md` tiene `imagen:` (`/img/lct-radiotelescopio.jpg`). EHT, WVR, GrTE y el resto muestran solo la sigla fantasma sobre fondo vacío.
- Acción (detalle en `PROMPTS-IMAGENES-CODEX.md`):
  - Orden de preferencia por imagen: **foto real del centro → foto real con licencia → imagen generada**.
  - Imágenes generadas: serie coherente con la luz del hero (contraluz aqua `#9FE6E3`, naranja bajo `#F58E34`, fondo petróleo → night, acabado AgX + viñeta + grano), como objetos de laboratorio genéricos e ilustrativos. Generar primero la plancha maestra (MMICs), aprobarla y usarla como referencia de estilo para el resto.
  - No generar el LCT (pedir la foto real en alta; la actual mide 760 px) ni el OVRO 40M (foto con licencia).
  - Formato: 4:5, `1200 × 1500`, WebP < 250 KB, en `public/img/proyectos/<id>.webp` + campo `imagen:` en cada `.md`. El tercio inferior debe quedar oscuro para el texto y la esquina superior izquierda limpia para el número.
  - Mientras falte una imagen: fallback en CSS (retícula del sistema con la sigla grande), no un fondo vacío.
- Hecho cuando: ninguna tarjeta del carrusel se ve vacía y las 13 imágenes pasan el control de calidad de `PROMPTS-IMAGENES-CODEX.md` §5.

**2. Contraste y peso del texto pequeño**
- Dónde: `src/styles/site.css` (lo propio del sitio). Los tokens viven en `design-system/` y no se editan aquí.
- Problema: descripciones bajo el hero, resúmenes de tarjetas, fechas de noticias y footer usan un peso muy delgado y gris de bajo contraste, tanto sobre fondo oscuro (#060D14) como sobre el gris claro de las secciones "lunares".
- Acción: subir el texto de cuerpo pequeño a peso 400 (mínimo) y aclarar el gris sobre oscuro / oscurecerlo sobre claro hasta cumplir WCAG AA (4.5:1 en texto < 18 px). Verificar con una herramienta de contraste sobre los valores reales.
- Hecho cuando: todo texto de cuerpo pasa AA.

**3. Navegación de escritorio no visible**
- Dónde: `src/components/Header.tsx`, `NavLinks.tsx`, `site.css` (líneas 16–38).
- Observación: en la captura a 1536 px solo se veían el logo y el botón "GrTE"; ni la lista `.c-nav` ni el botón de menú. El CSS solo oculta `.c-nav` bajo 1080 px, así que **verificar primero**: puede ser `HeroReveal` animando la cabecera, un problema de z-index sobre el canvas 3D, o un color de enlace que no contrasta con el cielo.
- Acción: reproducir en 1280–1600 px; asegurar que la nav sea visible desde el primer frame (sin depender de la animación de entrada).
- Hecho cuando: en escritorio se ven Somos, Proyectos, Infraestructura, Vinculación, Blog y Contacto sin interactuar.

### P2 — Claridad y contenido

**4. El LCT se repite cuatro veces en la portada**
- Hero, visor 3D, carrusel de destacados y noticias. Además el carrusel de proyectos y las líneas de trabajo muestran casi las mismas áreas.
- Acción: dejar el LCT protagonista en hero/visor; en "Proyectos destacados" abrir con otro proyecto (EHT o WVR) y dejar el LCT más atrás; diferenciar visual y textualmente "proyectos" (cosas concretas) de "líneas" (áreas).

**5. Siglas y términos sin explicar**
- "Conocer el LCT", "GrTE" (en escritorio sin descripción), "Submm", "EHT", "MMICs", "Plato" en el HUD.
- Acción: expandir la sigla la primera vez (p. ej. botón "GrTE · radiotelescopio para estudiantes", como ya ocurre en móvil); en el HUD, `title`/tooltip o etiqueta "Diámetro del plato".

**6. Contenido de relleno visible**
- Noticias de 2023–2024 en "Noticias recientes"; GrTE dice "su plataforma web está en desarrollo".
- Acción: pedir 2–3 noticias de 2025–2026 al centro, o renombrar la sección a "Noticias" sin "recientes"; en GrTE, reemplazar "en desarrollo" por lo que sí existe hoy (qué es, para quién, cómo participar).

**7. Detalles de texto**
- "Arrastra para girar 360°" y "Desliza para girar 360°" se leen pegados en el HTML (variantes escritorio/móvil). Ocultar la que no corresponde con `display:none`, no solo visualmente.
- Enlaces "Ver proyecto" / "Ver línea" repetidos sin contexto para lectores de pantalla: agregar texto oculto con el nombre (`<span class="u-sr-only"> — {nombre}</span>`).
- Noticias: título, bajada y fecha dentro de un solo enlace generan nombres accesibles muy largos; enlazar solo el título.

### P3 — Antes del lanzamiento

**8. Indexación y redes** — `src/app/layout.tsx`
- Línea 20: `robots: { index: false, follow: false }`. Correcto mientras sea boceto; **cambiar al lanzar**.
- Agregar `metadataBase`, `openGraph` (título, descripción, imagen 1200×630) y `twitter`. La imagen OG se **captura del hero 3D real** con Playwright, no se genera. Sin OG, el link compartido en WhatsApp/LinkedIn sale sin imagen.
- Descripción más específica: mencionar instrumentación, LCT, Chajnantor, Concepción.
- Canonical apuntando al dominio institucional definitivo.

**9. Rendimiento del 3D**
- Ver `docs/LCT-3D.md`. Confirmar peso del modelo, carga diferida y una imagen estática de respaldo mientras carga o si falla ("Cargando modelo" no debe quedar visible).
- Control por teclado para girar (flechas) como alternativa al arrastre.
- Logo UdeC: hoy PNG usado dos veces; pasar a SVG.

**10. Footer**
- Falta correo o teléfono directo (solo "Escríbenos" → /contacto e Instagram). Agregar al menos un correo.
- Agregar año / © Universidad de Concepción y enlace a política de privacidad si el formulario guarda datos.

---

## Checklist rápido

- [ ] P1.1 Imágenes (reales o generadas según `PROMPTS-IMAGENES-CODEX.md`) o fallback diseñado en todas las tarjetas
- [ ] P1.2 Texto de cuerpo pequeño pasa WCAG AA
- [ ] P1.3 Nav de escritorio visible desde el primer frame
- [ ] P2.4 Portada sin el LCT repetido 4 veces
- [ ] P2.5 Siglas explicadas la primera vez
- [ ] P2.6 Noticias actualizadas / GrTE sin "en desarrollo"
- [ ] P2.7 Instrucciones 360° separadas, enlaces con contexto
- [ ] P3.8 robots, Open Graph, canonical (al lanzar)
- [ ] P3.9 3D con fallback y teclado
- [ ] P3.10 Contacto directo y © en footer

## Para el portafolio

Con P1 resuelto, el sitio se puede mostrar como caso principal ("CePIA — Universidad de Concepción · 2026 · en desarrollo"). Capturas sugeridas: hero con el LCT, HUD de observación, acordeón de líneas y una vista móvil.
