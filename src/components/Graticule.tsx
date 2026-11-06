// Retícula de 12 columnas alineada al contenedor. Decorativa: va detrás del contenido.
export default function Graticule() {
  return (
    <div className="graticule" aria-hidden="true">
      <div className="u-container graticule__cols" />
    </div>
  );
}
