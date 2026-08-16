import * as THREE from 'three';
import { StageStyle } from '../types';

export const createTextTexture = (
  text: string,
  fontSize: number,
  fontWeight: number,
  textColor: string,
  style: StageStyle['text'],
  bgColor?: string,
  width?: number,
  height?: number,
): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // High-DPI optimization: cap devicePixelRatio at 4x to avoid excessive VRAM use.
  const pixelRatio = window.devicePixelRatio || 1;
  const scale = Math.min(pixelRatio, 4) * 2; // Supersample for extra sharpness.

  const fontString = `${fontWeight} ${fontSize * scale}px Inter, sans-serif`;
  ctx.font = fontString;

  const textMetrics = ctx.measureText(text);
  // Calculate base dimensions when none are provided.
  const baseWidth = width || textMetrics.width / scale + fontSize * 0.8; // Extra padding.
  const baseHeight = height || fontSize * 1.5;

  // Scale the backing canvas dimensions.
  canvas.width = Math.ceil(baseWidth * scale);
  canvas.height = Math.ceil(baseHeight * scale);

  // Background.
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Configure text rendering.
  ctx.font = fontString;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Render a gradient or solid color.
  if (textColor !== 'rgba(255, 255, 255, 1)' && !style.from) {
    ctx.fillStyle = textColor;
  } else {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, style.from);
    gradient.addColorStop(1, style.to);
    ctx.fillStyle = gradient;
  }

  // Add a scaled soft shadow for depth.
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 8 * scale;
  ctx.shadowOffsetY = 4 * scale;

  // Draw the text in the center.
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);

  // Configure the texture for maximum quality.
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  // Improve oblique views with a safe anisotropy default because the renderer is unavailable here.
  texture.anisotropy = 4;

  return texture;
};
