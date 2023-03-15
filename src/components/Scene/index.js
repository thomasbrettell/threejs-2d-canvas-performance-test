import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import Square from '../Square';
import Circle from '../Circle';
import * as d3 from 'd3';
import { Stats, Html, Points, Point, Line, shaderMaterial } from '@react-three/drei';
import InstancedCicles from '../InstancedCircles';
import { shuffle, randomNumRange } from '../../utils';
import gsap, { TweenLite } from 'gsap';
import Color from 'color';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp, lerp, smoothstep } from 'three/src/math/MathUtils';
import { button, useControls } from 'leva';
import styles from './styles.scss';
import { sortBy } from 'lodash';
import tinycolor from 'tinycolor2';
import { ShaderLib } from 'three';
import PointsManager from './PointsManager';

const url = new URL(window.location.href);

const pointsAmount = +(url.searchParams.get('pointsamount') ?? 80000);
const radius = +(url.searchParams.get('radius') ?? 1);
const padding = +(url.searchParams.get('padding') ?? radius * 0.25);

const pointsManager = new PointsManager(pointsAmount, radius, padding);

const o = new THREE.Object3D();
const c = new THREE.Color();

console.log(pointsManager);

const Scene = () => {
  const pointsRef = useRef();
  const positionInterpolation = useRef(1);
  const colourInterpolation = useRef(0);

  const { pointsState } = useControls({
    pointsState: {
      value: 'Circle1',
      options: Object.keys(pointsManager.states),
      onChange: () => {
        positionInterpolation.current = 0;
      },
      transient: false
    },
    pointsAmount: {
      value: pointsAmount,
      disabled: true
    },
    padding: {
      value: padding,
      disabled: true
    },
    radius: {
      value: radius,
      disabled: true
    },
    todo: {
      editable: false,
      value: `- ellipse\n- sphere\n- alpha\n- pointsManagerClass\n- webworkers for calculations`
    }
  });
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const randomColour = useRef(tinycolor.random().toRgb());

  useEffect(() => {
    setInterval(() => {
      randomColour.current = tinycolor.random().toRgb();
      colourInterpolation.current = 0;
    }, 6000);
  });

  useFrame((state, deltaTime) => {
    positionInterpolation.current = clamp((positionInterpolation.current += deltaTime * 0.3), 0, 1);
    colourInterpolation.current = clamp((colourInterpolation.current += deltaTime * 0.3), 0, 1);

    const positionst = smoothstep(positionInterpolation.current, 0, 1);
    const colourst = smoothstep(colourInterpolation.current, 0, 1);

    console.log(colourst);

    if (positionst >= 1 && colourst >= 1) return;

    const positions = pointsRef.current.geometry.attributes.position.array;
    const color = pointsRef.current.geometry.attributes.color.array;

    for (let i = 0; i < pointsAmount; i++) {
      const point = pointsManager.points[i];
      const i3 = i * 3;

      point.position.x = lerp(point.position.x, pointsManager.states[pointsState].positions[i3 + 0], positionst);
      point.position.y = lerp(point.position.y, pointsManager.states[pointsState].positions[i3 + 1], positionst);

      point.colour.r = lerp(point.colour.r, randomColour.current.r / 255, colourst);
      point.colour.g = lerp(point.colour.g, randomColour.current.g / 255, colourst);
      point.colour.b = lerp(point.colour.b, randomColour.current.b / 255, colourst);

      positions[i3 + 0] = point.position.x;
      positions[i3 + 1] = point.position.y;
      positions[i3 + 2] = point.position.z;

      color[i3 + 0] = point.colour.r;
      color[i3 + 1] = point.colour.g;
      color[i3 + 2] = point.colour.b;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <>
      <Line
        points={[
          [0, -windowHeight / 2, 0],
          [0, windowHeight / 2, 0]
        ]}
        color="lightgrey"
      />

      <Line
        points={[
          [-windowWidth / 2, 0, 0],
          [windowWidth / 2, 0, 0]
        ]}
        color="lightgrey"
      />

      <points ref={pointsRef}>
        <pointsMaterial vertexColors size={radius * 2} toneMapped={false} />
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={pointsManager.initialPositions}
            count={pointsAmount}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={pointsManager.initialColours}
            count={pointsAmount}
            itemSize={3}
          />
        </bufferGeometry>
      </points>

      <Stats className={styles.stats} />

      <Html fullscreen className={styles.html}>
        {pointsState === 'PopulationPyrmaid' && (
          <svg height={graphHeight} width={graphWidth}>
            <g transform={`translate(${graphMargin.left}, ${graphMargin.top})`}>
              <line
                stroke="black"
                strokeWidth={2}
                x1={0}
                x2={graphInnerWidth}
                y1={graphInnerHeight}
                y2={graphInnerHeight}
              />
              <line
                stroke="black"
                strokeWidth={2}
                x1={graphInnerWidth / 2}
                x2={graphInnerWidth / 2}
                y1={0}
                y2={graphInnerHeight}
              />
              {bandScale.domain().map(d => (
                <Fragment key={d}>
                  <text
                    x={graphInnerWidth / 2}
                    textAnchor="middle"
                    fontWeight="bold"
                    y={bandScale(d) + bandScale.bandwidth() / 2}
                  >
                    {d * 10} - {d * 10 + 10}
                  </text>
                </Fragment>
              ))}
            </g>
          </svg>
        )}
      </Html>
    </>
  );
};

export default Scene;
