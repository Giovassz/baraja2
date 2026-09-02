// Configuración de Tailwind CSS — tokens de diseño de Baraja2 (sección 5 del prompt maestro)
// Rediseño "picante": paleta y tipografías de marca; chrome oscuro, cartas con carácter.
// Implementa BJ2-002
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores de tema: variables CSS (ver :root y [data-tema] en globals.css) para
        // que cambien en toda la app sin recompilar — el usuario elige tema en Perfil.
        'rosa-pastel': 'rgb(var(--c-pastel) / <alpha-value>)',
        'rosa-acento': 'rgb(var(--c-acento) / <alpha-value>)',
        coral: 'rgb(var(--c-coral) / <alpha-value>)',
        lavanda: '#D9C9EC',
        menta: '#BFEAD1',
        'morado-marca': '#3B1F4D',
        'vino-marca': '#B3486B',
        'blanco-calido': '#FFF9FB',
        // Tema oscuro (UX estilo Tinder)
        noche: '#140810',
        'noche-2': '#1c0e18',
        superficie: '#26141f',
        'superficie-alta': '#33202d',
      },
      borderRadius: {
        widget: '22px',
        naipe: '20px',
      },
      fontFamily: {
        heading: ['var(--fuente-titulos)', 'Fredoka', 'sans-serif'],
        body: ['var(--fuente-cuerpo)', 'Nunito', 'sans-serif'],
      },
      boxShadow: {
        widget: '0 18px 40px -16px rgb(var(--c-acento) / 0.35)',
        'widget-sm': '0 8px 22px -8px rgba(59, 31, 77, 0.20)',
        naipe: '0 16px 34px -12px rgba(59, 31, 77, 0.5)',
        'naipe-alta': '0 30px 60px -14px rgba(59, 31, 77, 0.55)',
        glow: '0 0 0 1px rgb(var(--c-acento) / 0.3), 0 0 30px -4px rgb(var(--c-acento) / 0.6)',
        'glow-fuerte': '0 0 0 2px rgb(var(--c-acento) / 0.4), 0 0 44px -2px rgb(var(--c-acento) / 0.75)',
        nav: '0 -12px 30px -16px rgba(59,31,77,0.4)',
      },
      backgroundImage: {
        picante: 'linear-gradient(135deg, #E85D8A 0%, #B3486B 55%, #3B1F4D 120%)',
        'picante-suave':
          'radial-gradient(circle at 15% -8%, rgba(232,93,138,0.28), transparent 45%), radial-gradient(circle at 90% 4%, rgba(217,201,236,0.4), transparent 42%), radial-gradient(circle at 50% 118%, rgba(179,72,107,0.22), transparent 55%)',
        'brillo-carta':
          'linear-gradient(150deg, #ffffff 0%, #fff9fb 55%, #f7c6da 130%)',
      },
      keyframes: {
        'corazon-sube': {
          '0%': { transform: 'translateY(0) scale(0.5) rotate(-8deg)', opacity: '0' },
          '12%': { opacity: '1' },
          '100%': { transform: 'translateY(-170px) scale(1.1) rotate(8deg)', opacity: '0' },
        },
        'aparece-suave': {
          '0%': { transform: 'translateY(10px) scale(0.98)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'reparte-carta': {
          '0%': { transform: 'translateY(60px) rotate(-14deg) scale(0.85)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0) scale(1)', opacity: '1' },
        },
        'late-corazon': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.14)' },
        },
        flota: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'brillo-pasa': {
          '0%': { transform: 'translateX(-140%) skewX(-18deg)' },
          '100%': { transform: 'translateX(240%) skewX(-18deg)' },
        },
        'pulso-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(var(--c-acento) / 0.5)' },
          '50%': { boxShadow: '0 0 0 14px rgb(var(--c-acento) / 0)' },
        },
        'gradiente-mueve': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'corazon-sube': 'corazon-sube 1.8s ease-out forwards',
        'aparece-suave': 'aparece-suave 0.4s ease-out forwards',
        'reparte-carta': 'reparte-carta 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        'late-corazon': 'late-corazon 1.5s ease-in-out infinite',
        flota: 'flota 4s ease-in-out infinite',
        'brillo-pasa': 'brillo-pasa 3s ease-in-out infinite',
        'pulso-glow': 'pulso-glow 2.4s ease-out infinite',
        'gradiente-mueve': 'gradiente-mueve 16s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;
