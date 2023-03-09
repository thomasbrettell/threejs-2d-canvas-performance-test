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

const points = Array.from({ length: pointsAmount }).map(() => {
  return {
    r: radius + padding,
    country: Object.keys(COUNTRY_DETAILS)[Math.floor(Math.random() * Object.keys(COUNTRY_DETAILS).length)]
  };
});

const STATES = ['Circle 1', 'Circle 2', 'Rectangles'];

const pack = d3.packSiblings(points);
const pack2 = shuffle(pack);

const center = d3.packEnclose(pack);

const colours = Float32Array.from(
  new Array(pack.length).fill().flatMap((_, i) => Color(COUNTRY_DETAILS[pack[i].country].color).array())
);

let isPack1 = true;

const o = new THREE.Object3D();

const Scene = () => {
  const instanceRef = useRef();
  const currentPositions = useRef(pack);
  const newPositions = useRef(pack);
  const interpolateDuration = useRef(1);

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useFrame((state, deltaTime) => {
    interpolateDuration.current = clamp((interpolateDuration.current += deltaTime * 0.99), 0, 1);

    for (let i = 0; i < currentPositions.current.length; i++) {
      const pos = currentPositions.current[i];
      const toPos = newPositions.current[i];

      const st = smoothstep(interpolateDuration.current, 0, 1);

      o.position.set(lerp(pos.x, toPos.x, st), lerp(pos.y, toPos.y, st), 0);
      o.updateMatrix();
      instanceRef.current.setMatrixAt(i, o.matrix);
    }
    instanceRef.current.instanceMatrix.needsUpdate = true;
  });

  const tweenHandler = () => {
    interpolateDuration.current = Math.abs(interpolateDuration.current - 1);
    if (isPack1) {
      isPack1 = false;
      newPositions.current = pack2;
      currentPositions.current = pack;
    } else {
      isPack1 = true;
      newPositions.current = pack;
      currentPositions.current = pack2;
    }
  };

  return (
    <>
      <group position={[-windowWidth / 2, windowHeight / 2, 0]}>
        <group position={[center.r, -center.r, 0]}>
          <InstancedCicles
            ref={instanceRef}
            length={currentPositions.current.length}
            colours={colours}
            radius={radius}
          />
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
