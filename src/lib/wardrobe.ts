import { getSupabase, type Outfit, type Prenda, type Categoria } from './supabase';

const BUCKET = 'prendas';

/** Reduce y comprime una foto en el navegador antes de subirla (ahorra almacenamiento). */
export async function compressImage(
  file: File,
  maxSize = 1280,
  quality = 0.82,
  keepAlpha = false
): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, keepAlpha ? 'image/png' : 'image/jpeg', quality)
  );
  return blob ?? file;
}

/** Quita el fondo en el navegador y devuelve un PNG transparente. */
export async function quitarFondo(
  file: File,
  onProgress?: (texto: string) => void
): Promise<File> {
  const { removeBackground } = await import('@imgly/background-removal');
  const blob = await removeBackground(file, {
    model: 'isnet_quint8',
    output: { format: 'image/png', quality: 0.8 },
    progress: (_key, current, total) => {
      if (total > 0) onProgress?.(`Preparando el recorte… ${Math.round((current / total) * 100)}%`);
    },
  });
  const nombre = file.name.replace(/\.[^.]+$/, '') + '-sin-fondo.png';
  return new File([blob], nombre, { type: 'image/png' });
}

/** Sube una foto al bucket y devuelve la URL pública. */
export async function uploadPhoto(
  userId: string,
  file: File,
  keepAlpha = false
): Promise<string> {
  const supabase = getSupabase();
  const blob = await compressImage(file, 1280, 0.82, keepAlpha);
  const ext = keepAlpha ? 'png' : 'jpg';
  const mime = keepAlpha ? 'image/png' : 'image/jpeg';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: mime,
    cacheControl: '3600',
  });
  if (error) throw new Error(`No se pudo subir la foto: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function deletePhoto(fotoUrl: string): Promise<void> {
  const supabase = getSupabase();
  const marker = `${BUCKET}/`;
  const index = fotoUrl.indexOf(marker);
  if (index === -1) return;
  const path = decodeURIComponent(fotoUrl.slice(index + marker.length).split('?')[0]);
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function fetchPrendas(userId: string): Promise<Prenda[]> {
  const { data, error } = await getSupabase()
    .from('prendas')
    .select('*')
    .eq('user_id', userId)
    .order('creado_en', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Prenda[];
}

export async function fetchOutfits(userId: string): Promise<Outfit[]> {
  const { data, error } = await getSupabase()
    .from('outfits')
    .select('*')
    .eq('user_id', userId)
    .order('creado_en', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Outfit[];
}

export interface NuevaPrenda {
  nombre: string;
  categoria: Categoria;
  color: string;
  temporada: string;
  foto_url: string | null;
}

export async function insertPrenda(userId: string, prenda: NuevaPrenda): Promise<Prenda> {
  const { data, error } = await getSupabase()
    .from('prendas')
    .insert({ user_id: userId, ...prenda })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Prenda;
}

export async function updatePrenda(id: string, cambios: Partial<NuevaPrenda>): Promise<Prenda> {
  const { data, error } = await getSupabase()
    .from('prendas')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Prenda;
}

export async function deletePrenda(id: string, fotoUrl: string | null): Promise<void> {
  if (fotoUrl) await deletePhoto(fotoUrl).catch(() => {});
  const { error } = await getSupabase().from('prendas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function insertOutfit(userId: string, nombre: string, prendaIds: string[]): Promise<Outfit> {
  const { data, error } = await getSupabase()
    .from('outfits')
    .insert({ user_id: userId, nombre, prenda_ids: prendaIds })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Outfit;
}

export async function deleteOutfit(id: string): Promise<void> {
  const { error } = await getSupabase().from('outfits').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

const ENTITIES: Record<string, string> = {
  '&': '\u0026',
  '<': '\u003c',
  '>': '\u003e',
  '"': '\u0022',
  "'": '\u0027',
};

/** Escapa texto para insertarlo de forma segura en el DOM. */
export function esc(value: string | null | undefined): string {
  return (value ?? '').replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char);
}
