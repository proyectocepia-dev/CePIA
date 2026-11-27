// Gráfica temática del encabezado de cada sección (reemplaza al visor circular de las páginas interiores).
// Cada tema es un SVG en línea con el lenguaje del sistema: trazos aqua finos, un solo acento naranja, lecturas en
// Barlow Semi Condensed. Siempre que se puede, el dibujo sale de datos reales del centro. Decorativo (aria-hidden).
// Solo anima opacidad y transform, y nada con movimiento reducido (ver .hero-tema en site.css).

import { noticias, publicaciones } from '@/lib/content';

export type Tema =
  | 'proyectos' | 'atmosfera' | 'somos' | 'milimetricas-submm' | 'colaboraciones' | 'transferencia-tecnologica'
  | 'academicos' | 'lct' | 'infraestructura' | 'vinculacion' | 'publicaciones' | 'blog' | 'grte' | 'contacto' | 'error';

/** Tema de cada categoría de proyectos (las fichas de proyecto usan el de su categoría). */
export const temaDeCategoria = (id?: string): Tema | undefined =>
  (['atmosfera', 'milimetricas-submm', 'colaboraciones', 'transferencia-tecnologica', 'academicos'] as const).find((t) => t === id);

const f = (n: number) => n.toFixed(1);

/* ---------- Proyectos: regla del espectro milimétrico y submilimétrico ---------- */
// Eje logarítmico 30 GHz – 1 THz. Las marcas son bandas de observación reales (3 mm, 1,3 mm, 0,87 mm).
function Espectro() {
  const x0 = 40, x1 = 580, y = 330;
  const lg = (ghz: number) => x0 + ((Math.log10(ghz) - Math.log10(30)) / (Math.log10(1000) - Math.log10(30))) * (x1 - x0);
  const menores = [40, 50, 60, 70, 80, 90, 200, 400, 500, 600, 700, 800, 900];
  const mayores = [{ g: 30, t: '30 GHz' }, { g: 100, t: '100' }, { g: 300, t: '300' }, { g: 1000, t: '1 THz' }];
  const bandas = [{ g: 100, t: '3 mm' }, { g: 230, t: '1,3 mm' }, { g: 345, t: '0,87 mm' }];
  // Onda cuya longitud se acorta hacia la derecha, como la frecuencia en el eje.
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 2) {
    const fase = Math.pow((x - x0) / (x1 - x0), 1.8) * 30 * Math.PI;
    pts.push(`${f(x)},${f(178 + Math.sin(fase) * 36)}`);
  }
  return (
    <svg viewBox="0 80 600 310" className="hero-tema__svg">
      <rect x={lg(30)} y={120} width={lg(300) - lg(30)} height={250} className="ht-banda" />
      <rect x={lg(300)} y={120} width={lg(1000) - lg(300)} height={250} className="ht-banda ht-banda--b" />
      <text x={lg(30) + 10} y={112} className="ht-label">Milimétrico</text>
      <text x={lg(300) + 10} y={112} className="ht-label">Submilimétrico</text>
      <polyline points={pts.join(' ')} className="ht-trazo ht-dibuja" />
      <line x1={x0} y1={y} x2={x1} y2={y} className="ht-eje" />
      {menores.map((g) => <line key={g} x1={f(lg(g))} y1={y} x2={f(lg(g))} y2={y + 8} className="ht-eje" />)}
      {mayores.map((m) => (
        <g key={m.g}>
          <line x1={f(lg(m.g))} y1={y} x2={f(lg(m.g))} y2={y + 16} className="ht-eje" />
          <text x={f(lg(m.g))} y={y + 40} textAnchor={m.g === 1000 ? 'end' : m.g === 30 ? 'start' : 'middle'} className="ht-label">{m.t}</text>
        </g>
      ))}
      {bandas.map((b, i) => (
        <g key={b.g}>
          <line x1={f(lg(b.g))} y1={128} x2={f(lg(b.g))} y2={y} className={i === 0 ? 'ht-acento' : 'ht-guia ht-guia--fuerte'} />
          <circle cx={f(lg(b.g))} cy={y} r={4} className={i === 0 ? 'ht-punto ht-punto--acento' : 'ht-punto'} />
          <text x={f(lg(b.g) + 8)} y={250 + i * 26} className="ht-valor">{b.t}</text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Atmósfera: transmisión del cielo de Chajnantor y la línea del vapor de agua ---------- */
// Curva ilustrativa (≈1 mm de vapor de agua precipitable): ventanas y líneas de absorción en sus frecuencias reales.
// Los radiómetros miden la línea de 183 GHz (acento naranja).
function Transmision() {
  const x0 = 40, x1 = 560, yTop = 90, yBase = 350;
  const fx = (g: number) => x0 + ((g - 100) / (1000 - 100)) * (x1 - x0);
  const fy = (t: number) => yBase - t * (yBase - yTop);
  // [frecuencia GHz, ancho, profundidad] de las líneas de absorción principales (agua y oxígeno).
  const lineas: [number, number, number][] = [
    [118.8, 1.6, 0.35], [183.3, 9, 0.97], [325.2, 9, 0.8], [380.2, 13, 0.99], [448, 12, 0.97], [474.7, 5, 0.45],
    [556.9, 30, 1], [620.7, 7, 0.55], [752, 30, 1], [916, 10, 0.5], [988, 34, 1],
  ];
  const pts: string[] = [];
  for (let g = 100; g <= 1000; g += 1.5) {
    const continuo = 0.97 - 0.62 * Math.pow((g - 100) / 900, 1.15);
    let t = continuo;
    for (const [c, w, d] of lineas) t *= 1 - d * Math.exp(-(((g - c) / w) ** 2));
    pts.push(`${f(fx(g))},${f(fy(Math.max(0, t)))}`);
  }
  const ejes = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      {[0.25, 0.5, 0.75, 1].map((t) => <line key={t} x1={x0} y1={fy(t)} x2={x1} y2={fy(t)} className="ht-guia" />)}
      <text x={x1} y={fy(1) - 12} textAnchor="end" className="ht-label">Transmisión</text>
      <polyline points={pts.join(' ')} className="ht-trazo ht-dibuja" />
      <line x1={x0} y1={yBase} x2={x1} y2={yBase} className="ht-eje" />
      {ejes.map((g) => <line key={g} x1={f(fx(g))} y1={yBase} x2={f(fx(g))} y2={yBase + (g % 500 === 0 || g === 100 ? 16 : 8)} className="ht-eje" />)}
      <text x={fx(100)} y={yBase + 40} className="ht-label">100 GHz</text>
      <text x={fx(500)} y={yBase + 40} textAnchor="middle" className="ht-label">500</text>
      <text x={fx(1000)} y={yBase + 40} textAnchor="end" className="ht-label">1 THz</text>
      <line x1={fx(183.3)} y1={fy(1) - 30} x2={fx(183.3)} y2={yBase} className="ht-acento" />
      <circle cx={fx(183.3)} cy={fy(0.03)} r={4} className="ht-punto ht-punto--acento" />
      <text x={fx(183.3) + 10} y={fy(1) - 12} className="ht-valor">183 GHz <tspan className="ht-label">· vapor de agua</tspan></text>
    </svg>
  );
}

/* ---------- Somos: de Concepción a Chajnantor ---------- */
// Retícula de latitud y longitud en proyección equirectangular; las coordenadas son las del readout de la portada.
function Sitios() {
  const lon0 = -80, lon1 = -58, lat0 = -40, lat1 = -20;
  const W = 600, H = 460, m = 30;
  const esc = Math.min((W - 2 * m) / (lon1 - lon0), (H - 2 * m) / (lat1 - lat0));
  const px = (lon: number) => m + (lon - lon0) * esc + ((W - 2 * m) - (lon1 - lon0) * esc) / 2;
  const py = (lat: number) => m + (lat1 - lat) * esc;
  const conce = { lat: -36 - 49 / 60, lon: -73 - 3 / 60 };
  const chaj = { lat: -23 - 1 / 60, lon: -67 - 45 / 60 };
  const a = { x: px(conce.lon), y: py(conce.lat) };
  const b = { x: px(chaj.lon), y: py(chaj.lat) };
  // Arco suave entre ambos puntos (bombeado hacia el oeste, como una trayectoria vista en planta).
  const cx = (a.x + b.x) / 2 - 70, cy = (a.y + b.y) / 2;
  const mx = 0.25 * a.x + 0.5 * cx + 0.25 * b.x, my = 0.25 * a.y + 0.5 * cy + 0.25 * b.y;
  const meridianos = [-78, -74, -70, -66, -62];
  const paralelos = [-38, -34, -30, -26, -22];
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      {meridianos.map((l) => <line key={l} x1={f(px(l))} y1={py(lat1)} x2={f(px(l))} y2={py(lat0)} className="ht-guia" />)}
      {paralelos.map((l) => <line key={l} x1={px(lon0)} y1={f(py(l))} x2={px(lon1)} y2={f(py(l))} className="ht-guia" />)}
      {paralelos.map((l) => <text key={l} x={f(px(lon0) + 6)} y={f(py(l) - 8)} className="ht-label">{`${-l}°S`}</text>)}
      <path d={`M${f(a.x)},${f(a.y)} Q${f(cx)},${f(cy)} ${f(b.x)},${f(b.y)}`} className="ht-trazo ht-trazo--punteado ht-dibuja" />
      <circle cx={f(a.x)} cy={f(a.y)} r={5} className="ht-punto" />
      <circle cx={f(a.x)} cy={f(a.y)} r={14} className="ht-anillo" />
      <circle cx={f(b.x)} cy={f(b.y)} r={5} className="ht-punto ht-punto--acento" />
      <circle cx={f(b.x)} cy={f(b.y)} r={14} className="ht-anillo ht-anillo--acento" />
      <text x={f(a.x + 24)} y={f(a.y + 6)} className="ht-valor">Concepción</text>
      <text x={f(a.x + 24)} y={f(a.y + 32)} className="ht-label">36°49′S 73°03′O</text>
      <text x={f(b.x + 24)} y={f(b.y + 6)} className="ht-valor">Chajnantor</text>
      <text x={f(b.x + 24)} y={f(b.y + 32)} className="ht-label">23°01′S 67°45′O · 5000 m</text>
      <text x={f(mx - 14)} y={f(my + 6)} textAnchor="end" className="ht-label">1616 km</text>
    </svg>
  );
}

/* ---------- Milimétricas/Submm: bocina corrugada, guía de onda y haz gaussiano ---------- */
function Bocina() {
  const yc = 230;
  // Perfil de la bocina: se abre de 14 a 120 px entre x=330 y x=110, con dientes de corrugación.
  const perfil = (lado: 1 | -1) => {
    const d: string[] = [];
    const n = 22;
    for (let i = 0; i <= n; i++) {
      const x = 330 - (i / n) * 220;
      const r = 14 + Math.pow(i / n, 1.25) * 106;
      d.push(`${i === 0 ? 'M' : 'L'}${f(x)},${f(yc + lado * r)}`);
      if (i < n) d.push(`L${f(x)},${f(yc + lado * (r + 12))}`, `L${f(x - 5)},${f(yc + lado * (r + 12))}`, `L${f(x - 5)},${f(yc + lado * r)}`);
    }
    return d.join(' ');
  };
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      {[40, 70, 100, 130].map((r, i) => (
        <ellipse key={r} cx={70} cy={yc} rx={r * 0.32} ry={r} className={i === 0 ? 'ht-trazo ht-dibuja' : 'ht-guia ht-guia--fuerte'} />
      ))}
      <path d={perfil(1)} className="ht-trazo" />
      <path d={perfil(-1)} className="ht-trazo" />
      <rect x={330} y={yc - 14} width={170} height={28} className="ht-eje" />
      <line x1={330} y1={yc} x2={520} y2={yc} className="ht-acento" />
      <circle cx={505} cy={yc} r={4} className="ht-punto ht-punto--acento" />
      <line x1={20} y1={yc} x2={110} y2={yc} className="ht-guia" />
      <text x={110} y={yc - 150} className="ht-label">Bocina corrugada</text>
      <text x={340} y={yc - 34} className="ht-label">Guía de onda</text>
      <text x={340} y={yc + 56} className="ht-valor">λ 3 mm · 100 GHz</text>
      <text x={20} y={yc + 160} className="ht-label">Haz gaussiano</text>
    </svg>
  );
}

/* ---------- Colaboraciones: red de sitios de los proyectos internacionales ---------- */
const SITIOS_RED: { t: string; lat: number; lon: number; base?: boolean; izq?: boolean; abajo?: boolean }[] = [
  { t: 'Concepción', lat: -36.82, lon: -73.05, base: true, abajo: true },
  { t: 'Chajnantor', lat: -23.02, lon: -67.75, izq: true },
  { t: 'Owens Valley', lat: 37.23, lon: -118.28 },
  { t: 'Maunakea', lat: 19.82, lon: -155.47, abajo: true },
  { t: 'Shanghái', lat: 31.2, lon: 121.4 },
  { t: 'Polo Sur', lat: -89.9, lon: 0 },
];
function Red() {
  const px = (lon: number) => 20 + ((lon + 180) / 360) * 560;
  const py = (lat: number) => 60 + ((70 - lat) / 160) * 360;
  const base = SITIOS_RED[0];
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((l) => <line key={l} x1={f(px(l))} y1={py(70)} x2={f(px(l))} y2={py(-90)} className="ht-guia" />)}
      {[60, 30, 0, -30, -60].map((l) => <line key={l} x1={px(-180)} y1={f(py(l))} x2={px(180)} y2={f(py(l))} className="ht-guia" />)}
      {SITIOS_RED.slice(1).map((s) => {
        const a = { x: px(base.lon), y: py(base.lat) }, b = { x: px(s.lon), y: py(s.lat) };
        const cx = (a.x + b.x) / 2, cy = Math.min(a.y, b.y) - 50;
        return <path key={s.t} d={`M${f(a.x)},${f(a.y)} Q${f(cx)},${f(cy)} ${f(b.x)},${f(b.y)}`} className="ht-trazo ht-trazo--punteado ht-dibuja" />;
      })}
      {SITIOS_RED.map((s) => (
        <g key={s.t}>
          <circle cx={f(px(s.lon))} cy={f(py(s.lat))} r={s.base ? 5 : 4} className={s.base ? 'ht-punto ht-punto--acento' : 'ht-punto'} />
          {s.base && <circle cx={f(px(s.lon))} cy={f(py(s.lat))} r={14} className="ht-anillo ht-anillo--acento" />}
          <text x={f(px(s.lon) + (s.lon > 90 || s.izq ? -12 : 12))} y={f(py(s.lat) + (s.abajo ? 26 : -10))} textAnchor={s.lon > 90 || s.izq ? 'end' : 'start'} className={s.base ? 'ht-valor' : 'ht-label'}>{s.t}</text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Transferencia tecnológica: una señal que atraviesa la madera (Radiowood) ---------- */
function Madera() {
  const cx = 300, cy = 230;
  const anillos = Array.from({ length: 11 }, (_, i) => 18 + i * 15);
  const anillo = (r: number, k: number) => {
    const pts: string[] = [];
    for (let a = 0; a <= 360; a += 6) {
      const rad = (a * Math.PI) / 180;
      const rr = r * (1 + 0.035 * Math.sin(rad * 3 + k) + 0.02 * Math.cos(rad * 5 + k * 2));
      pts.push(`${f(cx + rr * Math.cos(rad) * 1.08)},${f(cy + rr * Math.sin(rad))}`);
    }
    return pts.join(' ');
  };
  const onda: string[] = [];
  for (let x = 20; x <= 580; x += 2) {
    const dentro = x > cx - 180 && x < cx + 180;
    const amp = x <= cx - 180 ? 34 : dentro ? 34 - ((x - (cx - 180)) / 360) * 22 : 12;
    onda.push(`${f(x)},${f(cy + Math.sin(x / 9) * amp)}`);
  }
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      {anillos.map((r, i) => <polygon key={r} points={anillo(r, i)} className={i === anillos.length - 1 ? 'ht-eje' : 'ht-guia ht-guia--suave'} />)}
      <polyline points={onda.join(' ')} className="ht-trazo ht-dibuja" />
      <line x1={cx + 180} y1={cy - 80} x2={cx + 180} y2={cy + 80} className="ht-acento" />
      <text x={20} y={cy - 52} className="ht-label">Señal emitida</text>
      <text x={580} y={cy - 52} textAnchor="end" className="ht-label">Señal recibida</text>
      <text x={cx + 192} y={cy + 100} className="ht-valor">Humedad</text>
    </svg>
  );
}

/* ---------- Académicos: óptica de un plato parabólico (rayos al foco) ---------- */
function Parabola({ lct = false }: { lct?: boolean }) {
  const vx = 150, yc = 230, F = 150; // vértice y distancia focal (x = vx + y²/4F)
  const xp = (y: number) => vx + (y * y) / (4 * F);
  const pts: string[] = [];
  for (let y = -170; y <= 170; y += 4) pts.push(`${f(xp(y))},${f(yc + y)}`);
  const rayos = [-140, -95, -50, 50, 95, 140];
  const foco = { x: vx + F, y: yc };
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      <polyline points={pts.join(' ')} className="ht-trazo" style={{ strokeWidth: 2.2 }} />
      {rayos.map((y) => (
        <polyline key={y} points={`590,${f(yc + y)} ${f(xp(y))},${f(yc + y)} ${f(foco.x)},${f(foco.y)}`} className="ht-guia ht-guia--fuerte ht-dibuja" />
      ))}
      <line x1={vx} y1={yc} x2={590} y2={yc} className="ht-guia" />
      <circle cx={foco.x} cy={foco.y} r={5} className="ht-punto ht-punto--acento" />
      <circle cx={foco.x} cy={foco.y} r={14} className="ht-anillo ht-anillo--acento" />
      {lct ? (
        <>
          <line x1={vx - 40} y1={yc - 170} x2={vx - 40} y2={yc + 170} className="ht-eje" />
          <line x1={vx - 48} y1={yc - 170} x2={vx - 32} y2={yc - 170} className="ht-eje" />
          <line x1={vx - 48} y1={yc + 170} x2={vx - 32} y2={yc + 170} className="ht-eje" />
          <text x={vx - 52} y={yc + 6} textAnchor="end" className="ht-valor">10,4 m</text>
          <text x={foco.x + 18} y={foco.y - 18} className="ht-label">Secundario</text>
          <text x={590} y={yc - 186} textAnchor="end" className="ht-label">Submilimétrico · Chajnantor</text>
        </>
      ) : (
        <>
          <text x={foco.x + 18} y={foco.y - 18} className="ht-valor">Foco</text>
          <text x={vx - 6} y={yc + 196} className="ht-label">Plato parabólico</text>
          <text x={590} y={yc - 186} textAnchor="end" className="ht-label">Ondas de radio</text>
        </>
      )}
    </svg>
  );
}

/* ---------- Infraestructura: etapas de un criostato y su escala de temperatura ---------- */
function Criostato() {
  const etapas = [
    { t: '300 K', d: 'Ambiente', w: 300, h: 380 },
    { t: '77 K', d: 'Nitrógeno líquido', w: 220, h: 250 },
    { t: '4 K', d: 'Helio líquido', w: 140, h: 120 },
  ];
  const cx = 230, cy = 230;
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      {etapas.map((e, i) => (
        <g key={e.t}>
          <rect x={cx - e.w / 2} y={cy - e.h / 2} width={e.w} height={e.h} className={i === 2 ? 'ht-trazo ht-dibuja' : i === 0 ? 'ht-eje' : 'ht-guia ht-guia--fuerte'} />
          <line x1={cx + e.w / 2} y1={cy - e.h / 2} x2={440} y2={cy - e.h / 2} className="ht-guia" />
          <circle cx={440} cy={cy - e.h / 2} r={4} className={i === 2 ? 'ht-punto ht-punto--acento' : 'ht-punto'} />
          <text x={456} y={cy - e.h / 2 + 6} className="ht-valor">{e.t}</text>
          <text x={456} y={cy - e.h / 2 + 30} className="ht-label">{e.d}</text>
        </g>
      ))}
      <rect x={cx - 26} y={cy - 18} width={52} height={36} className="ht-acento" />
      <line x1={440} y1={cy - 190} x2={440} y2={cy + 190} className="ht-eje" />
    </svg>
  );
}

/* ---------- Vinculación: industria, educación e investigación alrededor del centro ---------- */
function Nodos() {
  const c = { x: 300, y: 230 };
  const nodos = [{ t: 'Industria', a: -90 }, { t: 'Educación', a: 30 }, { t: 'I+D', a: 150 }];
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      {[70, 140, 190].map((r, i) => <circle key={r} cx={c.x} cy={c.y} r={r} className={i === 1 ? 'ht-guia ht-guia--fuerte' : 'ht-guia'} />)}
      {nodos.map((n) => {
        const rad = (n.a * Math.PI) / 180;
        const x = c.x + 140 * Math.cos(rad), y = c.y + 140 * Math.sin(rad);
        return (
          <g key={n.t}>
            <line x1={c.x} y1={c.y} x2={f(x)} y2={f(y)} className="ht-trazo ht-dibuja" />
            <circle cx={f(x)} cy={f(y)} r={5} className="ht-punto" />
            <circle cx={f(x)} cy={f(y)} r={14} className="ht-anillo" />
            <text x={f(x + (n.a === 150 ? -22 : 22))} y={f(y + (n.a === -90 ? -18 : 6))} textAnchor={n.a === 150 ? 'end' : n.a === -90 ? 'middle' : 'start'} className="ht-valor">{n.t}</text>
          </g>
        );
      })}
      <circle cx={c.x} cy={c.y} r={6} className="ht-punto ht-punto--acento" />
      <circle cx={c.x} cy={c.y} r={18} className="ht-anillo ht-anillo--acento" />
      <text x={c.x} y={c.y + 44} textAnchor="middle" className="ht-label">CePIA</text>
    </svg>
  );
}

