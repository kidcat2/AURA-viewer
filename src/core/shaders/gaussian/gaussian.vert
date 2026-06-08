out float vOpacity;
out mat2 vInvCov;
out vec3 vColor;
out float vPointSize;

in float opacity;
in vec3 scale;
in vec4 rotation;

uniform vec2 viewport;
uniform sampler2D shTexture;
uniform int shWidth;
uniform int shTexels;

void main()
{
    // Gaussian shape projection
    vec3 camPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
    float x = camPos.x;
    float y = camPos.y;
    float z = camPos.z;

    vec4 q = normalize(rotation);
    float qw = q.x;
    float qx = q.y;
    float qy = q.z;
    float qz = q.w;

    mat3 R = mat3(
        1.0 - 2.0*(qy*qy + qz*qz), 2.0*(qx*qy - qw*qz), 2.0*(qx*qz + qw*qy),
        2.0*(qx*qy + qw*qz), 1.0 - 2.0*(qx*qx + qz*qz), 2.0*(qy*qz - qw*qx),
        2.0*(qx*qz - qw*qy), 2.0*(qy*qz + qw*qx), 1.0 - 2.0*(qx*qx + qy*qy)
    );

    vec3 s = exp(scale);

    mat3 S = mat3(1.0);
    S[0][0] = s.x;
    S[1][1] = s.y;
    S[2][2] = s.z;

    // Model → World → View(Camera) → Clip → NDC → Screen
    mat3 cov_3d = R * S * transpose(S) * transpose(R); // Model space covariance

    float fx = projectionMatrix[0][0] * viewport.x * 0.5;
    float fy = projectionMatrix[1][1] * viewport.y * 0.5;

    mat3x2 J = mat3x2(0.0);
    J[0][0] = fx / z;
    J[1][1] = fy / z;
    J[2][0] = -(fx*x) / (z*z);
    J[2][1] = -(fy*y) / (z*z);

    mat3 W = mat3(modelViewMatrix); // translation 제외, rot-scale만 추출

    mat2 cov_2d = J * W * cov_3d * transpose(W) * transpose(J);
    cov_2d += mat2(0.3);

    // // Gaussian Bounding box
    float det = determinant(cov_2d);
    float mid = 0.5 * (cov_2d[0][0] + cov_2d[1][1]);
    float eigen_value = mid + sqrt(max(mid*mid - det, 0.0));
    float radius = 3.0 * sqrt(eigen_value);
    
    // color f-dc
    const float C0 = 0.2820947917738781;
    vColor = C0 * color + 0.5;

    // color f-rest
    int base = gl_VertexID * shTexels;

    float sh[45];
    for (int i = 0; i < shTexels; i++)
    {
        int L = base + i;
        int x = L % shWidth;
        int y = L / shWidth;

        vec4 texel = texelFetch(shTexture, ivec2(x, y), 0);
        
        int o = i * 4;
        if(o + 0 < 45) sh[o + 0] = texel.r;
        if(o + 1 < 45) sh[o + 1] = texel.g;
        if(o + 2 < 45) sh[o + 2] = texel.b;
        if(o + 3 < 45) sh[o + 3] = texel.a;
    }

    // color final  
    const float C1   =  0.4886025119029199;
    const float C2_0 =  1.0925484305920792;
    const float C2_1 = -1.0925484305920792;
    const float C2_2 =  0.31539156525252005;
    const float C2_3 = -1.0925484305920792;
    const float C2_4 =  0.5462742152960396;
    const float C3_0 = -0.5900435899266435;
    const float C3_1 =  2.890611442640554;
    const float C3_2 = -0.4570457994644658;
    const float C3_3 =  0.3731763325901154;
    const float C3_4 = -0.4570457994644658;
    const float C3_5 =  1.445305721320277;
    const float C3_6 = -0.5900435899266435;

    /// direct
    vec3 camLocal = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
    vec3 dir = normalize(position - camLocal);

    float dx = dir.x, dy = dir.y, dz = dir.z;
    float xx = dx*dx, yy = dy*dy, zz = dz*dz;
    float xy = dx*dy, yz = dy*dz, xz = dz*dx;

    float b[15];
    b[0]  = -C1 * dy;
    b[1]  =  C1 * dz;
    b[2]  = -C1 * dx;
    b[3]  =  C2_0 * xy;
    b[4]  =  C2_1 * yz;
    b[5]  =  C2_2 * (2.0*zz - xx - yy);
    b[6]  =  C2_3 * xz;
    b[7]  =  C2_4 * (xx - yy);
    b[8]  =  C3_0 * dy * (3.0*xx - yy);
    b[9]  =  C3_1 * xy * dz;
    b[10] =  C3_2 * dy * (4.0*zz - xx - yy);
    b[11] =  C3_3 * dz * (2.0*zz - 3.0*xx - 3.0*yy);
    b[12] =  C3_4 * dx * (4.0*zz - xx - yy);
    b[13] =  C3_5 * dz * (xx - yy);
    b[14] =  C3_6 * dx * (xx - 3.0*yy);

    vec3 dirColor = vec3(0,0,0);

    for(int i = 0; i < 15; i++)
    {
        dirColor.r += b[i] * sh[i];
        dirColor.g += b[i] * sh[i + 15];
        dirColor.b += b[i] * sh[i + 30];
    }

    vColor += dirColor;
    vColor = clamp(vColor, 0.0, 1.0);


    // out
    vOpacity =  1.0 / (1.0 + exp(-opacity));
    vInvCov = inverse(cov_2d);
    vPointSize = radius * 2.0; // gaussian bounding box

    // Gaussian Center projection
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //gl_Position.y *= -1.0;
    gl_PointSize = vPointSize;
}