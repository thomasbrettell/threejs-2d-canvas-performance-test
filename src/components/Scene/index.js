import React from 'react';
import useWindowSize from '../hooks/useWindowSize';
import Square from '../Square';
import Circle from '../Circle';
import * as d3 from 'd3';
import { Stats } from '@react-three/drei';
import InstancedCicles from '../InstancedCircles';

const radius = 1;
const padding = 0.1;

const circles = Array.from({ length: 80000 }).map(() => ({
  r: radius + padding
}));
const pack = d3.packSiblings(circles);
const center = d3.packEnclose(pack);

const positions = new Float32Array(pack.length * 3);
for (let i = 0; i < pack.length; i++) {
  positions[i * 3] = pack[i].x + center.r;
  positions[i * 3 + 1] = pack[i].y + center.r;
  positions[i * 3 + 2] = 0;
}

const Scene = () => {
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  return (
    <>
      <group position={[-windowWidth / 2, windowHeight / 2, 0]}>
        {/* <Circle x={center.r} y={center.r} r={center.r} /> */}

        <group position={[30, -30, 0]}>
          <InstancedCicles data={{ positions }} />
        </group>

        {/* {pack.map((d, i) => (
          <Circle key={i} x={d.x + center.r} y={d.y + center.r} r={radius} color={'red'} />
        ))} */}
      </group>

      <Stats />
    </>
  );
};

export default Scene;
