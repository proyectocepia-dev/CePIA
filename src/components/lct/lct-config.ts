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
  suelo2: '#24211E',      // altiplano de noche (arena oscura)
  cerros: '#0B121A',
  cerrosLejos: '#122230', // cordillera lejana, algo más clara      // silueta de los cerros
  nieblaHorizonte: '#132332', // color del cielo CSS en el horizonte: funde los cerros lejanos
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
  /** Plato espejo: rugosidad, barniz (clearcoat), intensidad de reflejos, tamaño del panel hexagonal (m),
   *  ancho de la junta (fracción del panel) y desalineación de cada panel (facetas en el reflejo). */
  acabado: { rugosidadPanel: number; barniz: number; reflejoPanel: number; panelHex: number; junta: number; faceta: number };
  /** Arrastre para inspeccionar: radianes por píxel, tope vertical (rad), segundos hasta volver al encuadre. */
  inspeccion: { velocidad: number; pitch: number; retorno: number };
  /** Rango de inclinación del plato desde el cenit (grados): -40 = 50° de elevación, el mínimo sin cruzarse
   *  con la montura en este modelo; -2 = casi cenit. */
  limiteEl: [number, number];
  /** Corrimiento del encuadre como fracción del lienzo: x negativo lleva el telescopio a la derecha; y negativo
   *  lo baja y deja ver el horizonte arriba. */
  encuadre: { escritorio: { x: number; y: number }; movil: { x: number; y: number } };
  /** Llano de noche: radio de los cerros (m), su alto máximo, cota del suelo y tramo de niebla [cerca, lejos]. */
  horizonte: { radio: number; altoCerros: number; base: number; niebla: [number, number] };
  /** Acabado de cine (después del tone mapping): mezcla con curva S, oscurecido de viñeta y amplitud de grano. */
  cine: { contraste: number; vineta: number; grano: number };
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
  fov: 30,
  objetivo: [0, 6.4, 0],
  anillo: {
    centro: [0, 8.6, 0], radio: 6.2, atras: 4.5,
    capas: [
      { ancho: 0.32, opacidad: 0.2, color: LCT_COLORES.halo },      // resplandor ancho, muy tenue
      { ancho: 0.11, opacidad: 0.42, color: LCT_COLORES.anillo },  // cuerpo del anillo, fuera de foco
      { ancho: 0.045, opacidad: 0.75, color: LCT_COLORES.anillo }, // núcleo, suave pero legible
    ],
  },
  lectura: { azCero: 270 },
  luz: { hemisferio: 0.55, clave: 2.6, borde: 7.5, bordeCalido: 3.2, frente: 2.4, entorno: 0.7, reflejoTexturas: 1.5 },
  sensibilidad: { az: 16, el: 7, orbita: 7, alto: 1.4, inercia: 3.2 },
  acabado: { rugosidadPanel: 0.05, barniz: 0.6, reflejoPanel: 1.35, panelHex: 1.05, junta: 0.035, faceta: 0.05 },
  inspeccion: { velocidad: 0.006, pitch: 0.35, retorno: 6 },
  limiteEl: [-40, -2],
  encuadre: { escritorio: { x: -0.12, y: -0.05 }, movil: { x: 0, y: -0.03 } },
  horizonte: { radio: 420, altoCerros: 26, base: -0.36, niebla: [30, 700] },
  cine: { contraste: 0.35, vineta: 0.45, grano: 0.022 },
  exposicion: 1.05,
  bloom: { fuerza: 0.32, radio: 0.5, umbral: 0.92 },
  sombra: { mapa: 2048, suavidad: 4 },
  // Vista 3/4 con la cámara algo elevada: el plato (que trabaja hacia el cenit) queda al centro y casi de frente,
  // girado lo justo para leer la estructura. El scroll rodea el telescopio hasta verlo de costado y sube el plato.
  inicio: { az: 120, el: 0, dist: 72, alto: 28, orbita: -40 },
  reposo: { az: -2, el: -34, dist: 40, alto: 11, orbita: 30 },
  salida: { az: 70, el: -8, dist: 34, alto: 15, orbita: 115 },
};