/* ---------- Publicaciones: publicaciones por año (datos de publicaciones.json) ---------- */
function PorAnio() {
  const cuenta = new Map<number, number>();
  for (const p of publicaciones()) cuenta.set(p.anio, (cuenta.get(p.anio) ?? 0) + 1);
  const anios = [...cuenta.keys()].sort();
  const a0 = Math.min(...anios, 2016), a1 = Math.max(...anios, 2026);
  const x0 = 40, x1 = 560, yb = 340;
  const px = (a: number) => x0 + ((a - a0) / (a1 - a0)) * (x1 - x0);
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      <line x1={x0} y1={yb} x2={x1} y2={yb} className="ht-eje" />
      {Array.from({ length: a1 - a0 + 1 }, (_, i) => a0 + i).map((a) => (
        <line key={a} x1={f(px(a))} y1={yb} x2={f(px(a))} y2={yb + (a % 5 === 0 ? 16 : 8)} className="ht-eje" />
      ))}
      {anios.map((a, i) => (
        <g key={a}>
          <line x1={f(px(a))} y1={yb} x2={f(px(a))} y2={f(yb - (cuenta.get(a) ?? 0) * 26 - 14)} className="ht-guia ht-guia--fuerte" />
          {Array.from({ length: cuenta.get(a) ?? 0 }, (_, k) => (
            <rect key={k} x={f(px(a) - 9)} y={f(yb - 24 - k * 26)} width={18} height={18} className={i === anios.length - 1 ? 'ht-acento ht-acento--lleno' : 'ht-trazo ht-dibuja'} />
          ))}
          <text x={f(px(a))} y={f(yb - (cuenta.get(a) ?? 0) * 26 - 26)} textAnchor="middle" className="ht-valor">{a}</text>
        </g>
      ))}
      <text x={x0} y={yb + 40} className="ht-label">{a0}</text>
      <text x={x1} y={yb + 40} textAnchor="end" className="ht-label">{a1}</text>
      <text x={x1} y={yb - 236} textAnchor="end" className="ht-label">Publicaciones por año</text>
    </svg>
  );
}

