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
import { clamp, lerp, smootherstep, smoothstep } from 'three/src/math/MathUtils';

const radius = 1;
const padding = radius * 0.25;

const COUNTRIES = ['CHINA', 'AUSTRALIA', 'INDIA'];

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
    rectangles: {
      positions: null
    }
  }
};

pointsManager.points = Array.from({ length: pointsAmount }).map(() => {
  return {
    country: Object.keys(COUNTRY_DETAILS)[Math.floor(Math.random() * Object.keys(COUNTRY_DETAILS).length)],
    currentPos: { x: null, y: null }
  };
});

const STATES = ['Circle 1', 'Circle 2', 'Rectangles'];

const circle1 = d3.packSiblings(
  pointsManager.points.map(p => {
    return { ...p, r: pointsManager.r };
  })
);

pointsManager.states.Circle1.circle = d3.packEnclose(circle1);

pointsManager.states.Circle1.positions = circle1.map(p => [p.x, p.y, 0]);
pointsManager.states.Circle2.positions = shuffle(pointsManager.states.Circle1.positions);

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
  const instanceRef = useRef();
  const pointsState = useRef('Circle1');
  const interpolateDuration = useRef(1);

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useFrame((state, deltaTime) => {
    interpolateDuration.current = clamp((interpolateDuration.current += deltaTime * 0.3), 0, 1);

    for (let i = 0; i < pointsManager.points.length; i++) {
      const point = pointsManager.points[i];
      const toPos = pointsManager.states[pointsState.current].positions[i];

      const st = smoothstep(interpolateDuration.current, 0, 1);

      point.currentPos.x = lerp(point.currentPos.x, toPos[0], st);
      point.currentPos.y = lerp(point.currentPos.y, toPos[1], st);

      o.position.set(point.currentPos.x, point.currentPos.y, 0);
      o.updateMatrix();
      instanceRef.current.setMatrixAt(i, o.matrix);
    }
    instanceRef.current.instanceMatrix.needsUpdate = true;
  });

  const tweenHandler = () => {
    interpolateDuration.current = 0;
    if (pointsState.current === 'Circle1') {
      pointsState.current = 'Circle2';
    } else {
      pointsState.current = 'Circle1';
    }
  };

  return (
    <>
      <group position={[-windowWidth / 2, windowHeight / 2, 0]}>
        <group position={[pointsManager.states.Circle1.circle.r, -pointsManager.states.Circle1.circle.r, 0]}>
          <InstancedCicles ref={instanceRef} length={pointsManager.points.length} colours={colours} radius={radius} />
        </group>
        <Square x={windowWidth - 75} y={175} width="100" height={100} />
      </group>

      <Stats />

      <Html fullscreen>
        <div
          style={{
            background: 'lightgrey',
            position: 'absolute',
            top: '0',
            right: '0'
          }}
        >
          <button onClick={tweenHandler}>Tween!</button>
          <div>Points: {pointsAmount}</div>
          <div>Radius: {radius}</div>
          <div>Padding: {padding}</div>

          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
            {STATES.map(state => (
              <button key={state}>{state}</button>
            ))}
          </div>
        </div>
      </Html>
    </>
  );
};

export default Scene;
