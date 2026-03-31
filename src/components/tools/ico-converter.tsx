"use client"

import { useState, useRef } from "react"
import { useTranslations } from 'next-intl'
import { Upload, Download, Image as ImageIcon, CheckCircle2 } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const ICON_SIZES = [16, 32, 48, 64, 128, 256]

export function IcoConverter() {
    const t = useTranslations('IcoConverter');
    const [image, setImage] = useState<string | null>(null)
    const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48])
    const [isConverting, setIsConverting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setImage(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const toggleSize = (size: number) => {
        setSelectedSizes(prev => 
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        )
    }

    const generateIco = async () => {
        if (!image || selectedSizes.length === 0) return
        setIsConverting(true)

        try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()
            img.src = image
            await new Promise(resolve => img.onload = resolve)

            const iconData: Blob[] = []
            for (const size of selectedSizes) {
                canvas.width = size
                canvas.height = size
                ctx?.clearRect(0, 0, size, size)
                ctx?.drawImage(img, 0, 0, size, size)
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
                if (blob) iconData.push(blob)
            }

            // Create ICO file structure
            const totalSize = iconData.reduce((acc, blob) => acc + blob.size, 0)
            const headerSize = 6 + (16 * iconData.length)
            const buffer = new ArrayBuffer(headerSize + totalSize)
            const view = new DataView(buffer)

            // Header
            view.setUint16(0, 0, true) // Reserved
            view.setUint16(2, 1, true) // Type (1 for ICO)
            view.setUint16(4, iconData.length, true) // Number of images

            let offset = headerSize
            for (let i = 0; i < iconData.length; i++) {
                const size = selectedSizes[i]
                const blob = iconData[i]
                
                // Directory Entry
                const entryOffset = 6 + (i * 16)
                view.setUint8(entryOffset, size >= 256 ? 0 : size) // Width
                view.setUint8(entryOffset + 1, size >= 256 ? 0 : size) // Height
                view.setUint8(entryOffset + 2, 0) // Color palette
                view.setUint8(entryOffset + 3, 0) // Reserved
                view.setUint16(entryOffset + 4, 1, true) // Color planes
                view.setUint16(entryOffset + 6, 32, true) // Bits per pixel
                view.setUint32(entryOffset + 8, blob.size, true) // Image size
                view.setUint32(entryOffset + 12, offset, true) // Image offset

                const blobBuffer = await blob.arrayBuffer()
                new Uint8Array(buffer, offset, blob.size).set(new Uint8Array(blobBuffer))
                offset += blob.size
            }

            const icoBlob = new Blob([buffer], { type: 'image/x-icon' })
            const url = URL.createObjectURL(icoBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'favicon.ico'
            a.click()
            URL.revokeObjectURL(url)
            toast.success("ICO generated successfully!")
        } catch (error) {
            console.error(error)
            toast.error("Failed to generate ICO")
        } finally {
            setIsConverting(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <GlassCard className="p-8">
                <label 
                    htmlFor="ico-upload-input"
                    className="block border-2 border-dashed border-border/60 rounded-2xl p-12 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group mb-8"
                >
                    <input 
                        id="ico-upload-input"
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {image ? (
                        <div className="space-y-4">
                            <img src={image} alt="Preview" className="w-32 h-32 mx-auto rounded-lg object-contain bg-muted/20" />
                            <p className="text-sm text-muted-foreground">Click to change image</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-semibold">{t('dropzone')}</p>
                                <p className="text-sm text-muted-foreground">Supports PNG, JPG, SVG (Max 5MB)</p>
                            </div>
                        </div>
                    )}
                </label>

                <div className="space-y-6">
                    <Label className="text-lg font-semibold">{t('sizes')}</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                        {ICON_SIZES.map(size => (
                            <button 
                                type="button"
                                key={size}
                                className={`flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer ${
                                    selectedSizes.includes(size) 
                                    ? 'bg-primary/10 border-primary shadow-sm' 
                                    : 'bg-muted/10 border-border/40 hover:border-primary/20'
                                }`}
                                onClick={() => toggleSize(size)}
                            >
                                <span className="text-sm font-medium mb-2">{size}x{size}</span>
                                <Checkbox checked={selectedSizes.includes(size)} />
                            </button>
                        ))}
                    </div>

                    <Button 
                        className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" 
                        disabled={!image || selectedSizes.length === 0 || isConverting}
                        onClick={generateIco}
                    >
                        {isConverting ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        ) : (
                            <Download className="w-5 h-5 mr-2" />
                        )}
                        {t('download')}
                    </Button>
                </div>
            </GlassCard>
        </div>
    )
}