/* ---------- Blog: registro de observación con las fechas de las noticias ---------- */
function Registro() {
  const fechas = noticias().map((n) => n.fecha);
  const t0 = new Date('2023-01-01').getTime(), t1 = new Date('2027-01-01').getTime();
  const x0 = 40, x1 = 560, y = 260;
  const px = (t: number) => x0 + ((t - t0) / (t1 - t0)) * (x1 - x0);
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      {Array.from({ length: 49 }, (_, i) => i).map((m) => (
        <line key={m} x1={f(x0 + (m / 48) * (x1 - x0))} y1={y} x2={f(x0 + (m / 48) * (x1 - x0))} y2={y + (m % 12 === 0 ? 18 : 8)} className="ht-eje" />
      ))}
      <line x1={x0} y1={y} x2={x1} y2={y} className="ht-eje" />
      {[2023, 2024, 2025, 2026].map((a) => <text key={a} x={f(px(new Date(`${a}-01-01`).getTime()) + 6)} y={y + 44} className="ht-label">{a}</text>)}
      {fechas.map((d, i) => (
        <g key={d.toISOString()}>
          <line x1={f(px(+d))} y1={y} x2={f(px(+d))} y2={y - 90 - i * 30} className={i === 0 ? 'ht-acento' : 'ht-trazo ht-dibuja'} />
          <circle cx={f(px(+d))} cy={y - 90 - i * 30} r={4} className={i === 0 ? 'ht-punto ht-punto--acento' : 'ht-punto'} />
        </g>
      ))}
      <text x={x0} y={y - 190} className="ht-label">Registro</text>
    </svg>
  );
}

