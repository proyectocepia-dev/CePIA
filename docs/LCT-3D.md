# LCT 3D en la portada

El visor de la portada (`src/components/lct/`) muestra el modelo 3D del Leighton Chajnantor Telescope sobre la foto.

## Cómo se comporta
- **Carga diferida:** el código 3D (three + R3F + GSAP, ~300 KB gz) y el modelo (`public/models/lct.glb`, 3,1 MB con texturas) se descargan solo cuando el visor entra en pantalla. El texto del hero nunca espera al 3D.
- **Solo el modelo:** la portada ya no usa el visor (radar) ni la foto. Mientras carga se ve el marco con un aviso "Cargando modelo".
- **Movimiento reducido:** con `prefers-reduced-motion: reduce` el modelo se monta quieto en su pose de reposo (sin apuntado, deriva ni scroll) y se dibuja solo cuando hace falta. Sin WebGL o con ahorro de datos queda el marco con la ficha, sin modelo.
- **Lámina técnica (brutalista):** marcas de corte, rótulo "Fig. 01 — LCT" y una ficha de bordes duros con plato, azimut y elevación; azimut y elevación son lecturas en vivo de la escena (10 Hz, escritas directo en el DOM). En móvil la ficha va bajo el modelo.
- **Escenas** (poses en `lct-config.ts`):
  1. *Apuntado*: al cargar, el plato baja desde el cenit y gira hasta mirar hacia el apuntador naranja del visor, junto con el barrido del anillo.
  2. *Seguimiento*: en reposo, deriva lenta en azimut y elevación (sigue una fuente); el puntero inclina un poco la cámara.
  3. *Salida*: al hacer scroll fuera del hero, el montaje gira, el plato baja al horizonte y la cámara se aleja.
- El render se detiene cuando el visor sale de pantalla.
- Dirección visual: pieza de museo. Metal oscuro con luces de borde (aqua del visor detrás, naranja bajo del otro lado) y reflejos de un estudio generado en la GPU (`RoomEnvironment`, sin descargar HDR). Detrás, un anillo de luz fuera de foco (desenfoque horneado en una textura de degradado radial, tres capas aditivas; sin postproceso ni filtro CSS) que siempre mira a la cámara y que el plato tapa en parte; se enciende durante el apuntado.
- El lienzo es más grande que el visor y queda por detrás del texto, a la derecha; el velo de `.hero__copy` mantiene el contraste de título, bajada y botones.

## Regenerar el GLB desde Blender
Archivo fuente: `LCT Modelo Completo.blend` (carpeta del proyecto, no va al repo).

```bash
blender -b "LCT Modelo Completo.blend" --python scripts/blender/export_lct.py -- lct-raw.glb
npx @gltf-transform/cli optimize lct-raw.glb public/models/lct.glb --compress meshopt --simplify false --texture-compress false --flatten false --join false
```

El script no modifica el `.blend`. Usa solo lo visible en render, quita pernos y tuercas (invisibles a esta escala), suelda y reduce las piezas grandes (970 mil → 133 mil caras) y une todo en tres nodos: `LCT_Base` (fijo), `LCT_Azimuth` (gira en Y) y `LCT_Elevation` (inclina en X). El modelo no usa texturas; los materiales se reemplazan en la web por grises lunares del sistema de diseño.

## Reutilizar
`LctCanvas` es independiente de la portada: props `activo`, `movimiento`, `alListo` y `alLeer`. Para otra página (por ejemplo `/proyectos/lct`) basta un envoltorio como `HeroLct` con su propio marco; poses, luces y anillo se ajustan en `lct-config.ts`. La portada compacta (T1.18) no toca `.hero__stage`, así que puede aplicarse encima de esta rama.

## Texturas realistas (versión actual del GLB)
`scripts/blender/export_lct_pbr.py` hace lo mismo que `export_lct.py` y además despliega UV y hornea en Cycles
(CPU) materiales procedurales: pintura grafito con suciedad en las cavidades (oclusión), desgaste en los cantos y
manchas; paneles del plato en aluminio. Por nodo salen un color base y un ORM (oclusión, rugosidad, metálico):
1024 px para base y azimut, 2048 px para la elevación (plato). Tarda ~2,5 min.

```bash
blender -b "LCT Modelo Completo.blend" --python scripts/blender/export_lct_pbr.py -- lct-pbr-raw.glb
npx @gltf-transform/cli optimize lct-pbr-raw.glb public/models/lct.glb --compress meshopt --simplify false --texture-compress webp --flatten false --join false
```

Peso: 3,1 MB (geometría ~2,1 MB + texturas WebP ~1 MB). Si el GLB trae texturas, `LctCanvas` usa sus materiales
tal cual; si no (GLB de `export_lct.py`), aplica los materiales planos de `lct-config.ts`.
