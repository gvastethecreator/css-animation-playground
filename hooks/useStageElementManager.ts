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
      } catch (error) {
        reportRuntimeIssue('stage-media.save', error, 'Error saving media to localStorage.');
        alert(
          `Failed to save file. It might be too large for local storage (limit is ~5MB).\n\nError: ${getErrorMessage(error)}`,
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setMedia(result, classifyStageMediaFile(file));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadRandomModel = useCallback(async () => {
    setIsLoadingModel(true);
    try {
      const randomUrl = SAMPLE_MODELS[Math.floor(Math.random() * SAMPLE_MODELS.length)];
      const response = await fetch(randomUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.statusText}`);
      }
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setMedia(result, 'model');
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      reportRuntimeIssue('stage-media.sample-model', error, 'Error loading random model.');
      alert(`Failed to load sample model. Please check your internet connection.\n\nError: ${getErrorMessage(error)}`);
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
  };
}
