
import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { StageStyle, TransformState, StageElement, GizmoMode } from '../types';
import { UploadCloud } from 'lucide-react';
import { createTextTexture } from '../utils/textureUtils';

interface ThreeCanvasProps {
    transforms: TransformState;
    modelDataUrl: string | null;
    imageDataUrl: string | null;
    scene: { translateX: number; translateY: number; translateZ: number };
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

const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

// Helper to prevent adding non-3D objects to the scene which causes crashes
const safeAdd = (parent: THREE.Object3D, ...children: (THREE.Object3D | null | undefined | unknown)[]) => {
    children.forEach(child => {
        if (child && child instanceof THREE.Object3D) {
            parent.add(child);
        } else if (child) {
            console.warn('ThreeCanvas: Attempted to add invalid object to scene:', child);
        }
    });
};

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
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

    // Refs for callbacks
    const onChangeRef = useRef(onChange);
    const onAdjustStartRef = useRef(onAdjustStart);
    const onAdjustEndRef = useRef(onAdjustEnd);
    const onElementClickRef = useRef(onElementClick);

    useLayoutEffect(() => {
        onChangeRef.current = onChange;
        onAdjustStartRef.current = onAdjustStart;
        onAdjustEndRef.current = onAdjustEnd;
        onElementClickRef.current = onElementClick;
    }, [onChange, onAdjustStart, onAdjustEnd, onElementClick]);

    // Scene Graph Refs - Initialize immediately to ensure availability
    const mainObjectContainerRef = useRef<THREE.Group>(new THREE.Group());
    const pivotGroupRef = useRef<THREE.Group>(new THREE.Group());
    const offsetGroupRef = useRef<THREE.Group>(new THREE.Group());
    const gridContainerRef = useRef<THREE.Group>(new THREE.Group());

    // One-time hierarchy setup
    useLayoutEffect(() => {
        // Ensure hierarchy is established only once or if broken
        if (mainObjectContainerRef.current.children.indexOf(pivotGroupRef.current) === -1) {
            safeAdd(mainObjectContainerRef.current, pivotGroupRef.current);
        }
        if (pivotGroupRef.current.children.indexOf(offsetGroupRef.current) === -1) {
            safeAdd(pivotGroupRef.current, offsetGroupRef.current);
        }
    }, []);

    const objectRef = useRef<THREE.Object3D | null>(null);
    const transformControlsRef = useRef<TransformControls | null>(null);

    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const dimensionsRef = useRef({ width: 0, height: 0, depth: 0 });

