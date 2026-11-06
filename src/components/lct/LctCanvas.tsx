'use client';
// Escena 3D del LCT para la portada. Tres escenas encadenadas con GSAP:
//  1. Apuntado (al cargar): la cámara se acerca y el plato baja desde la posición de reposo (cenit)
//     hasta un ángulo de observación, en sincronía con el barrido del visor.
//  2. Seguimiento (en reposo): el plato sigue una fuente con un desplazamiento lento en azimut y elevación;
//     el puntero inclina levemente la cámara.
//  3. Salida (scroll): al bajar, el telescopio gira, el plato mira al horizonte y la cámara se aleja.
// El GLB tiene tres nodos: LCT_Base (fijo), LCT_Azimuth (gira en Y) y LCT_Elevation (inclina en X).
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LCT_COLORES, LCT_ESCENA, LCT_MODELO } from './lct-config';

gsap.registerPlugin(ScrollTrigger);
const deg = THREE.MathUtils.degToRad;
const EJE_X = new THREE.Vector3(1, 0, 0);
const EJE_Y = new THREE.Vector3(0, 1, 0);
// El GLB va comprimido con meshopt (EXT_meshopt_compression): el decodificador es WASM pequeño, sin archivos extra.
const conMeshopt = (loader: GLTFLoader) => { loader.setMeshoptDecoder(MeshoptDecoder); };

/** Estado animable compartido entre GSAP (escribe) y el bucle de render (lee). */
type Pose = { az: number; el: number; dist: number; alto: number; orbita: number; salida: number };

function Telescopio({ pose, alListo }: { pose: Pose; alListo: () => void }) {
  const { scene } = useLoader(GLTFLoader, LCT_MODELO, conMeshopt);
  const azimut = useRef<THREE.Object3D | null>(null);
  const elevacion = useRef<THREE.Object3D | null>(null);
  const base = useRef({ az: new THREE.Quaternion(), el: new THREE.Quaternion() });   // rotación propia de cada eje en el GLB
  const giro = useMemo(() => new THREE.Quaternion(), []);

  const materiales = useMemo(() => ({
    estructura: new THREE.MeshStandardMaterial({ color: LCT_COLORES.estructura, metalness: 0.2, roughness: 0.6, side: THREE.DoubleSide }),
    plato: new THREE.MeshStandardMaterial({ color: LCT_COLORES.plato, metalness: 0.25, roughness: 0.4, side: THREE.DoubleSide }),
  }), []);

  useLayoutEffect(() => {
    scene.traverse((o) => {
      // La rotación propia se guarda una sola vez en el nodo: la escena del GLB queda en caché entre montajes
      // y, si se leyera de nuevo, ya incluiría la pose aplicada en cuadros anteriores.
      if (o.name === 'LCT_Azimuth' || o.name === 'LCT_Elevation') {
        o.userData.rotacionBase ??= o.quaternion.clone();
        if (o.name === 'LCT_Azimuth') { azimut.current = o; base.current.az.copy(o.userData.rotacionBase); }
        else { elevacion.current = o; base.current.el.copy(o.userData.rotacionBase); }
      }
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
        const original = Array.isArray(m.material) ? m.material[0] : m.material;
        m.material = original?.name === 'Material.002' ? materiales.plato : materiales.estructura;
      }
    });
    alListo();
  }, [scene, materiales, alListo]);

  useEffect(() => () => { materiales.estructura.dispose(); materiales.plato.dispose(); }, [materiales]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Seguimiento sideral: deriva lenta que se apaga a medida que avanza la salida por scroll.
    const deriva = 1 - pose.salida;
    // La pose se aplica sobre la rotación propia de cada eje (ejes locales Y y X del GLB).
    if (azimut.current) azimut.current.quaternion.copy(base.current.az).multiply(giro.setFromAxisAngle(EJE_Y, mezclar(pose, 'az') + deg(6) * Math.sin(t * 0.07) * deriva));
    if (elevacion.current) elevacion.current.quaternion.copy(base.current.el).multiply(giro.setFromAxisAngle(EJE_X, mezclar(pose, 'el') + deg(2.5) * Math.sin(t * 0.11 + 1) * deriva));
  });

  return <primitive object={scene} />;
}

function Camara({ pose }: { pose: Pose }) {
  const { camera, pointer } = useThree();
  const mirar = useMemo(() => new THREE.Vector3(...LCT_ESCENA.objetivo), []);
  const suave = useRef(new THREE.Vector2());
  useFrame((_, dt) => {
    suave.current.lerp(pointer, Math.min(1, dt * 2.5));
    const a = mezclar(pose, 'orbita') + suave.current.x * deg(5);
    const h = mezclar(pose, 'alto') + suave.current.y * 0.6;
    const d = mezclar(pose, 'dist');
    camera.position.set(Math.sin(a) * d, h, Math.cos(a) * d);
    camera.lookAt(mirar);
  });
  return null;
}

function Coreografia({ pose }: { pose: Pose }) {
  useEffect(() => {
    const e = LCT_ESCENA;
    const ctx = gsap.context(() => {
      // Escena 1: apuntado inicial (dura lo mismo que el barrido del visor en site.css).
      gsap.to(pose, {
        az: deg(e.reposo.az), el: deg(e.reposo.el), dist: e.reposo.dist, alto: e.reposo.alto, orbita: deg(e.reposo.orbita),
        duration: 2.6, ease: 'power3.out', delay: 0.2,
      });
      // Escena 3: avance de la salida ligado al scroll del hero; la mezcla con la pose se hace en mezclar().
      gsap.to(pose, { salida: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 } });
    });
    return () => ctx.revert();
  }, [pose]);
  return null;
}

/** Pose final de un cuadro: la pose animada (apuntado + reposo) mezclada con la de salida según el scroll. */
function mezclar(pose: Pose, clave: 'az' | 'el' | 'orbita' | 'dist' | 'alto'): number {
  const destino = clave === 'dist' || clave === 'alto' ? LCT_ESCENA.salida[clave] : deg(LCT_ESCENA.salida[clave]);
  return THREE.MathUtils.lerp(pose[clave], destino, pose.salida);
}

export default function LctCanvas({ activo, alListo }: { activo: boolean; alListo: () => void }) {
  const pose = useMemo<Pose>(() => ({ ...LCT_ESCENA.inicio, az: deg(LCT_ESCENA.inicio.az), el: deg(LCT_ESCENA.inicio.el), orbita: deg(LCT_ESCENA.inicio.orbita), salida: 0 }), []);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    (window as unknown as { __lctPose?: Pose }).__lctPose = pose;   // solo para afinar poses en desarrollo
  }, [pose]);
  return (
    <Canvas
      frameloop={activo ? 'always' : 'never'}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
      camera={{ fov: 30, near: 0.5, far: 200, position: [0, LCT_ESCENA.inicio.alto, LCT_ESCENA.inicio.dist] }}
    >
      <ambientLight intensity={0.35} color={LCT_COLORES.cielo} />
      <hemisphereLight args={[LCT_COLORES.cielo, LCT_COLORES.suelo, 0.9]} />
      <directionalLight position={[-16, 14, 10]} intensity={2.8} color={LCT_COLORES.sol} />
      <directionalLight position={[10, 6, -14]} intensity={0.9} color={LCT_COLORES.borde} />
      <Suspense fallback={null}>
        <Telescopio pose={pose} alListo={alListo} />
        <Coreografia pose={pose} />
      </Suspense>
      <Camara pose={pose} />
    </Canvas>
  );
}

