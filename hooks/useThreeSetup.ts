import { useRef, useEffect, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { reportRuntimeIssue } from '../utils/runtimeDiagnostics.ts';

/** Safely add three.js objects to a parent, skipping non-Object3D values. */
export const safeAdd = (parent: THREE.Object3D, ...children: unknown[]) => {
  for (const child of children) {
    if (child instanceof THREE.Object3D) {
      parent.add(child);
    } else if (child) {
      reportRuntimeIssue('three.safe-add', child, 'ThreeCanvas attempted to add an invalid object to the scene.');
    }
  }
};

export interface ThreeSceneRefs {
  renderer: React.RefObject<THREE.WebGLRenderer | null>;
  camera: React.RefObject<THREE.PerspectiveCamera | null>;
  scene: React.RefObject<THREE.Scene>;
  mainObjectContainer: React.RefObject<THREE.Group>;
  pivotGroup: React.RefObject<THREE.Group>;
  offsetGroup: React.RefObject<THREE.Group>;
  gridContainer: React.RefObject<THREE.Group>;
  transformControls: React.RefObject<TransformControls | null>;
  transformControlsHelper: React.RefObject<THREE.Object3D | null>;
  object: React.MutableRefObject<THREE.Object3D | null>;
  dimensions: React.MutableRefObject<{ width: number; height: number; depth: number }>;
}

interface SetupCallbacks {
  onChange: (updates: Record<string, number>) => void;
  onAdjustStart: () => void;
  onAdjustEnd: () => void;
  onElementClick?: () => void;
}

/**
 * Initialises the Three.js renderer, camera, lighting, shadow plane,
 * grid helpers, transform controls and input handlers.
 *
 * Returns stable refs that the consumer can use in follow-up effects.
 */
export function useThreeSetup(mountRef: React.RefObject<HTMLDivElement | null>, callbacks: SetupCallbacks) {
  // ---- Refs ----
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mainObjectContainerRef = useRef<THREE.Group>(new THREE.Group());
  const pivotGroupRef = useRef<THREE.Group>(new THREE.Group());
  const offsetGroupRef = useRef<THREE.Group>(new THREE.Group());
  const gridContainerRef = useRef<THREE.Group>(new THREE.Group());
  const objectRef = useRef<THREE.Object3D | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const transformControlsHelperRef = useRef<THREE.Object3D | null>(null);
  const dimensionsRef = useRef({ width: 0, height: 0, depth: 0 });

  // Keep callback refs in sync without re-running the setup effect.
  const onChangeRef = useRef(callbacks.onChange);
  const onAdjustStartRef = useRef(callbacks.onAdjustStart);
  const onAdjustEndRef = useRef(callbacks.onAdjustEnd);
  const onElementClickRef = useRef(callbacks.onElementClick);

  useLayoutEffect(() => {
    onChangeRef.current = callbacks.onChange;
    onAdjustStartRef.current = callbacks.onAdjustStart;
    onAdjustEndRef.current = callbacks.onAdjustEnd;
    onElementClickRef.current = callbacks.onElementClick;
  }, [callbacks.onChange, callbacks.onAdjustStart, callbacks.onAdjustEnd, callbacks.onElementClick]);

  // ---- One-time hierarchy setup ----
  useLayoutEffect(() => {
    if (!mainObjectContainerRef.current.children.includes(pivotGroupRef.current)) {
      safeAdd(mainObjectContainerRef.current, pivotGroupRef.current);
    }
    if (!pivotGroupRef.current.children.includes(offsetGroupRef.current)) {
      safeAdd(pivotGroupRef.current, offsetGroupRef.current);
    }
  }, []);

  // ---- Main setup effect (runs once) ----
  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    // Camera & Renderer
    const camera = new THREE.PerspectiveCamera(75, mountNode.clientWidth / mountNode.clientHeight, 0.1, 20000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountNode.appendChild(renderer.domElement);

    cameraRef.current = camera;
    rendererRef.current = renderer;

    const scene = sceneRef.current;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(500, 1000, 800);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    const d = 1500;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-500, 0, -500);

    safeAdd(scene, ambientLight, dirLight, fillLight);

    // Add groups to scene
    safeAdd(scene, mainObjectContainerRef.current, gridContainerRef.current);

    // Shadow plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.ShadowMaterial({ opacity: 0.2 }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -200;
    shadowPlane.receiveShadow = true;
    safeAdd(gridContainerRef.current, shadowPlane);

    // Transform controls
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControlsRef.current = transformControls;
    const transformControlsHelper = transformControls.getHelper();
    transformControlsHelperRef.current = transformControlsHelper;
    safeAdd(scene, transformControlsHelper);

    const onDraggingChanged = (event: any) => {
      if (event.value) onAdjustStartRef.current();
      else onAdjustEndRef.current();
    };

    const onObjectChange = () => {
      if (!transformControls.object) return;
      const target = transformControls.object;

      if (target === mainObjectContainerRef.current) {
        const { position } = target;
        onChangeRef.current({
          translateX: position.x,
          translateY: -position.y,
          translateZ: -position.z,
        });
      } else if (target === pivotGroupRef.current) {
        const { rotation, scale } = target;
        onChangeRef.current({
          rotateX: -THREE.MathUtils.radToDeg(rotation.x),
          rotateY: THREE.MathUtils.radToDeg(rotation.y),
          rotateZ: THREE.MathUtils.radToDeg(rotation.z),
          scaleX: scale.x,
          scaleY: scale.y,
          scaleZ: scale.z,
        });
      }
    };

    transformControls.addEventListener('dragging-changed', onDraggingChanged);
    transformControls.addEventListener('change', onObjectChange);

    // Grid helpers
    const gridHelper = new THREE.GridHelper(4000, 80, 0x555555, 0x222222);
    gridHelper.position.y = -200;

    const lineX = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2000, 0.1, 0), new THREE.Vector3(2000, 0.1, 0)]),
      new THREE.LineBasicMaterial({ color: 0xef4444, fog: false }),
    );
    lineX.position.y = -200 + 0.5;

    const lineZ = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.1, -2000), new THREE.Vector3(0, 0.1, 2000)]),
      new THREE.LineBasicMaterial({ color: 0x22c55e, fog: false }),
    );
    lineZ.position.y = -200 + 0.5;

    safeAdd(gridContainerRef.current, gridHelper, lineX, lineZ);

    // Resize handler
    const handleResize = () => {
      if (!mountNode || !rendererRef.current || !cameraRef.current) return;
      rendererRef.current.setSize(mountNode.clientWidth, mountNode.clientHeight);
      cameraRef.current.aspect = mountNode.clientWidth / mountNode.clientHeight;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Click handler (ray-cast)
    const handleClick = (event: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current || !offsetGroupRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      if (raycaster.intersectObject(offsetGroupRef.current, true).length > 0) {
        onElementClickRef.current?.();
      }
    };
    mountNode.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountNode.removeEventListener('click', handleClick);
      transformControls.removeEventListener('dragging-changed', onDraggingChanged);
      transformControls.removeEventListener('change', onObjectChange);
      transformControls.dispose();
      if (transformControlsHelperRef.current) {
        scene.remove(transformControlsHelperRef.current);
      }
      scene.remove(mainObjectContainerRef.current);
      scene.remove(gridContainerRef.current);
      scene.remove(ambientLight, dirLight, fillLight);

      gridContainerRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else if (child.material) {
            (child.material as THREE.Material).dispose();
          }
        }
      });
      gridContainerRef.current.clear();
      dirLight.shadow.map?.dispose();

      if (rendererRef.current?.domElement) {
        mountNode.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
      rendererRef.current = null;
      cameraRef.current = null;
      transformControlsHelperRef.current = null;
    };
  }, []);

  return {
    renderer: rendererRef,
    camera: cameraRef,
    scene: sceneRef,
    mainObjectContainer: mainObjectContainerRef,
    pivotGroup: pivotGroupRef,
    offsetGroup: offsetGroupRef,
    gridContainer: gridContainerRef,
    transformControls: transformControlsRef,
    transformControlsHelper: transformControlsHelperRef,
    object: objectRef,
    dimensions: dimensionsRef,
  } satisfies ThreeSceneRefs;
}
