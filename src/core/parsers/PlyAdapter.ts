import { IAdapter } from "../../types/IAdapter";
import { GaussianData } from "../../types/GaussianData";

export class PlyAdapter implements IAdapter
{
    // ArrayBuffer : binary
    // binary => decode => string
    parse(buffer: ArrayBuffer): GaussianData
    {
        // return
        let count = 0

        const text = new TextDecoder().decode(buffer)
        const headerEnd = text.indexOf('end_header\n')

        if (headerEnd === -1)
        {
            throw new Error("can't find end header")
        }

        const header = text.slice(0, headerEnd)
        const headerLine = header.split('\n')

        const properties = []
        let format: boolean | undefined

        for (const line of headerLine)
        {
            if(line.startsWith('element vertex'))
            {
                count = parseInt(line.split(' ')[2])
                continue
            }

            if(line.startsWith('format'))
            {
                if(line.includes('little'))
                    format = true
                else
                    format = false
                continue
            }

            if(line.startsWith('property float'))
            {
                properties.push(line.split(' ')[2])
            }
        }

        const positions = new Float32Array(count * 3)
        const normals = properties.includes('nx') ? new Float32Array(count * 3) : undefined

        const colorCount = properties.filter(p => p.startsWith('f_dc')).length
        const colors =  new Float32Array(count * colorCount)
        const shCount = properties.filter(p => p.startsWith('f_rest_')).length
        const sh = shCount > 0 ? new Float32Array(count * shCount) : undefined
        const opacities =  new Float32Array(count)
        const scales =  new Float32Array(count * 3)
        const rotations =  new Float32Array(count * 4)

        const bodyStart = headerEnd + 'end_header\n'.length
        const body = new DataView(buffer, bodyStart)
        const stride = properties.length * 4

        for (let i = 0; i < count; i++) // 정점의 수 만큼
        {
            const base = i * stride

            for(let j = 0; j < properties.length; j++)
            {
                const value = body.getFloat32(base + j * 4, true)
                const name = properties[j]

                if (name === 'x') positions[i * 3 + 0] = value
                else if (name === 'y') positions[i * 3 + 1] = value
                else if (name === 'z') positions[i * 3 + 2] = value
                else if (name === 'nx' && normals) normals[i * 3 + 0] = value
                else if (name === 'ny' && normals) normals[i * 3 + 1] = value
                else if (name === 'nz' && normals) normals[i * 3 + 2] = value
                else if (name === 'opacity') opacities[i] = value
                else if (name.startsWith('f_dc_')) {
                    const idx = parseInt(name.split('_')[2])
                    colors[i * colorCount + idx] = value
                }
                else if (name.startsWith('f_rest_') && sh) {
                    const idx = parseInt(name.split('_')[2])
                    sh[i * shCount + idx] = value
                }
                else if (name.startsWith('scale_')) {
                    const idx = parseInt(name.split('_')[1])
                    scales[i * 3 + idx] = value
                }
                else if (name.startsWith('rot_')) {
                    const idx = parseInt(name.split('_')[1])
                    rotations[i * 4 + idx] = value
                }

            }
        }

        return {
            count,
            positions,
            normals,
            colors,
            sh,
            opacities,
            scales,
            rotations
        }

    }
}


/*
ArrayBuffer : ply, splat

1. ply

format
vertex count
position     x, y, z
normal       nx, ny, nz
color        f_dc_0~2
sh_rest      f_rest_0~44
opacity      opacity
scale        scale_0~2
rotation     rot_0~3

data :  [x, y, z, nx, ny, nz, f_dc_0, f_dc_1, f_dc_2, f_rest_0, .. f_rest_44, opacity, scale_x, scale_y, scale_z, rot_x, rot_y, rot_z]

2. splat

*/
