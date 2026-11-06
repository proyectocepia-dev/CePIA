# LCT 3D en la portada

El visor de la portada (`src/components/lct/`) muestra el modelo 3D del Leighton Chajnantor Telescope sobre la foto.

## Cómo se comporta
- **Carga diferida:** el código 3D (three + R3F + GSAP, ~300 KB gz) y el modelo (`public/models/lct.glb`, 1,5 MB) se descargan solo cuando el visor entra en pantalla. El texto del hero nunca espera al 3D.
- **Respaldo:** con `prefers-reduced-motion: reduce`, ahorro de datos o sin WebGL queda la foto fija del visor. La foto también se ve mientras carga el modelo y se funde al terminar.
- **Escenas** (poses en `lct-config.ts`):
  1. *Apuntado*: al cargar, el plato baja desde el cenit y gira hasta mirar hacia el apuntador naranja del visor, junto con el barrido del anillo.
  2. *Seguimiento*: en reposo, deriva lenta en azimut y elevación (sigue una fuente); el puntero inclina un poco la cámara.
  3. *Salida*: al hacer scroll fuera del hero, el montaje gira, el plato baja al horizonte y la cámara se aleja.
- El render se detiene cuando el visor sale de pantalla.
- Dirección visual: pieza de museo. Metal oscuro con luces de borde (aqua del visor detrás, naranja bajo del otro lado) y reflejos de un estudio generado en la GPU (`RoomEnvironment`, sin descargar HDR). Detrás, un anillo de luz que siempre mira a la cámara y que el plato tapa en parte, con halo aditivo; se enciende durante el apuntado.
- El lienzo es más grande que el visor y queda por detrás del texto, a la derecha; el velo de `.hero__copy` mantiene el contraste de título, bajada y botones.

## Regenerar el GLB desde Blender
Archivo fuente: `LCT Modelo Completo.blend` (carpeta del proyecto, no va al repo).

```bash
blender -b "LCT Modelo Completo.blend" --python scripts/blender/export_lct.py -- lct-raw.glb
npx @gltf-transform/cli optimize lct-raw.glb public/models/lct.glb --compress meshopt --simplify false --texture-compress false --flatten false --join false
```

El script no modifica el `.blend`. Usa solo lo visible en render, quita pernos y tuercas (invisibles a esta escala), suelda y reduce las piezas grandes (970 mil → 133 mil caras) y une todo en tres nodos: `LCT_Base` (fijo), `LCT_Azimuth` (gira en Y) y `LCT_Elevation` (inclina en X). El modelo no usa texturas; los materiales se reemplazan en la web por grises lunares del sistema de diseño.
