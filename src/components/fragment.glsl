varying vec2 vUv;
uniform vec3 rgb;
uniform float uPos;

void main() {
  // gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);

  float range = 3.0;
  float distFromCenter = 1.0 - clamp(abs(uPos), 0.0, range) / range;
  float alpha = pow(distFromCenter, 2.0);

  gl_FragColor = vec4(rgb, distFromCenter);
}
