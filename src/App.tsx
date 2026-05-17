import Viewer from "./viewer/Viewer"
import { GaussianData } from "./types/GaussianData"
import { useState, useEffect } from "react"
import { PlyAdapter } from "./core/parsers/PlyAdapter"


export default function App() {
  
  const [gsData, setGsData] = useState<GaussianData | null>(null)

  useEffect(()=> {
    (async () => {
      const res = await fetch("/room.ply")
      const aBuffer = await res.arrayBuffer()
      const parsed = await new PlyAdapter().parse(aBuffer)
      setGsData(parsed)
    })()
  }, [])

  if(!gsData) return <div> 로딩중... </div>

  return (
    <div style={{display:"flex", justifyContent:"center", alignItems:"center", width:"100vw", height:"100vh"}}>
      <Viewer data={gsData}/>
    </div>
  )
}