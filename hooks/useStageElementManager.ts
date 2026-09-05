import { useState, useEffect, useCallback } from 'react';
import { StageElement, StageMediaType } from '../types';
import { getErrorMessage, reportRuntimeIssue } from '../utils/runtimeDiagnostics.ts';
import {
  classifyStageMediaFile,
  MEDIA_STORAGE_KEY,
  parseStoredMedia,
  projectStageMedia,
  type StoredMedia,
} from '../utils/stageMedia';

const SAMPLE_MODELS = [
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/Parrot.glb',
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/Soldier.glb',
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/Stork.glb',
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/Flamingo.glb',
];

export function useStageElementManager() {
  const [stageElement, setStageElement] = useState<StageElement>('card');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [modelDataUrl, setModelDataUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<StageMediaType | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const applyMedia = useCallback((media: StoredMedia) => {
    const projection = projectStageMedia(media);
    setImageDataUrl(projection.imageDataUrl);
    setModelDataUrl(projection.modelDataUrl);
    setMediaType(projection.mediaType);
    setStageElement(projection.stageElement);
  }, []);

  const setMedia = useCallback(
    (dataUrl: string, mediaType: StageMediaType) => {
      const mediaToStore: StoredMedia = { type: mediaType, dataUrl };
      try {
        localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(mediaToStore));
        applyMedia(mediaToStore);
        setMediaError(null);
      } catch (error) {
        reportRuntimeIssue('stage-media.save', error, 'Error saving media to localStorage.');
        setMediaError(
          `Unable to save the file. It may be larger than local storage allows (${getErrorMessage(error)}).`,
        );
      }
    },
    [applyMedia],
  );

  useEffect(() => {
    try {
      const savedMediaJson = localStorage.getItem(MEDIA_STORAGE_KEY);
      const savedMedia = parseStoredMedia(savedMediaJson);
      if (savedMedia) applyMedia(savedMedia);
    } catch (error) {
      reportRuntimeIssue('stage-media.read', error, 'Error reading media from localStorage.');
    }
  }, [applyMedia]);

  const handleFileChange = (file: File) => {
    const mediaType = classifyStageMediaFile(file);
    if (!mediaType) {
      setMediaError('Use an image, a WebM video, or a .glb / .gltf model.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setMedia(result, mediaType);
      }
    };
    reader.onerror = () => {
      setMediaError('Unable to read that file.');
    };
    reader.readAsDataURL(file);
  };

  const handleLoadRandomModel = useCallback(async () => {
    setIsLoadingModel(true);
    setMediaError(null);
    try {
      const randomUrl = SAMPLE_MODELS[Math.floor(Math.random() * SAMPLE_MODELS.length)];
      const response = await fetch(randomUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.statusText}`);
      }
      const blob = await response.blob();
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) setMedia(result, 'model');
          resolve();
        };
        reader.onerror = () => reject(new Error('Unable to read the sample model.'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      reportRuntimeIssue('stage-media.sample-model', error, 'Error loading random model.');
      setMediaError(`Unable to load the sample model. Check your connection (${getErrorMessage(error)}).`);
    } finally {
      setIsLoadingModel(false);
    }
  }, [setMedia]);

  const handleFileRemove = () => {
    localStorage.removeItem(MEDIA_STORAGE_KEY);
    setImageDataUrl(null);
    setModelDataUrl(null);
    setMediaType(null);
    if (stageElement === 'image' || stageElement === 'model') {
      setStageElement('card');
    }
  };

  return {
    stageElement,
    setStageElement,
    imageDataUrl,
    modelDataUrl,
    mediaType,
    handleFileChange,
    handleFileRemove,
    handleLoadRandomModel,
    hasMedia: !!imageDataUrl || !!modelDataUrl,
    isLoadingModel,
    mediaError,
    clearMediaError: () => setMediaError(null),
  };
}
