# Plan de mejoras de diseño y UX (noviembre 2026)

Base: `docs/plan/REVISION-UX-2026-11.md` (revisión sobre `7ae919c`).
Verificado contra `main` el 26-nov-2026. `main` sigue en `7ae919c`, así que la revisión mira exactamente lo que está publicado en cepia.vercel.app. No se revisó si hay trabajo local sin subir en el PC.

**Estado: solo plan. No se implementa nada hasta el VB.**

Reglas que manda este plan por sobre la revisión:
- Legibilidad: cuerpo ≥ 18 px, secundario ≥ 15 px, interlineado ~1,6, contraste AA o mejor, Light solo desde 24 px, nada de Thin. Es más estricto que el umbral de la revisión (AA en texto < 18 px).
- `tokens.css` sale de `design-system/tokens.json` con `build_tokens.py`: no se edita a mano. Los ajustes van en `src/styles/site.css`.
- Cada tanda va en su rama y su PR, se revisa en la versión de prueba (URL preview de la rama) y llega a cepia.vercel.app solo con VB.
- Cambios quirúrgicos, sin reescribir componentes. Imágenes en WebP livianas en `public/img/`, nunca base64.
- Fotos de personas o estudiantes solo con consentimiento. Las ilustraciones propias del equipo se pueden usar.
- Tipografía: Barlow (gratis). El lente "portafolio/reclutador" de la revisión es secundario: es un sitio para un cliente.

---

## 1. Verificación punto por punto

