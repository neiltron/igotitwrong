#define AMPLITUDE 0.2
#define SPEED 0.05


precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 iResolution;
uniform float iGlobalTime;
uniform vec2 iMouse;


#pragma glslify: noise2 = require("glsl-noise/classic/3d")


vec4 rgbShift( vec2 p , vec4 shift) {
    shift *= 2.0*shift.w - 1.0;
    vec2 rs = vec2(shift.x,-shift.y);
    vec2 gs = vec2(shift.y,-shift.z);
    vec2 bs = vec2(shift.z,-shift.x);

    float r = texture2D(uSampler, p + rs, 1.0);
    float g = texture2D(uSampler, p + gs, 1.0);
    float b = texture2D(uSampler, p + bs, 1.0);

    return vec4(r, g, b, 1.0);
}

vec4 vec4pow( vec4 v, float p ) {
    // Don't touch alpha (w), we use it to choose the direction of the shift
    // and we don't want it to go in one direction more often than the other
    return vec4(pow(v[0],p),pow(v.y,p),pow(v.z,p),v.w);
}

void main()
{
  vec2 p = vTextureCoord;
  vec4 c = vec4(0.0,0.0,0.0,1.0);

  // Elevating shift values to some high power (between 8 and 16 looks good)
  // helps make the stuttering look more sudden
  float n = noise2(vec3(gl_FragCoord.xy * 0.001, iGlobalTime));

  vec4 shift = vec4pow(vec4(n),8.0)
          *vec4(AMPLITUDE,AMPLITUDE,AMPLITUDE,1.0);

  c += rgbShift(p, shift);

  vec4 color = texture2D(uSampler, vTextureCoord);

  gl_FragColor = color / 2.0 + c / 2.0;
}