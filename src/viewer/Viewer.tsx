import {GaussianObject} from "./GaussianObject"
import { GaussianData } from "../types/GaussianData"
import * as THREE from "three"
import { useEffect, useRef } from "react"


interface ViewerProps
{
    data: GaussianData
}

export default function Viewer({data} : ViewerProps)
{
    const containerRef = useRef<HTMLDivElement>(null)

    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.Camera | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

    useEffect(()=> {
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera()
        const renderer = new THREE.WebGLRenderer()

        // renderer
        if(!containerRef.current)
        {
            console.log("No ContainerRef")
            return
        }
        containerRef.current.appendChild(renderer.domElement)
        renderer.setSize(containerRef.current.clientWidth,containerRef.current.clientHeight)
        //renderer.setSize(window.innerWidth, window.innerHeight)
        
        // scene
        const gaussianObject = new GaussianObject(data)
        gaussianObject.sortedByDepth(camera)
        scene.add(gaussianObject.points)

        // camera
        camera.position.z = 7

        // render
        renderer.render(scene, camera)

        sceneRef.current = scene
        cameraRef.current = camera
        rendererRef.current = renderer

        return(()=>{
            scene.remove(gaussianObject.points)
        })

    }, [])

    return <div ref={containerRef} style={{width: "70vw", height: "70vh"}}/> 
}