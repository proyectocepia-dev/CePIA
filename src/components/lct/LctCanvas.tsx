'use client';
// Escena 3D del LCT para la portada, en clave de pieza de museo: el telescopio en metal oscuro, recortado por
// luces de borde, delante de un anillo de luz desenfocado (fuera de foco, como en una toma con poca profundidad
// de campo) que su propio plato tapa en parte: profundidad real, no un overlay.
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
/** Lectura para la ficha: azimut en grados de brújula (0-360) y elevación sobre el horizonte. */
export type Lectura = { az: number; el: number };
const LECTURA_CADA = 0.1;   // s entre lecturas (10 Hz basta para un número que cambia lento)

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

type TelescopioProps = { pose: Pose; movimiento: boolean; alListo: () => void; alLeer?: (l: Lectura) => void };

function Telescopio({ pose, movimiento, alListo, alLeer }: TelescopioProps) {
  const { scene } = useLoader(GLTFLoader, LCT_MODELO, conMeshopt);
  const azimut = useRef<THREE.Object3D | null>(null);
  const elevacion = useRef<THREE.Object3D | null>(null);
  const base = useRef({ az: new THREE.Quaternion(), el: new THREE.Quaternion() });
  const giro = useMemo(() => new THREE.Quaternion(), []);
  const ultimaLectura = useRef(-1);

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
        const original = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial;
        m.userData.materialOriginal ??= original?.name ?? '';
        if (original?.map) {
          // GLB con texturas horneadas (pintura gastada, suciedad, oclusión): se usa tal cual, por ambas caras.
          original.side = THREE.DoubleSide;
          original.envMapIntensity = LCT_ESCENA.luz.reflejoTexturas;
        } else {
          m.material = m.userData.materialOriginal === 'Material.002' ? materiales.plato : materiales.estructura;
        }
      }
    });
    alListo();
  }, [scene, materiales, alListo]);

  useEffect(() => () => { materiales.estructura.dispose(); materiales.plato.dispose(); }, [materiales]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // El seguimiento se apaga a medida que avanza la salida por scroll (y no existe sin movimiento).
    const deriva = movimiento ? 1 - pose.salida : 0;
    const az = mezclar(pose, 'az') + deg(5) * Math.sin(t * 0.07) * deriva;
    const el = mezclar(pose, 'el') + deg(2) * Math.sin(t * 0.11 + 1) * deriva;
    if (alLeer && t - ultimaLectura.current >= LECTURA_CADA) {
      ultimaLectura.current = t;
      const azGrados = THREE.MathUtils.euclideanModulo(LCT_ESCENA.lectura.azCero - THREE.MathUtils.radToDeg(az), 360);
      alLeer({ az: azGrados, el: 90 + THREE.MathUtils.radToDeg(el) });
    }
    azimut.current?.quaternion.copy(base.current.az).multiply(giro.setFromAxisAngle(EJE_Y, az));
    elevacion.current?.quaternion.copy(base.current.el).multiply(giro.setFromAxisAngle(EJE_X, el));
  });

  return <primitive object={scene} />;
}

/**
 * Textura de un anillo desenfocado: un degradado radial con el pico en el radio del anillo. Es el desenfoque
 * "horneado" en una textura de 512 px, así que no hay pasada de postproceso ni filtro CSS (regla v0.8).
 * `ancho` es la mitad del espesor del brillo, como fracción del radio de la textura.
 */
