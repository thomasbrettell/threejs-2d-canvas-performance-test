import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';

const Square = ({ x, y, width, height, color = 0x000000 }) => {
  const ref = useRef();

  useFrame(() => {
    ref.current.rotation.z += 0.01;
  });

  return (
    <mesh ref={ref} position={[x, -y, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

export default Square;
