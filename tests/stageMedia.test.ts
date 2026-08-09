import { describe, expect, it } from 'vite-plus/test';
import { classifyStageMediaFile, parseStoredMedia, projectStageMedia } from '../utils/stageMedia';

describe('stage media core', () => {
  it('classifies image, video, GLB, and glTF files', () => {
    expect(classifyStageMediaFile({ name: 'still.png', type: 'image/png' })).toBe('image');
    expect(classifyStageMediaFile({ name: 'clip.bin', type: 'video/webm' })).toBe('video');
    expect(classifyStageMediaFile({ name: 'mesh.GLB', type: 'application/octet-stream' })).toBe('model');
    expect(classifyStageMediaFile({ name: 'scene.gltf', type: 'model/gltf+json' })).toBe('model');
  });

  it('parses only complete supported persisted payloads', () => {
    expect(parseStoredMedia('{broken')).toBeNull();
    expect(parseStoredMedia(JSON.stringify({ type: 'audio', dataUrl: 'data:audio/wav;base64,x' }))).toBeNull();
    expect(parseStoredMedia(JSON.stringify({ type: 'image', dataUrl: '' }))).toBeNull();
    expect(parseStoredMedia(JSON.stringify({ type: 'video', dataUrl: 'data:image/png;base64,x' }))).toBeNull();
    expect(parseStoredMedia(JSON.stringify({ type: 'video', dataUrl: 'data:video/webm;base64,x' }))).toEqual({
      type: 'video',
      dataUrl: 'data:video/webm;base64,x',
    });
  });

  it('projects models separately while images and videos share the image stage', () => {
    expect(projectStageMedia({ type: 'model', dataUrl: 'data:model' })).toEqual({
      stageElement: 'model',
      imageDataUrl: null,
      modelDataUrl: 'data:model',
      mediaType: 'model',
    });
    expect(projectStageMedia({ type: 'video', dataUrl: 'data:video' })).toEqual({
      stageElement: 'image',
      imageDataUrl: 'data:video',
      modelDataUrl: null,
      mediaType: 'video',
    });
  });
});
