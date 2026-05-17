varying vec3 vColor;
varying float vOpacity;
varying mat2 vInvCov;

attribute float opacity;
attribute vec3 scale;
attribute vec4 rotation;

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
        2.0*(qx*qy + qw*qz), 1.0 - 2.0*(qx*qx - qz*qz), 2.0*(qy*qz - qw*qx),
        2.0*(qx*qz - qw*qy), 2.0*(qy*qz + qw*qx), 1.0 - 2.0*(qx*qx + qy*qy)
    );

    vec3 s = exp(scale);

    mat3 S = mat3(1.0);
    S[0][0] = s.x;
    S[1][1] = s.y;
    S[2][2] = s.z;

    mat3 cov_3d = R * S * transpose(S) * transpose(R);

    float fx = projectionMatrix[0][0];
    float fy = projectionMatrix[1][1];

    mat3x2 J = mat3x2(0.0);
    J[0][0] = fx / z;
    J[1][1] = fy / z;
    J[2][0] = -(fx*x) / (z*z);
    J[2][1] = -(fy*y) / (z*z);

    mat3 W = mat3(modelViewMatrix); // translation 제외, rot-scale만 추출

    mat2 cov_2d = J * W * cov_3d * transpose(W) * transpose(J);

    // Gaussian Bounding box
    float det = determinant(cov_2d);
    float mid = 0.5 * (cov_2d[0][0] + cov_2d[1][1]);
    float eigen_value = mid + sqrt(max(mid*mid - det, 0.0));
    float radius = 3.0 * sqrt(eigen_value);
    
    // color (나중에)


    // det가 0에 가까우면 (singular matrix) 렌더링 제외
    if(det <= 0.000001)
    {
        gl_PointSize = 0.0;
        vColor = vec3(0.0);
        vOpacity = 0.0;
        vInvCov = mat2(1.0);

        return;
    }
    
    vColor = color;
    vOpacity = opacity;
    vInvCov = inverse(cov_2d);

    // Gaussian Center projection
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 20.0 * radius;
}