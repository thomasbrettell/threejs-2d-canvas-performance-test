import { useFrame } from '@react-three/fiber';
import React, { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { randomNumRange } from '../../utils';

const o = new THREE.Object3D();

const InstancedCicles = ({ data, radius }) => {
  const length = data.positions.length / 3;
  const ref = useRef();

  useFrame(() => {
    // console.log(ref.current);
    // const positions = ref.current.geometry.attributes.position.array;
    // console.log(positions);
    for (let i = 0; i < data.positions.length; i += 3) {
      const id = i / 3;
      o.position.set(
        data.positions[i] + randomNumRange(-10, 10),
        -data.positions[i + 1] + randomNumRange(-10, 10),
        data.positions[i + 2]
      );
      o.updateMatrix();
      ref.current.setMatrixAt(id, o.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  // useLayoutEffect(() => {
  //   for (let i = 0; i < data.positions.length; i += 3) {
  //     const id = i / 3;
  //     o.position.set(data.positions[i], -data.positions[i + 1], data.positions[i + 2]);
  //     o.updateMatrix();
  //     ref.current.setMatrixAt(id, o.matrix);
  //   }
  //   ref.current.instanceMatrix.needsUpdate = true;
  // }, []);

  return (
    <instancedMesh ref={ref} args={[null, null, length]}>
      <circleGeometry args={[radius, 64, 64]} />
      <meshBasicMaterial color={'black'} />
    </instancedMesh>
  );
};

export default InstancedCicles;
