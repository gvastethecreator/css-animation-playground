import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import { renderHook, act } from '@testing-library/react';
import { useStageElementManager } from '../hooks/useStageElementManager';

function mockFileReader() {
  const reader = {
    readAsDataURL: vi.fn(),
    onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
    onerror: null as ((e: ProgressEvent<FileReader>) => void) | null,
  };

  const FileReaderMock = vi.fn(function MockFileReader() {
    return reader as unknown as FileReader;
  });

  vi.stubGlobal('FileReader', FileReaderMock as unknown as typeof FileReader);

  return reader;
}

describe('useStageElementManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns default stage element as card', () => {
    const { result } = renderHook(() => useStageElementManager());
    expect(result.current.stageElement).toBe('card');
    expect(result.current.imageDataUrl).toBeNull();
    expect(result.current.modelDataUrl).toBeNull();
    expect(result.current.hasMedia).toBe(false);
    expect(result.current.isLoadingModel).toBe(false);
  });

  it('changes stage element via setStageElement', () => {
    const { result } = renderHook(() => useStageElementManager());
    act(() => {
      result.current.setStageElement('cube');
    });
    expect(result.current.stageElement).toBe('cube');
  });

  it('handleFileChange reads image file and updates state', async () => {
    const { result } = renderHook(() => useStageElementManager());

    const fakeDataUrl = 'data:image/png;base64,fakedata';
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    const reader = mockFileReader();

    act(() => {
      result.current.handleFileChange(file);
    });

    // Simulate the FileReader onload callback
    act(() => {
      reader.onload?.({ target: { result: fakeDataUrl } } as ProgressEvent<FileReader>);
    });

    expect(result.current.imageDataUrl).toBe(fakeDataUrl);
    expect(result.current.stageElement).toBe('image');
    expect(result.current.hasMedia).toBe(true);
  });

  it('rejects unsupported files without treating them as images', () => {
    const { result } = renderHook(() => useStageElementManager());
    const file = new File(['nope'], 'notes.pdf', { type: 'application/pdf' });

    act(() => {
      result.current.handleFileChange(file);
    });

    expect(result.current.mediaError).toMatch(/image/i);
    expect(result.current.imageDataUrl).toBeNull();
    expect(result.current.stageElement).toBe('card');
  });

  it('handleFileChange reads model file (.glb)', async () => {
    const { result } = renderHook(() => useStageElementManager());

    const fakeDataUrl = 'data:application/octet-stream;base64,fakemodel';
    const file = new File(['model'], 'model.glb', { type: 'application/octet-stream' });

    const reader = mockFileReader();

    act(() => {
      result.current.handleFileChange(file);
    });

    act(() => {
      reader.onload?.({ target: { result: fakeDataUrl } } as ProgressEvent<FileReader>);
    });

    expect(result.current.modelDataUrl).toBe(fakeDataUrl);
    expect(result.current.stageElement).toBe('model');
    expect(result.current.hasMedia).toBe(true);
  });

  it('handleFileRemove clears media and resets to card', () => {
    const { result } = renderHook(() => useStageElementManager());

    // Manually store media then remove
    localStorage.setItem('userUploadedMedia', JSON.stringify({ type: 'image', dataUrl: 'data:fake' }));

    act(() => {
      result.current.setStageElement('image');
    });

    act(() => {
      result.current.handleFileRemove();
    });

    expect(result.current.imageDataUrl).toBeNull();
    expect(result.current.modelDataUrl).toBeNull();
    expect(result.current.stageElement).toBe('card');
    expect(localStorage.getItem('userUploadedMedia')).toBeNull();
  });

  it('persists media to localStorage on file change', () => {
    const { result } = renderHook(() => useStageElementManager());

    const fakeDataUrl = 'data:image/png;base64,test';
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    const reader = mockFileReader();

    act(() => {
      result.current.handleFileChange(file);
    });

    act(() => {
      reader.onload?.({ target: { result: fakeDataUrl } } as ProgressEvent<FileReader>);
    });

    const stored = JSON.parse(localStorage.getItem('userUploadedMedia')!);
    expect(stored.type).toBe('image');
    expect(stored.dataUrl).toBe(fakeDataUrl);
  });

  it('restores image from localStorage on mount', () => {
    const fakeDataUrl = 'data:image/png;base64,restored';
    localStorage.setItem('userUploadedMedia', JSON.stringify({ type: 'image', dataUrl: fakeDataUrl }));

    const { result } = renderHook(() => useStageElementManager());

    expect(result.current.imageDataUrl).toBe(fakeDataUrl);
    expect(result.current.stageElement).toBe('image');
  });

  it('restores valid media without rewriting storage', () => {
    const fakeDataUrl = 'data:image/png;base64,restored';
    localStorage.setItem('userUploadedMedia', JSON.stringify({ type: 'image', dataUrl: fakeDataUrl }));
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useStageElementManager());

    expect(result.current.imageDataUrl).toBe(fakeDataUrl);
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('ignores malformed persisted media', () => {
    localStorage.setItem('userUploadedMedia', JSON.stringify({ type: 'audio', dataUrl: 'data:audio' }));

    const { result } = renderHook(() => useStageElementManager());

    expect(result.current.stageElement).toBe('card');
    expect(result.current.imageDataUrl).toBeNull();
    expect(result.current.modelDataUrl).toBeNull();
  });

  it('restores model from localStorage on mount', () => {
    const fakeDataUrl = 'data:application/octet-stream;base64,modeldata';
    localStorage.setItem('userUploadedMedia', JSON.stringify({ type: 'model', dataUrl: fakeDataUrl }));

    const { result } = renderHook(() => useStageElementManager());

    expect(result.current.modelDataUrl).toBe(fakeDataUrl);
    expect(result.current.stageElement).toBe('model');
  });

  it('loads a sample model through the existing fetch and FileReader path', async () => {
    const reader = mockFileReader();
    const blob = new Blob(['model'], { type: 'application/octet-stream' });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      statusText: 'OK',
      blob: vi.fn().mockResolvedValue(blob),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(Math, 'random').mockReturnValue(0);
    reader.readAsDataURL.mockImplementation(() => {
      queueMicrotask(() => {
        reader.onload?.({
          target: { result: 'data:application/octet-stream;base64,sample' },
        } as ProgressEvent<FileReader>);
      });
    });
    const { result } = renderHook(() => useStageElementManager());

    await act(async () => {
      await result.current.handleLoadRandomModel();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/Parrot.glb',
    );
    expect(reader.readAsDataURL).toHaveBeenCalledWith(blob);

    expect(result.current.modelDataUrl).toBe('data:application/octet-stream;base64,sample');
    expect(result.current.stageElement).toBe('model');
    expect(result.current.isLoadingModel).toBe(false);
  });
});
