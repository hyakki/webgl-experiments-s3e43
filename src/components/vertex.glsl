varying vec2 vUv;
uniform float time;

void main() {
  vUv = uv;  
  vec3 pos = position;

  // pos.y = pos.y + (sin(time / 100.0) * 0.2);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * mvPosition;
}
