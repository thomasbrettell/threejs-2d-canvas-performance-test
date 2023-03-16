import * as THREE from 'three';

export default class CustomPointsMaterial extends THREE.PointsMaterial {
  constructor(props) {
    super(props);
    this.onBeforeCompile = (shader, renderer) => {
      const { isWebGL2 } = renderer.capabilities;

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

      //turn square points into round points
      //not sure if this is a good idea atm
      // shader.fragmentShader = shader.fragmentShader.replace(
      //   '#include <output_fragment>',
      //   `
      //   ${
      //     !isWebGL2
      //       ? '#extension GL_OES_standard_derivatives : enable\n#include <output_fragment>'
      //       : '#include <output_fragment>'
      //   }
      //   vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      //   float r = dot(cxy, cxy);
      //   float delta = fwidth(r);
      //   float mask = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
      //   gl_FragColor = vec4(gl_FragColor.rgb, mask * gl_FragColor.a );
      //   #include <tonemapping_fragment>
      //   #include <encodings_fragment>
      //   `
      // );
    };
  }
}
