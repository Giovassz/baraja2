// Configuración de Tailwind CSS — tokens de diseño de Baraja2 (sección 5 del prompt maestro)
// Rediseño total: paleta y tipografías de marca intactas; se amplían sombras y animaciones.
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
        // Radio del naipe de póker (rediseño solicitado): más cerrado que el widget,
        // nunca esquinas rectas.
        naipe: '16px',
      },
      fontFamily: {
        heading: ['var(--fuente-titulos)', 'Fredoka', 'sans-serif'],
        body: ['var(--fuente-cuerpo)', 'Nunito', 'sans-serif'],
        naipe: ['var(--fuente-titulos)', 'Fredoka', 'sans-serif'],
      },
      boxShadow: {
        widget: '0 18px 40px -16px rgba(232, 93, 138, 0.35)',
        'widget-sm': '0 8px 22px -8px rgba(59, 31, 77, 0.20)',
        naipe: '0 12px 28px -10px rgba(59, 31, 77, 0.45)',
        'naipe-alta': '0 26px 50px -12px rgba(59, 31, 77, 0.5)',
        glow: '0 0 0 1px rgba(232,93,138,0.25), 0 0 26px -4px rgba(232,93,138,0.55)',
        'borde-suave': 'inset 0 0 0 1px rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'romantico':
          'radial-gradient(circle at 12% -5%, rgba(217,201,236,0.55), transparent 42%), radial-gradient(circle at 88% 6%, rgba(191,234,209,0.45), transparent 40%), radial-gradient(circle at 50% 120%, rgba(247,198,218,0.55), transparent 55%)',
        'brillo-naipe':
          'linear-gradient(140deg, rgba(255,255,255,0.9) 0%, rgba(255,249,251,1) 45%, rgba(247,198,218,0.35) 100%)',
      },
      keyframes: {
        'corazon-sube': {
          '0%': { transform: 'translateY(0) scale(0.5) rotate(-8deg)', opacity: '0' },
          '12%': { opacity: '1' },
          '100%': { transform: 'translateY(-160px) scale(1.05) rotate(6deg)', opacity: '0' },
        },
        'aparece-suave': {
          '0%': { transform: 'translateY(10px) scale(0.98)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'reparte-naipe': {
          '0%': { transform: 'translateY(40px) rotate(-12deg) scale(0.9)', opacity: '0' },
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
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '100%': { transform: 'translateX(220%) skewX(-18deg)' },
        },
        'pulso-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,93,138,0.45)' },
          '50%': { boxShadow: '0 0 0 12px rgba(232,93,138,0)' },
        },
        'gradiente-mueve': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'corazon-sube': 'corazon-sube 1.7s ease-out forwards',
        'aparece-suave': 'aparece-suave 0.4s ease-out forwards',
        'reparte-naipe': 'reparte-naipe 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        'late-corazon': 'late-corazon 1.5s ease-in-out infinite',
        flota: 'flota 4s ease-in-out infinite',
        'brillo-pasa': 'brillo-pasa 2.6s ease-in-out infinite',
        'pulso-glow': 'pulso-glow 2.4s ease-out infinite',
        'gradiente-mueve': 'gradiente-mueve 14s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;
