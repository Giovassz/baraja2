// Íconos de Baraja2 — set curado de lucide-react (sin emojis en toda la app).
// Implementa BJ2-002
import {
  Heart,
  HeartHandshake,
  Flame,
  Sparkles,
  RefreshCw,
  Check,
  CircleCheck,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  BellRing,
  BellOff,
  Settings,
  LogOut,
  Share2,
  Copy,
  Plane,
  Repeat,
  House,
  Lock,
  Swords,
  Hand,
  WifiOff,
  Crown,
  Users,
  Shuffle,
  Play,
  ShieldCheck,
  Clock,
  Mail,
  Store,
  ShoppingBag,
  Coins,
  Gem,
  Star,
  TrendingUp,
  Gift,
  Music,
  Coffee,
  Camera,
  MessageCircle,
  Phone,
  MapPin,
  Sun,
  Moon,
  Utensils,
  Gamepad2,
  Feather,
  Flower2,
  Mic,
  Video,
  User,
  Eye,
  EyeOff,
  PawPrint,
  Pencil,
  Trash2,
  Palette,
  Search,
  LayoutGrid,
  ChevronDown,
  BarChart3,
  Cat,
  Dog,
  Rabbit,
  Bird,
  Fish,
  Squirrel,
  Turtle,
  Snail,
  type LucideIcon,
} from 'lucide-react';

export type { LucideIcon };

export const Icono = {
  corazon: Heart,
  corazones: HeartHandshake,
  llama: Flame,
  chispa: Sparkles,
  recargar: RefreshCw,
  check: Check,
  cumplida: CircleCheck,
  cerrar: X,
  atras: ChevronLeft,
  siguiente: ChevronRight,
  flecha: ArrowRight,
  campana: BellRing,
  campanaOff: BellOff,
  ajustes: Settings,
  salir: LogOut,
  compartir: Share2,
  copiar: Copy,
  avion: Plane,
  hibrido: Repeat,
  casa: House,
  candado: Lock,
  espadas: Swords,
  mano: Hand,
  sinWifi: WifiOff,
  corona: Crown,
  pareja: Users,
  barajar: Shuffle,
  jugar: Play,
  escudo: ShieldCheck,
  reloj: Clock,
  sobre: Mail,
  usuario: User,
  ojo: Eye,
  ojoCerrado: EyeOff,
  tienda: Store,
  bolsa: ShoppingBag,
  moneda: Coins,
  gema: Gem,
  estrella: Star,
  nivel: TrendingUp,
  // íconos de carta estándar
  regalo: Gift,
  musica: Music,
  cafe: Coffee,
  camara: Camera,
  mensaje: MessageCircle,
  llamada: Phone,
  mapa: MapPin,
  sol: Sun,
  luna: Moon,
  plato: Utensils,
  juego: Gamepad2,
  pluma: Feather,
  flor: Flower2,
  micro: Mic,
  video: Video,
  huella: PawPrint,
  lapiz: Pencil,
  papelera: Trash2,
  paleta: Palette,
  buscar: Search,
  apps: LayoutGrid,
  flechaAbajo: ChevronDown,
  grafico: BarChart3,
} satisfies Record<string, LucideIcon>;

export type NombreIcono = keyof typeof Icono;

/** Subconjunto de íconos válidos como cara de una carta. */
export type NombreIconoCarta =
  | 'llama'
  | 'regalo'
  | 'musica'
  | 'cafe'
  | 'camara'
  | 'mensaje'
  | 'llamada'
  | 'mapa'
  | 'estrella'
  | 'sol'
  | 'luna'
  | 'plato'
  | 'juego'
  | 'pluma'
  | 'flor'
  | 'micro'
  | 'video'
  | 'mano'
  | 'candado'
  | 'chispa';

// Íconos-animal para los avatares provisionales (los definitivos llegan después).
export const ICONOS_ANIMAL = {
  gato: Cat,
  perro: Dog,
  conejo: Rabbit,
  ave: Bird,
  pez: Fish,
  ardilla: Squirrel,
  tortuga: Turtle,
  caracol: Snail,
} satisfies Record<string, LucideIcon>;

export type NombreAnimal = keyof typeof ICONOS_ANIMAL;
