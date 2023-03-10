import React, { Fragment, useMemo, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import Square from '../Square';
import Circle from '../Circle';
import * as d3 from 'd3';
import { Stats, Html } from '@react-three/drei';
import InstancedCicles from '../InstancedCircles';
import { shuffle, randomNumRange } from '../../utils';
import gsap, { TweenLite } from 'gsap';
import Color from 'color';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp, lerp, smoothstep } from 'three/src/math/MathUtils';
import { useControls } from 'leva';
import styles from './styles.scss';
import { sortBy } from 'lodash';

const url = new URL(window.location.href);

const pointsAmount = +(url.searchParams.get('pointsamount') ?? 80000);
const radius = +(url.searchParams.get('radius') ?? 1);
const padding = radius * 0.25;

const COUNTRY_DETAILS = {
  CHINA: {
    color: 'red'
  },
  AUSTRALIA: {
    color: 'green'
  },
  INDIA: {
    color: 'blue'
  }
};

//TODO
// make this a class
const pointsManager = {
  r: radius + padding,
  states: {
    Circle1: {
      positions: null
    },
    Circle2: {
      positions: null
    },
    Circles3: {
      positions: null
    },
    Rectangle: {
      positions: null
    },
    SortedRectangle: {
      positions: null
    },
    SortedRectangles: {
      positions: null
    },
    Random: {
      positions: Array.from({ length: pointsAmount }).map(() => [
        randomNumRange(0, window.innerWidth),
        randomNumRange(0, -window.innerHeight),
        0
      ])
    },
    PopulationPyrmaid: {
      positions: null
    }
  }
};

pointsManager.points = Array.from({ length: pointsAmount }).map((_, i) => {
  return {
    country: Object.keys(COUNTRY_DETAILS)[Math.floor(Math.random() * Object.keys(COUNTRY_DETAILS).length)],
    currentPos: { x: null, y: null },
    id: i,
    age: Math.floor(Math.random() * 100)
  };
});

const circle1 = d3.packSiblings(
  pointsManager.points.map(p => {
    return { ...p, r: pointsManager.r };
  })
);

pointsManager.states.Circle1.circle = d3.packEnclose(circle1);

pointsManager.states.Circle1.positions = circle1.map(p => [
  p.x + pointsManager.states.Circle1.circle.r,
  p.y - pointsManager.states.Circle1.circle.r,
  0
]);

//bug?
//on really high points amouts only
//setting the state to circle2 will cause the fps to drop to ~30 and stay there (not only during the transition)
//this is werid because nothing different is happening then with any of the other state changes
pointsManager.states.Circle2.positions = shuffle(pointsManager.states.Circle1.positions);

const circles3 = d3.packSiblings(
  pointsManager.points
    .filter(p => p.country !== 'AUSTRALIA')
    .map(p => {
      return { ...p, r: pointsManager.r };
    })
);

pointsManager.states.Circles3.circle = d3.packEnclose(circles3);

const circle3positions = circles3.reduce((acc, p) => {
  acc[p.id] = {
    ...p
  };
  return acc;
}, {});

pointsManager.states.Circles3.positions = pointsManager.points.map(p => {
  if (p.country === 'AUSTRALIA') {
    return [-radius, -radius, 0];
  } else {
    const rect = circle3positions[p.id];
    return [rect.x + pointsManager.states.Circles3.circle.r, rect.y - pointsManager.states.Circles3.circle.r, 0];
  }
});

const colours = Float32Array.from(
  new Array(pointsManager.points.length)
    .fill()
    .flatMap((_, i) => Color(COUNTRY_DETAILS[pointsManager.points[i].country].color).array())
);

pointsManager.colours = colours;

pointsManager.points.forEach((p, i) => {
  const pos = pointsManager.states.Circle1.positions[i];
  p.currentPos.x = pos[0];
  p.currentPos.y = pos[1];
});

let columns = 200;
pointsManager.states.SortedRectangle.positions = sortBy(pointsManager.points, 'country').reduce((acc, p, i) => {
  const x = i % columns;
  const y = Math.floor(i / columns);

  acc[p.id] = [x * (radius * 2 + padding) + radius, -y * (radius * 2 + padding) - radius, 0];

  return acc;
}, []);

pointsManager.states.Rectangle.positions = pointsManager.points.reduce((acc, p, i) => {
  const x = i % columns;
  const y = Math.floor(i / columns);

  acc[p.id] = [x * (radius * 2 + padding) + radius, -y * (radius * 2 + padding) - radius, 0];

  return acc;
}, []);

let mapIndex = 0;
pointsManager.states.SortedRectangles.positions = [];
d3.group(pointsManager.points, d => d.country).forEach(points => {
  const columns = 60;
  points.forEach((p, i) => {
    const x = i % columns;
    const y = Math.floor(i / columns);

    pointsManager.states.SortedRectangles.positions[p.id] = [
      x * (radius * 2 + padding) + columns * (radius * 2 + padding) * mapIndex + 50 * mapIndex + radius,
      -y * (radius * 2 + padding) - radius,
      0
    ];
  });

  mapIndex++;
});

