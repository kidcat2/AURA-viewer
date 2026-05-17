// adpater output data type
export interface GaussianData
{
    count: number
    positions: Float32Array
    normals?: Float32Array
    colors: Float32Array
    sh?: Float32Array
    opacities: Float32Array
    scales: Float32Array
    rotations: Float32Array
}
