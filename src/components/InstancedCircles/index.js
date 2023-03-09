import React, { forwardRef } from 'react';

const InstancedCicles = forwardRef(({ length, radius, color = 'black', colours }, ref) => {
  return (
    <instancedMesh ref={ref} args={[null, null, length]}>
      <circleGeometry args={[radius, 8, 8]}>
        <instancedBufferAttribute attach="attributes-color" args={[colours, 3]} />
      </circleGeometry>
      <meshBasicMaterial toneMapped={false} vertexColors />
    </instancedMesh>
  );
});

export default InstancedCicles;
