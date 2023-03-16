import React, { Fragment, useRef } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import { Stats, Html, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { clamp, lerp, smoothstep } from 'three/src/math/MathUtils';
import { useControls } from 'leva';
import styles from './styles.scss';
import PointsManager from './PointsManager';
import { COUNTRY_DETAILS } from '../../constants';
import Circle from '../Circle';
import CustomPointsMaterial from './CustomPointsMaterial';

const customPointsMaterial = new CustomPointsMaterial(null);

const url = new URL(window.location.href);

const pointsAmount = +(url.searchParams.get('pointsamount') ?? 80000);
const radius = +(url.searchParams.get('radius') ?? 1);
const padding = +(url.searchParams.get('padding') ?? radius * 0.25);

const pointsManager = new PointsManager(pointsAmount, radius, padding);

console.log(pointsManager);

const Scene = () => {
  const pointsRef = useRef();

  const positionInterpolation = useRef(1);
  const colourInterpolation = useRef(0);
  const rotationInterpolation = useRef(1);
  const opacityInterpolation = useRef(1);

  const { pointsState, australiaOpacity, chinaOpacity, indiaOpacity } = useControls({
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
    australiaOpacity: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: () => {
        opacityInterpolation.current = 0;
      },
      transient: false
    },
    chinaOpacity: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: () => {
        opacityInterpolation.current = 0;
      },
      transient: false
    },
    indiaOpacity: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: () => {
        opacityInterpolation.current = 0;
      },
      transient: false
    },
    chinaColour: {
      value: `#${COUNTRY_DETAILS.CHINA.color.getHexString()}`,
      onChange: value => {
        COUNTRY_DETAILS.CHINA.color.set(value);
        colourInterpolation.current = 0;
      }
    },
    australiaColour: {
      value: `#${COUNTRY_DETAILS.AUSTRALIA.color.getHexString()}`,
      onChange: value => {
        COUNTRY_DETAILS.AUSTRALIA.color.set(value);
        colourInterpolation.current = 0;
      }
    },
    indiaColour: {
      value: `#${COUNTRY_DETAILS.INDIA.color.getHexString()}`,
      onChange: value => {
        COUNTRY_DETAILS.INDIA.color.set(value);
        colourInterpolation.current = 0;
      }
    },
    todo: {
      editable: false,
      value: `- ellipse\n- alpha\n- webworkers for calculations`
    }
  });
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useFrame((state, deltaTime) => {
    positionInterpolation.current = clamp((positionInterpolation.current += deltaTime * 0.3), 0, 1);
    colourInterpolation.current = clamp((colourInterpolation.current += deltaTime * 0.3), 0, 1);
    opacityInterpolation.current = clamp((opacityInterpolation.current += deltaTime * 0.3), 0, 1);

    const positionst = smoothstep(positionInterpolation.current, 0, 1);
    const colourst = smoothstep(colourInterpolation.current, 0, 1);
    const opacityst = smoothstep(opacityInterpolation.current, 0, 1);

    if (pointsState === 'Sphere' || pointsState === 'Globe') {
      pointsRef.current.rotation.y += deltaTime * 0.3;
      pointsRef.current.rotation.y = pointsRef.current.rotation.y % (Math.PI * 2);

      rotationInterpolation.current = 0;
    } else {
      rotationInterpolation.current = clamp((rotationInterpolation.current += deltaTime * 0.3), 0, 1);
      pointsRef.current.rotation.y = lerp(pointsRef.current.rotation.y, 0, rotationInterpolation.current);

      rotationInterpolation.current = clamp((rotationInterpolation.current += deltaTime * 0.3), 0, 1);
    }

    if (positionst >= 1 && colourst >= 1 && opacityst >= 1) return;

    const positions = pointsRef.current.geometry.attributes.position.array;
    const color = pointsRef.current.geometry.attributes.color.array;
    const opacities = pointsRef.current.geometry.attributes.pointOpacity.array;

    for (let i = 0; i < pointsAmount; i++) {
      const point = pointsManager.points[i];
      const i3 = i * 3;

      point.position.x = lerp(point.position.x, pointsManager.states[pointsState].positions[i3 + 0], positionst);
      point.position.y = lerp(point.position.y, pointsManager.states[pointsState].positions[i3 + 1], positionst);
      point.position.z = lerp(point.position.z, pointsManager.states[pointsState].positions[i3 + 2], positionst);

      point.colour.r = lerp(point.colour.r, COUNTRY_DETAILS[point.country].color.r, colourst);
      point.colour.g = lerp(point.colour.g, COUNTRY_DETAILS[point.country].color.g, colourst);
      point.colour.b = lerp(point.colour.b, COUNTRY_DETAILS[point.country].color.b, colourst);

      point.opacity = lerp(
        point.opacity,
        point.country === 'AUSTRALIA' ? australiaOpacity : point.country === 'CHINA' ? chinaOpacity : indiaOpacity,
        opacityst
      );

      positions[i3 + 0] = point.position.x;
      positions[i3 + 1] = point.position.y;
      positions[i3 + 2] = point.position.z;

      color[i3 + 0] = point.colour.r;
      color[i3 + 1] = point.colour.g;
      color[i3 + 2] = point.colour.b;

      opacities[i] = point.opacity;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    pointsRef.current.geometry.attributes.pointOpacity.needsUpdate = true;
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
        <primitive
          vertexColors
          size={radius * 2}
          toneMapped={false}
          transparent
          depthTest
          depthWrite
          object={customPointsMaterial}
          attach="material"
          alphaTest={0}
        />
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
          <bufferAttribute
            attach="attributes-pointOpacity"
            array={pointsManager.initialOpacities}
            count={pointsAmount}
            itemSize={1}
          />
        </bufferGeometry>
      </points>

      <Circle
        r={pointsManager.states.Sphere.radius}
        color={0xffffff}
        opacity={pointsState === 'Sphere' || pointsState === 'Globe' ? 1 : 0}
      />

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
