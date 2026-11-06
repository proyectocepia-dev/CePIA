'use client';
// Escena 3D del LCT para la portada, en clave de pieza de museo: el telescopio en metal oscuro, recortado por
// luces de borde, delante de un anillo de luz que su propio plato tapa en parte (profundidad real, no un overlay).
// Tres momentos encadenados con GSAP:
//  1. Apuntado (al cargar): la cámara se acerca y el plato baja desde el cenit hasta su ángulo de observación;
//     el anillo se enciende.
//  2. Seguimiento (en reposo): deriva lenta en azimut y elevación; el puntero inclina levemente la cámara.
//  3. Salida (scroll): el montaje gira, el plato baja al horizonte y la cámara se aleja.
// El GLB tiene tres nodos: LCT_Base (fijo), LCT_Azimuth (gira en Y) y LCT_Elevation (inclina en X).
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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
type Pose = { az: number; el: number; dist: number; alto: number; orbita: number; salida: number; anillo: number };
type Clave = 'az' | 'el' | 'orbita' | 'dist' | 'alto';

/** Pose final de un cuadro: la pose animada (apuntado + reposo) mezclada con la de salida según el scroll. */
function mezclar(pose: Pose, clave: Clave): number {
  const destino = clave === 'dist' || clave === 'alto' ? LCT_ESCENA.salida[clave] : deg(LCT_ESCENA.salida[clave]);
  return THREE.MathUtils.lerp(pose[clave], destino, pose.salida);
}

/** Reflejos suaves para el metal: un estudio generado en la GPU (sin descargar HDR). */
function Entorno() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = LCT_ESCENA.luz.entorno;
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
}

function Telescopio({ pose, alListo }: { pose: Pose; alListo: () => void }) {
  const { scene } = useLoader(GLTFLoader, LCT_MODELO, conMeshopt);
  const azimut = useRef<THREE.Object3D | null>(null);
  const elevacion = useRef<THREE.Object3D | null>(null);
  const base = useRef({ az: new THREE.Quaternion(), el: new THREE.Quaternion() });
  const giro = useMemo(() => new THREE.Quaternion(), []);

  const materiales = useMemo(() => ({
    estructura: new THREE.MeshStandardMaterial({ color: LCT_COLORES.estructura, metalness: 0.85, roughness: 0.38, side: THREE.DoubleSide }),
    plato: new THREE.MeshStandardMaterial({ color: LCT_COLORES.plato, metalness: 0.7, roughness: 0.28, side: THREE.DoubleSide }),
  }), []);

  useLayoutEffect(() => {
    // La escena del GLB queda en caché entre montajes: la rotación y el material originales se guardan una sola
    // vez en userData; si se leyeran de nuevo ya traerían lo aplicado en el montaje anterior.
    scene.traverse((o) => {
      if (o.name === 'LCT_Azimuth' || o.name === 'LCT_Elevation') {
        o.userData.rotacionBase ??= o.quaternion.clone();
        if (o.name === 'LCT_Azimuth') { azimut.current = o; base.current.az.copy(o.userData.rotacionBase); }
        else { elevacion.current = o; base.current.el.copy(o.userData.rotacionBase); }
      }
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
        const original = Array.isArray(m.material) ? m.material[0] : m.material;
        m.userData.materialOriginal ??= original?.name ?? '';
        m.material = m.userData.materialOriginal === 'Material.002' ? materiales.plato : materiales.estructura;
      }
    });
    alListo();
  }, [scene, materiales, alListo]);

  useEffect(() => () => { materiales.estructura.dispose(); materiales.plato.dispose(); }, [materiales]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const deriva = 1 - pose.salida;   // el seguimiento se apaga a medida que avanza la salida por scroll
    const az = mezclar(pose, 'az') + deg(5) * Math.sin(t * 0.07) * deriva;
    const el = mezclar(pose, 'el') + deg(2) * Math.sin(t * 0.11 + 1) * deriva;
    azimut.current?.quaternion.copy(base.current.az).multiply(giro.setFromAxisAngle(EJE_Y, az));
    elevacion.current?.quaternion.copy(base.current.el).multiply(giro.setFromAxisAngle(EJE_X, el));
  });

  return <primitive object={scene} />;
}