const graphWidth = 700;
const graphHeight = 900;
const graphMargin = {
  top: 20,
  right: 0,
  bottom: 0,
  left: 20
};
const graphInnerWidth = graphWidth - graphMargin.left - graphMargin.right;
const graphInnerHeight = graphHeight - graphMargin.top - graphMargin.bottom;

const countryGroups = d3.group(pointsManager.points, d => d.country);

const bandScale = d3
  .scaleBand()
  .domain(Array.from({ length: 10 }, (_, i) => i).reverse())
  .range([0, graphInnerHeight])
  .padding(0.1);

pointsManager.states.PopulationPyrmaid.positions = [];

countryGroups.forEach((points, country) => {
  const rows = Math.round(bandScale.bandwidth() / (radius * 2 + padding));

  if (country === 'AUSTRALIA') {
    points.forEach(p => {
      pointsManager.states.PopulationPyrmaid.positions[p.id] = [-radius, -radius, 0];
    });
  }
  if (country === 'INDIA') {
    const ageGroup = d3.group(points, d => Math.floor(d.age / 10));

    ageGroup.forEach((points, age) => {
      points.forEach((p, i) => {
        const row = i % rows;
        const column = Math.floor(i / rows);
        const x = graphInnerWidth / 2 - column * (radius * 2 + padding) + graphMargin.left - 10;
        const y = -(bandScale(age) + graphMargin.top) - row * (radius * 2 + padding);
        pointsManager.states.PopulationPyrmaid.positions[p.id] = [x, y, 0];
      });
    });
  }

  if (country === 'CHINA') {
    const ageGroup = d3.group(points, d => Math.floor(d.age / 10));

    ageGroup.forEach((points, age) => {
      points.forEach((p, i) => {
        const row = i % rows;
        const column = Math.floor(i / rows);
        const x = column * (radius * 2 + padding) + graphMargin.left + graphInnerWidth / 2 + 10;
        const y = -(bandScale(age) + graphMargin.top) - row * (radius * 2 + padding);
        pointsManager.states.PopulationPyrmaid.positions[p.id] = [x, y, 0];
      });
    });
  }
});

// pointsManager.states.PopulationPyrmaid.positions = sortBy(pointsManager.points, 'age').reduce((acc, p, i) => {
//   if (p.country !== 'INDIA') {
//     acc[p.id] = [-radius, -radius, 0];
//     return acc;
//   }

//   console.log(p);

//   const ageGroup = Math.floor(p.age / 10);

//   // const rows = countryGroups.get('INDIA').filter(p => Math.floor(p.age / 10) === ageGroup);
//   // console.log(rows);

//   console.log(ageGroup);

//   const x = i % columns;
//   const y = Math.floor(i / columns);

//   acc[p.id] = [x * (radius * 2 + padding) + radius, -y * (radius * 2 + padding) - radius, 0];

//   return acc;
// }, []);

console.log(pointsManager);

const o = new THREE.Object3D();

const Scene = () => {
  const interpolateDuration = useRef(1);
  const { pointsState, showFPSSpinner } = useControls({
    pointsState: {
      value: 'Circle1',
      options: Object.keys(pointsManager.states),
      onChange: () => {
        interpolateDuration.current = 0;
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
    showFPSSpinner: false,
    todo: {
      editable: false,
      value: `- ellipse`
    }
  });
  const instanceRef = useRef();

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useFrame((state, deltaTime) => {
    interpolateDuration.current = clamp((interpolateDuration.current += deltaTime * 0.3), 0, 1);

    //no need to run the frame if the interpolation is done
    if (interpolateDuration.current >= 1 || interpolateDuration.current <= 0) return;

    for (let i = 0; i < pointsManager.points.length; i++) {
      const point = pointsManager.points[i];
      const toPos = pointsManager.states[pointsState].positions[i];

      const st = smoothstep(interpolateDuration.current, 0, 1);

      point.currentPos.x = lerp(point.currentPos.x, toPos[0], st);
      point.currentPos.y = lerp(point.currentPos.y, toPos[1], st);

      o.position.set(point.currentPos.x, point.currentPos.y, 0);
      o.updateMatrix();
      instanceRef.current.setMatrixAt(i, o.matrix);
    }
    instanceRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <group position={[-windowWidth / 2, windowHeight / 2, 0]}>
        {/* <group position={[pointsManager.states.Circle1.circle.r, -pointsManager.states.Circle1.circle.r, 0]}> */}
        {useMemo(
          () => (
            <InstancedCicles ref={instanceRef} length={pointsManager.points.length} colours={colours} radius={radius} />
          ),
          [pointsManager.points.length]
        )}
        {/* </group> */}
        {showFPSSpinner && <Square x={windowWidth / 2} y={windowHeight / 2} width="100" height={100} />}
      </group>

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
                  {/* <rect
                    data-group={d}
                    height={bandScale.bandwidth()}
                    width={graphInnerWidth / 2}
                    y={bandScale(d)}
                    fill="red"
                  /> */}
                  {/* <rect
                    data-group={d}
                    height={bandScale.bandwidth()}
                    width={graphInnerWidth / 2}
                    y={bandScale(d)}
                    x={graphInnerWidth / 2}
                    fill="blue"
                  /> */}
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
