// Layout raíz de Baraja2: tipografías de marca, metadatos PWA y registro del service worker
// Implementa BJ2-002 y BJ2-006
import type { Metadata, Viewport } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';
import { RegistrarServiceWorker } from '@/components/pwa/RegistrarServiceWorker';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--fuente-titulos',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--fuente-cuerpo',
  display: 'swap',
});

export const metadata: Metadata = {
  applicationName: 'Baraja2',
  title: {
    default: 'Baraja2',
    template: '%s · Baraja2',
  },
  description: 'El juego de cartas semanal para vivir su relación en pareja.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Baraja2',
  },
  icons: {
    icon: '/icons/icono-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#140810',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="font-body">
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
