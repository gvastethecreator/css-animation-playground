const DEG_TO_RAD = Math.PI / 180;

export interface DocumentPoseInput {
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

export interface ThreePose {
  position: { x: number; y: number; z: number };
  rotationRad: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export type ThreeGsapBinding = {
  group: 'main' | 'pivot';
  property: string;
  value: number;
};

export function degreesToRadians(degrees: number): number {
  return degrees * DEG_TO_RAD;
}

export function documentToThreePose(input: DocumentPoseInput): ThreePose {
  return {
    position: { x: input.translateX, y: -input.translateY, z: input.translateZ },
    rotationRad: {
      x: degreesToRadians(-input.rotateX),
      y: degreesToRadians(-input.rotateY),
      z: degreesToRadians(-input.rotateZ),
    },
    scale: { x: input.scaleX, y: input.scaleY, z: input.scaleZ },
  };
}

export function documentPropertyToThreeGsap(key: string, value: number): ThreeGsapBinding | null {
  switch (key) {
    case 'translateX':
      return { group: 'main', property: 'position.x', value };
    case 'translateY':
      return { group: 'main', property: 'position.y', value: -value };
    case 'translateZ':
      return { group: 'main', property: 'position.z', value };
    case 'rotateX':
      return { group: 'pivot', property: 'rotation.x', value: degreesToRadians(-value) };
    case 'rotateY':
      return { group: 'pivot', property: 'rotation.y', value: degreesToRadians(-value) };
    case 'rotateZ':
      return { group: 'pivot', property: 'rotation.z', value: degreesToRadians(-value) };
    case 'scaleX':
    case 'scaleY':
    case 'scaleZ':
      return { group: 'pivot', property: key.toLowerCase(), value };
    default:
      return null;
  }
}
