# Modelo de contenido (T1.1)

Fecha: 2026-10-26. Definido en `src/lib/content.ts` (esquemas zod); los datos están en `content/` (Markdown) y `src/data/` (JSON). Rutas en `plan/MAPA-DEL-SITIO.md` del proyecto.

Todas las colecciones con texto del centro llevan `editorial`: `confirmado` (por defecto), `por-confirmar` (se muestra con el aviso "Por confirmar" del boceto) u `oculto` (no se publica).

| Colección | Archivo | Campos | Se usa en |
|---|---|---|---|
| `categorias` | `data/categorias.json` | nombre, orden, resumen, parrafo, notaInterna, editorial | Inicio, Proyectos, `/proyectos/<categoria>` |
| `proyectos` | `content/proyectos/*.md` | titulo, sigla, categoria (ref, vacía solo en LCT), etiquetas (refs a otras categorías), estado (activo/pasado), rol (propio/colaboracion), resumen, banda, socios, imagen, orden, editorial + cuerpo | Categorías, fichas `/proyectos/<categoria>/<proyecto>`, LCT |
| `publicaciones` | `data/publicaciones.json` | titulo, autores, anio, medio, enlace, tipo, proyecto (ref) | Proyectos, categorías, fichas, `/proyectos/publicaciones` (filtro por proyecto) |
| `personas` | `data/personas.json` | nombre, rol, foto, orden, editorial | Somos (equipo) |
| `infraestructura` | `data/infraestructura.json` | nombre, bloque (dependencias / equipamiento / equipos-desarrollados), descripcion, imagen, editorial | Infraestructura |
| `socios` | `data/socios.json` | nombre, bloque (empresas / educacion / id), descripcion, url, editorial | Vinculación |
| `noticias` | `content/noticias/*.md` | titulo, fecha, resumen, etiqueta, proyecto (ref), fuente + cuerpo | Inicio, Blog, fichas |

Reglas:
- Un proyecto tiene una sola ruta (su categoría principal); `etiquetas` lo hace aparecer también en otras categorías.
- Transferencia Tecnológica agrupa por `estado` (activos / pasados).
- Restricciones del centro: en Milimétricas/Submm no nombrar proyectos en ejecución (TA, Fondecyt) y cuidar la propiedad intelectual; DTS sin datos confidenciales. Están en `notaInterna` de cada categoría.
