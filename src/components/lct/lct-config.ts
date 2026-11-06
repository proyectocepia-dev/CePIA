// Parámetros de la escena del LCT: modelo, colores (del sistema de diseño) y poses de cada escena.
// Ángulos en grados; distancias en metros (el modelo está en escala real: plato de 10,4 m).
// az: giro del montaje sobre su eje vertical. el: inclinación del plato desde el cenit
//   (0 = reposo mirando al cenit, -90 = horizonte; negativo inclina el plato hacia la cámara).
// dist/alto/orbita: cámara en órbita alrededor de `objetivo` (orbita 0 = de frente, eje +Z).
export const LCT_MODELO = '/models/lct.glb';

export const LCT_COLORES = {
  estructura: '#C9D0D5', // lunar-300
  plato: '#E6E9EB',      // lunar-100
  cielo: '#2A4A63',      // petróleo claro
  suelo: '#050506',      // night-1000
  sol: '#FFD9B0',        // luz baja cálida, tinte del acento naranja
  borde: '#9FE6E3',      // aqua del visor
} as const;

type PoseEscena = { az: number; el: number; dist: number; alto: number; orbita: number };

export const LCT_ESCENA: { objetivo: [number, number, number]; inicio: PoseEscena; reposo: PoseEscena; salida: PoseEscena } = {
  objetivo: [0, 5.6, 0],
  inicio: { az: -130, el: 0, dist: 70, alto: 16, orbita: 10 },
  reposo: { az: -45, el: -42, dist: 40, alto: 7, orbita: 35 },
  salida: { az: 30, el: -72, dist: 50, alto: 3, orbita: 75 },
};
