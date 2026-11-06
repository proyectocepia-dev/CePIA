import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Barlow, Barlow_Condensed, Barlow_Semi_Condensed } from 'next/font/google';
import '@/styles/tokens.css';
import '@/styles/cepia.css';
import '@/styles/site.css';
import Footer from '@/components/Footer';
import ObservationHud from '@/components/ObservationHud';
import { LogoSprite } from '@/components/Logo';

// Barlow en público: Apex New no tiene licencia web. next/font las aloja en el mismo sitio y las precarga
// (sin hoja externa que bloquee el primer pintado).
const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap', variable: '--font-barlow' });
const cond = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600'], display: 'swap', variable: '--font-barlow-cond' });
const semi = Barlow_Semi_Condensed({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-barlow-semi' });

export const metadata: Metadata = {
  title: { default: 'CePIA · Centro para la Instrumentación Astronómica', template: '%s · CePIA' },
  description: 'Centro para la Instrumentación Astronómica de la Universidad de Concepción.',
  robots: { index: false, follow: false },
  icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#060D14' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${barlow.variable} ${cond.variable} ${semi.variable}`}>
      <body>
        <LogoSprite />
        <a className="skip" href="#contenido">Saltar al contenido</a>
        <div className="scroll-progress" aria-hidden="true" />
        <ObservationHud />
        {children}
        <Footer />
      </body>
    </html>
  );
}
