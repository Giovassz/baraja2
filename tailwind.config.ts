// Configuración de Tailwind CSS — tokens de diseño de Baraja2 (sección 5 del prompt maestro)
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
        'rosa-pastel': '#F7C6DA',
        'rosa-acento': '#E85D8A',
        lavanda: '#D9C9EC',
        menta: '#BFEAD1',
        'morado-marca': '#3B1F4D',
        'vino-marca': '#B3486B',
        'blanco-calido': '#FFF9FB',
      },
      borderRadius: {
        widget: '22px',
      },
      fontFamily: {
        heading: ['var(--fuente-titulos)', 'Fredoka', 'sans-serif'],
        body: ['var(--fuente-cuerpo)', 'Nunito', 'sans-serif'],
      },
      boxShadow: {
        // Sombra suave con tinte rosado, nunca gris puro (sección 5)
        widget: '0 10px 30px -8px rgba(232, 93, 138, 0.28)',
        'widget-sm': '0 6px 18px -6px rgba(59, 31, 77, 0.18)',
      },
      keyframes: {
        'corazon-sube': {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0' },
          '15%': { opacity: '1' },
          '100%': { transform: 'translateY(-120px) scale(1)', opacity: '0' },
        },
        'aparece-suave': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'late-corazon': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
        },
      },
      animation: {
        'corazon-sube': 'corazon-sube 1.6s ease-out forwards',
        'aparece-suave': 'aparece-suave 0.35s ease-out forwards',
        'late-corazon': 'late-corazon 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
