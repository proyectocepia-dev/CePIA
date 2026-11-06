// Logo e isotipo CePIA en SVG con fill currentColor (toman el color del texto).
// Se definen una sola vez como <symbol> (LogoSprite, en el layout) y cada uso es un <use> liviano.
// Se quita el manifiesto c2pa de los archivos (unos 8 KB por logo que no se ven).
import fs from 'node:fs';
import path from 'node:path';

const read = (f: string) => fs.readFileSync(path.join(process.cwd(), 'src/assets/logos', f), 'utf8').replace(/<metadata>[\s\S]*?<\/metadata>/g, '');
const parse = (svg: string) => ({ viewBox: /viewBox="([^"]+)"/.exec(svg)![1], inner: /<svg[^>]*>([\s\S]*)<\/svg>/.exec(svg)![1] });
const svgs = { logo: parse(read('cepia-logo.svg')), iso: parse(read('cepia-isotipo.svg')) };

export function LogoSprite() {
  const symbols = (Object.keys(svgs) as (keyof typeof svgs)[])
    .map((k) => `<symbol id="cepia-${k}" viewBox="${svgs[k].viewBox}">${svgs[k].inner}</symbol>`).join('');
  return <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: symbols }} />;
}

export default function Logo({ variant = 'logo', label }: { variant?: 'logo' | 'iso'; label?: string }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: false };
  return <svg viewBox={svgs[variant].viewBox} {...a11y}><use href={`#cepia-${variant}`} /></svg>;
}
