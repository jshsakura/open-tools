"use client"

import NextImage from "next/image"
import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  Upload,
  Download,
  X,
  Eraser,
  Paintbrush,
  Square,
  Circle,
  Undo2,
  Clipboard,
  ClipboardCheck,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

type BrushShape = "circle" | "square"
type MaskMode = "paint" | "erase"

export function ImageEraser() {
  const t = useTranslations("ImageEraser")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState("")
  const [brushSize, setBrushSize] = useState(30)
  const [brushShape, setBrushShape] = useState<BrushShape>("circle")
  const [maskMode, setMaskMode] = useState<MaskMode>("paint")
  const [isDrawing, setIsDrawing] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [clipboardPasted, setClipboardPasted] = useState(false)

  // History for undo
  const historyRef = useRef<ImageData[]>([])

  // Calculate display scale based on container
  const calculateDisplayScale = useCallback(() => {
    if (!containerRef.current || !image) return 1
    const maxW = containerRef.current.clientWidth - 32
    const maxH = 500
    return Math.min(maxW / image.width, maxH / image.height, 1)
  }, [image])

  // Draw the canvas with image and mask overlay
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !image) return

    const scale = calculateDisplayScale()
    canvas.width = image.width * scale
    canvas.height = image.height * scale

    if (maskCanvas) {
      maskCanvas.width = image.width
      maskCanvas.height = image.height
    }

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    // Draw mask overlay
    if (maskCanvas) {
      const maskCtx = maskCanvas.getContext("2d")
      if (maskCtx) {
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = canvas.width
        tempCanvas.height = canvas.height
        const tempCtx = tempCanvas.getContext("2d")
        if (tempCtx) {
          tempCtx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height)
          ctx.fillStyle = "rgba(255, 0, 0, 0.4)"
          ctx.globalCompositeOperation = "source-over"
          // Apply red overlay where mask exists
          const tempData = tempCtx.getImageData(0, 0, canvas.width, canvas.height)
          for (let i = 0; i < tempData.data.length; i += 4) {
            if (tempData.data[i + 3] > 0) {
              ctx.fillStyle = "rgba(255, 0, 0, 0.4)"
              ctx.fillRect((i / 4) % canvas.width, Math.floor((i / 4) / canvas.width), 1, 1)
            }
          }
        }
      }
    }
  }, [image, calculateDisplayScale])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Save state for undo
  const saveState = useCallback(() => {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas) return
    const ctx = maskCanvas.getContext("2d")
    if (!ctx) return
    historyRef.current.push(ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height))
    if (historyRef.current.length > 20) historyRef.current.shift()
    setCanUndo(historyRef.current.length > 0)
  }, [])

  // Undo
  const handleUndo = useCallback(() => {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas || historyRef.current.length === 0) return
    const ctx = maskCanvas.getContext("2d")
    if (!ctx) return
    const prevState = historyRef.current.pop()
    if (prevState) {
      ctx.putImageData(prevState, 0, 0)
      drawCanvas()
    }
    setCanUndo(historyRef.current.length > 0)
  }, [drawCanvas])

  // Handle file
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("errors.invalidType"))
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error(t("errors.fileTooLarge"))
      return
    }
    setFileName(file.name)
    const img = new Image()
    img.onload = () => {
      setImage(img)
      setResultUrl(null)
      historyRef.current = []
      setCanUndo(false)
      // Clear mask
      const maskCanvas = maskCanvasRef.current
      if (maskCanvas) {
        const ctx = maskCanvas.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
        }
      }
    }
    img.src = URL.createObjectURL(file)
  }, [t])

  // File input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  // Clipboard paste
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"))
        if (imageType) {
          const blob = await item.getType(imageType)
          handleFile(new File([blob], "clipboard-image.png", { type: blob.type }))
          setClipboardPasted(true)
          setTimeout(() => setClipboardPasted(false), 2000)
          toast.success(t("clipboard.pasted"))
          return
        }
      }
      toast.error(t("clipboard.empty"))
    } catch {
      toast.error(t("clipboard.failed"))
    }
  }, [handleFile, t])

  // Global paste listener
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile()
          if (blob) {
            handleFile(new File([blob], "clipboard-image.png", { type: blob.type }))
            setClipboardPasted(true)
            setTimeout(() => setClipboardPasted(false), 2000)
            toast.success(t("clipboard.pasted"))
            return
          }
        }
      }
    }
    window.addEventListener("paste", handleGlobalPaste)
    return () => window.removeEventListener("paste", handleGlobalPaste)
  }, [handleFile, t])

  // Get canvas coordinates from mouse event
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = maskCanvas.width / rect.width
    const scaleY = maskCanvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  // Draw brush on mask
  const drawBrushOnMask = useCallback(
    (x: number, y: number) => {
      const maskCanvas = maskCanvasRef.current
      if (!maskCanvas) return
      const ctx = maskCanvas.getContext("2d")
      if (!ctx) return

      ctx.globalCompositeOperation = maskMode === "paint" ? "source-over" : "destination-out"

      if (brushShape === "circle") {
        ctx.beginPath()
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = "white"
        ctx.fill()
      } else {
        ctx.fillStyle = "white"
        ctx.fillRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize)
      }

      drawCanvas()
    },
    [brushSize, brushShape, maskMode, drawCanvas]
  )

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || resultUrl) return
    saveState()
    setIsDrawing(true)
    const { x, y } = getCanvasCoords(e)
    drawBrushOnMask(x, y)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !image || resultUrl) return
    const { x, y } = getCanvasCoords(e)
    drawBrushOnMask(x, y)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  // Clear mask
  const clearMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas) return
    const ctx = maskCanvas.getContext("2d")
    if (!ctx) return
    saveState()
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
    drawCanvas()
  }, [saveState, drawCanvas])

  // Simple inpainting algorithm using surrounding pixel averaging
  const inpaintRegion = useCallback(() => {
    if (!image || !maskCanvasRef.current) return null

    const maskCanvas = maskCanvasRef.current
    const maskCtx = maskCanvas.getContext("2d")
    if (!maskCtx) return null

    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)

    // Create output canvas at full resolution
    const outputCanvas = document.createElement("canvas")
    outputCanvas.width = image.width
    outputCanvas.height = image.height
    const outputCtx = outputCanvas.getContext("2d")
    if (!outputCtx) return null

    // Draw original image
    outputCtx.drawImage(image, 0, 0)
    const outputData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height)

    // For each masked pixel, average surrounding non-masked pixels
    const searchRadius = 20
    for (let y = 0; y < maskCanvas.height; y++) {
      for (let x = 0; x < maskCanvas.width; x++) {
        const maskIdx = (y * maskCanvas.width + x) * 4
        if (maskData.data[maskIdx + 3] > 0) {
          // This pixel is masked, need to fill
          let totalR = 0,
            totalG = 0,
            totalB = 0,
            count = 0

          // Search in a spiral pattern for non-masked pixels
          for (let r = 1; r <= searchRadius && count === 0; r++) {
            for (let dy = -r; dy <= r; dy++) {
              for (let dx = -r; dx <= r; dx++) {
                const nx = x + dx
                const ny = y + dy
                if (nx < 0 || nx >= maskCanvas.width || ny < 0 || ny >= maskCanvas.height) continue
                const nMaskIdx = (ny * maskCanvas.width + nx) * 4
                if (maskData.data[nMaskIdx + 3] === 0) {
                  // Non-masked pixel
                  const nOutIdx = (ny * outputCanvas.width + nx) * 4
                  totalR += outputData.data[nOutIdx]
                  totalG += outputData.data[nOutIdx + 1]
                  totalB += outputData.data[nOutIdx + 2]
                  count++
                }
              }
            }
          }

          if (count > 0) {
            const outIdx = (y * outputCanvas.width + x) * 4
            outputData.data[outIdx] = Math.round(totalR / count)
            outputData.data[outIdx + 1] = Math.round(totalG / count)
            outputData.data[outIdx + 2] = Math.round(totalB / count)
            outputData.data[outIdx + 3] = 255
          }
        }
      }
    }

    outputCtx.putImageData(outputData, 0, 0)
    return outputCanvas.toDataURL("image/png")
  }, [image])

  // Run eraser
  const runEraser = useCallback(async () => {
    if (!image) return

    setProcessing(true)
    try {
      // Small delay to show processing state
      await new Promise((resolve) => setTimeout(resolve, 100))

      const result = inpaintRegion()
      if (result) {
        setResultUrl(result)
        toast.success(t("status.success"))
      } else {
        toast.error(t("status.failed"))
      }
    } catch (error) {
      console.error("Eraser error:", error)
      toast.error(t("status.failed"))
    } finally {
      setProcessing(false)
    }
  }, [image, inpaintRegion, t])

  // Download result
  const downloadResult = useCallback(() => {
    if (!resultUrl) return
    const link = document.createElement("a")
    link.href = resultUrl
    link.download = `erased_${fileName}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(t("download"))
  }, [resultUrl, fileName, t])

  // Clear all
  const clearAll = useCallback(() => {
    setImage(null)
    setResultUrl(null)
    setFileName("")
    historyRef.current = []
    setCanUndo(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1
          className="text-3xl font-black tracking-tight"
          dangerouslySetInnerHTML={{ __html: t("title") }}
        />
        <p className="text-muted-foreground">{t("description")}</p>
      </header>

      {!image ? (
        <GlassCard
          className="h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
          />
          <div className="bg-primary/10 p-6 rounded-full mb-6 animate-pulse">
            <Upload className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">{t("inputPlaceholder")}</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">{t("dropHint")}</p>
          <p className="text-xs text-muted-foreground mb-4">{t("supportedFormats")}</p>
          <div className="flex gap-3">
            <Button variant="secondary">{t("selectImage")}</Button>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handlePasteFromClipboard()
              }}
              className="gap-2"
            >
              {clipboardPasted ? (
                <ClipboardCheck className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clipboard className="w-4 h-4" />
              )}
              {t("pasteFromClipboard")}
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <GlassCard className="p-4">
            <div ref={containerRef} className="relative">
              {resultUrl ? (
                <NextImage
                  src={resultUrl}
                  alt="Result"
                  width={image.width}
                  height={image.height}
                  unoptimized
                  className="w-full max-h-[500px] object-contain rounded-lg"
                />
              ) : (
                <>
                  <canvas
                    ref={canvasRef}
                    className="w-full cursor-crosshair rounded-lg"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                  <canvas ref={maskCanvasRef} className="hidden" />
                </>
              )}
            </div>
            {resultUrl && (
              <div className="mt-4 flex gap-3 justify-center">
                <Button size="lg" onClick={downloadResult} className="gap-2">
                  <Download className="w-4 h-4" />
                  {t("download")}
                </Button>
                <Button variant="outline" size="lg" onClick={clearAll}>
                  {t("replaceImage")}
                </Button>
              </div>
            )}
          </GlassCard>

          {!resultUrl && (
            <div className="space-y-6">
              <GlassCard className="p-6 space-y-6 sticky top-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Eraser className="w-4 h-4 text-primary" />
                    {t("controlsTitle")}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearAll}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">{t("controlsDescription")}</p>

                {/* Mask Mode */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold">{t("maskModeLabel")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={maskMode === "paint" ? "default" : "outline"}
                      onClick={() => setMaskMode("paint")}
                      className="text-xs gap-1"
                    >
                      <Paintbrush className="w-3 h-3" />
                      {t("maskMode.paint")}
                    </Button>
                    <Button
                      size="sm"
                      variant={maskMode === "erase" ? "default" : "outline"}
                      onClick={() => setMaskMode("erase")}
                      className="text-xs gap-1"
                    >
                      <Eraser className="w-3 h-3" />
                      {t("maskMode.erase")}
                    </Button>
                  </div>
                </div>

                {/* Brush Shape */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold">{t("brushShapeLabel")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={brushShape === "circle" ? "default" : "outline"}
                      onClick={() => setBrushShape("circle")}
                      className="text-xs gap-1"
                    >
                      <Circle className="w-3 h-3" />
                      {t("brushShape.circle")}
                    </Button>
                    <Button
                      size="sm"
                      variant={brushShape === "square" ? "default" : "outline"}
                      onClick={() => setBrushShape("square")}
                      className="text-xs gap-1"
                    >
                      <Square className="w-3 h-3" />
                      {t("brushShape.square")}
                    </Button>
                  </div>
                </div>

                {/* Brush Size */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold">{t("brushSizeLabel")}</Label>
                    <span className="text-xs text-muted-foreground">{brushSize}px</span>
                  </div>
                  <Slider
                    value={[brushSize]}
                    onValueChange={(v) => setBrushSize(v[0])}
                    min={5}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="text-xs gap-1"
                  >
                    <Undo2 className="w-3 h-3" />
                    Undo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearMask}
                    className="text-xs gap-1"
                  >
                    <X className="w-3 h-3" />
                    {t("clearMask")}
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="w-full font-bold gap-2"
                  onClick={runEraser}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <Eraser className="w-4 h-4" />
                      {t("runEraser")}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">{t("scopeNote")}</p>
              </GlassCard>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
