import * as THREE from 'three';
import * as d3 from 'd3';
import { shuffle } from 'lodash';
import { latLongToSphereXyz, randomNumRange } from '../../utils';
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
      },
      Sphere: {
        radius: 350
      },
      Globe: {
        radius: 350
      }
      // PopulationPyramid: {
      //   graphWidth: 700,
      //   graphHeight: Math.min(700, window.innerHeight),
      //   graphMargin: {
      //     top: 20,
      //     right: 0,
      //     bottom: 0,
      //     left: 20
      //   },
      //   graphInnerWidth:
      //     this.states.PopulationPyramid.graphWidth -
      //     this.states.PopulationPyramid.graphMargin.left -
      //     this.states.PopulationPyramid.graphMargin.right,
      //   graphInnerHeight:
      //     this.states.PopulationPyramid.graphHeight -
      //     this.states.PopulationPyramid.graphMargin.top -
      //     this.states.PopulationPyramid.graphMargin.bottom,
      //   countryGroups: d3.group(this.points, d => d.country),
      //   bandScale: d3
      //     .scaleBand()
      //     .domain(Array.from({ length: 10 }, (_, i) => i).reverse())
      //     .range([0, this.states.PopulationPyramid.graphInnerHeight])
      //     .padding(0.1)
      // }
    };
    this.calculateGlobe();
    this.states.Sphere.positions = this.calculateSphere(this.states.Sphere.radius);

    this.initialPositions = Float32Array.from(this.states.Circle1.positions);
    this.initialColours = Float32Array.from(
      new Array(_pointsAmount).fill().flatMap((_, i) => this.points[i].colour.toArray())
    );
    this.initialOpacities = Float32Array.from(
      new Array(_pointsAmount).fill().flatMap((_, i) => [this.points[i].opacity])
    );

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

  calculateSphere(radius) {
    const numPoints = this.points.length;
    const points = new Float32Array(numPoints * 3);

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      points[i * 3] = x;
      points[i * 3 + 1] = y;
      points[i * 3 + 2] = z;
    }

    return points;
  }

  async calculateGlobe() {
    this.states.Globe.positions = Float32Array.from(
      Array(this.points.length)
        .fill()
        .flatMap(() => [0, 0, 0])
    );
    d3.json('/globeDots.json').then(data => {
      this.states.Globe.positions = Float32Array.from(
        Array(this.points.length)
          .fill()
          .flatMap((_, i) => {
            const coord = data[i];

            if (coord) {
              return latLongToSphereXyz({
                latitude: coord[1],
                longitude: coord[0],
                radius: this.states.Globe.radius
              });
            }
            return [0, 0, 0];
          })
      );
    });
  }
}
