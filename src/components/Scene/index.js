import React, { useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import Square from '../Square';
import Circle from '../Circle';
import * as d3 from 'd3';
import { Stats, Html } from '@react-three/drei';
import InstancedCicles from '../InstancedCircles';
import { shuffle, randomNumRange } from '../../utils';
import gsap, { TweenLite } from 'gsap';
import Color from 'color';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp, generateUUID, lerp, smootherstep, smoothstep } from 'three/src/math/MathUtils';
import { useControls } from 'leva';
import styles from './styles.scss';

const radius = 1;
const padding = radius * 0.25;

const COUNTRY_DETAILS = {
  CHINA: {
    color: 'red'
  },
  AUSTRALIA: {
    color: 'green'
  },
  INDIA: {
    color: 'blue'
  }
};

const pointsAmount = 80000;

//TODO
// make this a class
const pointsManager = {
  r: radius + padding,
  states: {
    Circle1: {
      positions: null
    },
    Circle2: {
      positions: null
    },
    Rectangles: {
      positions: null
    },
    Random: {
      positions: Array.from({ length: pointsAmount }).map(() => [
        randomNumRange(0, window.innerWidth),
        randomNumRange(0, -window.innerHeight),
        0
      ])
    }
  }
};

pointsManager.points = Array.from({ length: pointsAmount }).map((_, i) => {
  return {
    country: Object.keys(COUNTRY_DETAILS)[Math.floor(Math.random() * Object.keys(COUNTRY_DETAILS).length)],
    currentPos: { x: null, y: null },
    id: i
  };
});

const circle1 = d3.packSiblings(
  pointsManager.points.map(p => {
    return { ...p, r: pointsManager.r };
  })
);

pointsManager.states.Circle1.circle = d3.packEnclose(circle1);

pointsManager.states.Circle1.positions = circle1.map(p => [
  p.x + pointsManager.states.Circle1.circle.r,
  p.y - pointsManager.states.Circle1.circle.r,
  0
]);
pointsManager.states.Circle2.positions = shuffle(pointsManager.states.Circle1.positions);

const rectangles = d3.packSiblings(
  pointsManager.points
    .filter(p => p.country !== 'AUSTRALIA')
    .map(p => {
      return { ...p, r: pointsManager.r };
    })
);
pointsManager.states.Rectangles.circle = d3.packEnclose(rectangles);
pointsManager.states.Rectangles.positions = pointsManager.points.map(p => {
  if (p.country === 'AUSTRALIA') {
    return [-radius, -radius, 0];
  } else {
    const rect = rectangles.find(r => r.id === p.id);
    return [rect.x + pointsManager.states.Rectangles.circle.r, rect.y - pointsManager.states.Rectangles.circle.r, 0];
  }
});
console.log(rectangles);

const colours = Float32Array.from(
  new Array(pointsManager.points.length)
    .fill()
    .flatMap((_, i) => Color(COUNTRY_DETAILS[pointsManager.points[i].country].color).array())
);
pointsManager.colours = colours;

pointsManager.points.forEach((p, i) => {
  const pos = pointsManager.states.Circle1.positions[i];
  p.currentPos.x = pos[0];
  p.currentPos.y = pos[1];
});

console.log(pointsManager);

const o = new THREE.Object3D();

const Scene = () => {
  const interpolateDuration = useRef(1);
  const { pointsState } = useControls({
    pointsState: {
      value: 'Circle1',
      options: Object.keys(pointsManager.states),
      onChange: () => {
        interpolateDuration.current = 0;
      },
      transient: false
    },
    pointsAmount: {
      value: pointsAmount,
      disabled: true
    },
    padding: {
      value: padding,
      disabled: true
    },
    radius: {
      value: radius,
      disabled: true
    }
  });
  const instanceRef = useRef();

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useFrame((state, deltaTime) => {
    interpolateDuration.current = clamp((interpolateDuration.current += deltaTime * 0.3), 0, 1);

    for (let i = 0; i < pointsManager.points.length; i++) {
      const point = pointsManager.points[i];
      const toPos = pointsManager.states[pointsState].positions[i];

      const st = smoothstep(interpolateDuration.current, 0, 1);

      point.currentPos.x = lerp(point.currentPos.x, toPos[0], st);
      point.currentPos.y = lerp(point.currentPos.y, toPos[1], st);

      o.position.set(point.currentPos.x, point.currentPos.y, 0);
      o.updateMatrix();
      instanceRef.current.setMatrixAt(i, o.matrix);
    }
    instanceRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <group position={[-windowWidth / 2, windowHeight / 2, 0]}>
        {/* <group position={[pointsManager.states.Circle1.circle.r, -pointsManager.states.Circle1.circle.r, 0]}> */}
        <InstancedCicles ref={instanceRef} length={pointsManager.points.length} colours={colours} radius={radius} />
        {/* </group> */}
        {/* <Square x={windowWidth - 75} y={175} width="100" height={100} /> */}
      </group>

      <Stats className={styles.stats} />
    </>
  );
};

export default Scene;