/* ---------- GrTE: red de radiotelescopios escolares conectados a una plataforma ---------- */
function Escuelas() {
  const c = { x: 330, y: 250 };
  const platos = [{ x: 110, y: 130 }, { x: 150, y: 330 }, { x: 330, y: 80 }, { x: 520, y: 150 }, { x: 500, y: 360 }];
  const plato = (x: number, y: number) => `M${x - 26},${y - 8} Q${x},${y + 22} ${x + 26},${y - 8}`;
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      {platos.map((p) => <line key={`${p.x}`} x1={c.x} y1={c.y} x2={p.x} y2={p.y + 6} className="ht-trazo ht-trazo--punteado ht-dibuja" />)}
      {platos.map((p) => (
        <g key={`p${p.x}`}>
          <path d={plato(p.x, p.y)} className="ht-trazo" style={{ strokeWidth: 2 }} />
          <line x1={p.x} y1={p.y + 7} x2={p.x} y2={p.y + 26} className="ht-eje" />
          <line x1={p.x - 12} y1={p.y + 26} x2={p.x + 12} y2={p.y + 26} className="ht-eje" />
        </g>
      ))}
      <rect x={c.x - 16} y={c.y - 16} width={32} height={32} className="ht-acento" />
      <circle cx={c.x} cy={c.y} r={5} className="ht-punto ht-punto--acento" />
      <text x={c.x + 28} y={c.y + 6} className="ht-valor">Plataforma</text>
      <text x={110} y={92} textAnchor="middle" className="ht-label">Colegio</text>
    </svg>
  );
}

