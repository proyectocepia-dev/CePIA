'use client';
// Llano de Chajnantor de noche, detrás del LCT: suelo de altiplano que se pierde en la distancia y una línea de
// cerros en silueta (referencia: fotos nocturnas de Chajnantor del catastro). Todo procedural, sin texturas que
// descargar. Arriba del horizonte el lienzo es transparente y se ve el cielo CSS del sitio; la niebla funde los
// cerros con el color del cielo en el horizonte.
import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LCT_COLORES, LCT_ESCENA } from './lct-config';

/** Altura de los cerros según el ángulo: suma de ondas, con dos cumbres altas tipo volcán. */
function alturaCerro(a: number): number {
  const ondas = 0.5 + 0.28 * Math.sin(a * 3 + 0.6) + 0.17 * Math.sin(a * 7 + 2.1) + 0.08 * Math.sin(a * 17 + 0.3);
  const volcan = (centro: number, ancho: number, alto: number) => {
    const d = Math.atan2(Math.sin(a - centro), Math.cos(a - centro));
    return alto * Math.max(0, 1 - Math.abs(d) / ancho);
  };
  return ondas + volcan(Math.PI * 0.86, 0.32, 1.4) + volcan(Math.PI * 1.22, 0.22, 0.9);
}

function geometriaCerros(radio: number, alto: number, base: number): THREE.BufferGeometry {
  const n = 360;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = radio * (1 + 0.06 * Math.sin(a * 5));
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    pos.push(x, base, z, x, base + alto * alturaCerro(a), z);
    if (i < n) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Textura radial del suelo: opaco cerca del telescopio, transparente hacia el horizonte. */
function texturaSuelo(): THREE.CanvasTexture {
  const n = 256;
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, n, n);
  }
  return new THREE.CanvasTexture(c);
}

export default function Horizonte() {
  const { scene } = useThree();
  const h = LCT_ESCENA.horizonte;

  const piezas = useMemo(() => {
    const alfa = texturaSuelo();
    return {
      alfa,
      // Sin iluminar: de noche el llano y los cerros son siluetas; así no los aclaran las luces del telescopio.
      suelo: new THREE.MeshBasicMaterial({ color: LCT_COLORES.suelo2, alphaMap: alfa, transparent: true, depthWrite: false }),
      cerros: new THREE.MeshBasicMaterial({ color: LCT_COLORES.cerros, side: THREE.DoubleSide }),
      // La sombra del telescopio sobre el suelo, en una capa aparte (solo oscurece donde hay sombra).
      sombra: new THREE.ShadowMaterial({ opacity: 0.55, transparent: true, depthWrite: false }),
      geo: geometriaCerros(h.radio, h.altoCerros, h.base),
    };
  }, [h.radio, h.altoCerros, h.base]);

  useEffect(() => {
    // La niebla toma el color del cielo en el horizonte: los cerros lejanos se funden con el fondo CSS.
    scene.fog = new THREE.Fog(LCT_COLORES.nieblaHorizonte, h.niebla[0], h.niebla[1]);
    return () => {
      scene.fog = null;
      piezas.alfa.dispose();
      piezas.suelo.dispose();
      piezas.cerros.dispose();
      piezas.sombra.dispose();
      piezas.geo.dispose();
    };
  }, [scene, piezas, h.niebla]);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={h.base} material={piezas.suelo} renderOrder={-2}>
        <circleGeometry args={[h.radio * 1.05, 96]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={h.base + 0.01} material={piezas.sombra} receiveShadow renderOrder={-1}>
        <circleGeometry args={[30, 64]} />
      </mesh>
      <mesh geometry={piezas.geo} material={piezas.cerros} renderOrder={-2} />
    </group>
  );
}
