import { describe, expect, it } from 'vite-plus/test';
import { documentPropertyToThreeGsap, documentToThreePose, degreesToRadians } from '../utils/threeTransform';

describe('documentToThreePose', () => {
  it('mirrors CSS Y and negates all Euler axes to match the stage canvas', () => {
    const pose = documentToThreePose({
      translateX: 10,
      translateY: 20,
      translateZ: 30,
      rotateX: 15,
      rotateY: 45,
      rotateZ: 90,
      scaleX: 2,
      scaleY: 3,
      scaleZ: 4,
    });

    expect(pose.position).toEqual({ x: 10, y: -20, z: 30 });
    expect(pose.rotationRad).toEqual({
      x: degreesToRadians(-15),
      y: degreesToRadians(-45),
      z: degreesToRadians(-90),
    });
    expect(pose.scale).toEqual({ x: 2, y: 3, z: 4 });
  });
});

describe('documentPropertyToThreeGsap', () => {
  it('uses the same Y negation and rotation signs as the canvas pose', () => {
    expect(documentPropertyToThreeGsap('translateY', 50)).toEqual({
      group: 'main',
      property: 'position.y',
      value: -50,
    });
    expect(documentPropertyToThreeGsap('translateZ', 80)).toEqual({
      group: 'main',
      property: 'position.z',
      value: 80,
    });
    expect(documentPropertyToThreeGsap('rotateY', 90)).toEqual({
      group: 'pivot',
      property: 'rotation.y',
      value: degreesToRadians(-90),
    });
  });
});
