// Aparición suave al entrar en pantalla, con red de seguridad: si el observador no
// dispara (JS lento, navegador raro), el contenido se muestra igual tras un momento.
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enVista = useInView(ref, { once: true, margin: '-40px' });
  const [forzar, setForzar] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForzar(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const visible = enVista || forzar;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 26 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
      transition={{ duration: 0.55, delay: visible ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
