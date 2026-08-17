import { supabase } from './supabase';

export const PROCESS_MEDIA_BUCKET = 'process-media';
export const PROCESS_MEDIA_MAX_BYTES = 12 * 1024 * 1024;

const ALLOWED_MEDIA_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/ogg',
]);

const sanitizePathPart = (value: string, fallback: string) => {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return normalized || fallback;
};

export const normalizeMediaSource = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  const source = value as Record<string, unknown>;
  const candidates = [
    source.url,
    source.src,
    source.imageUrl,
    source.image_url,
    source.publicUrl,
    source.public_url,
  ];

  const match = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim());
  return typeof match === 'string' ? match.trim() : '';
};

export const normalizeMediaSources = (value: unknown): string[] => {
  const source = Array.isArray(value) ? value : value == null ? [] : [value];
  return Array.from(new Set(source.map(normalizeMediaSource).filter(Boolean)));
};

export const uploadProcessMediaFiles = async (files: File[], nodeId: string): Promise<string[]> => {
  const uploadedPaths: string[] = [];

  try {
    const urls: string[] = [];
    for (const file of files) {
      if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
        throw new Error(`Formato não permitido: ${file.name}`);
      }
      if (file.size > PROCESS_MEDIA_MAX_BYTES) {
        throw new Error(`O arquivo ${file.name} excede o limite de 12 MB.`);
      }

      const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const safeNodeId = sanitizePathPart(nodeId, 'node');
      const safeFileName = sanitizePathPart(baseName, 'media');
      const path = `maps/${safeNodeId}/${crypto.randomUUID()}-${safeFileName}${extension.toLowerCase()}`;

      const { error } = await supabase.storage
        .from(PROCESS_MEDIA_BUCKET)
        .upload(path, file, {
          cacheControl: '31536000',
          contentType: file.type,
          upsert: false,
        });

      if (error) throw new Error(`Não foi possível enviar ${file.name}: ${error.message}`);
      uploadedPaths.push(path);

      const { data } = supabase.storage.from(PROCESS_MEDIA_BUCKET).getPublicUrl(path);
      if (!data.publicUrl) throw new Error(`Não foi possível gerar a URL de ${file.name}.`);
      urls.push(data.publicUrl);
    }

    return urls;
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(PROCESS_MEDIA_BUCKET).remove(uploadedPaths);
    }
    throw error;
  }
};

export const getProcessMediaPath = (url: string): string | null => {
  const marker = `/storage/v1/object/public/${PROCESS_MEDIA_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex < 0) return null;
  return decodeURIComponent(url.slice(markerIndex + marker.length).split('?')[0]);
};

export const deleteProcessMediaUrl = async (url: string) => {
  const path = getProcessMediaPath(url);
  if (!path) return;
  const { error } = await supabase.storage.from(PROCESS_MEDIA_BUCKET).remove([path]);
  if (error) console.warn('Não foi possível remover a mídia do armazenamento:', error.message);
};
