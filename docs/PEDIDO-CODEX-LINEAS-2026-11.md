# Pedido a Codex: imágenes de Líneas de trabajo (26-nov-2026)

**Tarea única:** generar las cinco imágenes del acordeón de Líneas de trabajo de la portada, según §7 de `docs/PROMPTS-IMAGENES-CORRECCIONES-2026-11.md`. Usa el bloque base (§2 de `PROMPTS-IMAGENES-CODEX.md`) con los cambios de formato y composición de §7.

La entrega anterior (LCT, GrTE, EHT, integración híbrida, OVRO y Open Graph) ya está integrada en la rama `claude/project-thread-ksxcgs`. No la toques.

## Qué entregar

En `entrega-imagenes-lineas-2026-11/recursos/`, mismo esquema que la entrega anterior (PARA-CLAUDE.md, INVENTARIO.json, CONTROL-CALIDAD.json, PROMPTS-UTILIZADOS.md, originales/):

| Archivo | Destino |
|---|---|
| `milimetricas-submm.webp` | `public/img/lineas/milimetricas-submm.webp` |
| `atmosfera.webp` | `public/img/lineas/atmosfera.webp` |
| `colaboraciones.webp` | `public/img/lineas/colaboraciones.webp` |
| `transferencia-tecnologica.webp` | `public/img/lineas/transferencia-tecnologica.webp` |
| `academicos.webp` | `public/img/lineas/academicos.webp` |

- 16:10, 1600 × 1000, WebP < 220 KB.
- Sujeto centro-derecha. El tercio izquierdo y el 40 % inferior caen a casi negro `#0F1012`.
- Control: recortada al centro a 1:4 (franja vertical), el sujeto se sigue reconociendo. Ninguna repite una imagen de proyecto.
- Muestra cada imagen antes de pasar a la siguiente.

## Reglas

- Solo produce recursos en la carpeta de entrega. No escribas en el repositorio, no edites código ni fichas, no hagas operaciones de Git ni publiques. Claude integra.
- El código ya está listo: cada imagen aparece sola cuando existe el archivo en `public/img/lineas/`.
- Sin texto, logos ni personas. Nada que imite un observatorio o equipo real reconocible.
