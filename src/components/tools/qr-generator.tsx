"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import QRCode from "qrcode"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, QrCode, Type, Link, Mail, Phone, Settings2, Share2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export function QrGenerator() {
    const t = useTranslations('QrGenerator')
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // State
    const [text, setText] = useState("https://example.com")
    const [size, setSize] = useState(1024) // Default high res for better download quality
    const [displaySize, setDisplaySize] = useState(256) // Only for display slider if needed, but we'll use CSS for preview
    const [fgColor, setFgColor] = useState("#000000")
    const [bgColor, setBgColor] = useState("#ffffff")
    const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M')
    const [margin, setMargin] = useState(4)

    // Generate QR code
    useEffect(() => {
        if (!canvasRef.current || !text) return

        // Use a fixed size for the canvas to ensure high quality export
        // CSS will handle the responsive display size
        QRCode.toCanvas(
            canvasRef.current,
            text,
            {
                width: size,
                margin: margin,
                color: {
                    dark: fgColor,
                    light: bgColor,
                },
                errorCorrectionLevel: errorLevel,
            },
            (error) => {
                if (error) {
                    console.error('QR Code generation error:', error)
                    toast.error('Failed to generate QR code')
                }
            }
        )
    }, [text, size, fgColor, bgColor, errorLevel, margin])

    // Download as PNG
    const downloadPNG = () => {
        if (!canvasRef.current) return

        canvasRef.current.toBlob((blob) => {
            if (!blob) return
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `qrcode-${Date.now()}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success('QR code downloaded as PNG')
        })
    }

    // Download as SVG
    const downloadSVG = async () => {
        if (!text) return

        try {
            const svg = await QRCode.toString(text, {
                type: 'svg',
                width: size,
                margin: margin,
                color: {
                    dark: fgColor,
                    light: bgColor,
                },
                errorCorrectionLevel: errorLevel,
            })

            const blob = new Blob([svg], { type: 'image/svg+xml' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `qrcode-${Date.now()}.svg`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success('QR code downloaded as SVG')
        } catch (error) {
            console.error('SVG generation error:', error)
            toast.error('Failed to generate SVG')
        }
    }

    // Copy to clipboard
    const copyToClipboard = async () => {
        if (!canvasRef.current) return

        try {
            canvasRef.current.toBlob(async (blob) => {
                if (!blob) return
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ])
                toast.success('QR code copied to clipboard')
            })
        } catch (error) {
            console.error('Copy error:', error)
            toast.error('Failed to copy to clipboard')
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Preview (Sticky on Desktop) - Order 1 on Mobile */}
            <div className="w-full md:w-1/2 lg:w-5/12 order-1 md:order-1">
                <div className="md:sticky md:top-24 space-y-6">
                    <Card className="border-border/20 bg-background/60 backdrop-blur-xl shadow-2xl relative overflow-hidden ring-1 ring-primary/10">

                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-primary" />
                                Result Preview
                            </CardTitle>
                            <CardDescription>Your QR Code is ready</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Canvas Container */}
                            <div className="flex items-center justify-center p-8 bg-secondary/30 rounded-2xl border border-dashed border-border">
                                <div className="relative group">

                                    <canvas
                                        ref={canvasRef}
                                        className="relative max-w-full h-auto rounded-md shadow-sm"
                                        style={{ maxHeight: '300px', width: 'auto' }} // CSS limits display size, canvas has high res
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={downloadPNG} className="w-full h-11 shadow-lg shadow-primary/20" size="lg">
                                    <Download className="w-4 h-4 mr-2" />
                                    PNG
                                </Button>
                                <Button onClick={downloadSVG} variant="outline" className="w-full h-11" size="lg">
                                    <Download className="w-4 h-4 mr-2" />
                                    SVG
                                </Button>
                                <Button onClick={copyToClipboard} variant="secondary" className="col-span-2 w-full h-11">
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy to Clipboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="hidden md:block text-center text-sm text-muted-foreground/60">
                        <p>High resolution output ({size}x{size}px)</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Controls - Order 2 on Mobile */}
            <div className="w-full md:w-1/2 lg:w-7/12 order-2 md:order-2 space-y-6">
                {/* Input Section */}
                <Card className="border-border/20 bg-card/60 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Type className="w-5 h-5 text-blue-500" />
                            Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="url" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 h-12 mb-6">
                                <TabsTrigger value="url" className="gap-2"><Link className="w-4 h-4" /> URL</TabsTrigger>
                                <TabsTrigger value="text" className="gap-2"><Type className="w-4 h-4" /> Text</TabsTrigger>
                                <TabsTrigger value="email" className="gap-2"><Mail className="w-4 h-4" /> Email</TabsTrigger>
                                <TabsTrigger value="phone" className="gap-2"><Phone className="w-4 h-4" /> Phone</TabsTrigger>
                            </TabsList>

                            <TabsContent value="url" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Website URL</Label>
                                    <Input
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="https://example.com"
                                        className="h-11 font-mono text-base"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="text" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Text Content</Label>
                                    <Input
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Enter any text..."
                                        className="h-11 text-base"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="email" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input
                                        value={text.replace('mailto:', '')}
                                        onChange={(e) => setText(`mailto:${e.target.value}`)}
                                        placeholder="user@example.com"
                                        type="email"
                                        className="h-11"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="phone" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        value={text.replace('tel:', '')}
                                        onChange={(e) => setText(`tel:${e.target.value}`)}
                                        placeholder="+1234567890"
                                        type="tel"
                                        className="h-11"
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Customization Section */}
                <Card className="border-border/20 bg-card/60 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Settings2 className="w-5 h-5 text-indigo-500" />
                            Appearance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Colors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>Foreground Color</Label>
                                <div className="flex gap-2 items-center">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 shadow-sm">
                                        <Input
                                            type="color"
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                            className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <Input
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value)}
                                        placeholder="#000000"
                                        className="font-mono uppercase"
                                        maxLength={7}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Background Color</Label>
                                <div className="flex gap-2 items-center">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 shadow-sm">
                                        <Input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <Input
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        placeholder="#ffffff"
                                        className="font-mono uppercase"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Dimensions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>Resolution Scale</Label>
                                    <span className="text-xs text-muted-foreground font-mono">{size}px</span>
                                </div>
                                <Slider
                                    value={[size]}
                                    onValueChange={(value) => setSize(value[0])}
                                    min={256}
                                    max={2048}
                                    step={64}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>Quiet Zone (Margin)</Label>
                                    <span className="text-xs text-muted-foreground font-mono">{margin} blocks</span>
                                </div>
                                <Slider
                                    value={[margin]}
                                    onValueChange={(value) => setMargin(value[0])}
                                    min={0}
                                    max={8}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Error Correction */}
                        <div className="space-y-3">
                            <Label className="flex justify-between">
                                Error Correction Level
                                <span className="text-xs text-muted-foreground font-normal">
                                    {errorLevel === 'L' && 'Blue (Low) - 7%'}
                                    {errorLevel === 'M' && 'Green (Medium) - 15%'}
                                    {errorLevel === 'Q' && 'Orange (Quartile) - 25%'}
                                    {errorLevel === 'H' && 'Red (High) - 30%'}
                                </span>
                            </Label>
                            <Select value={errorLevel} onValueChange={(value) => setErrorLevel(value as ErrorCorrectionLevel)}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="L">Level L (Simple)</SelectItem>
                                    <SelectItem value="M">Level M (Standard)</SelectItem>
                                    <SelectItem value="Q">Level Q (Complex)</SelectItem>
                                    <SelectItem value="H">Level H (Robust)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Higher levels allow the QR code to be scanned even if partially damaged or covered, but result in denser codes.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
