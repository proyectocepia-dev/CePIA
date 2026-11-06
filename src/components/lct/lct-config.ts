// Parámetros de la escena del LCT: modelo, colores (del sistema de diseño), luces y poses de cada momento.
// Ángulos en grados; distancias en metros (el modelo está en escala real: plato de 10,4 m).
// az: giro del montaje sobre su eje vertical. el: inclinación del plato desde el cenit
//   (0 = reposo mirando al cenit, -90 = horizonte; negativo inclina el plato hacia la cámara).
// dist/alto/orbita: cámara en órbita alrededor de `objetivo` (orbita 0 = de frente, eje +Z).
export const LCT_MODELO = '/models/lct.glb';

export const LCT_COLORES = {
  estructura: '#2A3138',  // metal oscuro, entre night-800 y petróleo
  plato: '#56606A',       // paneles algo más claros para que el plato se lea como superficie
  cielo: '#1B3346',       // petróleo
  suelo: '#050506',       // night-1000
  clave: '#FFE2C4',       // luz principal tenue y cálida (eco del acento naranja)
  borde: '#9FE6E3',       // aqua del visor: recorta la silueta desde atrás
  bordeCalido: '#F58E34', // orange-500, contraluz bajo del otro lado
  anillo: '#F4F1EA',      // text-on-dark: el anillo es luz, no un color de marca
  halo: '#9FE6E3',
  panelPulido: '#DDE2E6', // aluminio limpio de los paneles del plato (lunar-100 algo más frío)
} as const;

type PoseEscena = { az: number; el: number; dist: number; alto: number; orbita: number };

type Escena = {
  fov: number;
  objetivo: [number, number, number];
  /** Capas del anillo desenfocado: `ancho` = mitad del espesor del brillo (fracción del radio de la textura). */
  anillo: { centro: [number, number, number]; radio: number; atras: number; capas: Array<{ ancho: number; opacidad: number; color: string }> };
  /** azCero: lectura de brújula cuando la pose az es 0 (solo para la ficha; el modelo no tiene norte real). */
  lectura: { azCero: number };
  /** reflejoTexturas: intensidad de reflejos del estudio sobre los materiales con texturas horneadas. */
  luz: { hemisferio: number; clave: number; borde: number; bordeCalido: number; frente: number; entorno: number; reflejoTexturas: number };
  /** Respuesta al puntero (o a la inclinación del teléfono): grados de giro del telescopio y de la cámara,
   *  metros de alto de cámara e inercia (más alto = sigue más rápido). */
  sensibilidad: { az: number; el: number; orbita: number; alto: number; inercia: number };
  /** Acabado del plato pulido: rugosidad, barniz (clearcoat) e intensidad de reflejos del estudio. */
  acabado: { rugosidadPanel: number; barniz: number; reflejoPanel: number };
  /** Rango de inclinación del plato desde el cenit (grados): -40 = 50° de elevación, el mínimo sin cruzarse
   *  con la montura en este modelo; -2 = casi cenit. */
  limiteEl: [number, number];
  /** Corrimiento horizontal del encuadre (filmOffset, mm de película): negativo lleva el telescopio a la derecha. */
  encuadre: { escritorio: number; movil: number };
  /** Exposición del tone mapping AgX. */
  exposicion: number;
  /** Bloom (UnrealBloomPass): solo lo que supera `umbral` (anillo y brillos especulares) florece. */
  bloom: { fuerza: number; radio: number; umbral: number };
  /** Sombra de la luz principal: tamaño del mapa y suavidad del borde (PCF suave). */
  sombra: { mapa: number; suavidad: number };
  inicio: PoseEscena;
  reposo: PoseEscena;
  salida: PoseEscena;
};

export const LCT_ESCENA: Escena = {
  fov: 28,
  objetivo: [0, 7.8, 0],
  anillo: {
    centro: [0, 8.6, 0], radio: 6.2, atras: 4.5,
    capas: [
      { ancho: 0.32, opacidad: 0.32, color: LCT_COLORES.halo },      // resplandor ancho, muy tenue
      { ancho: 0.11, opacidad: 0.6, color: LCT_COLORES.anillo },  // cuerpo del anillo, fuera de foco
      { ancho: 0.045, opacidad: 0.75, color: LCT_COLORES.anillo }, // núcleo, suave pero legible
    ],
  },
  lectura: { azCero: 270 },
  luz: { hemisferio: 0.55, clave: 2.6, borde: 7.5, bordeCalido: 3.2, frente: 2.4, entorno: 0.7, reflejoTexturas: 1.5 },
  sensibilidad: { az: 16, el: 7, orbita: 7, alto: 1.4, inercia: 3.2 },
  acabado: { rugosidadPanel: 0.16, barniz: 0.5, reflejoPanel: 1.4 },
  limiteEl: [-40, -2],
  encuadre: { escritorio: -5.5, movil: 0 },
  exposicion: 0.95,
  bloom: { fuerza: 0.32, radio: 0.5, umbral: 0.92 },
  sombra: { mapa: 2048, suavidad: 4 },
  // Cámara alta mirando hacia abajo: como el plato trabaja hacia el cenit, se le ve de frente desde arriba.
  // El scroll lleva el plato hacia el cenit y la cámara sube sobre él (vista cenital).
  inicio: { az: 60, el: 0, dist: 46, alto: 48, orbita: 0 },
  reposo: { az: -10, el: -36, dist: 42, alto: 38, orbita: 0 },
  salida: { az: 15, el: -6, dist: 22, alto: 54, orbita: 20 },
};
