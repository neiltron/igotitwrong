#define ZOOM_SAMPLES 10.0

precision mediump float;

uniform sampler2D texture;
uniform float time;
uniform vec2 u_resolution;
uniform float u_intensity;
uniform float u_blurdecay;
uniform vec2 u_mousepos;
varying vec2 vTextureCoord;

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

void main() {
  if (u_intensity == 0.0) {
    gl_FragColor = texture2D(texture, vTextureCoord.xy);
    return;
  }

  // zoomBlur(texture, center, strength, texCoord, texSize)
  vec4 color = zoomBlur(texture, u_mousepos, u_intensity * (1.0 - u_blurdecay * 0.9) * 0.3, vTextureCoord, u_resolution);

  // Grayscale
  color.rgb = mix(color.rgb, vec3(0.2126*color.r + 0.7152*color.g + 0.0722*color.b), u_intensity);

  gl_FragColor = color;
}
