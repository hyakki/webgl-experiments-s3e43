varying vec2 vUv;
uniform float uPos;
uniform sampler2D uTexture;

void main() {
  vec4 color = texture2D(uTexture, vUv);

  float range = 4.0;
  float distFromCenter = 1.0 - clamp(abs(uPos), 0.0, range) / range;
  float alpha = pow(distFromCenter, 2.0);

  gl_FragColor = vec4(color.rgb, alpha);
}
