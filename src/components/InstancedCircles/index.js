import React, { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';

const o = new THREE.Object3D();

const InstancedCicles = ({ positions, radius, color = 'black', colours }) => {
  const length = positions.length / 3;
  const ref = useRef();

  useLayoutEffect(() => {
    for (let i = 0; i < positions.length; i += 3) {
      const id = i / 3;
      o.position.set(positions[i], -positions[i + 1], positions[i + 2]);
      o.updateMatrix();
      ref.current.setMatrixAt(id, o.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh ref={ref} args={[null, null, length]}>
      <circleGeometry args={[radius, 8, 8]}>
        <instancedBufferAttribute attach="attributes-color" args={[colours, 3]} />
      </circleGeometry>
      <meshBasicMaterial toneMapped={false} vertexColors />

      {/* <meshBasicMaterial color={color} /> */}
    </instancedMesh>
  );
};

export default InstancedCicles;
