import React from 'react';
import styles from './styles.scss';
import { Canvas } from '@react-three/fiber';
import Scene from '../Scene';

const App = () => {
  return (
    <div className={styles['canvas-parent']}>
      <Canvas camera={{ position: [0, 0, 1], near: 0.1, far: 1000 }} orthographic>
        <Scene />
      </Canvas>
    </div>
  );
};

export default App;
