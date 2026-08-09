/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { render } from '@testing-library/react';
import StageImage from '../components/StageImage';
import { defaultTransformState } from '../types';

describe('StageImage', () => {
  it('renders non-WebM video media with the video element', () => {
    const { container } = render(
      <StageImage
        transforms={{ ...defaultTransformState }}
        isAdjusting={false}
        isPlaying={false}
        imageDataUrl="data:video/mp4;base64,video"
        mediaType="video"
        onFileChange={vi.fn()}
        showStageUI
        willChangeString="auto"
        isExploded={false}
      />,
    );

    expect(container.querySelector('video')).not.toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });
});
