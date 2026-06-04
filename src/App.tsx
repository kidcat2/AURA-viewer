import Viewer from "./viewer/Viewer"
import { GaussianData } from "./types/GaussianData"
import { useState, useEffect } from "react"
import { PlyAdapter } from "./core/parsers/PlyAdapter"


export default function App() {

  const [gsData, setGsData] = useState<GaussianData | null>(null)

  useEffect(()=> {
    (async () => {
      const res = await fetch("/cactus_splat3_11kSteps_1.5M_splats.ply")
      const aBuffer = await res.arrayBuffer()
      const parsed = await new PlyAdapter().parse(aBuffer)
      setGsData(parsed)
    })()
  }, [])

  if(!gsData) return <div> 로딩중... </div>

  return (
    <div style={{display:"flex", justifyContent:"center", alignItems:"center", width:"70vw", height:"70vh"}}>
      <Viewer data={gsData}/>
    </div>
  )
}

