// Visor de la portada: anillos, graduación y cruz de un instrumento de apuntado.
// Con `foto`, muestra el LCT dentro del visor. En la etapa inmersiva, el modelo 3D del LCT
// se monta en [data-stage="lct-3d"] en lugar de la foto y los anillos quedan encima.
const C = 300;
const ticks = Array.from({ length: 120 }, (_, i) => {
  const a = (i * 3 * Math.PI) / 180;
  const largo = i % 10 === 0 ? 16 : i % 5 === 0 ? 10 : 5;
  const r1 = 262, r2 = r1 + largo;
  const f = (n: number) => n.toFixed(2);
  return { x1: f(C + r1 * Math.sin(a)), y1: f(C - r1 * Math.cos(a)), x2: f(C + r2 * Math.sin(a)), y2: f(C - r2 * Math.cos(a)), mayor: i % 10 === 0 };
});
const cardinales = [
  { t: 'N', x: C, y: 18 }, { t: 'E', x: 584, y: C }, { t: 'S', x: C, y: 584 }, { t: 'O', x: 16, y: C },
];

export default function Reticle({ foto, compacto = false }: { foto?: string; compacto?: boolean }) {
  return (
    <div className={`reticle${compacto ? ' reticle--compact' : ''}`} data-stage="lct-3d" aria-hidden="true">
      <svg viewBox="0 0 600 600" role="presentation" focusable="false">
        <defs>
          <clipPath id={compacto ? 'visor-c' : 'visor'}><circle cx={C} cy={C} r="232" /></clipPath>
          <radialGradient id={compacto ? 'vineta-c' : 'vineta'} cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="#0C1F30" stopOpacity="0" />
            <stop offset="100%" stopColor="#0C1F30" stopOpacity=".85" />
          </radialGradient>
        </defs>
        {foto && (
          <g clipPath={`url(#${compacto ? 'visor-c' : 'visor'})`}>
            <image className="reticle__img" href={foto} x="-140" y="68" width="880" height="426" preserveAspectRatio="xMidYMid slice" />
            <circle cx={C} cy={C} r="232" fill={`url(#${compacto ? 'vineta-c' : 'vineta'})`} />
          </g>
        )}
        <g className="reticle__faint">
          <circle cx={C} cy={C} r="155" />
          <circle cx={C} cy={C} r="78" />
          <circle cx={C} cy={C} r="292" strokeDasharray="2 8" />
          <line x1="0" y1={C} x2="282" y2={C} /><line x1="318" y1={C} x2="600" y2={C} />
          <line x1={C} y1="0" x2={C} y2="282" /><line x1={C} y1="318" x2={C} y2="600" />
        </g>
        <circle className="reticle__ring" cx={C} cy={C} r="232" pathLength={1} />
        <g className="reticle__ticks">
          {ticks.map((t, i) => <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className={t.mayor ? 'is-major' : undefined} />)}
        </g>
        {!compacto && (
          <g className="reticle__labels">
            {cardinales.map((c) => <text key={c.t} x={c.x} y={c.y} textAnchor="middle" dominantBaseline="central">{c.t}</text>)}
          </g>
        )}
        <g className="reticle__sweep">
          <line x1={C} y1={C} x2={C} y2="68" />
          <circle cx={C} cy="68" r="5" />
        </g>
        <circle className="reticle__center" cx={C} cy={C} r="4" />
      </svg>
    </div>
  );
}