    const handleDragEvents = {
        onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                onFileChange(e.dataTransfer.files[0]);
            }
        },
    };

    // --- SETUP EFFECT ---
    useEffect(() => {
        const mountNode = mountRef.current;
        if (!mountNode) return;

        // 1. Setup Camera & Renderer
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

        // 2. Setup Lighting
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

        // 3. Add Groups to Scene
        safeAdd(scene, mainObjectContainerRef.current, gridContainerRef.current);

        // 4. Shadow Plane
        const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
        const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), shadowMaterial);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -200;
        shadowPlane.receiveShadow = true;
        safeAdd(gridContainerRef.current, shadowPlane);

        // 5. Transform Controls
        const transformControls = new TransformControls(camera, renderer.domElement);
        transformControlsRef.current = transformControls;
        safeAdd(scene, transformControls);

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
                    translateZ: -position.z
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
        transformControls.addEventListener('change', onObjectChange); // 'change' is the correct event for transform updates

        // 6. Grid Helpers
        const gridHelper = new THREE.GridHelper(4000, 80, 0x555555, 0x222222);
        gridHelper.position.y = -200;

        const lineX = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2000, 0.1, 0), new THREE.Vector3(2000, 0.1, 0)]),
            new THREE.LineBasicMaterial({ color: 0xef4444, fog: false })
        );
        lineX.position.y = -200 + 0.5;

        const lineZ = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.1, -2000), new THREE.Vector3(0, 0.1, 2000)]),
            new THREE.LineBasicMaterial({ color: 0x22c55e, fog: false })
        );
        lineZ.position.y = -200 + 0.5;

        safeAdd(gridContainerRef.current, gridHelper, lineX, lineZ);

        // 7. Handle Resize
        const handleResize = () => {
            if (!mountNode || !rendererRef.current || !cameraRef.current) return;
            rendererRef.current.setSize(mountNode.clientWidth, mountNode.clientHeight);
            cameraRef.current.aspect = mountNode.clientWidth / mountNode.clientHeight;
            cameraRef.current.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // 8. Handle Click
        const handleClick = (event: MouseEvent) => {
            if (!mountRef.current || !cameraRef.current || !offsetGroupRef.current) return;

            const rect = mountRef.current.getBoundingClientRect();
            const mouse = new THREE.Vector2();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, cameraRef.current);

            const intersects = raycaster.intersectObject(offsetGroupRef.current, true);

            if (intersects.length > 0) {
                onElementClickRef.current?.();
            }
        };
        mountNode.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('resize', handleResize);
            mountNode.removeEventListener('click', handleClick);

            transformControls.removeEventListener('dragging-changed', onDraggingChanged);
            transformControls.removeEventListener('change', onObjectChange);
            transformControls.dispose();
            scene.remove(transformControls as unknown as THREE.Object3D);

            scene.remove(mainObjectContainerRef.current);
            scene.remove(gridContainerRef.current);
            scene.remove(ambientLight, dirLight, fillLight);

            // Dispose grid helper, axis lines, shadow plane geometries & materials
            gridContainerRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
                    child.geometry?.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else if (child.material) {
                        (child.material as THREE.Material).dispose();
                    }
                }
            });
            gridContainerRef.current.clear();

            // Dispose directional light shadow maps
            dirLight.shadow.map?.dispose();

            if (rendererRef.current?.domElement) {
                mountNode.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current?.dispose();
            rendererRef.current = null;
            cameraRef.current = null;
        };
    }, []);

    // --- RESOURCE LOADING EFFECT ---
    useEffect(() => {
        let isCancelled = false;
        const container = offsetGroupRef.current;
        if (!container) return;

        const cleanup = (obj: THREE.Object3D | null) => {
            if (!obj) return;
            obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => {
                            if (m.map) m.map.dispose();
                            m.dispose();
                        });
                    } else if (child.material) {
                        if (child.material.map) child.material.map.dispose();
                        child.material.dispose();
                    }
                }
            });
        };

        const applyObject = (obj: THREE.Object3D | null, w: number, h: number, d: number) => {
            if (isCancelled) return;
            cleanup(objectRef.current);
            container.clear();
            objectRef.current = obj;
            dimensionsRef.current = { width: w, height: h, depth: d };

            if (obj) {
                obj.traverse(child => {
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
                if (transformControlsRef.current && mainObjectContainerRef.current) {
                    transformControlsRef.current.attach(mainObjectContainerRef.current);
                }
            } else {
                if (transformControlsRef.current) {
                    transformControlsRef.current.detach();
                }
            }
        };

        const loadResources = () => {
            switch (stageElement) {
                case 'card': {
                    const group = new THREE.Group();
                    const w = 288;
                    const h = 384;

                    const backMat = new THREE.MeshStandardMaterial({ color: 0x27272a, side: THREE.FrontSide, roughness: 0.5 });
                    const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), backMat);
                    backPlane.name = 'card-back';
                    backPlane.rotation.y = Math.PI;
                    backPlane.castShadow = true;

                    const baseMat = new THREE.MeshStandardMaterial({ color: 0x27272a, side: THREE.FrontSide, transparent: true, opacity: 0.9, roughness: 0.5 });
                    const basePlane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), baseMat);
                    basePlane.name = 'card-base';
                    basePlane.castShadow = true;

                    safeAdd(group, backPlane, basePlane);

                    textureLoader.load("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop", texture => {
                        if (isCancelled) return;
                        texture.colorSpace = THREE.SRGBColorSpace;
                        const imageMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.9 });
                        const imagePlane = new THREE.Mesh(new THREE.PlaneGeometry(w, h * 0.6), imageMat);
                        imagePlane.name = 'card-image';
                        imagePlane.position.y = h * 0.2;
                        imagePlane.position.z = 0.5;
                        safeAdd(group, imagePlane);
                    });

                    applyObject(group, w, h, 2);
                    break;
                }
                case 'cube': {
                    const size = 200;
                    const geo = new THREE.BoxGeometry(size, size, size);
                    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
                    const newObject = new THREE.Mesh(geo, mat);
                    applyObject(newObject, size, size, size);
                    break;
                }
                case 'text': {
                    const geo = new THREE.PlaneGeometry(1, 1);
                    const mat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide });
                    const newObject = new THREE.Mesh(geo, mat);
                    applyObject(newObject, 1, 1, 1);
                    break;
                }
                case 'image': {
                    applyObject(null, 0, 0, 0);
                    if (imageDataUrl) {
                        textureLoader.load(imageDataUrl, (texture) => {
                            if (isCancelled) return texture.dispose();
                            texture.colorSpace = THREE.SRGBColorSpace;
                            const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
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
                        gltfLoader.load(modelDataUrl, (gltf) => {
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
                            const scale = isFinite(maxDim) && maxDim > 0 ? 200 / maxDim : 1;
                            model.scale.setScalar(scale);

                            applyObject(wrapper, size.x * scale, size.y * scale, size.z * scale);
                        }, undefined, (error) => {
                            console.error("Error loading model:", error);
                        });
                    }
                    break;
                }
            }
        };

        loadResources();

        return () => { isCancelled = true; };
    }, [stageElement, modelDataUrl, imageDataUrl]);

    // --- MATERIAL & GEOMETRY UPDATE EFFECT ---
    useEffect(() => {
        const obj = objectRef.current;
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
                let color = new THREE.Color(0xffffff), opacity = 1.0;
                if (match) {
                    color = new THREE.Color(`rgb(${match[1]},${match[2]},${match[3]})`);
                    opacity = parseFloat(match[4]);
                }
                const textTexture = transforms.cubeShowNumbers ? createTextTexture(String(i + 1), 48, 700, '#FFFFFF', { from: '', to: '' }) : null;
                return new THREE.MeshStandardMaterial({
                    color, opacity, transparent: opacity < 1.0 || !!textTexture,
                    wireframe: transforms.cubeWireframe,
                    map: textTexture,
                    roughness: 0.4,
                    metalness: 0.1
                });
            });
            obj.material = materials;
        }

        if (stageElement === 'text' && obj instanceof THREE.Mesh) {
            const texture = createTextTexture('ANIMATE', transforms.fontSize, transforms.fontWeight, transforms.textColor, stageStyle.text);
            const aspect = texture.image.width / texture.image.height;
            const textHeight = transforms.fontSize * 0.8;
            const textWidth = textHeight * aspect;

            if (obj.geometry) obj.geometry.dispose();
            obj.geometry = new THREE.PlaneGeometry(textWidth, textHeight);

            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.dispose());
            } else {
                (obj.material as THREE.Material).dispose();
            }

            obj.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
            dimensionsRef.current = { width: textWidth, height: textHeight, depth: 1 };
        }

        if (stageElement === 'image' && obj instanceof THREE.Mesh && obj.userData.aspect) {
            const width = transforms.imageWidth;
            const height = width / obj.userData.aspect;
            obj.scale.set(width, height, 1);
            dimensionsRef.current = { width, height, depth: 1 };
        }

    }, [stageElement, stageStyle, transforms.fontSize, transforms.fontWeight, transforms.textColor, transforms.imageWidth, transforms.cubeShowNumbers, transforms.cubeWireframe]);


    // --- TRANSFORMS & RENDER LOOP ---
    useLayoutEffect(() => {
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        const scene = sceneRef.current;

        const mainContainer = mainObjectContainerRef.current;
        const pivotGroup = pivotGroupRef.current;
        const offsetGroup = offsetGroupRef.current;
        const object = objectRef.current;

        if (!renderer || !camera || !scene || !mainContainer || !pivotGroup || !offsetGroup) return;

        // Background color
        const bgMatch = stageStyle.stage.background.match(/#([0-9a-f]{6})/i);
        scene.background = new THREE.Color(bgMatch ? bgMatch[0] : '#09090b');

        // Config GIZMO
        if (transformControlsRef.current) {
            const controls = transformControlsRef.current;
            if (object) {
                if (controls.mode !== gizmoMode) controls.setMode(gizmoMode as 'translate' | 'rotate' | 'scale');
                if (gizmoMode === 'translate') {
                    if (controls.object !== mainContainer) controls.attach(mainContainer);
                } else {
                    if (controls.object !== pivotGroup) controls.attach(pivotGroup);
                }
                controls.enabled = true;
                (controls as unknown as THREE.Object3D).visible = true;
            } else {
                controls.detach();
                (controls as unknown as THREE.Object3D).visible = false;
                controls.enabled = false;
            }
        }

        if (object) {
            // Visual Updates (Wireframe/Opacity)
            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    (Array.isArray(child.material) ? child.material : [child.material]).forEach(m => {
                        if (m) {
                            m.wireframe = (stageElement === 'model' && transforms.modelWireframe) || (stageElement === 'cube' && transforms.cubeWireframe);
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
            const { translateX, translateY, translateZ, rotateX, rotateY, rotateZ, scaleX, scaleY, scaleZ, transformOriginX, transformOriginY, transformOriginZ } = transforms;

            mainContainer.position.set(translateX, -translateY, translateZ);

            pivotGroup.rotation.set(
                THREE.MathUtils.degToRad(-rotateX),
                THREE.MathUtils.degToRad(-rotateY),
                THREE.MathUtils.degToRad(-rotateZ),
                'YXZ'
            );
            pivotGroup.scale.set(scaleX, scaleY, scaleZ);

            // Calculate offset to simulate transform-origin
            offsetGroup.position.x = -((transformOriginX - 50) / 100 * dimensionsRef.current.width);
            offsetGroup.position.y = ((transformOriginY - 50) / 100 * dimensionsRef.current.height);
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
            camera.fov = 2 * Math.atan((mountNode.clientHeight / 2) / perspective) * (180 / Math.PI);
            camera.updateProjectionMatrix();
        }

        if (gridContainerRef.current) {
            const gridGroup = gridContainerRef.current;
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
                        <UploadCloud size={48} className={`transition-colors ${isDraggingOver ? 'text-indigo-400' : 'text-zinc-600'}`} />
                        <p className={`mt-4 font-bold text-lg transition-colors ${isDraggingOver ? 'text-indigo-300' : 'text-zinc-500'}`}>
                            Drop {stageElement === 'image' ? 'Image/Video' : '3D Model'} here
                        </p>
                        <p className={`mt-1 text-sm transition-colors ${isDraggingOver ? 'text-indigo-400' : 'text-zinc-600'}`}>
                            or click to browse
                        </p>
                        <input id={`stage-file-upload-three-${stageElement}`} type="file" className="hidden" onChange={(e) => e.target.files && onFileChange(e.target.files[0])} accept={stageElement === 'image' ? "image/*,video/webm" : ".gltf,.glb"} />
                    </label>
                </div>
            )}
        </div>
    );
};

export default ThreeCanvas;
