// Marca visible de "por confirmar" en el boceto, para que el centro vea qué falta.
export default function Pending({ text = 'Por confirmar' }: { text?: string }) {
  return <span className="c-pending">{text}</span>;
}
