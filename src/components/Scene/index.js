import React, { useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import Square from '../Square';
import Circle from '../Circle';
import * as d3 from 'd3';
import { Stats, Html } from '@react-three/drei';
import InstancedCicles from '../InstancedCircles';
import { shuffle, randomNumRange } from '../../utils';
import gsap, { TweenLite } from 'gsap';
import Color from 'color';

const radius = 2;
const padding = radius * 0.25;

const COUNTRIES = ['CHINA', 'AUSTRALIA', 'INDIA'];

const COUNTRY_COLORS = {
  CHINA: 'red',
  AUSTRALIA: 'green',
  INDIA: 'blue'
};

const CHINA_COLOR = 'red';
const AUSTRALIA_COLOR = 'green';
const INDIA_COLOR = 'blue';

const pointsAmount = 32000;

const circles = Array.from({ length: pointsAmount }).map(() => ({
  r: radius + padding,
  country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]
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
  new Array(pack.length).fill().flatMap((_, i) => Color(COUNTRY_COLORS[pack[i].country]).array())
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
