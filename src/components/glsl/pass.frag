uniform sampler2D tDiffuse;
uniform float uShift;
varying vec2 vUv;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float parabola(float x, float k) {
	return pow(4.0f * x * (1.0f - x), k);
}

vec4 applyRGBShift(sampler2D tDiffuse, vec2 uv, vec4 color, float shift, float strength) {
	float s = map(shift, -1.0, 1.0, -strength, strength);
	color.r = texture2D( tDiffuse, vec2(uv.x + s, uv.y)).r;

	return color;
}

vec2 applyDistorsion(vec2 uv, float strength) {
	float dd = pow(uv.x - 0.5, 2.0);
  float curve = clamp(dd, 0.0, 1.0);

  curve = map(curve, 1.0, 2.0, 0.0, strength);

	float s = sign(uv.y - 0.5);
	
	uv.y = uv.y - s * abs(uv.x - 0.5) * -curve * abs(uv.y - 0.5);

	return uv;
}

void main() {
	vec2 uv = vUv;

	uv = applyDistorsion(uv, 0.5);
	vec4 color = texture2D(tDiffuse, uv);

	color = applyRGBShift(tDiffuse, uv, color, uShift, 1.0);

	gl_FragColor = vec4(color);
}
