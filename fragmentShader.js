var _fragmentShaderSource = `precision mediump float;

varying vec4 fColor;
varying vec2 fTexCoord;

void main(void) {
  gl_FragColor = fColor;
}
`;
