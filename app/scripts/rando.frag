#define ZOOM_SAMPLES 10.0
#define AMPLITUDE 0.2
#define SPEED 1.0

precision mediump float;

uniform sampler2D texture;
uniform float time;
uniform vec2 u_resolution;
uniform float u_intensity;
uniform float u_blurdecay;
uniform vec2 u_mousepos;
uniform bool u_ismobile;
varying vec2 vTextureCoord;

#pragma glslify: noise2 = require("glsl-noise/classic/3d")

// Imported from https://github.com/evanw/glfx.js/blob/58841c23919bd59787effc0333a4897b43835412/src/filters/common.js
float random(vec3 scale, float seed) {
  /* use the fragment position for a different seed per-pixel */
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

// Adapted from https://github.com/evanw/glfx.js/blob/58841c23919bd59787effc0333a4897b43835412/src/filters/blur/zoomblur.js
vec4 zoomBlur(sampler2D texture, vec2 center, float strength, vec2 texCoord, vec2 texSize) {
  vec4 color = vec4(0.0);
  float total = 0.0;
  vec2 toCenter = center - texCoord * texSize;

  /* randomize the lookup values to hide the fixed number of samples */
  float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

  for (float t = 0.0; t <= ZOOM_SAMPLES; t++) {
    float percent = (t + offset) / ZOOM_SAMPLES;
    float weight = 4.0 * (percent - percent * percent);
    vec4 sample = texture2D(texture, texCoord + toCenter * percent * strength / texSize);

    color += sample * weight;
    total += weight;
  }

  return color / total;
}

vec4 rgbShift(vec2 p, vec4 shift) {
  shift *= 2.0 * shift.w - 1.0;
  vec2 rs = vec2(shift.x, -shift.y);
  vec2 gs = vec2(-shift.y, shift.z);
  vec2 bs = vec2(-shift.z, -shift.x);

  float r = texture2D(texture, p + rs, 1.0).r;
  float g = texture2D(texture, p + gs, 1.0).g;
  float b = texture2D(texture, p + bs, 1.0).b;

  return vec4(r, g, b, 1.0);
}

vec4 vec4pow(vec4 v, float p) {
  return vec4(pow(v[0],p),pow(v.y,p),pow(v.z,p),v.w);
}

vec4 applyShift(vec2 point) {
  float noise = noise2(vec3(gl_FragCoord.xy * 0.001, time * SPEED));
  vec4 shiftColor = vec4(0.0, 0.0, 0.0, 1.0);
  vec4 shift = vec4(noise) * vec4(vec3(AMPLITUDE * u_intensity), 1.0);
  float distanceXY = distance(u_mousepos.xy, gl_FragCoord.xy / 2.0);

  float opacity = 1.0;
  float blurDistance = 500.0;
  if (distanceXY > 50.0) {
    opacity = 1.0 - (distanceXY / blurDistance);
  }

  opacity = clamp(opacity, 0.0, 1.0);
  return shiftColor + rgbShift(point, shift * vec4(0.15 * u_intensity));
}

void main() {
  if (u_intensity == 0.0) {
    gl_FragColor = texture2D(texture, vTextureCoord.xy);
    return;
  }

  // zoomBlur(texture, center, strength, texCoord, texSize)
  vec4 color = zoomBlur(texture, u_mousepos, u_intensity * (1.0 - u_blurdecay * 0.9) * 0.3, vTextureCoord, u_resolution);

  // Grayscale
  color.rgb = mix(color.rgb, vec3(0.2126*color.r + 0.7152*color.g + 0.0722*color.b), u_intensity);

  // RGB Shift
  if (u_ismobile == false) {
    color.rgb = mix(color.rgb, applyShift(vTextureCoord).rgb, 0.25);
  }

  gl_FragColor = color;
}
