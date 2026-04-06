import { useState, useEffect, useCallback } from "react";
import { StageElement } from "../types";
import { getErrorMessage, reportRuntimeIssue } from "../utils/runtimeDiagnostics.ts";

const MEDIA_STORAGE_KEY = "userUploadedMedia";

interface StoredMedia {
  type: "image" | "video" | "model";
  dataUrl: string;
}

const SAMPLE_MODELS = [
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/Parrot.glb",
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/Soldier.glb",
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/Stork.glb",
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/Flamingo.glb",
];

export function useStageElementManager() {
  const [stageElement, setStageElement] = useState<StageElement>("card");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [modelDataUrl, setModelDataUrl] = useState<string | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);

  const setMedia = useCallback((dataUrl: string, mediaType: StoredMedia["type"]) => {
    const mediaToStore: StoredMedia = { type: mediaType, dataUrl };
    try {
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(mediaToStore));
      if (mediaType === "model") {
        setModelDataUrl(dataUrl);
        setImageDataUrl(null);
        setStageElement("model");
      } else {
        setImageDataUrl(dataUrl);
        setModelDataUrl(null);
        setStageElement("image");
      }
    } catch (error) {
      reportRuntimeIssue("stage-media.save", error, "Error saving media to localStorage.");
      alert(
        `Failed to save file. It might be too large for local storage (limit is ~5MB).\n\nError: ${getErrorMessage(error)}`,
      );
    }
  }, []);

  useEffect(() => {
    try {
      const savedMediaJson = localStorage.getItem(MEDIA_STORAGE_KEY);
      if (savedMediaJson) {
        const savedMedia: StoredMedia = JSON.parse(savedMediaJson);
        setMedia(savedMedia.dataUrl, savedMedia.type);
      }
    } catch (error) {
      reportRuntimeIssue("stage-media.read", error, "Error reading media from localStorage.");
    }
  }, [setMedia]);

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        let mediaType: StoredMedia["type"] = "image";
        if (file.type.startsWith("video")) {
          mediaType = "video";
        } else if (file.name.endsWith(".gltf") || file.name.endsWith(".glb")) {
          mediaType = "model";
        }
        setMedia(result, mediaType);
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
          setMedia(result, "model");
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      reportRuntimeIssue("stage-media.sample-model", error, "Error loading random model.");
      alert(
        `Failed to load sample model. Please check your internet connection.\n\nError: ${getErrorMessage(error)}`,
      );
    } finally {
      setIsLoadingModel(false);
    }
  }, [setMedia]);

  const handleFileRemove = () => {
    localStorage.removeItem(MEDIA_STORAGE_KEY);
    setImageDataUrl(null);
    setModelDataUrl(null);
    if (stageElement === "image" || stageElement === "model") {
      setStageElement("card");
    }
  };

  return {
    stageElement,
    setStageElement,
    imageDataUrl,
    modelDataUrl,
    handleFileChange,
    handleFileRemove,
    handleLoadRandomModel,
    hasMedia: !!imageDataUrl || !!modelDataUrl,
    isLoadingModel,
  };
}
