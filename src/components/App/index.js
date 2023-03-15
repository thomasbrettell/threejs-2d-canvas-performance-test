import React, { useRef } from 'react';
import styles from './styles.scss';
import { Canvas } from '@react-three/fiber';
import Scene from '../Scene';

const App = () => {
  const overlayRef = useRef();
  return (
    <div className={styles['canvas-parent']}>
      <Canvas camera={{ position: [0, 0, 1], near: -1000, far: 1000 }} orthographic>
        {/* <Canvas camera={{ position: [0, 0, distance], fov }}> */}
        <Scene overlayRef={overlayRef} />
      </Canvas>
      <div ref={overlayRef} />
    </div>
  );
};

export default App;
