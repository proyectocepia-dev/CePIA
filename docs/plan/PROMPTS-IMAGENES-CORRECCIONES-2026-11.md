# Correcciones de imágenes para Codex (26-nov-2026)

Complemento de `PROMPTS-IMAGENES-CODEX.md`. Usa su **bloque base (§2)** antes de cada bloque de sujeto, salvo donde se indique otra cosa. Mismo control de calidad (§5).
Formato de salida igual que la serie: 4:5, 1200 × 1500, WebP < 250 KB, en `public/img/proyectos/<id>.webp`.

**Antes de commitear:** el repo local está en `c3d8277`, tres PR atrás de `main` (`7ae919c`: menú de la portada y lecturas del hero, PR #3, #4 y #5). Primero trae `main` y resuelve conflictos en `src/app/page.tsx`, `src/app/layout.tsx` y `src/styles/site.css` sin perder esos cambios. Todo va en una rama con PR y URL de prueba. Nada a `main` sin VB.

Cambio de regla: **ahora sí se genera el LCT** (pedido explícito, 26-nov). Sigue sin generarse el OVRO.

---

## 1. EHT · TITANS — `eht-titans.webp` (rehacer)

Problema: la estación quedó parada en el mar. TITANS es prueba de sitio en la Antártica: hielo firme, no agua.

```text
SUBJECT — EHT TITANS SITE-TESTING STATION (generic)
A compact, generic autonomous site-testing station standing on a flat, wind-packed Antarctic ice plateau at polar twilight. A slender aluminium mast on a low tripod with guy lines, a small insulated instrument enclosure, a radiometer-style sensor head angled towards the sky, a small solar panel and a thin whip antenna. Light frost on the edges. The ground is solid snow with fine sastrugi ridges and wind-blown drift, absolutely no liquid water, no waves, no sea, no reflections of water. A very low, thin band of orange twilight on the distant horizon, petrol-blue sky above with a few stars. The station sits in the upper 60% of the frame; the snow in the lower 40% falls into deep shadow, almost black.
Not a replica of any real EHT or CePIA equipment. No flags, no logos, no text, no people, no vehicles.
```
Extra negativo: `ocean, sea, waves, water, lake, reflections on water, beach, boat`.

## 2. GrTE — `grte.webp` (rehacer)

Problemas: el plato de malla parece un equipo comercial y tapa la esquina superior izquierda donde va el número. GrTE es real y está **impreso en 3D**. Si llega una foto real de Cristóbal o del centro, la foto reemplaza esta imagen.

```text
SUBJECT — GrTE LOW-COST STUDENT RADIO TELESCOPE (generic, 3D printed)
A small, desk-sized educational radio telescope made mostly of 3D-printed parts: a shallow parabolic dish around 60 cm wide built from several matte PLA petal segments in light grey with visible fine print layer lines, bolted together on thin ribs; a small feed horn held at the focus by three slim printed struts; a compact printed alt-azimuth mount with exposed stepper motors, a small electronics board and neat cables. It looks handmade, precise and friendly, a school project done well, not an industrial antenna. The dish faces up and to the right, so the top-left quarter of the frame stays empty. Subject in the upper 60%, lower 40% falls into near-black.
No mesh dish, no satellite TV dish, no logos, no text, no people, no hands.
```

## 3. MMICs vs. Integración híbrida (diferenciar)

Hoy son casi la misma caja dorada abierta. Se mantiene `mmics.webp` (fue la plancha maestra) y se rehace **`integracion-hibrida.webp`** con otro motivo: el sustrato y los hilos en macro, sin bloque dorado.

```text
SUBJECT — HYBRID INTEGRATION (generic, macro)
Extreme macro of a hybrid microwave circuit: a small white alumina ceramic substrate with fine gold microstrip lines, two tiny dark semiconductor dies and a few chip capacitors, all joined by hair-thin gold wire bonds forming delicate arcs. Shot at a low grazing angle so the wire-bond arcs catch the aqua rim light and read as bright curves against the dark. Very shallow depth of field: the nearest bonds razor sharp, the far edge of the substrate softly out of focus. No machined gold housing, no lid, no connectors. Subject in the upper 60%, top-left corner empty, lower 40% near-black.
```

## 4. LCT — `public/img/proyectos/lct.webp` (nuevo, generado)

El LCT es un telescopio real y reconocible: la imagen tiene que respetar su forma. **Adjuntar dos referencias**: la foto actual `public/img/lct-radiotelescopio.jpg` y una captura del modelo 3D del hero (cepia.vercel.app, en reposo). La referencia manda en geometría; el bloque base manda en luz y color.

```text
SUBJECT — LEIGHTON CHAJNANTOR TELESCOPE (match the reference images for geometry)
The Leighton 10.4-metre submillimetre radio telescope, faithful to the reference images: a single solid parabolic dish made of hexagonal aluminium panels, a slim quadrupod holding the secondary at the focus, the open steel back-structure behind the dish, mounted on its alt-azimuth yoke and turret over a low concrete base. Set on the Chajnantor plateau in the Atacama at about 5000 m, at blue hour after sunset: flat, dry, reddish-brown ground with scattered stones, distant dark Andes silhouettes, a petrol-blue sky with the first stars and a thin orange glow low on the horizon. The dish points high, around 60° elevation, towards upper right. Aqua rim light from the sky behind traces the dish edge; warm orange light grazes the yoke from the opposite side. The telescope sits in the upper 60% of the frame; the ground in the lower 40% falls into deep shadow. Do not invent extra antennas, buildings, domes, vehicles or people.
```
Uso: tarjeta del carrusel de la portada y ficha del LCT (`content/proyectos/lct.md` → `imagen: /img/proyectos/lct.webp`, `imagenTipo: ilustracion`, alt descriptivo). La foto real se mantiene en `public/img/lct-radiotelescopio.jpg` para la página del LCT si el centro no entrega una en alta. Control extra: comparar lado a lado con la referencia. Si el plato, la montura o el cuadrípode no coinciden, se descarta.

## 5. OVRO — `ovro.webp` (ajustar, no generar)

Recortar la foto con licencia a 4:5 (1200 × 1500) **centrando el plato**, no el cuadro. Aplicar un degradado oscuro en el 40 % inferior hacia `#0F1012` y bajar un poco la exposición del cielo para que no rompa la serie nocturna. No cambiar colores de forma que parezca otra toma. Mantener el crédito CC BY-SA 4.0 y anotar "recortada y oscurecida" en `docs/IMAGENES-PROYECTOS-2026-11.md`.

## 6. Open Graph — `public/img/cepia-open-graph.jpg` (rehacer desde la captura)

Partir de la misma captura real del hero, ya con `main` al día. Encuadre más cerrado: el LCT más grande y el titular legible en miniatura (que ocupe ~45 % del alto). Sin HUD lateral ni ficha. 1200 × 630, JPG calidad ~82, < 200 KB. Actualizar la ruta en `layout.tsx`. La indexación sigue desactivada.

---

Orden: 4 (LCT) → 2 (GrTE) → 1 (EHT) → 3 (IH) → 5 (OVRO) → 6 (OG). Mostrar cada imagen antes de pasar a la siguiente.

---

## 7. Imágenes de las Líneas de trabajo (acordeón de la portada) — nuevas

El código ya está listo: cada imagen se muestra sola en cuanto exista el archivo `public/img/lineas/<id>.webp` (no hay que tocar código).
Misma serie y mismo **bloque base (§2 de `PROMPTS-IMAGENES-CODEX.md`)**, con estos cambios de formato porque el panel abierto es apaisado y los cerrados son franjas verticales:

- **Formato:** 16:10, `1600 × 1000`, WebP < 220 KB.
- **Composición (reemplaza la del bloque base):** sujeto en el **centro-derecha**; el **tercio izquierdo y el 40 % inferior** caen a casi negro `#0F1012` (ahí va el título y el texto). El centro vertical de la imagen debe leerse bien recortado como franja angosta (paneles cerrados).
- Son escenas de **línea** (más amplias que las de proyecto) y no deben repetir ninguna imagen de proyecto.

| Archivo | Sujeto |
|---|---|
| `milimetricas-submm.webp` | An open cryostat seen from above at three-quarter angle: a cold plate with a small hexagonal cluster of seven corrugated aluminium feedhorns, copper thermal straps and thin coaxial lines, a round vacuum window ring at the edge. Generic, no recognisable instrument. |
| `atmosfera.webp` | The high Andean plateau at night at about 5000 m: flat dry ground, distant dark volcano silhouettes, thin translucent wisps of water vapour drifting low across a starry petrol-blue sky, a faint orange line on the horizon. A tiny generic weather-instrument mast far away for scale. No people, no buildings. |
| `colaboraciones.webp` | Three or four generic radio dishes of different sizes spread across a desert plain at blue hour, seen from a low distance, dishes pointing to the same patch of sky, faint dotted lines of light linking them (very subtle). Not ALMA, not any recognisable observatory. |
| `transferencia-tecnologica.webp` | A clean lab bench: a plank of raw wood passing under a small microwave horn on a gantry, a compact electronics module beside it, cables neatly routed. Industrial yet precise. No text on screens, no people. |
| `academicos.webp` | A teaching optics bench: a small parabolic reflector model on a stand, a feed at its focus, a laser-like thin aqua beam tracing rays from the dish to the focus, a few calibration tools on the table. Educational, not a toy. |

Control de calidad igual que §5, más: al recortar la imagen al centro a 1:4 (franja vertical) el sujeto se sigue reconociendo.
