precision mediump float;

attribute vec2 position;
attribute vec4 color;

uniform mat4 u_viewMatrix;

varying vec4 v_color;

void main() {
  v_color = color;
  gl_Position = u_viewMatrix * vec4(position, 0.0, 1.0);
}
