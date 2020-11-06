#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

uniform sampler2D tDiffuse;
uniform float uShift;
varying vec2 vUv;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float parabola(float x, float k) {
	return pow(4.0 * x * (1.0 - x), k);
}

vec4 RGBShift(sampler2D tDiffuse, vec2 uv, vec4 color, float shift, float strength) {
	float s = map(shift, -1.0, 1.0, -strength, strength);
	color.r = texture2D( tDiffuse, vec2(uv.x + s, uv.y)).r;

	return color;
}

vec2 EdgeDistortion(vec2 uv, float strength) {
	// float xNorm = (uv.x * 2.0) - 1.0;
	float yNorm = (uv.y * 2.0) - 1.0;
	float dd = pow(uv.x - 0.5, 2.0) * strength + 0.5;

	dd = map(dd, 0.0, 1.0, 0.2, -0.05);
	uv.y = uv.y + yNorm * dd;

	return uv;
}

void main() {
	vec2 uv = vUv;

	uv = EdgeDistortion(uv, 3.0);
	vec4 color = texture2D(tDiffuse, uv);

	color = RGBShift(tDiffuse, uv, color, uShift, 1.0);

	gl_FragColor = vec4(color);
}