/* ---------- Contacto: rosa de rumbos con la sede ---------- */
function Rumbos() {
  const c = { x: 300, y: 230 }, R = 170;
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      <circle cx={c.x} cy={c.y} r={R} className="ht-eje" />
      <circle cx={c.x} cy={c.y} r={R * 0.62} className="ht-guia" />
      {ticks.map((a) => {
        const r = (a * Math.PI) / 180, l = a % 90 === 0 ? 18 : a % 30 === 0 ? 11 : 5;
        return <line key={a} x1={f(c.x + R * Math.sin(r))} y1={f(c.y - R * Math.cos(r))} x2={f(c.x + (R - l) * Math.sin(r))} y2={f(c.y - (R - l) * Math.cos(r))} className="ht-eje" />;
      })}
      <polygon points={`${c.x},${c.y - R + 26} ${c.x + 12},${c.y} ${c.x},${c.y + R - 26} ${c.x - 12},${c.y}`} className="ht-trazo ht-dibuja" />
      <polygon points={`${c.x - R + 26},${c.y} ${c.x},${c.y - 12} ${c.x + R - 26},${c.y} ${c.x},${c.y + 12}`} className="ht-guia ht-guia--fuerte" />
      <circle cx={c.x} cy={c.y} r={5} className="ht-punto ht-punto--acento" />
      <text x={c.x} y={c.y - R - 14} textAnchor="middle" className="ht-valor">N</text>
      <text x={c.x + R + 16} y={c.y + 6} className="ht-label">E</text>
      <text x={c.x + 26} y={c.y + R * 0.62 + 34} className="ht-valor">Concepción</text>
      <text x={c.x + 26} y={c.y + R * 0.62 + 58} className="ht-label">36°49′S 73°03′O</text>
    </svg>
  );
}

