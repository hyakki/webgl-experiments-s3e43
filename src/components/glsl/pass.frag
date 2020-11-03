uniform sampler2D tDiffuse;
uniform float uShift;
varying vec2 vUv;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
	vec2 uv = vUv;

	// Change Uvs for distorsion
	float n = 1.0 - step(0.2, uv.x) + step(0.8, uv.x);
	float dd = map(n, 0.0, 1.0, 1.0, 1.4);

	uv.y = uv.y * dd - ((dd - 1.0) / 2.0);

	// Color shift
	vec4 color = texture2D( tDiffuse, uv );

	float shift = clamp(uShift, -0.009, 0.009);

	color.r = texture2D( tDiffuse, vec2(uv.x + shift, uv.y)).r;

	gl_FragColor = color;
}
