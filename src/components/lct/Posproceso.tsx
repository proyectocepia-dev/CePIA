'use client';
// Posproceso de la escena del LCT, solo con módulos de three/examples (sin dependencias nuevas):
//   RenderPass (con MSAA 4x en el buffer, porque `antialias` del renderer no llega al composer)
//   → UnrealBloomPass con umbral alto: solo florecen el anillo y los brillos especulares del metal pulido
//   → OutputPass: aplica el tone mapping del renderer (AgX) y la conversión a sRGB. Debe ir al final.
// Toma el control del render con prioridad 1 en useFrame (R3F deja de dibujar por su cuenta).
import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { LCT_ESCENA } from './lct-config';

/**
 * Acabado cinematográfico, después del OutputPass (en espacio de pantalla): curva de contraste suave en S,
 * viñeta y grano fino. Solo toca el color; el alfa queda igual, así el lienzo sigue transparente sobre el cielo CSS.
 */
const CINE = {
  uniforms: {
    tDiffuse: { value: null },
    uContraste: { value: LCT_ESCENA.cine.contraste },
    uVineta: { value: LCT_ESCENA.cine.vineta },
    uGrano: { value: LCT_ESCENA.cine.grano },
    uSemilla: { value: 0 },
  },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uContraste; uniform float uVineta; uniform float uGrano; uniform float uSemilla;
    varying vec2 vUv;
    float azar(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSemilla) * 43758.5453); }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 s = c.rgb * c.rgb * (3.0 - 2.0 * c.rgb);            // S suave
      c.rgb = mix(c.rgb, s, uContraste);
      float d = distance(vUv, vec2(0.5));
      c.rgb *= 1.0 - uVineta * smoothstep(0.35, 0.85, d);
      c.rgb += (azar(vUv * 1024.0) - 0.5) * uGrano * c.a;
      gl_FragColor = c;
    }`,
};

export default function Posproceso() {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const destino = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const c = new EffectComposer(gl, destino);
    c.addPass(new RenderPass(scene, camera));
    const b = LCT_ESCENA.bloom;
    c.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), b.fuerza, b.radio, b.umbral));
    c.addPass(new OutputPass());
    c.addPass(new ShaderPass(CINE));
    return c;
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size]);

  useEffect(() => () => composer.dispose(), [composer]);

  useFrame(() => composer.render(), 1);
  return null;
}
