precision mediump float;

in vec3 vColor;
in float vOpacity;
in mat2 vInvCov;
in float vPointSize;

out vec4 fragColor;

void main() 
{
    
    // f(x) = exp(-0.5 * x^T * covInv * x)
    vec2 x = (gl_PointCoord - vec2(0.5)) * vPointSize;
    float g = exp(-0.5 * dot(x, vInvCov * x));

    fragColor = vec4(vColor, vOpacity * g);
}