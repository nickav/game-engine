attribute vec2 position;
attribute vec2 texcoord;
attribute vec4 color;

uniform mat4 u_viewMatrix;

varying vec2 v_texcoord;
varying vec4 v_color;

void main() {
  v_color = color;
  v_texcoord = texcoord;
  gl_Position = u_viewMatrix * vec4(position, 0.0, 1.0);
}
