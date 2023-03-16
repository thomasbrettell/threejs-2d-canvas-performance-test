import * as THREE from 'three';

export default class CustomPointsMaterial extends THREE.PointsMaterial {
  constructor(props) {
    super(props);
    this.onBeforeCompile = (shader, renderer) => {
      shader.vertexShader = shader.vertexShader.replace(
        'uniform float scale;',
        `uniform float scale;
        attribute float pointOpacity;
        varying float vPointOpacity;`
      );

      shader.vertexShader = shader.vertexShader.replace(
        'void main() {',
        `void main() {
        vPointOpacity = pointOpacity;`
      );

      shader.fragmentShader = shader.fragmentShader.replace('uniform float opacity;', ``);
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        varying float vPointOpacity;
        void main() {
          float opacity = vPointOpacity;
        `
      );
    };
  }
}
