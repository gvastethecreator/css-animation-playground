import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStageElementManager } from '../hooks/useStageElementManager';

describe('useStageElementManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
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

    // Mock FileReader
    const readAsDataURLMock = vi.fn();
    const mockFileReader = {
      readAsDataURL: readAsDataURLMock,
      onload: null as ((e: any) => void) | null,
      result: fakeDataUrl,
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

    act(() => {
      result.current.handleFileChange(file);
    });

    // Simulate the FileReader onload callback
    act(() => {
      mockFileReader.onload?.({ target: { result: fakeDataUrl } } as any);
    });

    expect(result.current.imageDataUrl).toBe(fakeDataUrl);
    expect(result.current.stageElement).toBe('image');
    expect(result.current.hasMedia).toBe(true);
  });

  it('handleFileChange reads model file (.glb)', async () => {
    const { result } = renderHook(() => useStageElementManager());

    const fakeDataUrl = 'data:application/octet-stream;base64,fakemodel';
    const file = new File(['model'], 'model.glb', { type: 'application/octet-stream' });

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as ((e: any) => void) | null,
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

    act(() => {
      result.current.handleFileChange(file);
    });

    act(() => {
      mockFileReader.onload?.({ target: { result: fakeDataUrl } } as any);
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

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as ((e: any) => void) | null,
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

    act(() => {
      result.current.handleFileChange(file);
    });

    act(() => {
      mockFileReader.onload?.({ target: { result: fakeDataUrl } } as any);
    });

    const stored = JSON.parse(localStorage.getItem('userUploadedMedia')!);
    expect(stored.type).toBe('image');
    expect(stored.dataUrl).toBe(fakeDataUrl);
  });

  it('restores image from localStorage on mount', () => {
    const fakeDataUrl = 'data:image/png;base64,restored';
    localStorage.setItem(
      'userUploadedMedia',
      JSON.stringify({ type: 'image', dataUrl: fakeDataUrl }),
    );

    const { result } = renderHook(() => useStageElementManager());

    expect(result.current.imageDataUrl).toBe(fakeDataUrl);
    expect(result.current.stageElement).toBe('image');
  });

  it('restores model from localStorage on mount', () => {
    const fakeDataUrl = 'data:application/octet-stream;base64,modeldata';
    localStorage.setItem(
      'userUploadedMedia',
      JSON.stringify({ type: 'model', dataUrl: fakeDataUrl }),
    );

    const { result } = renderHook(() => useStageElementManager());

    expect(result.current.modelDataUrl).toBe(fakeDataUrl);
    expect(result.current.stageElement).toBe('model');
  });
});
