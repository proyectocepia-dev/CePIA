import type { Proyecto } from '@/lib/content';

export default function ProjectImage({ p }: { p: Proyecto }) {
  if (!p.imagen) return null;
  return (
    <figure className="project-image">
      <img src={p.imagen} alt={p.imagenAlt ?? p.titulo} width={1200} height={1500} loading="lazy" />
      <figcaption>
        {p.imagenTipo === 'ilustracion' ? 'Ilustración generada con IA. Representación genérica; no muestra un equipo real de CePIA.' : p.imagenCredito && <>
          Fotografía: <a href={p.imagenFuente}>{p.imagenCredito}</a> · <a href={p.imagenLicenciaUrl}>{p.imagenLicencia}</a>. Recortada y oscurecida.
        </>}
      </figcaption>
    </figure>
  );
}
