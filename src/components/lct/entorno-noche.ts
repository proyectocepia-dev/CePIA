// Entorno de reflejos para el plato espejo: un cielo nocturno de altiplano pintado en un canvas equirectangular
// (cénit petróleo profundo, resplandor frío en el horizonte, estrellas, valle oscuro bajo el horizonte y un brillo
// cálido bajo). Se convierte en mapa PMREM; no se descarga ningún HDR.
import * as THREE from 'three';

/** Generador pseudoaleatorio determinista (las estrellas no cambian entre recargas). */
function azar(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function texturaCieloNocturno(): THREE.CanvasTexture {
  const w = 2048;
  const h = 1024;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (ctx) {
    // Cielo: del cénit (arriba) al horizonte (mitad).
    const cielo = ctx.createLinearGradient(0, 0, 0, h / 2);
    cielo.addColorStop(0, '#05080d');
    cielo.addColorStop(0.55, '#0c1a28');
    cielo.addColorStop(0.9, '#1f3a4f');
    cielo.addColorStop(1, '#4a6f86');
    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, w, h / 2);
    // Valle bajo el horizonte: casi negro, con un leve brillo cálido cerca de la línea.
    const valle = ctx.createLinearGradient(0, h / 2, 0, h);
    valle.addColorStop(0, '#2a2420');
    valle.addColorStop(0.08, '#120f0d');
    valle.addColorStop(1, '#040404');
    ctx.fillStyle = valle;
    ctx.fillRect(0, h / 2, w, h / 2);
    // Banda de la Vía Láctea: una franja diagonal tenue.
    ctx.save();
    ctx.translate(w * 0.55, h * 0.22);
    ctx.rotate(-0.35);
    const banda = ctx.createLinearGradient(0, -90, 0, 90);
    banda.addColorStop(0, 'rgba(160,190,220,0)');
    banda.addColorStop(0.5, 'rgba(160,190,220,0.16)');
    banda.addColorStop(1, 'rgba(160,190,220,0)');
    ctx.fillStyle = banda;
    ctx.fillRect(-w, -90, w * 2, 180);
    ctx.restore();
    // Estrellas: más densas cerca del cénit.
    const r = azar(17);
    for (let i = 0; i < 2600; i++) {
      const y = Math.pow(r(), 1.6) * (h / 2) * 0.96;
      const x = r() * w;
      const brillo = 0.35 + r() * 0.65;
      ctx.fillStyle = `rgba(235,242,255,${brillo})`;
      ctx.fillRect(x, y, r() < 0.06 ? 2 : 1, r() < 0.06 ? 2 : 1);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
