import { GaussianData } from "../types/GaussianData"
import vertexShader from "../core/shaders/gaussian/gaussian.vert?raw"
import fragmentShader from "../core/shaders/gaussian/gaussian.frag?raw"
import * as THREE from "three"

/* 
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

*/

/*
[Three.js 방식 구조]

1. bufferAttribute  : Float32Array 데이터를 Three.js attribute로 등록
                      ("이 데이터가 position이야, color야...")

2. bufferGeometry   : attribute들을 하나로 묶은 정점 데이터 묶음
                      (raw WebGL의 createBuffer + vertexAttribPointer 역할)

3. shaderMaterial   : GLSL 셰이더 코드를 Three.js에 넘김
                      Three.js가 컴파일/링크/GPU 업로드 대신 처리
                      (raw WebGL의 createShader + createProgram 역할)

4. <points>         : bufferGeometry + shaderMaterial을 묶어 Scene에 등록
                      Three.js가 매 프레임 알아서 그려줌
                      (raw WebGL의 useFrame + drawArrays 역할)

우리가 담당: 데이터(Float32Array) + 셰이더 코드(GLSL)
Three.js가 담당: 컴파일, 버퍼 관리, 드로우, 리소스 정리
*/

export class GaussianObject
{
    points: THREE.Points

    constructor(data: GaussianData)
    {
        const geometry = new THREE.BufferGeometry()
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            vertexColors: true,
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                viewport: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                }
            }
            
        })

        // debug code
        //console.log(data.scales[0], data.scales[1], data.scales[2])
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(data.positions, 3),
        )

        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(data.colors, 3)
        )

        if(data.sh)
        {
            geometry.setAttribute(
                "sh",
                new THREE.BufferAttribute(data.sh, 45)
            )
        }
        else
        {
            console.log("3dgs data has no sh")
        }
        
        geometry.setAttribute(
            "opacity",
            new THREE.BufferAttribute(data.opacities, 1)
        )

        geometry.setAttribute(
            "scale",
            new THREE.BufferAttribute(data.scales, 3)
        )

        geometry.setAttribute(
            "rotation",
            new THREE.BufferAttribute(data.rotations, 4)
        )

        this.points = new THREE.Points(
            geometry,
            material
        )

        this.points.rotation.x = Math.PI 
    }

    sortedByDepth(camera: THREE.Camera)
    {
        const geometry = this.points.geometry
        const position = geometry.getAttribute("position")
        const count = position.count
        
        camera.updateMatrixWorld()
        this.points.updateMatrixWorld()
        const modelView = new THREE.Matrix4().multiplyMatrices(
            camera.matrixWorldInverse,
            this.points.matrixWorld
        )

        const depths = new Float32Array(count)
        const p = new THREE.Vector3()


        for(let i=0; i < count; i++)
        {   
            p.set(position.getX(i), position.getY(i), position.getZ(i))
            p.applyMatrix4(modelView)
            depths[i] = p.z
        }

        const order = Array.from({length: count}, (_, i) => i)
        order.sort((a, b) => depths[a] - depths[b])
        
        geometry.setIndex(order)
    }
}

// opengl : vertex, fragment, compute shader, geometry shader, tessellation shader
// webgl shaders : vertex, fragment
// webgpu : vertex, fragment, compute shader

