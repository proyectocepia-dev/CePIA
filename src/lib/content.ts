// Modelo de contenido (T1.1). Ver docs/MODELO-DE-CONTENIDO.md.
// Hoy el contenido vive en archivos del repo (content/*.md, src/data/*.json); en el Hito 2 se mueve a Sanity con los mismos campos.
// Solo se usa en el servidor (build): lee archivos y valida con zod, igual que las colecciones del boceto anterior.
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { z } from 'zod';

const ROOT = process.cwd();

/** Estado editorial: lo que falta confirmar con el centro se muestra con aviso u oculto. */
const editorial = z.enum(['confirmado', 'por-confirmar', 'oculto']).default('confirmado');

const categoria = z.object({
  id: z.string(),
  nombre: z.string(),
  orden: z.number(),
  resumen: z.string(),
  parrafo: z.string(),
  notaInterna: z.string().optional(),
  editorial,
});

const proyecto = z.object({
  titulo: z.string(),
  sigla: z.string(),
  /** Sin categoría solo el LCT, que tiene página propia en /proyectos/lct. */
  categoria: z.string().optional(),
  etiquetas: z.array(z.string()).default([]),
  estado: z.enum(['activo', 'pasado']).default('activo'),
  rol: z.enum(['propio', 'colaboracion']).default('propio'),
  resumen: z.string(),
  banda: z.string().optional(),
  socios: z.array(z.string()).default([]),
  imagen: z.string().optional(),
  orden: z.number().default(99),
  editorial,
});

const publicacion = z.object({
  id: z.string(),
  titulo: z.string(),
  autores: z.string(),
  anio: z.number(),
  medio: z.string(),
  enlace: z.string().url(),
  tipo: z.enum(['articulo', 'conferencia']).default('articulo'),
  proyecto: z.string().optional(),
});

const persona = z.object({
  id: z.string(),
  nombre: z.string(),
  rol: z.string(),
  foto: z.string().optional(),
  orden: z.number().default(99),
  editorial,
});

const infra = z.object({
  id: z.string(),
  nombre: z.string(),
  bloque: z.enum(['dependencias', 'equipamiento', 'equipos-desarrollados']),
  descripcion: z.string(),
  imagen: z.string().optional(),
  editorial,
});

const socio = z.object({
  id: z.string(),
  nombre: z.string(),
  bloque: z.enum(['empresas', 'educacion', 'id']),
  descripcion: z.string().optional(),
  url: z.string().url().optional(),
  editorial,
});

const noticia = z.object({
  titulo: z.string(),
  fecha: z.coerce.date(),
  resumen: z.string(),
  etiqueta: z.string().default('Noticia'),
  proyecto: z.string().optional(),
  fuente: z.string().url().optional(),
});

export type Categoria = z.infer<typeof categoria>;
export type Proyecto = z.infer<typeof proyecto> & { id: string; html: string };
export type Publicacion = z.infer<typeof publicacion>;
export type Persona = z.infer<typeof persona>;
export type Infra = z.infer<typeof infra>;
export type Socio = z.infer<typeof socio>;
export type Noticia = z.infer<typeof noticia> & { id: string; html: string };

function json<T>(file: string, schema: z.ZodType<T>): T[] {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', file), 'utf8'));
  return z.array(schema).parse(raw);
}

function markdown<T>(dir: string, schema: z.ZodType<T>): (T & { id: string; html: string })[] {
  const base = path.join(ROOT, 'content', dir);
  return fs.readdirSync(base).filter((f) => f.endsWith('.md')).map((f) => {
    const { data, content } = matter(fs.readFileSync(path.join(base, f), 'utf8'));
    const parsed = schema.safeParse(data);
    if (!parsed.success) throw new Error(`content/${dir}/${f}: ${parsed.error.message}`);
    return { ...parsed.data, id: f.replace(/\.md$/, ''), html: marked.parse(content, { async: false }) };
  });
}

export const categorias = () => json('categorias.json', categoria).sort((a, b) => a.orden - b.orden);
export const categoriaPorId = (id: string) => categorias().find((c) => c.id === id);

/** Proyectos visibles (los marcados "oculto" no se publican). */
export const proyectos = () => markdown('proyectos', proyecto).filter((p) => p.editorial !== 'oculto').sort((a, b) => a.orden - b.orden);
export const proyectoPorId = (id: string) => markdown('proyectos', proyecto).find((p) => p.id === id);

export const publicaciones = () => json('publicaciones.json', publicacion).sort((a, b) => b.anio - a.anio);
export const personas = () => json('personas.json', persona).filter((x) => x.editorial !== 'oculto').sort((a, b) => a.orden - b.orden);
export const infraestructura = () => json('infraestructura.json', infra).filter((i) => i.editorial !== 'oculto');
export const socios = () => json('socios.json', socio).filter((s) => s.editorial !== 'oculto');
export const noticias = () => markdown('noticias', noticia).sort((a, b) => +b.fecha - +a.fecha);

/** Sigla de cada proyecto, para las etiquetas de publicaciones. */
export const siglas = () => Object.fromEntries(markdown('proyectos', proyecto).map((p) => [p.id, p.sigla]));

/** Ruta de la ficha: una sola, la de su categoría principal (el LCT tiene la suya). */
export const rutaProyecto = (p: { id: string; categoria?: string }) => (p.categoria ? `/proyectos/${p.categoria}/${p.id}` : `/proyectos/${p.id}`);

export const fechaCorta = (f: Date) => `${String(f.getUTCDate()).padStart(2, '0')}.${String(f.getUTCMonth() + 1).padStart(2, '0')}.${f.getUTCFullYear()}`;
