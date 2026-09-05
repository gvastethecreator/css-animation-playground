import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import * as THREE from 'three';
import { StageStyle, TransformState, StageElement, GizmoMode, StageViewportState } from '../types';
import { UploadCloud } from 'lucide-react';
import { createTextTexture } from '../utils/textureUtils';
import { useThreeSetup } from '../hooks/useThreeSetup';
import { useResourceLoader } from '../hooks/useResourceLoader';
import { documentToThreePose } from '../utils/threeTransform';

interface ThreeCanvasProps {
  transforms: TransformState;
  modelDataUrl: string | null;
  imageDataUrl: string | null;
  scene: StageViewportState;
  stageElement: StageElement;
  showGrid: boolean;
  alignGridToView: boolean;
  stageStyle: StageStyle;
  isExploded: boolean;
  onFileChange: (file: File) => void;
  gizmoMode: GizmoMode;
  onChange: (updates: Partial<TransformState>) => void;
  onAdjustStart: () => void;
  onAdjustEnd: () => void;
  onElementClick?: () => void;
}

const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  transforms,
  modelDataUrl,
  imageDataUrl,
  scene: cameraOffset,
  stageElement,
  showGrid,
  alignGridToView,
  stageStyle,
  isExploded,
  onFileChange,
  gizmoMode,
  onChange,
  onAdjustStart,
  onAdjustEnd,
  onElementClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const refs = useThreeSetup(mountRef, { onChange, onAdjustStart, onAdjustEnd, onElementClick });
  useResourceLoader(refs, stageElement, modelDataUrl, imageDataUrl);

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragEvents = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileChange(e.dataTransfer.files[0]);
      }
    },
  };

  // --- MATERIAL & GEOMETRY UPDATE EFFECT ---
  useEffect(() => {
    const obj = refs.object.current;
    if (!obj) return;

    if (stageElement === 'card' && obj instanceof THREE.Group) {
      const back = obj.getObjectByName('card-back') as THREE.Mesh;
      const base = obj.getObjectByName('card-base') as THREE.Mesh;
      if (back && back.material instanceof THREE.MeshStandardMaterial) back.material.color.set(stageStyle.card.base);
      if (base && base.material instanceof THREE.MeshStandardMaterial) base.material.color.set(stageStyle.card.base);
    }

    if (stageElement === 'cube' && obj instanceof THREE.Mesh) {
      const materials = stageStyle.cube.map((colorStr, i) => {
        const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        let color = new THREE.Color(0xffffff),
          opacity = 1.0;
        if (match) {
          color = new THREE.Color(`rgb(${match[1]},${match[2]},${match[3]})`);
          opacity = parseFloat(match[4]);
        }
        const textTexture = transforms.cubeShowNumbers
          ? createTextTexture(String(i + 1), 48, 700, '#FFFFFF', { from: '', to: '' })
          : null;
        return new THREE.MeshStandardMaterial({
          color,
          opacity,
          transparent: opacity < 1.0 || !!textTexture,
          wireframe: transforms.cubeWireframe,
          map: textTexture,
          roughness: 0.4,
          metalness: 0.1,
        });
      });
      obj.material = materials;
    }

    if (stageElement === 'text' && obj instanceof THREE.Mesh) {
      const texture = createTextTexture(
        'ANIMATE',
        transforms.fontSize,
        transforms.fontWeight,
        transforms.textColor,
        stageStyle.text,
      );
      const aspect = texture.image.width / texture.image.height;
      const textHeight = transforms.fontSize * 0.8;
      const textWidth = textHeight * aspect;

      if (obj.geometry) obj.geometry.dispose();
      obj.geometry = new THREE.PlaneGeometry(textWidth, textHeight);

      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        (obj.material as THREE.Material).dispose();
      }

      obj.material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      refs.dimensions.current = { width: textWidth, height: textHeight, depth: 1 };
    }

    if (stageElement === 'image' && obj instanceof THREE.Mesh && obj.userData.aspect) {
      const width = transforms.imageWidth;
      const height = width / obj.userData.aspect;
      obj.scale.set(width, height, 1);
      refs.dimensions.current = { width, height, depth: 1 };
    }
  }, [
    stageElement,
    stageStyle,
    transforms.fontSize,
    transforms.fontWeight,
    transforms.textColor,
    transforms.imageWidth,
    transforms.cubeShowNumbers,
    transforms.cubeWireframe,
  ]);

  // --- TRANSFORMS & RENDER LOOP ---
  useLayoutEffect(() => {
    const renderer = refs.renderer.current;
    const camera = refs.camera.current;
    const scene = refs.scene.current;

    const mainContainer = refs.mainObjectContainer.current;
    const pivotGroup = refs.pivotGroup.current;
    const offsetGroup = refs.offsetGroup.current;
    const object = refs.object.current;

    if (!renderer || !camera || !scene || !mainContainer || !pivotGroup || !offsetGroup) return;

    // Background color
    const bgMatch = stageStyle.stage.background.match(/#([0-9a-f]{6})/i);
    scene.background = new THREE.Color(bgMatch ? bgMatch[0] : '#09090b');

    // Config GIZMO
    if (refs.transformControls.current) {
      const controls = refs.transformControls.current;
      const controlsHelper = refs.transformControlsHelper.current;
      // Three.js TransformControls only supports translate/rotate/scale — skip 'skew'
      const effectiveMode = gizmoMode === 'skew' ? 'translate' : gizmoMode;
      if (object) {
        if (controls.mode !== effectiveMode) controls.setMode(effectiveMode);
        if (effectiveMode === 'translate') {
          if (controls.object !== mainContainer) controls.attach(mainContainer);
        } else {
          if (controls.object !== pivotGroup) controls.attach(pivotGroup);
        }
        controls.enabled = true;
        if (controlsHelper) controlsHelper.visible = true;
      } else {
        controls.detach();
        if (controlsHelper) controlsHelper.visible = false;
        controls.enabled = false;
      }
    }

    if (object) {
      // Visual Updates (Wireframe/Opacity)
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          (Array.isArray(child.material) ? child.material : [child.material]).forEach((m) => {
            if (m) {
              m.wireframe =
                (stageElement === 'model' && transforms.modelWireframe) ||
                (stageElement === 'cube' && transforms.cubeWireframe);
              const targetOpacity = transforms.opacityEnabled ? transforms.opacity : 1.0;
              if (m.opacity !== targetOpacity) {
                m.opacity = targetOpacity;
                m.transparent = m.opacity < 1.0;
                m.needsUpdate = true;
              }
            }
          });
        }
      });

      // Layer explosion logic
      if (stageElement === 'card' && object instanceof THREE.Group) {
        const layers = object.children as THREE.Mesh[];
        const midIndex = Math.floor(layers.length / 2);
        layers.forEach((layer, index) => {
          layer.position.z = isExploded ? (index - midIndex) * 60 : (index - midIndex) * 0.1;
        });
      }

      // APPLY TRANSFORMS
      const {
        translateX,
        translateY,
        translateZ,
        rotateX,
        rotateY,
        rotateZ,
        scaleX,
        scaleY,
        scaleZ,
        transformOriginX,
        transformOriginY,
        transformOriginZ,
      } = transforms;

      const pose = documentToThreePose({
        translateX,
        translateY,
        translateZ,
        rotateX,
        rotateY,
        rotateZ,
        scaleX,
        scaleY,
        scaleZ,
      });
      mainContainer.position.set(pose.position.x, pose.position.y, pose.position.z);
      pivotGroup.rotation.set(pose.rotationRad.x, pose.rotationRad.y, pose.rotationRad.z, 'YXZ');
      pivotGroup.scale.set(pose.scale.x, pose.scale.y, pose.scale.z);

      // Calculate offset to simulate transform-origin
      offsetGroup.position.x = -(((transformOriginX - 50) / 100) * refs.dimensions.current.width);
      offsetGroup.position.y = ((transformOriginY - 50) / 100) * refs.dimensions.current.height;
      offsetGroup.position.z = -transformOriginZ;
    }

    // Camera & Grid Updates
    const { perspective } = transforms;
    const mountNode = mountRef.current;
    if (mountNode) {
      camera.position.x = cameraOffset.translateX;
      camera.position.y = -cameraOffset.translateY;
      camera.position.z = perspective + cameraOffset.translateZ;

      // FOV calculation to match CSS Perspective
      camera.fov = 2 * Math.atan(mountNode.clientHeight / 2 / perspective) * (180 / Math.PI);
      camera.updateProjectionMatrix();
    }

    if (refs.gridContainer.current) {
      const gridGroup = refs.gridContainer.current;
      gridGroup.visible = showGrid;
      if (showGrid) {
        gridGroup.rotation.set(0, 0, 0);
        if (alignGridToView) gridGroup.rotation.copy(pivotGroup.rotation);
        gridGroup.position.copy(mainContainer.position);
      }
    }

    renderer.render(scene, camera);
  }, [transforms, cameraOffset, stageStyle, showGrid, alignGridToView, isExploded, stageElement, gizmoMode]);

  const showPlaceholder = (stageElement === 'image' && !imageDataUrl) || (stageElement === 'model' && !modelDataUrl);

  return (
    <div className="absolute inset-0 w-full h-full" {...handleDragEvents} onMouseDown={(e) => e.stopPropagation()}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
      {showPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <label
            htmlFor={`stage-file-upload-three-${stageElement}`}
            className={`w-80 h-80 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors pointer-events-auto ${isDraggingOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'}`}
          >
            <UploadCloud
              size={48}
              className={`transition-colors ${isDraggingOver ? 'text-indigo-400' : 'text-zinc-600'}`}
            />
            <p
              className={`mt-4 font-bold text-lg transition-colors ${isDraggingOver ? 'text-indigo-300' : 'text-zinc-500'}`}
            >
              Drop {stageElement === 'image' ? 'Image/Video' : '3D Model'} here
            </p>
            <p className={`mt-1 text-sm transition-colors ${isDraggingOver ? 'text-indigo-400' : 'text-zinc-600'}`}>
              or click to browse
            </p>
            <input
              id={`stage-file-upload-three-${stageElement}`}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files && onFileChange(e.target.files[0])}
              accept={stageElement === 'image' ? 'image/*,video/webm' : '.gltf,.glb'}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default React.memo(ThreeCanvas);
