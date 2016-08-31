precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 iResolution;
uniform float iGlobalTime;
uniform vec2 iMouse;

#pragma glslify: noise = require("glsl-noise/classic/3d")

void main() {
  vec4 color = texture2D(uSampler, vec2(
    vTextureCoord.x,
    vTextureCoord.y
  ));

  float n = noise(vec3(gl_FragCoord.xy * 0.001, iGlobalTime));

  if (n > 0.0) {
    n = 0.0;
  } else {
    n = n / 2.0;
  }

  color.rgb += vec3(n);

  gl_FragColor = vec4(color.rgb, 1.0);
}