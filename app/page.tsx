// Punto de entrada: el middleware ya redirige a /login si no hay sesión.
import { redirect } from 'next/navigation';

export default function Inicio() {
  redirect('/dashboard');
}
