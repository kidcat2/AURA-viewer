precision mediump float;

varying vec3 vColor;
varying float vOpacity;
varying mat2 vInvCov;
varying float vPointSize;

void main() 
{
    
    // f(x) = exp(-0.5 * x^T * covInv * x)
    vec2 x = (gl_PointCoord - vec2(0.5)) * vPointSize;
    float g = exp(-0.5 * dot(x, vInvCov * x));

    gl_FragColor = vec4(vColor, vOpacity * g);
}