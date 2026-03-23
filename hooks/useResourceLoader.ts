import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { StageElement } from '../types';
import { createTextTexture } from '../utils/textureUtils';
import { safeAdd, type ThreeSceneRefs } from './useThreeSetup';

const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

/**
 * Manages loading / disposing Three.js geometry for each StageElement type.
 *
 * Depends on the stable refs returned by `useThreeSetup`.
 */
export function useResourceLoader(
  refs: ThreeSceneRefs,
  stageElement: StageElement,
  modelDataUrl: string | null,
  imageDataUrl: string | null,
) {
  useEffect(() => {
    let isCancelled = false;
    const container = refs.offsetGroup.current;
    if (!container) return;

    const cleanup = (obj: THREE.Object3D | null) => {
      if (!obj) return;
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => {
              m.map?.dispose();
              m.dispose();
            });
          } else if (child.material) {
            child.material.map?.dispose();
            child.material.dispose();
          }
        }
      });
    };

    const applyObject = (
      obj: THREE.Object3D | null,
      w: number,
      h: number,
      d: number,
    ) => {
      if (isCancelled) return;
      cleanup(refs.object.current);
      container.clear();
      refs.object.current = obj;
      refs.dimensions.current = { width: w, height: h, depth: d };

      if (obj) {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.envMapIntensity = 1;
              child.material.needsUpdate = true;
            }
          }
        });
        safeAdd(container, obj);
        if (refs.transformControls.current && refs.mainObjectContainer.current) {
          refs.transformControls.current.attach(refs.mainObjectContainer.current);
        }
      } else {
        refs.transformControls.current?.detach();
      }
    };

    switch (stageElement) {
      case 'card': {
        const group = new THREE.Group();
        const w = 288;
        const h = 384;

        const backMat = new THREE.MeshStandardMaterial({
          color: 0x27272a,
          side: THREE.FrontSide,
          roughness: 0.5,
        });
        const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), backMat);
        backPlane.name = 'card-back';
        backPlane.rotation.y = Math.PI;
        backPlane.castShadow = true;

        const baseMat = new THREE.MeshStandardMaterial({
          color: 0x27272a,
          side: THREE.FrontSide,
          transparent: true,
          opacity: 0.9,
          roughness: 0.5,
        });
        const basePlane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), baseMat);
        basePlane.name = 'card-base';
        basePlane.castShadow = true;

        safeAdd(group, backPlane, basePlane);

        textureLoader.load(
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
          (texture) => {
            if (isCancelled) return;
            texture.colorSpace = THREE.SRGBColorSpace;
            const imageMat = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              opacity: 0.9,
            });
            const imagePlane = new THREE.Mesh(
              new THREE.PlaneGeometry(w, h * 0.6),
              imageMat,
            );
            imagePlane.name = 'card-image';
            imagePlane.position.y = h * 0.2;
            imagePlane.position.z = 0.5;
            safeAdd(group, imagePlane);
          },
        );

        applyObject(group, w, h, 2);
        break;
      }
      case 'cube': {
        const size = 200;
        const geo = new THREE.BoxGeometry(size, size, size);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.1,
        });
        applyObject(new THREE.Mesh(geo, mat), size, size, size);
        break;
      }
      case 'text': {
        const geo = new THREE.PlaneGeometry(1, 1);
        const mat = new THREE.MeshBasicMaterial({
          transparent: true,
          side: THREE.DoubleSide,
        });
        applyObject(new THREE.Mesh(geo, mat), 1, 1, 1);
        break;
      }
      case 'image': {
        applyObject(null, 0, 0, 0);
        if (imageDataUrl) {
          textureLoader.load(imageDataUrl, (texture) => {
            if (isCancelled) return texture.dispose();
            texture.colorSpace = THREE.SRGBColorSpace;
            const mat = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              side: THREE.DoubleSide,
            });
            const aspect = texture.image.width / texture.image.height;
            const width = 200;
            const height = width / aspect;
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
            mesh.userData = { aspect };
            applyObject(mesh, width, height, 1);
          });
        }
        break;
      }
      case 'model': {
        applyObject(null, 0, 0, 0);
        if (modelDataUrl) {
          gltfLoader.load(
            modelDataUrl,
            (gltf) => {
              if (isCancelled) return;
              const model = gltf.scene;
              const box = new THREE.Box3().setFromObject(model);
              const size = box.getSize(new THREE.Vector3());
              const center = box.getCenter(new THREE.Vector3());
              model.position.sub(center);

              const wrapper = new THREE.Group();
              safeAdd(wrapper, model);
              wrapper.userData = { originalSize: size.clone() };

              const maxDim = Math.max(size.x, size.y, size.z);
              const scale =
                isFinite(maxDim) && maxDim > 0 ? 200 / maxDim : 1;
              model.scale.setScalar(scale);

              applyObject(
                wrapper,
                size.x * scale,
                size.y * scale,
                size.z * scale,
              );
            },
            undefined,
            (error) => {
              console.error('Error loading model:', error);
            },
          );
        }
        break;
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [stageElement, modelDataUrl, imageDataUrl, refs]);
}
