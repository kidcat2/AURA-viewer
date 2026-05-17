precision mediump float;

varying vec3 vColor;
varying float vOpacity;
varying mat2 vInvCov;

void main() 
{
    gl_FragColor = vec4(vColor, vOpacity);

    // f(x) = exp(-0.5 * x^T * covInv * x)
    vec2 x = (gl_PointCoord - vec2(0.5)) * 20.0;
    float d = dot(x, vInvCov * x);
    float g = exp(-0.5 * dot(x, vInvCov * x));

    gl_FragColor = vec4(vec3(d * 0.01), 1.0);
}