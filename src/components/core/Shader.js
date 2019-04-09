const shaderCompile = (gl, type, src) => {
  const id = gl.createShader(type);
  gl.shaderSource(id, src);
  gl.compileShader(id);

  // check compile errors:
  const success = gl.getShaderParameter(id, gl.COMPILE_STATUS);
  if (!success) {
    console.error('Shader failed to compile!', gl.getShaderInfoLog(id));
  }

  return id;
};

export default class Shader {
  constructor(gl, vert, frag) {
    this.id = null;
    this.gl = gl;

    const vertShaderId = shaderCompile(gl, gl.VERTEX_SHADER, vert);
    const fragShaderId = shaderCompile(gl, gl.FRAGMENT_SHADER, frag);
    const programId = gl.createProgram();

    gl.attachShader(programId, vertShaderId);
    gl.attachShader(programId, fragShaderId);

    gl.linkProgram(programId);

    gl.deleteShader(vertShaderId);
    gl.deleteShader(fragShaderId);

    const success = gl.getProgramParameter(programId, gl.LINK_STATUS);
    if (!success) {
      console.error('Shader linking failed!', gl.getProgramInfoLog(programId));
      return;
    }

    this.id = programId;
  }

  destroy() {
    const { gl, id } = this;
    gl.deleteProgram(id);

    this.id = null;
    this.gl = null;
  }

  use() {
    const { gl, id } = this;
    gl.useProgram(id);
  }

  getAttrib(name) {
    const { gl, id } = this;
    return gl.getAttribLocation(id, name);
  }

  getUniform(name) {
    const { gl, id } = this;
    return gl.getUniformLocation(id, name);
  }

  setBool(name, value) {
    this.setInt(name, value ? 1 : 0);
  }

  setInt(name, value) {
    const { gl } = this;
    gl.uniform1i(this.getUniform(name), value);
  }

  setFloat(name, value) {
    const { gl } = this;
    gl.uniform1f(this.getUniform(name), value);
  }

  setFloat2(name, x, y) {
    const { gl } = this;
    gl.uniform2f(this.getUniform(name), x, y);
  }

  setFloat3(name, x, y, z) {
    const { gl } = this;
    gl.uniform3f(this.getUniform(name), x, y, z);
  }

  setFloat4(name, x, y, z, w) {
    const { gl } = this;
    gl.uniform4f(this.getUniform(name), x, y, z, w);
  }

  setVert(name, size, type, normalized, stride, offset) {
    const { gl } = this;
    const i = this.getAttrib(name);

    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, size, type, normalized, stride, offset);
    gl.enableVertexAttribArray(0);
  }
}
