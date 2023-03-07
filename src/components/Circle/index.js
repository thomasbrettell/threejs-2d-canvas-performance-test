import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import { randomNumRange } from '../../utils';

const Circle = ({ x, y, r, color = 0x000000, move }) => {
  const ref = useRef();

  useFrame(() => {
    if (move) {
      ref.current.position.x += randomNumRange(-0.5, 0.5);
      ref.current.position.y += randomNumRange(-0.5, 0.5);
    }
  });

  return (
    <mesh ref={ref} position={[x, -y, 0]}>
      <circleGeometry args={[r, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

export default Circle;
