// Material del plato del LCT: aluminio casi espejo, en paneles hexagonales como el plato Leighton original
// (~1 m por panel). Cada panel queda apenas desalineado (normal y rugosidad con una variación propia), así el
// reflejo del cielo se rompe en facetas; entre paneles hay una junta fina y más opaca.
// El patrón se calcula en el espacio del objeto (plano xz del nodo de elevación, perpendicular al eje del plato),
// así no depende de las UV del horneado.
import * as THREE from 'three';
import { LCT_COLORES, LCT_ESCENA } from './lct-config';

const VERT_DECL = 'varying vec3 vLctPos;\n';
const FRAG_DECL = `varying vec3 vLctPos;
uniform float uHexTam;
uniform float uJunta;
uniform float uFaceta;
float lctHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
// Celda hexagonal: devuelve (centro de celda en xy, distancia al borde en z).
vec3 lctHex(vec2 p) {
  vec2 r = vec2(1.0, 1.7320508);
  vec2 h = r * 0.5;
  vec2 a = mod(p, r) - h;
  vec2 b = mod(p - h, r) - h;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  vec2 q = abs(g);
  float borde = 0.5 - max(dot(q, normalize(vec2(1.0, 1.7320508))), q.x);
  return vec3(p - g, borde);
}
`;

export function crearPlatoEspejo(aoMap: THREE.Texture | null): THREE.MeshPhysicalMaterial {
  const a = LCT_ESCENA.acabado;
  const mat = new THREE.MeshPhysicalMaterial({
    color: LCT_COLORES.panelPulido, metalness: 1, roughness: a.rugosidadPanel, aoMap, aoMapIntensity: 0.6,
    clearcoat: a.barniz, clearcoatRoughness: 0.03, envMapIntensity: a.reflejoPanel,
    side: THREE.DoubleSide, shadowSide: THREE.FrontSide,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uHexTam = { value: a.panelHex };
    shader.uniforms.uJunta = { value: a.junta };
    shader.uniforms.uFaceta = { value: a.faceta };
    shader.vertexShader = VERT_DECL + shader.vertexShader.replace(
      '#include <begin_vertex>', '#include <begin_vertex>\n  vLctPos = position;',
    );
    shader.fragmentShader = FRAG_DECL + shader.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
  vec3 lctCelda = lctHex(vLctPos.xz / uHexTam);
  float lctJunta = 1.0 - smoothstep(0.0, uJunta, lctCelda.z);
  float lctH1 = lctHash(lctCelda.xy);
  float lctH2 = lctHash(lctCelda.xy + 7.31);
  diffuseColor.rgb *= mix(1.0, 0.32, lctJunta) * (0.97 + 0.06 * lctH1);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
  roughnessFactor = clamp(roughnessFactor + (lctH2 - 0.5) * 0.04 + lctJunta * 0.5, 0.02, 1.0);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  normal = normalize(normal + vec3(lctH1 - 0.5, lctH2 - 0.5, 0.0) * uFaceta);`);
  };
  mat.customProgramCacheKey = () => 'lct-plato-espejo';
  return mat;
}
