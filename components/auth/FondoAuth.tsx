// Fondo decorativo de las pantallas de autenticación: gradiente profundo + blobs
// difuminados + siluetas de cartas que flotan lentamente.
// Implementa BJ2-002
'use client';

import { motion } from 'framer-motion';

const CARTAS = [
  { top: '8%', left: '-4%', rot: -18, dur: 9 },
  { top: '22%', right: '-6%', rot: 14, dur: 11 },
  { bottom: '10%', left: '2%', rot: 10, dur: 10 },
  { bottom: '24%', right: '4%', rot: -12, dur: 12 },
];

export function FondoAuth() {
  return (
    <div className="auth-fondo overflow-hidden" aria-hidden>
      <span
        className="auth-blob"
        style={{ width: 260, height: 260, top: '-60px', left: '-40px', background: '#E85D8A' }}
      />
      <span
        className="auth-blob"
        style={{ width: 320, height: 320, bottom: '-120px', right: '-80px', background: '#D9C9EC' }}
      />
      {CARTAS.map((c, i) => (
        <motion.span
          key={i}
          className="auth-carta-deco"
          style={{ ...c } as React.CSSProperties}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -14, 0], rotate: [c.rot, c.rot + 3, c.rot] }}
          transition={{
            opacity: { duration: 1 },
            y: { duration: c.dur, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: c.dur, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      ))}
    </div>
  );
}
