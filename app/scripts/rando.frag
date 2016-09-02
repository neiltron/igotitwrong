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

    float r = texture2D(uSampler, p + rs, 0.5).r;
    float g = texture2D(uSampler, p, 0.5).g;
    float b = texture2D(uSampler, p, 0.5).b;

    return vec4(r, g, b, 1.0);
}

vec4 vec4pow( vec4 v, float p ) {
    return vec4(pow(v[0],p),pow(v.y,p),pow(v.z,p),v.w);
}

void main()
{
  vec2 p = vTextureCoord;
  vec4 c = vec4(0.0,0.0,0.0,1.0);

  // Elevating shift values to some high power (between 8 and 16 looks good)
  // helps make the stuttering look more sudden
  float n = noise2(vec3(gl_FragCoord.xy * 0.0005, iGlobalTime));

  vec4 shift = vec4pow(vec4(n),8.0)
          *vec4(AMPLITUDE,AMPLITUDE,AMPLITUDE,1.0);

  c += rgbShift(p, shift);


  // vec4 color = texture2D(uSampler, vTextureCoord);

  gl_FragColor = c;
}