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
import { LCT_ESCENA } from './lct-config';

export default function Posproceso() {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const destino = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const c = new EffectComposer(gl, destino);
    c.addPass(new RenderPass(scene, camera));
    const b = LCT_ESCENA.bloom;
    c.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), b.fuerza, b.radio, b.umbral));
    c.addPass(new OutputPass());
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
