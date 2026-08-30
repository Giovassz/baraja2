// Contenedor animado de la tarjeta de autenticación
// Implementa BJ2-008
'use client';

import { motion } from 'framer-motion';

export function TarjetaAuth({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="tarjeta-auth"
    >
      {children}
    </motion.section>
  );
}
