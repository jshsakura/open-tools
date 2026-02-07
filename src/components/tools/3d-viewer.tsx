"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUp, File, X, Box, RotateCw, Grid3x3, Move3d, Maximize, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import * as THREE from "three"
import { OrbitControls } from "three-stdlib"
import { OBJLoader } from "three-stdlib"
import { STLLoader } from "three-stdlib"
import { GLTFLoader } from "three-stdlib"
import { PLYLoader } from "three-stdlib"

export function Basic3dViewer() {
    const t = useTranslations("Basic3dViewer")
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showGrid, setShowGrid] = useState(true)
    const [showAxes, setShowAxes] = useState(true)
    const [autoRotate, setAutoRotate] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const controlsRef = useRef<OrbitControls | null>(null)
    const requestRef = useRef<number | null>(null)
    const modelRef = useRef<THREE.Object3D | null>(null)

    useEffect(() => {
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current)
            }
            if (rendererRef.current) {
                rendererRef.current.dispose()
            }
        }
    }, [])

    useEffect(() => {
        if (!file || !containerRef.current) return

        const init = async () => {
            setIsLoading(true)

            // Cleanup previous
            if (rendererRef.current) {
                containerRef.current?.removeChild(rendererRef.current.domElement)
                rendererRef.current.dispose()
            }

            // Scene setup
            const scene = new THREE.Scene()
            scene.background = new THREE.Color(0xf0f0f0) // Light gray background
            sceneRef.current = scene

            // Camera setup
            const width = containerRef.current!.clientWidth
            const height = containerRef.current!.clientHeight
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
            camera.position.z = 5
            cameraRef.current = camera

            // Renderer setup
            const renderer = new THREE.WebGLRenderer({ antialias: true })
            renderer.setSize(width, height)
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.shadowMap.enabled = true
            containerRef.current!.appendChild(renderer.domElement)
            rendererRef.current = renderer

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
            scene.add(ambientLight)

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
            directionalLight.position.set(5, 10, 7)
            directionalLight.castShadow = true
            scene.add(directionalLight)

            // Helpers
            if (showGrid) {
                const gridHelper = new THREE.GridHelper(10, 10)
                scene.add(gridHelper)
            }
            if (showAxes) {
                const axesHelper = new THREE.AxesHelper(5)
                scene.add(axesHelper)
            }

            // Controls
            const controls = new OrbitControls(camera, renderer.domElement)
            controls.enableDamping = true
            controlsRef.current = controls

            // Load Model
            const loader = getLoader(file)
            if (!loader) {
                toast.error("Unsupported file format")
                setFile(null)
                setIsLoading(false)
                return
            }

            const url = URL.createObjectURL(file)

            try {
                // @ts-ignore
                loader.load(url, (object) => {
                    let mesh: THREE.Object3D

                    if (file.name.toLowerCase().endsWith('.gltf') || file.name.toLowerCase().endsWith('.glb')) {
                        // @ts-ignore
                        mesh = object.scene
                    } else if (file.name.toLowerCase().endsWith('.stl') || file.name.toLowerCase().endsWith('.ply')) {
                        // @ts-ignore
                        const geometry = object as THREE.BufferGeometry
                        const material = new THREE.MeshStandardMaterial({ color: 0x606060, roughness: 0.5, metalness: 0.1 })
                        mesh = new THREE.Mesh(geometry, material)
                    } else { // OBJ
                        // @ts-ignore
                        mesh = object as THREE.Group
                    }

                    // Center and scale model
                    const box = new THREE.Box3().setFromObject(mesh)
                    const center = box.getCenter(new THREE.Vector3())
                    const size = box.getSize(new THREE.Vector3())

                    const maxDim = Math.max(size.x, size.y, size.z)
                    const scale = 3 / maxDim
                    mesh.scale.setScalar(scale)

                    mesh.position.sub(center.multiplyScalar(scale))
                    mesh.position.y += size.y * scale / 2 // sit on grid

                    mesh.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh) {
                            child.castShadow = true
                            child.receiveShadow = true
                        }
                    })

                    scene.add(mesh)
                    modelRef.current = mesh
                    setIsLoading(false)
                    URL.revokeObjectURL(url)
                },
                    // @ts-ignore
                    (xhr) => {
                        // Progress
                        // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
                    },
                    (error: any) => {
                        console.error(error)
                        toast.error(t("error"))
                        setIsLoading(false)
                    }
                )
            } catch (e) {
                console.error(e)
                toast.error("Error loading model")
                setIsLoading(false)
            }

            // Animation Loop
            const animate = () => {
                requestRef.current = requestAnimationFrame(animate)

                if (controlsRef.current) controlsRef.current.update()

                if (autoRotate && modelRef.current) {
                    modelRef.current.rotation.y += 0.01
                }

                if (rendererRef.current && sceneRef.current && cameraRef.current) {
                    rendererRef.current.render(sceneRef.current, cameraRef.current)
                }
            }
            animate()
        }

        init()

    }, [file])

    // Effect for toggles
    useEffect(() => {
        if (!sceneRef.current) return

        // Very basic way to toggle helpers, ideally we manage references
        // But for simplicity in this task:
        const scene = sceneRef.current

        // Remove existing helpers
        scene.children = scene.children.filter(c => !(c instanceof THREE.GridHelper) && !(c instanceof THREE.AxesHelper))

        if (showGrid) {
            const gridHelper = new THREE.GridHelper(10, 10)
            scene.add(gridHelper)
        }
        if (showAxes) {
            const axesHelper = new THREE.AxesHelper(5)
            scene.add(axesHelper)
        }
    }, [showGrid, showAxes])


    const getLoader = (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase()
        switch (ext) {
            case 'obj': return new OBJLoader()
            case 'stl': return new STLLoader()
            case 'gltf':
            case 'glb': return new GLTFLoader()
            case 'ply': return new PLYLoader()
            default: return null
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const resetCamera = () => {
        if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(0, 0, 5)
            cameraRef.current.lookAt(0, 0, 0)
            controlsRef.current.reset()
        }
    }

    return (
        <Card className="max-w-4xl mx-auto h-[80vh] flex flex-col">
            <CardHeader className="border-b bg-muted/30 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Box className="h-5 w-5 text-purple-600" />
                            {t("title")}
                        </CardTitle>
                        <CardDescription>{t("description")}</CardDescription>
                    </div>
                    {file && (
                        <div className="flex bg-background rounded-md border shadow-sm">
                            <Button variant="ghost" size="icon" onClick={resetCamera} title={t("resetCamera")}>
                                <Maximize className="h-4 w-4" />
                            </Button>
                            <div className="w-px bg-border my-1" />
                            <Button variant="ghost" size="icon" onClick={() => setShowGrid(!showGrid)} className={!showGrid ? "text-muted-foreground" : ""} title={t("toggleGrid")}>
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                            <div className="w-px bg-border my-1" />
                            <Button variant="ghost" size="icon" onClick={() => setShowAxes(!showAxes)} className={!showAxes ? "text-muted-foreground" : ""} title={t("toggleAxes")}>
                                <Move3d className="h-4 w-4" />
                            </Button>
                            <div className="w-px bg-border my-1" />
                            <Button variant="ghost" size="icon" onClick={() => setAutoRotate(!autoRotate)} className={!autoRotate ? "text-muted-foreground" : "text-primary bg-primary/10"} title={t("autoRotate")}>
                                <RotateCw className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden relative bg-neutral-100 dark:bg-neutral-900">
                {!file ? (
                    <div className="h-full flex items-center justify-center p-6 bg-background">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center hover:bg-muted/30 transition-colors cursor-pointer w-full max-w-lg"
                            onClick={() => document.getElementById("model-upload")?.click()}
                        >
                            <input
                                id="model-upload"
                                type="file"
                                accept=".obj,.stl,.gltf,.glb,.ply"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium mb-1">{t("dropTitle")}</p>
                            <p className="text-sm text-muted-foreground">{t("dropDesc")}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div ref={containerRef} className="w-full h-full cursor-move" />

                        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur p-3 rounded-lg border shadow-sm max-w-xs text-xs space-y-1">
                            <div className="flex items-center justify-between gap-4">
                                <span className="font-semibold flex items-center gap-1.5 truncate">
                                    <Box className="h-3 w-3" /> {file.name}
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-5 w-5 -mr-1">
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                            <div className="text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                        </div>

                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <p className="font-medium text-sm">{t("loading")}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
