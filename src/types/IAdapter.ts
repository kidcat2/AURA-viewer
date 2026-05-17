import { GaussianData } from "./GaussianData"

export interface IAdapter
{
    // arg(buffer) : .ply, .splat..
    // return : GaussianData
    parse(buffer: ArrayBuffer): GaussianData
}