/** Anillo de luz detrás del plato: siempre de frente a la cámara, con halos aditivos que hacen de resplandor. */
function Anillo({ pose }: { pose: Pose }) {
  const grupo = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const centro = useMemo(() => new THREE.Vector3(...LCT_ESCENA.anillo.centro), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const mats = useMemo(() => ({
    linea: new THREE.MeshBasicMaterial({ color: LCT_COLORES.anillo, transparent: true, toneMapped: false }),
    halo: new THREE.MeshBasicMaterial({ color: LCT_COLORES.halo, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
  }), []);
  useEffect(() => () => { mats.linea.dispose(); mats.halo.dispose(); }, [mats]);

  useFrame(() => {
    const g = grupo.current;
    if (!g) return;
    // Se ubica detrás del telescopio respecto de la cámara, para que el plato lo tape en parte.
    dir.copy(camera.position).sub(centro).setY(0).normalize();
    g.position.copy(centro).addScaledVector(dir, -LCT_ESCENA.anillo.atras);
    g.lookAt(camera.position);
    mats.linea.opacity = pose.anillo;
    mats.halo.opacity = pose.anillo * 0.16;
    g.visible = pose.anillo > 0.01;
  });

  const { radio, grosor } = LCT_ESCENA.anillo;
  return (
    <group ref={grupo}>
      <mesh material={mats.linea}><torusGeometry args={[radio, grosor, 12, 192]} /></mesh>
      <mesh material={mats.halo}><torusGeometry args={[radio, grosor * 4, 12, 192]} /></mesh>
      <mesh material={mats.halo}><torusGeometry args={[radio, grosor * 12, 12, 192]} /></mesh>
    </group>
  );
}

function Camara({ pose }: { pose: Pose }) {
  const { camera, pointer } = useThree();
  const mirar = useMemo(() => new THREE.Vector3(...LCT_ESCENA.objetivo), []);
  const suave = useRef(new THREE.Vector2());
  useFrame((_, dt) => {
    suave.current.lerp(pointer, Math.min(1, dt * 2.5));
    const a = mezclar(pose, 'orbita') + suave.current.x * deg(4);
    const h = mezclar(pose, 'alto') + suave.current.y * 0.5;
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
      gsap.timeline({ delay: 0.15 })
        .to(pose, { az: deg(e.reposo.az), el: deg(e.reposo.el), dist: e.reposo.dist, alto: e.reposo.alto, orbita: deg(e.reposo.orbita), duration: 2.8, ease: 'power3.out' })
        .to(pose, { anillo: 1, duration: 1.6, ease: 'power2.inOut' }, 0.9);
      gsap.to(pose, { salida: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 } });
    });
    return () => ctx.revert();
  }, [pose]);
  return null;
}

type Props = { activo: boolean; alListo: () => void };

export default function LctCanvas({ activo, alListo }: Props) {
  const pose = useMemo<Pose>(() => {
    const i = LCT_ESCENA.inicio;
    return { az: deg(i.az), el: deg(i.el), dist: i.dist, alto: i.alto, orbita: deg(i.orbita), salida: 0, anillo: 0 };
  }, []);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    (window as unknown as { __lctPose?: Pose }).__lctPose = pose;   // solo para afinar poses en desarrollo
  }, [pose]);
  const l = LCT_ESCENA.luz;
  return (
    <Canvas
      frameloop={activo ? 'always' : 'never'}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
      camera={{ fov: LCT_ESCENA.fov, near: 0.5, far: 300, position: [0, LCT_ESCENA.inicio.alto, LCT_ESCENA.inicio.dist] }}
    >
      <hemisphereLight args={[LCT_COLORES.cielo, LCT_COLORES.suelo, l.hemisferio]} />
      <directionalLight position={[-12, 9, 14]} intensity={l.clave} color={LCT_COLORES.clave} />
      <directionalLight position={[14, 10, -16]} intensity={l.borde} color={LCT_COLORES.borde} />
      <directionalLight position={[-16, 4, -12]} intensity={l.bordeCalido} color={LCT_COLORES.bordeCalido} />
      <Entorno />
      <Suspense fallback={null}>
        <Telescopio pose={pose} alListo={alListo} />
        <Anillo pose={pose} />
        <Coreografia pose={pose} />
      </Suspense>
      <Camara pose={pose} />
    </Canvas>
  );
}
