var _vertexShaderSource = `attribute vec3 vCoord;
attribute vec3 vNorm;
attribute vec4 vColor;
attribute vec2 vTexCoord;

uniform mat4 mvpMatrix;
uniform vec3 lightVec;

varying vec4 fColor;
varying vec2 fTexCoord;
void main(void) {
  fColor = vec4(vColor.rgb*dot(vNorm, lightVec), vColor.a);
  fTexCoord = vTexCoord;
  gl_Position = vec4(vCoord, 1.0) * mvpMatrix;
}
`;
