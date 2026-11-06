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
} as const;

type PoseEscena = { az: number; el: number; dist: number; alto: number; orbita: number };

type Escena = {
  fov: number;
  objetivo: [number, number, number];
  anillo: { centro: [number, number, number]; radio: number; grosor: number; atras: number };
  luz: { hemisferio: number; clave: number; borde: number; bordeCalido: number; entorno: number };
  inicio: PoseEscena;
  reposo: PoseEscena;
  salida: PoseEscena;
};

export const LCT_ESCENA: Escena = {
  fov: 28,
  objetivo: [0, 5.2, 0],
  anillo: { centro: [0, 7.8, 0], radio: 5.8, grosor: 0.045, atras: 4.5 },
  luz: { hemisferio: 0.35, clave: 1.4, borde: 5.5, bordeCalido: 2.2, entorno: 0.45 },
  inicio: { az: -130, el: 0, dist: 64, alto: 14, orbita: 18 },
  reposo: { az: -45, el: -42, dist: 40, alto: 6.5, orbita: 30 },
  salida: { az: 25, el: -70, dist: 42, alto: 3.5, orbita: 62 },
};
