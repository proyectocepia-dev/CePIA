// Gráfica temática del encabezado de cada sección (reemplaza al visor circular de las páginas interiores).
// Cada tema es un SVG en línea con el lenguaje del sistema: trazos aqua finos, un solo acento naranja, lecturas en
// Barlow Semi Condensed. Siempre que se puede, el dibujo sale de datos reales del centro. Decorativo (aria-hidden).
// Solo anima opacidad y transform, y nada con movimiento reducido (ver .hero-tema en site.css).

export type Tema = 'proyectos' | 'atmosfera' | 'somos';

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

export default function HeroTema({ tema }: { tema: Tema }) {
  return (
    <div className={`hero-tema hero-tema--${tema}`} aria-hidden="true">
      {tema === 'proyectos' && <Espectro />}
      {tema === 'atmosfera' && <Transmision />}
      {tema === 'somos' && <Sitios />}
    </div>
  );
}