function texturaAnillo(radio: number, ancho: number): THREE.CanvasTexture {
  const n = 512;
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const ctx = c.getContext('2d');
  if (ctx) {
    const h = n / 2;
    const g = ctx.createRadialGradient(h, h, 0, h, h, h);
    const pasos: Array<[number, number]> = [
      [radio - ancho, 0], [radio - ancho * 0.5, 0.35], [radio - ancho * 0.15, 0.85], [radio, 1],
      [radio + ancho * 0.15, 0.85], [radio + ancho * 0.5, 0.35], [radio + ancho, 0],
    ];
    for (const [pos, alfa] of pasos) g.addColorStop(THREE.MathUtils.clamp(pos, 0, 1), `rgba(255,255,255,${alfa})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, n, n);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Anillo de luz fuera de foco detrás del plato: siempre de frente a la cámara, en capas aditivas. */
function Anillo({ pose }: { pose: Pose }) {
  const grupo = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const centro = useMemo(() => new THREE.Vector3(...LCT_ESCENA.anillo.centro), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  // El anillo está al 80 % del radio de la textura: el plano mide 2 * radio / 0,8 para que quede en `radio` metros.
  const capas = useMemo(() => LCT_ESCENA.anillo.capas.map((c) => {
    const mapa = texturaAnillo(0.8, c.ancho);
    const mat = new THREE.MeshBasicMaterial({ map: mapa, color: c.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    return { mapa, mat, opacidad: c.opacidad };
  }), []);
  useEffect(() => () => { capas.forEach((c) => { c.mat.dispose(); c.mapa.dispose(); }); }, [capas]);

  useFrame(() => {
    const g = grupo.current;
    if (!g) return;
    // Se ubica detrás del telescopio respecto de la cámara, para que el plato lo tape en parte.
    dir.copy(camera.position).sub(centro).setY(0).normalize();
    g.position.copy(centro).addScaledVector(dir, -LCT_ESCENA.anillo.atras);
    g.lookAt(camera.position);
    capas.forEach((c) => { c.mat.opacity = pose.anillo * c.opacidad; });
    g.visible = pose.anillo > 0.01;
  });

  const lado = (LCT_ESCENA.anillo.radio * 2) / 0.8;
  return (
    <group ref={grupo}>
      {capas.map((c, i) => (
        <mesh key={i} material={c.mat} renderOrder={-1}><planeGeometry args={[lado, lado]} /></mesh>
      ))}
    </group>
  );
}

function Camara({ pose, movimiento }: { pose: Pose; movimiento: boolean }) {
  const { camera, pointer } = useThree();
  const mirar = useMemo(() => new THREE.Vector3(...LCT_ESCENA.objetivo), []);
  const suave = useRef(new THREE.Vector2());
  useFrame((_, dt) => {
    if (movimiento) suave.current.lerp(pointer, Math.min(1, dt * 2.5));
    const a = mezclar(pose, 'orbita') + suave.current.x * deg(4);
    const h = mezclar(pose, 'alto') + suave.current.y * 0.5;
    const d = mezclar(pose, 'dist');
    camera.position.set(Math.sin(a) * d, h, Math.cos(a) * d);
    camera.lookAt(mirar);
  });
  return null;
}

function Coreografia({ pose, movimiento }: { pose: Pose; movimiento: boolean }) {
  useEffect(() => {
    const e = LCT_ESCENA;
    if (!movimiento) {
      // Sin movimiento: pose de reposo inmediata, anillo encendido, sin scroll ni deriva.
      Object.assign(pose, { az: deg(e.reposo.az), el: deg(e.reposo.el), dist: e.reposo.dist, alto: e.reposo.alto, orbita: deg(e.reposo.orbita), anillo: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: 0.15 })
        .to(pose, { az: deg(e.reposo.az), el: deg(e.reposo.el), dist: e.reposo.dist, alto: e.reposo.alto, orbita: deg(e.reposo.orbita), duration: 2.8, ease: 'power3.out' })
        .to(pose, { anillo: 1, duration: 1.6, ease: 'power2.inOut' }, 0.9);
      gsap.to(pose, { salida: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 } });
    });
    return () => ctx.revert();
  }, [pose, movimiento]);
  return null;
}

type Props = { activo: boolean; movimiento?: boolean; alListo: () => void; alLeer?: (l: Lectura) => void };

export default function LctCanvas({ activo, movimiento = true, alListo, alLeer }: Props) {
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
      frameloop={!activo ? 'never' : movimiento ? 'always' : 'demand'}
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
        <Telescopio pose={pose} movimiento={movimiento} alListo={alListo} alLeer={alLeer} />
        <Anillo pose={pose} />
        <Coreografia pose={pose} movimiento={movimiento} />
      </Suspense>
      <Camara pose={pose} movimiento={movimiento} />
    </Canvas>
  );
}
