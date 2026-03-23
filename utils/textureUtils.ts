
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
    height?: number
): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Optimización High-DPI: Usar devicePixelRatio pero limitar a 4x para evitar uso excesivo de VRAM
    const pixelRatio = window.devicePixelRatio || 1;
    const scale = Math.min(pixelRatio, 4) * 2; // Factor de sobremuestreo para nitidez extra
    
    const fontString = `${fontWeight} ${fontSize * scale}px Inter, sans-serif`;
    ctx.font = fontString;
    
    const textMetrics = ctx.measureText(text);
    // Calcular dimensiones base si no se proveen
    const baseWidth = width || (textMetrics.width / scale + fontSize * 0.8); // Padding extra
    const baseHeight = height || (fontSize * 1.5);

    // Dimensiones reales del canvas (escaladas)
    canvas.width = Math.ceil(baseWidth * scale);
    canvas.height = Math.ceil(baseHeight * scale);

    // Fondo
    if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Configuración de texto
    ctx.font = fontString;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Renderizado de gradiente o color sólido
    if (textColor !== 'rgba(255, 255, 255, 1)' && !style.from) { 
        ctx.fillStyle = textColor;
    } else { 
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, style.from);
        gradient.addColorStop(1, style.to);
        ctx.fillStyle = gradient;
    }

    // Sombra suave para profundidad (escalada)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8 * scale;
    ctx.shadowOffsetY = 4 * scale;

    // Dibujar texto en el centro
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    // Configuración de textura para máxima calidad
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    
    // Anisotropía para mejorar la vista en ángulos oblicuos
    // (Asumiendo un valor seguro por defecto, ya que no tenemos acceso al renderer aquí)
    texture.anisotropy = 4; 
    
    return texture;
};
