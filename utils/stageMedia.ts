import type { StageElement, StageMediaType } from '../types';

export const MEDIA_STORAGE_KEY = 'userUploadedMedia';

export interface StoredMedia {
  type: StageMediaType;
  dataUrl: string;
}

export interface StageMediaProjection {
  stageElement: Extract<StageElement, 'image' | 'model'>;
  imageDataUrl: string | null;
  modelDataUrl: string | null;
  mediaType: StageMediaType;
}

interface MediaFileDescriptor {
  name: string;
  type: string;
}

export function classifyStageMediaFile(file: MediaFileDescriptor): StageMediaType {
  if (file.type.toLowerCase().startsWith('video')) return 'video';
  const fileName = file.name.toLowerCase();
  return fileName.endsWith('.gltf') || fileName.endsWith('.glb') ? 'model' : 'image';
}

export function parseStoredMedia(serializedMedia: string | null): StoredMedia | null {
  if (!serializedMedia) return null;

  try {
    const candidate: unknown = JSON.parse(serializedMedia);
    if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) return null;

    const { type, dataUrl } = candidate as Record<string, unknown>;
    if ((type !== 'image' && type !== 'video' && type !== 'model') || typeof dataUrl !== 'string' || !dataUrl) {
      return null;
    }

    if (type === 'image' && !dataUrl.startsWith('data:image/')) return null;
    if (type === 'video' && !dataUrl.startsWith('data:video/')) return null;

    return { type, dataUrl };
  } catch {
    return null;
  }
}

export function projectStageMedia(media: StoredMedia): StageMediaProjection {
  if (media.type === 'model') {
    return { stageElement: 'model', imageDataUrl: null, modelDataUrl: media.dataUrl, mediaType: media.type };
  }

  return { stageElement: 'image', imageDataUrl: media.dataUrl, modelDataUrl: null, mediaType: media.type };
}
