import { useFrame } from '@react-three/fiber';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { clamp, lerp } from 'three/src/math/MathUtils';

const Circle = ({ x, y, r, color = 0x000000, opacity }) => {
  const ref = useRef();
  const opacityInterpolation = useRef(1);
  const initialUpdate = useRef(true);

  useLayoutEffect(() => {
    if (initialUpdate.current) {
      initialUpdate.current = false;
      return;
    }
    opacityInterpolation.current = 0;
  }, [opacity]);

  useFrame((state, deltaTime) => {
    opacityInterpolation.current = clamp((opacityInterpolation.current += deltaTime * 0.3), 0, 1);
    ref.current.material.opacity = lerp(ref.current.material.opacity, opacity, opacityInterpolation.current);
  });

  return (
    <mesh ref={ref} position={[x, -y, 0]}>
      <circleGeometry args={[r, 32]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent />
    </mesh>
  );
};

export default Circle;
