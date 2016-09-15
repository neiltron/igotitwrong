#define AMPLITUDE 0.2
#define SPEED 1.0

precision mediump float;

uniform sampler2D texture;
uniform float time;
uniform vec2 u_resolution;
uniform float u_intensity;
varying vec2 vTextureCoord;

#pragma glslify: noise2 = require("glsl-noise/classic/3d")

vec4 rgbShift( vec2 p , vec4 shift) {
    shift *= 2.0 * shift.w - 1.0;
    vec2 rs = vec2(shift.x,-shift.y);
    vec2 gs = vec2(-shift.y,shift.z);
    vec2 bs = vec2(-shift.z,-shift.x);

    float r = texture2D(texture, p + rs, 1.0).r;
    float g = texture2D(texture, p + gs, 1.0).g;
    float b = texture2D(texture, p + bs, 1.0).b;

    return vec4(r, g, b, 0.2);
}

vec4 vec4pow( vec4 v, float p ) {
    return vec4(pow(v[0],p),pow(v.y,p),pow(v.z,p),v.w);
}

void main()
{
    vec4 c = vec4(0.0, 0.0, 0.0, 1.0);

    if (u_intensity > 0.0) {
        vec2 p = vec2(1.0 - vTextureCoord.x, vTextureCoord.y);
        float n = noise2(vec3(gl_FragCoord.xy * 0.001, time * SPEED));

        vec4 shift = vec4(n) * vec4(AMPLITUDE,AMPLITUDE,AMPLITUDE,1.0);

        c += rgbShift(p, shift * vec4(u_intensity));
    }

    vec4 color = texture2D(texture, vec2(1.0 - vTextureCoord.x, vTextureCoord.y));

    gl_FragColor = (color * (1.0 - u_intensity)) + (c * u_intensity);
}