/* ---------- 404: señal perdida ---------- */
function SinSenal() {
  const pts: string[] = [];
  let semilla = 7;
  const azar = () => { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; };
  for (let x = 20; x <= 580; x += 4) {
    const amp = x < 330 ? 70 * (1 - (x - 20) / 310) : 0;
    pts.push(`${x},${f(230 + (azar() - 0.5) * 2 * amp)}`);
  }
  return (
    <svg viewBox="0 0 600 460" className="hero-tema__svg">
      <line x1={20} y1={230} x2={580} y2={230} className="ht-guia" />
      <polyline points={pts.join(' ')} className="ht-trazo ht-dibuja" />
      <circle cx={580} cy={230} r={4} className="ht-punto ht-punto--acento" />
      <text x={580} y={200} textAnchor="end" className="ht-valor">Sin señal</text>
    </svg>
  );
}

const DIBUJOS: Record<Tema, () => React.JSX.Element> = {
  proyectos: Espectro,
  atmosfera: Transmision,
  somos: Sitios,
  'milimetricas-submm': Bocina,
  colaboraciones: Red,
  'transferencia-tecnologica': Madera,
  academicos: () => <Parabola />,
  lct: () => <Parabola lct />,
  infraestructura: Criostato,
  vinculacion: Nodos,
  publicaciones: PorAnio,
  blog: Registro,
  grte: Escuelas,
  contacto: Rumbos,
  error: SinSenal,
};

export default function HeroTema({ tema }: { tema: Tema }) {
  const Dibujo = DIBUJOS[tema];
  return (
    <div className={`hero-tema hero-tema--${tema}`} aria-hidden="true">
      <Dibujo />
    </div>
  );
}
