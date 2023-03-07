import React, { useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import Square from '../Square';
import Circle from '../Circle';
import * as d3 from 'd3';
import { Stats, Html } from '@react-three/drei';
import InstancedCicles from '../InstancedCircles';
import { shuffle } from '../../utils';
import gsap, { TweenLite } from 'gsap';

const radius = 0.5;
const padding = 0.2;

const pointsAmount = 80000;

const circles = Array.from({ length: pointsAmount }).map(() => ({
  r: radius + padding
}));
const pack = d3.packSiblings(circles);
const center = d3.packEnclose(pack);

const initialPositions = new Float32Array(pack.length * 3);
for (let i = 0; i < pack.length; i++) {
  initialPositions[i * 3] = pack[i].x + center.r;
  initialPositions[i * 3 + 1] = pack[i].y + center.r;
  initialPositions[i * 3 + 2] = 0;
}

const colours = Float32Array.from(
  new Array(pack.length).fill().flatMap((_, i) => [Math.random(), Math.random(), Math.random()])
);

const Scene = () => {
  const [positions, setPositions] = useState(initialPositions);

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const tweenHandler = () => {
    const newPositions = new Float32Array(positions.length);
    const shuffledPack = shuffle(pack);

    for (let i = 0; i < shuffledPack.length; i++) {
      newPositions[i * 3] = shuffledPack[i].x + center.r;
      newPositions[i * 3 + 1] = shuffledPack[i].y + center.r;
      newPositions[i * 3 + 2] = 0;
    }

    const animationObject = positions;
    newPositions.onUpdate = function () {
      const newArray = new Float32Array(animationObject.length);
      newArray.set(animationObject);
      setPositions(newArray);
    };

    TweenLite.to(animationObject, 1, newPositions);
  };

  console.log(positions);

  return (
    <>
      <group position={[-windowWidth / 2, windowHeight / 2, 0]}>
        <group position={[0, 0, 0]}>
          {/* <Circle x={center.r} y={center.r} r={center.r} /> */}
          <InstancedCicles positions={positions} colours={colours} radius={radius} />
        </group>

        {/* {pack.map((d, i) => (
          <Circle key={i} x={d.x + center.r} y={d.y + center.r} r={radius} color={'red'} />
        ))} */}
      </group>

      <Stats />

      <Html fullscreen>
        <button style={{ transform: `translate(0, 100px)` }} onClick={tweenHandler}>
          Tween!
        </button>

        <div style={{ transform: `translate(0, 120px)` }}>Points: {pointsAmount}</div>

        <div style={{ transform: `translate(0, 130px)` }}>Radius: {radius}</div>

        <div style={{ transform: `translate(0, 140px)` }}>Padding: {padding}</div>
      </Html>
    </>
  );
};

export default Scene;
