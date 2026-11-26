import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

/** true cuando las variables de entorno de Supabase están definidas. */
export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Cliente de Supabase compartido (solo en el navegador). */
export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!url || !anonKey) {
      throw new Error(
        'Supabase no está configurado. Copia .env.example a .env y rellena PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY.'
      );
    }
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'armario-auth',
      },
    });
  }
  return client;
}

/** Devuelve el usuario actual o `null` si no hay sesión. */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabaseConfigured) return null;
  const { data } = await getSupabase().auth.getUser();
  return data.user;
}

/**
 * Protege páginas privadas: si no hay sesión, redirige a /login.
 * Llamar siempre al principio del `<script>` de la página.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = `${import.meta.env.BASE_URL}login/`;
    throw new Error('Sesión no iniciada');
  }
  return user;
}

/** Cierra la sesión y vuelve al inicio. */
export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
  window.location.href = import.meta.env.BASE_URL;
}

export type Categoria = 'superior' | 'inferior' | 'abrigo' | 'calzado' | 'accesorio';

export const CATEGORIAS: { id: Categoria; label: string }[] = [
  { id: 'superior', label: 'Parte de arriba' },
  { id: 'inferior', label: 'Parte de abajo' },
  { id: 'abrigo', label: 'Abrigo' },
  { id: 'calzado', label: 'Calzado' },
  { id: 'accesorio', label: 'Accesorio' },
];

export const TEMPORADAS = ['primavera', 'verano', 'otoño', 'invierno', 'todo el año'] as const;

export interface Prenda {
  id: string;
  user_id: string;
  nombre: string;
  categoria: Categoria;
  color: string | null;
  temporada: string | null;
  foto_url: string | null;
  creado_en: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  nombre: string;
  prenda_ids: string[];
  creado_en: string;
}
