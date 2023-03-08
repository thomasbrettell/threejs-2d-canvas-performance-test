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
import { clamp, lerp } from 'three/src/math/MathUtils';

const radius = 1;
const padding = radius * 0.25;

const COUNTRIES = ['CHINA', 'AUSTRALIA', 'INDIA'];

const COUNTRY_COLORS = {
  CHINA: 'red',
  AUSTRALIA: 'green',
  INDIA: 'blue'
};

const pointsAmount = 100000;

const circles = Array.from({ length: pointsAmount }).map(() => ({
  r: radius + padding,
  country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]
}));

const pack = d3.packSiblings(circles);
const pack2 = shuffle(pack);

const center = d3.packEnclose(pack);

// const makeIntoArray = (a) => {
//   const array = []
//   for(let i = 0,)
// }

const initialPositions = new Float32Array(pack.length * 3);
for (let i = 0; i < pack.length; i++) {
  initialPositions[i * 3] = pack[i].x + center.r;
  initialPositions[i * 3 + 1] = pack[i].y + center.r;
  initialPositions[i * 3 + 2] = 0;
}

const colours = Float32Array.from(
  new Array(pack.length).fill().flatMap((_, i) => Color(COUNTRY_COLORS[pack[i].country]).array())
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
    interpolateDuration.current = clamp((interpolateDuration.current += deltaTime), 0, 1);

    for (let i = 0; i < currentPositions.current.length; i++) {
      const pos = currentPositions.current[i];
      const toPos = newPositions.current[i];

      o.position.set(
        lerp(pos.x, toPos.x, interpolateDuration.current),
        lerp(pos.y, toPos.y, interpolateDuration.current),
        0
      );
      o.updateMatrix();
      instanceRef.current.setMatrixAt(i, o.matrix);
    }
    instanceRef.current.instanceMatrix.needsUpdate = true;
  });

  const tweenHandler = () => {
    if (isPack1) {
      isPack1 = false;
      newPositions.current = pack2;
      currentPositions.current = pack;
      interpolateDuration.current = 0;
    } else {
      isPack1 = true;
      newPositions.current = pack;
      currentPositions.current = pack2;
      interpolateDuration.current = 0;
    }
    // const newPositions = new Float32Array(positions.length);
    // const shuffledPack = shuffle(pack);

    // for (let i = 0; i < shuffledPack.length; i++) {
    //   newPositions[i * 3] = shuffledPack[i].x + center.r;
    //   newPositions[i * 3 + 1] = shuffledPack[i].y + center.r;
    //   newPositions[i * 3 + 2] = 0;
    // }

    // const animationObject = positions;
    // newPositions.onUpdate = function () {
    //   const newArray = new Float32Array(animationObject.length);
    //   newArray.set(animationObject);
    //   setPositions(newArray);
    // };

    // TweenLite.to(animationObject, 1, newPositions);
  };

  return (
    <>
      <group position={[-windowWidth / 2, windowHeight / 2, 0]}>
        <group position={[center.r, -center.r, 0]}>
          {/* <Circle x={center.r} y={center.r} r={center.r} /> */}
          <InstancedCicles
            ref={instanceRef}
            length={currentPositions.current.length}
            colours={colours}
            radius={radius}
          />
        </group>

        {/* {pack.map((d, i) => (
          <Circle key={i} x={d.x + center.r} y={d.y + center.r} r={radius} color={'red'} />
        ))} */}
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
        </div>
      </Html>
    </>
  );
};

export default Scene;
