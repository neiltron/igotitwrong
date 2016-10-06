precision mediump float;

attribute vec2 position;
varying vec2 vTextureCoord;

void main () {
  vTextureCoord = position;
  gl_Position = vec4(1.0 - 2.0 * position, 0, 1.0) * vec4(-1.0, 1.0, 1.0, 1.0);
}