| Punto | Estado | Lo que muestra el código |
|---|---|---|
| P1.1 Carrusel sin imágenes | **Vigente, con matices** | Solo `content/proyectos/lct.md` tiene `imagen:`. Pero no hay "fondo vacío": en tono oscuro (`/proyectos`) cada tarjeta usa un degradado `art-1/2/3`, y en tono claro (portada) muestra la sigla grande por `data-sigla` (`site.css` ~571). Es un respaldo, no un respaldo diseñado. Ojo: el carrusel de `/proyectos` muestra **categorías** (5), no proyectos; el de la portada muestra 5 proyectos. Hacen falta ~9 imágenes para los carruseles, no 13. Las fichas (`ProjectCard.tsx`) ya caen a la sigla. `PROMPTS-IMAGENES-CODEX.md` no está en el repo ni en la carpeta del proyecto. |
| P1.2 Contraste del texto pequeño | **Casi resuelto en código** | Medido sobre los valores reales: gris secundario `#B9B4AA` sobre `#060D14` = 9,5:1; sobre `#0F161E` = 8,8:1; tinta `#43525D` sobre lunar 200/100/50 = 5,9 / 6,6 / 7,3:1. Todo pasa AA, la mayoría AAA. Barlow se carga solo en 400/500/700, así que no hay pesos bajo 400. Lo "delgado" que se percibe es Barlow 400 a 16 px en gris. Lo que **sí** queda abierto: texto encima del lienzo 3D y del cielo animado (no se mide con un par de colores) y el naranja `#F58E34` sobre lunar (1,7:1) si llega a usarse como texto en zonas claras. |
| P1.3 Nav de escritorio no visible | **Cambió: es intencional** | No es un bug de z-index. `HeroReveal.tsx` deja el menú retraído en la portada (`html[data-menu="retraido"] .hero .c-nav { opacity: 0 }`, `site.css:680`) y lo muestra con cualquier scroll, mouse, toque o tecla. Es la portada compacta T1.18, aprobada el 6-nov (PR #3 y #4). Una captura estática sin mover el mouse siempre lo verá oculto. Es decisión de diseño, no corrección. Ver §2. |
| P2.4 LCT repetido | **Vigente en parte** | Hero y "visor 3D" son el mismo elemento. Se repite en hero, centro de "Proyectos destacados" (`page.tsx`, `DESTACADOS`), la bajada de esa sección y la noticia "LCT inicia viaje". El orden con el LCT al centro fue aprobado el 6-nov, y en la reunión del 21-oct el cliente pidió destacar **GrTE y LCT** en la portada. |
| P2.5 Siglas sin explicar | **Vigente** | Botón `GrTE` sin bajada en escritorio (`Header.tsx`); en móvil sí dice "radiotelescopio de bajo costo". La ficha del 3D dice "Plato" (`HeroLct.tsx`). "Conocer el LCT" y "Submm" sin expandir. |
| P2.6 Contenido de relleno | **Vigente** | Las 3 noticias son de 2023-10 y 2024-03. `content/proyectos/grte.md` y `/grte` dicen "en desarrollo": es cierto (la plataforma la hace otro equipo), pero se lee a obra gruesa. |
| P2.7a "Arrastra / Desliza" pegados | **Ya resuelto** | `.solo-tactil { display: none }` y el cambio por `@media (hover: none) and (pointer: coarse)` (`site.css:716-717`); además el `<p>` es `aria-hidden`. Solo se "pegan" en el texto plano del HTML, que nadie lee. |
| P2.7b "Ver proyecto / Ver línea" sin contexto | **Resuelto en el carrusel, vigente en el acordeón** | En el carrusel toda la tarjeta es el enlace e incluye el `h3`, así que el nombre accesible ya trae el nombre. En `LineasAcordeon.tsx:29` el enlace "Ver línea" va solo. |
| P2.7c Noticia entera dentro de un enlace | **Vigente** | `NewsCard.tsx`: chip, título, resumen y fecha dentro de un `Link`. |
| P3.8 Indexación y redes | **Vigente** | `layout.tsx`: `robots: { index: false }` (bien por ahora), sin `metadataBase`, `openGraph` ni `twitter`, descripción genérica. |
| P3.9 Rendimiento del 3D | **Vigente en parte** | Ya hay carga diferida por IntersectionObserver, `next/dynamic` sin SSR, corte sin WebGL o con ahorro de datos, reposo con movimiento reducido y pausa fuera de pantalla. El GLB pesa **2,85 MB** (la doc dice 2,7 y 3,1: hay que corregirla). Falta una imagen estática mientras carga y como respaldo: hoy se ve "Cargando modelo" parpadeando. No hay giro por teclado. El logo UdeC es PNG de 10,6 KB, usado 2 veces, y no hay fuente vectorial. |
| P3.10 Footer | **Vigente** | Sin correo ni teléfono, sin año ni ©. El formulario de contacto aún no guarda datos, así que la política de privacidad puede esperar. |

---

## 2. Opinión crítica

**Lo que la revisión acierta.** Protege el concepto de instrumento, que es lo mejor del sitio. Las imágenes son de verdad el punto que más "boceto" hace ver al sitio. OG y metadatos son baratos y se notan cada vez que alguien comparte el enlace. La jerarquía de siglas es real.

**Lo que no se sostiene o hay que corregir.**
- **P1.2 está mal diagnosticado.** Los colores ya pasan AA con margen. Un cambio a ciegas de pesos o grises en `site.css` sería ruido y podría desordenar la jerarquía. Lo correcto es medir la página renderizada (axe más capturas en varios momentos de la animación) y arreglar solo lo que falle, empezando por el texto sobre el 3D.
- **P1.3 no es un error, es una decisión aprobada.** Si se revierte, se deshace T1.18. Mi opinión: la portada compacta está bien para usuarios reales (aparece al primer movimiento del mouse). Lo débil es la retracción a los 5 s, que hace desaparecer el menú mientras alguien lee arriba. Propongo un punto medio: menú visible desde el primer cuadro en pantallas de escritorio con altura suficiente (≥ 800 px), y mantener la portada compacta solo en laptops bajas, que fue el problema original de Nahuel. Esto lo decides tú.
- **P1.1 con imágenes generadas, con cuidado.** Un centro de instrumentación que muestra "objetos de laboratorio" generados por IA corre el riesgo de que parezcan equipos propios que no existen. Orden que propongo: foto real del centro (SharePoint de Comunicaciones, requiere acceso UdeC), luego ilustraciones propias del equipo, luego arte abstracto con el lenguaje del sistema (retícula, lecturas, sigla). Imagen generada solo si es claramente abstracta y nunca como un instrumento específico. Antes de todo eso, un **respaldo diseñado** hace que ninguna tarjeta se vea vacía aunque no llegue ni una foto.
- **P2.4 contradice al cliente si se aplica tal cual.** El cliente pidió destacar GrTE y LCT. Sacar el LCT del centro está bien, pero el reemplazo natural es **GrTE**, no EHT ni WVR: es el proyecto que financia parte del sitio y hoy en escritorio solo tiene un botón chico. Eso da más valor que cualquier reordenamiento.

**Lo que sobra o puede esperar.**
- La sección "Para el portafolio": fuera del alcance del cliente.
- Logo UdeC en SVG: pesa 10,6 KB y no tenemos el vector. Solo si la UdeC entrega el SVG oficial.
- Giro del 3D por teclado: el giro es inspección decorativa, no contenido. Hacer el lienzo enfocable agrega una parada de tabulación arriba de todo. Si se hace, que sean dos botones pequeños (girar a la izquierda o a la derecha) dentro de la ficha. Baja prioridad.
- El control de calidad de 13 imágenes de la revisión: se reduce a ~9 y depende del contenido real.

**Lo que falta.**
1. **Imagen de respaldo del 3D (póster).** Una captura real del modelo en WebP (~60 KB) que se ve al instante, se queda si no hay WebGL y se reemplaza con un fundido cuando el modelo está listo. Mejora la primera vista en móvil y la misma captura sirve de base para la imagen OG. Es lo que más mejora la percepción de calidad y velocidad.
2. **Presupuesto de rendimiento en móvil medio.** three + R3F + GSAP (~300 KB gz) más un GLB de 2,85 MB en 4G. Medir LCP e INP en el preview con un móvil emulado y fijar metas (LCP < 2,5 s, sin tirones al hacer scroll). Si no se cumplen, no cargar el 3D en móviles de gama baja y dejar el póster.
3. **Una puerta de calidad automática en el repo.** Un script con Playwright y axe que, sobre el preview, saque capturas a 390, 1280 y 1536 px, corra axe en todas las páginas y valide tamaños mínimos de texto. Así la verificación no depende del criterio de un modelo y se repite igual en cada tanda.
4. **Revisar las páginas interiores.** La revisión miró solo la portada. Categorías, fichas, Somos, Infraestructura, Vinculación y Contacto tienen avisos "por confirmar" y textos provisorios.
5. **Versión en inglés.** Un centro con socios como Caltech y ShNU, que quiere ser el mejor sitio de su rubro, la va a necesitar. No ahora, pero hay que dejar la estructura de rutas lista para no rehacerla. Queda como pregunta para el cliente.

**Riesgos.**
- **HeroReveal.** Toca el primer contacto con el sitio y ya tuvo tres iteraciones (PR #3, #4 y #5). Cualquier cambio tiene que probar: sin JS (el menú queda visible porque nunca se pone `data-menu`, y está bien), con teclado (el `:focus-within` lo muestra), en táctil y con el puntero quieto sobre el header. No mezclar este cambio con otra tanda.
- **3D.** El contraste de título, bajada y botones depende del velo de `.hero__copy` sobre un lienzo que se mueve. Cualquier ajuste en `site.css` cerca de `.hero__*` o `.lct-stage*` se valida con capturas en tres momentos (cargando, apuntado y reposo), no con un par de colores. No tocar `lct-config.ts` ni el GLB en este plan: la nueva exportación del plato desde Blender sigue pendiente y es pesada para el PC.
- **`site.css` es un solo archivo de ~720 líneas.** Dos tandas en paralelo que lo toquen chocan. Las tandas que lo tocan van en serie.
- **Contenido del cliente.** Imágenes, noticias de 2025-2026, correo de contacto y texto de GrTE dependen del centro. El plan los separa para que el código no quede esperando.

---

## 3. Plan de implementación por tandas

Cada tanda = una rama, un PR y una URL de prueba. Ninguna reescribe componentes.

### Tanda 0 · Puerta de calidad (sin cambios visibles)
- Archivos: `scripts/qa/revisar.mjs` (nuevo), `package.json` (script `qa`), `docs/plan/QA.md`.
- Qué hace: sobre una URL (preview o local) toma capturas de 8 páginas a 390, 1280 y 1536 px, corre axe-core (WCAG AA), lista el texto con tamaño < 15 px o peso < 400, y escribe un informe corto. Usa el Playwright del entorno.
- Hecho cuando: corre sobre cepia.vercel.app y deja la línea base (lo que falla hoy).
- Modelo: Sonnet construye. Revisa Opus.

### Tanda 1 · Accesibilidad y siglas (riesgo bajo)
- Archivos: `src/components/LineasAcordeon.tsx` (texto oculto con el nombre en "Ver línea"), `src/components/NewsCard.tsx` (solo el título es enlace, con área de clic extendida por CSS para no perder la tarjeta clicable), `src/components/lct/HeroLct.tsx` ("Plato" pasa a "Diámetro del plato"), `src/app/page.tsx` (expandir LCT y Submm la primera vez), `src/components/Header.tsx` y `site.css` (GrTE con bajada en escritorio ≥ 1280 px; probar que la cabecera no se desborde entre 1080 y 1280 px), `src/styles/site.css` (estilos mínimos).
- Hecho cuando: axe sin errores nuevos y lectores de pantalla leen enlaces con contexto. La cabecera no se corta a 1080, 1280 y 1536 px.
- Modelo: Sonnet. Verifica Haiku con la puerta de calidad.

### Tanda 2 · Respaldo diseñado para tarjetas sin imagen
- Archivos: `src/styles/site.css` (bloque coverflow, tono oscuro y tarjetas de proyecto), `src/components/CategoryCoverflow.tsx` (pasar la sigla también en tono oscuro: hoy `/proyectos` manda el conteo en `meta`, así que hay que agregar un campo `sigla` aparte), `src/app/proyectos/page.tsx` (sigla de la categoría). Sin imágenes nuevas.
- Diseño: retícula del sistema, sigla grande, lectura pequeña (número de proyectos o banda) y un borde horizonte. Tercio inferior oscuro para el texto, igual que tendrán las fotos, para que el cambio a foto sea solo agregar `imagen:`.
- Hecho cuando: ninguna tarjeta de los dos carruseles ni de las fichas se ve vacía, en claro y en oscuro.
- Modelo: Opus define el diseño en una línea de especificación y Sonnet lo construye. Revisa Opus con capturas.

### Tanda 3 · Póster del 3D y metadatos para compartir
- Archivos: `scripts/qa/poster.mjs` (captura del hero 3D real con Playwright, en reposo), `public/img/lct-poster.webp` (~60 KB), `public/og/cepia-og.jpg` (1200×630, < 200 KB), `src/components/lct/HeroLct.tsx` (póster detrás del lienzo, fundido al estado `listo`, se queda en `sin-3d`; quitar el texto "Cargando modelo"), `src/styles/site.css` (bloque `.lct-stage`), `src/app/layout.tsx` (`metadataBase` con la URL actual, `openGraph`, `twitter`, descripción con instrumentación, LCT, Chajnantor y Concepción; **`robots` sigue en noindex**), `docs/LCT-3D.md` (corregir peso del GLB y documentar el póster).
- Riesgo: es la tanda que toca el hero. Validar con capturas en cargando, apuntado y reposo, y con movimiento reducido.
- Hecho cuando: la primera vista nunca muestra un marco vacío, el enlace compartido en WhatsApp muestra imagen y título, y el LCP en móvil emulado no empeora.
- Modelo: Sonnet construye. Revisa Opus (el visual del hero es criterio, no checklist).

### Tanda 4 · Ajustes de contraste medidos
- Archivos: solo `src/styles/site.css`.
- Qué hace: corrige lo que la Tanda 0 marque como fallido, empezando por el texto sobre el lienzo y el cielo. Sin tocar tokens. Si un fallo viene de un token, se anota para el design system y se corrige en `tokens.json` con su build, en otra tanda.
- Hecho cuando: la puerta de calidad pasa sin errores de contraste en las 8 páginas.
- Modelo: Sonnet. Verifica Haiku.

### Tanda 5 · Portada: GrTE al frente y noticias (necesita tu decisión)
- Archivos: `src/app/page.tsx` (orden de `DESTACADOS` y bajada de la sección; título "Noticias" sin "recientes"), `content/proyectos/grte.md` y `src/app/grte/page.tsx` (texto: qué es, para quién, cómo participar), y quizá un bloque GrTE propio en la portada si lo apruebas.
- Depende de: tu decisión sobre el orden y del texto de GrTE que entregue el centro o Cristóbal.
- Modelo: Sonnet. Revisa Opus.

### Tanda 6 · Cabecera de la portada (solo si eliges cambiarla)
- Archivos: `src/components/HeroReveal.tsx`, `src/styles/site.css` (líneas ~679-680).
- Opción propuesta: menú visible desde el primer cuadro con altura de ventana ≥ 800 px; portada compacta solo en laptops bajas; sin retracción por inactividad.
- Hecho cuando: pasa las pruebas de §2 (sin JS, teclado, táctil, puntero sobre el header).
- Modelo: Sonnet construye. Revisa Opus.

### Tanda 7 · Contenido real (pista del cliente, en paralelo)
- Fotos por categoría y proyecto (WebP 4:5, 1200×1500, < 250 KB, en `public/img/proyectos/<id>.webp` más el campo `imagen:` en el `.md`), foto del LCT en alta, 2 o 3 noticias de 2025-2026, correo de contacto para el footer.
- Archivos: `content/**`, `public/img/proyectos/`, `src/components/Footer.tsx` (correo y © con el año).
- Depende de: el centro. Las fotos con personas necesitan consentimiento.
- Modelo: Haiku convierte y comprime imágenes y valida pesos. Sonnet integra.

### Tanda 8 · Lanzamiento (no ahora)
- `layout.tsx`: `robots` index, canonical y `metadataBase` al dominio institucional, `sitemap.ts` y `robots.ts`. Solo cuando exista el dominio definitivo.

**Orden propuesto:** 0 → 1 → 2 → 3 → 4, en serie porque casi todas tocan `site.css`. La 5 y la 6 entran cuando decidas. La 7 corre en paralelo y se integra a medida que llegue material.

---

## 4. Niveles y modelos: cómo trabajar

La propuesta (Opus planifica y delega, Sonnet construye, Haiku observa) es buena para repartir costo. La ajustaría en un punto: **Haiku no debería juzgar lo visual.** Es bueno para correr y leer verificaciones mecánicas, pero se le escapan problemas de composición, contraste sobre el 3D o un hero que "se ve raro". La revisión visual final la hace Opus.

| Rol | Modelo | Qué hace | Qué no hace |
|---|---|---|---|
| Plan y criterio | **Opus** | Este plan, la especificación de cada tanda en 5-10 líneas, revisión visual con capturas antes de pedir VB, decisiones de diseño | No escribe el código de las tandas |
| Construcción | **Sonnet** | Implementa una tanda por rama, cambios quirúrgicos, abre el PR con capturas | No cambia el alcance de la tanda ni toca tokens |
| Verificación mecánica | **Haiku** | Corre la puerta de calidad (build, axe, tamaños de texto, pesos de imágenes, enlaces rotos) y reporta números y fallos | No aprueba lo visual ni corrige |
| Aprobación | **Tú** | VB sobre la URL de prueba de cada PR | |

Lo que cambia respecto de la propuesta:
1. **Una puerta automática (Tanda 0) antes que un modelo observador.** Un script da el mismo resultado cada vez y cuesta casi nada. Haiku solo la corre y resume.
2. **Opus revisa antes de que tú veas el PR** las tandas que tocan el hero o el diseño (2, 3, 5 y 6). Las de bajo riesgo (1 y 4) pasan con la puerta automática.
3. **Una tanda a la vez sobre `site.css`.** Nada de varios agentes en paralelo sobre el mismo archivo.
4. **Ciclo por tanda:** Opus especifica → Sonnet construye → puerta (Haiku) → Opus revisa (si aplica) → PR con URL de prueba → tu VB → merge a `main`.
