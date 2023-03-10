import * as THREE from 'three';
import * as d3 from 'd3';
import { shuffle } from 'lodash';
import { randomNumRange } from '../../utils';
import { COUNTRY_DETAILS } from '../../constants';

export default class PointsManager {
  constructor(_pointsAmount, _radius, _padding) {
    this.points = new Array(_pointsAmount).fill().map((_, i) => {
      const country = Object.keys(COUNTRY_DETAILS)[Math.floor(Math.random() * Object.keys(COUNTRY_DETAILS).length)];
      return {
        position: new THREE.Vector3(0, 0, 0),
        colour: COUNTRY_DETAILS[country].color.clone(),
        country: country,
        age: Math.floor(Math.random() * 100),
        id: i,
        opacity: 1
      };
    });
    this.radius = _radius;
    this.padding = _padding;

    this.states = {
      Circle1: {
        positions: this.calculateCircle1()
      },
      Circle2: {
        positions: this.calculateCircle2()
      },
      Random: {
        positions: this.calculateRandom()
      }
    };

    this.initialPositions = Float32Array.from(this.states.Circle1.positions);
    this.initialColours = Float32Array.from(
      new Array(_pointsAmount).fill().flatMap((_, i) => this.points[i].colour.toArray())
    );
    this.initialOpacities = Float32Array.from(new Array(_pointsAmount).fill().flatMap(() => [Math.random()]));

    this.points.forEach((point, i) => {
      const i3 = i * 3;
      point.position.set(this.initialPositions[i3 + 0], this.initialPositions[i3 + 1], this.initialPositions[i3 + 2]);
    });
  }

  calculateCircle1() {
    const circle = d3.packSiblings(
      this.points.map(p => {
        return { r: this.radius + this.padding };
      })
    );

    return Float32Array.from(circle.flatMap(({ x, y }) => [x, -y, 0]));
  }

  calculateCircle2() {
    const circle = d3.packSiblings(
      this.points.map(p => {
        return { r: this.radius + this.padding };
      })
    );

    return Float32Array.from(shuffle(circle).flatMap(({ x, y }) => [x, -y, 0]));
  }

  calculateRandom() {
    return Float32Array.from(
      new Array(this.points.length)
        .fill()
        .flatMap(() => [
          randomNumRange(-window.innerWidth / 2, window.innerWidth / 2),
          randomNumRange(-window.innerHeight / 2, window.innerHeight / 2),
          0
        ])
    );
  }
}
