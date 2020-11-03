varying vec2 vUv;
uniform float time;
uniform float uPos;

void main() {
  vUv = uv;  
  vec3 pos = position;

  // float range = 3.0;
  // float distFromCenter = 1.0 - clamp(abs(uPos), 0.0, range) / range;

  // pos.z = pos.z + pow(distFromCenter, 3.0) * 1.4;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * mvPosition;
}
