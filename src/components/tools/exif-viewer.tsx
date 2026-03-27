"use client"

import { useState, useRef, useCallback } from "react"
import { useTranslations } from "next-intl"
import {
    Upload,
    Download,
    Trash2,
    Camera,
    MapPin,
    Calendar,
    Info,
    ShieldAlert,
    Copy,
    CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ExifData {
    fileName: string
    fileSize: number
    fileType: string
    width: number
    height: number
    lastModified: string
    cameraMake?: string
    cameraModel?: string
    exposureTime?: string
    fNumber?: string
    iso?: number
    dateTime?: string
    gpsLatitude?: number
    gpsLongitude?: number
    software?: string
    orientation?: number
    focalLength?: string
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function readUint16(view: DataView, offset: number, littleEndian: boolean): number {
    return view.getUint16(offset, littleEndian)
}

function readUint32(view: DataView, offset: number, littleEndian: boolean): number {
    return view.getUint32(offset, littleEndian)
}

function readRational(view: DataView, offset: number, littleEndian: boolean): number {
    const numerator = readUint32(view, offset, littleEndian)
    const denominator = readUint32(view, offset + 4, littleEndian)
    return denominator === 0 ? 0 : numerator / denominator
}

function readSignedRational(view: DataView, offset: number, littleEndian: boolean): number {
    const numerator = view.getInt32(offset, littleEndian)
    const denominator = view.getInt32(offset + 4, littleEndian)
    return denominator === 0 ? 0 : numerator / denominator
}

function readString(view: DataView, offset: number, length: number): string {
    let str = ""
    for (let i = 0; i < length; i++) {
        const c = view.getUint8(offset + i)
        if (c === 0) break
        str += String.fromCharCode(c)
    }
    return str.trim()
}

function parseGpsCoordinate(
    view: DataView,
    offset: number,
    littleEndian: boolean
): number {
    const degrees = readRational(view, offset, littleEndian)
    const minutes = readRational(view, offset + 8, littleEndian)
    const seconds = readRational(view, offset + 16, littleEndian)
    return degrees + minutes / 60 + seconds / 3600
}

function getTagValue(
    view: DataView,
    tiffStart: number,
    entryOffset: number,
    littleEndian: boolean
): string | number | undefined {
    const type = readUint16(view, entryOffset + 2, littleEndian)
    const count = readUint32(view, entryOffset + 4, littleEndian)
    const valueOffset = entryOffset + 8

    // Types: 1=BYTE, 2=ASCII, 3=SHORT, 4=LONG, 5=RATIONAL, 10=SRATIONAL
    switch (type) {
        case 2: { // ASCII
            const totalBytes = count
            if (totalBytes <= 4) {
                return readString(view, valueOffset, totalBytes)
            }
            const strOffset = readUint32(view, valueOffset, littleEndian)
            return readString(view, tiffStart + strOffset, totalBytes)
        }
        case 3: // SHORT
            return readUint16(view, valueOffset, littleEndian)
        case 4: // LONG
            return readUint32(view, valueOffset, littleEndian)
        case 5: { // RATIONAL
            const ratOffset = readUint32(view, valueOffset, littleEndian)
            return readRational(view, tiffStart + ratOffset, littleEndian)
        }
        case 10: { // SRATIONAL
            const sratOffset = readUint32(view, valueOffset, littleEndian)
            return readSignedRational(view, tiffStart + sratOffset, littleEndian)
        }
        default:
            return undefined
    }
}

function parseExifFromBuffer(buffer: ArrayBuffer): Partial<ExifData> {
    const view = new DataView(buffer)
    const result: Partial<ExifData> = {}

    // Find EXIF APP1 marker (0xFFE1)
    let offset = 2 // skip SOI marker 0xFFD8
    while (offset < view.byteLength - 2) {
        const marker = view.getUint16(offset)
        if (marker === 0xFFE1) {
            // Found APP1
            const length = view.getUint16(offset + 2)
            // Check "Exif\0\0"
            const exifStr = readString(view, offset + 4, 4)
            if (exifStr === "Exif") {
                const tiffStart = offset + 10 // After marker(2) + length(2) + "Exif\0\0"(6)
                const byteOrder = view.getUint16(tiffStart)
                const littleEndian = byteOrder === 0x4949 // "II"

                const ifdOffset = readUint32(view, tiffStart + 4, littleEndian)
                parseIfd(view, tiffStart, tiffStart + ifdOffset, littleEndian, result, "ifd0")
            }
            break
        }
        // Move to next marker
        if ((view.getUint8(offset) & 0xFF) !== 0xFF) break
        const segLen = view.getUint16(offset + 2)
        offset += 2 + segLen
    }

    return result
}

function parseIfd(
    view: DataView,
    tiffStart: number,
    ifdStart: number,
    littleEndian: boolean,
    result: Partial<ExifData>,
    ifdType: string
) {
    if (ifdStart >= view.byteLength - 2) return

    const entryCount = readUint16(view, ifdStart, littleEndian)

    for (let i = 0; i < entryCount; i++) {
        const entryOffset = ifdStart + 2 + i * 12
        if (entryOffset + 12 > view.byteLength) break

        const tag = readUint16(view, entryOffset, littleEndian)

        if (ifdType === "ifd0") {
            switch (tag) {
                case 0x010F: // Make
                    result.cameraMake = getTagValue(view, tiffStart, entryOffset, littleEndian) as string
                    break
                case 0x0110: // Model
                    result.cameraModel = getTagValue(view, tiffStart, entryOffset, littleEndian) as string
                    break
                case 0x0112: // Orientation
                    result.orientation = getTagValue(view, tiffStart, entryOffset, littleEndian) as number
                    break
                case 0x0131: // Software
                    result.software = getTagValue(view, tiffStart, entryOffset, littleEndian) as string
                    break
                case 0x0132: // DateTime
                    result.dateTime = getTagValue(view, tiffStart, entryOffset, littleEndian) as string
                    break
                case 0x8769: { // ExifIFDPointer
                    const exifOffset = readUint32(view, entryOffset + 8, littleEndian)
                    parseIfd(view, tiffStart, tiffStart + exifOffset, littleEndian, result, "exif")
                    break
                }
                case 0x8825: { // GPSInfoIFDPointer
                    const gpsOffset = readUint32(view, entryOffset + 8, littleEndian)
                    parseIfd(view, tiffStart, tiffStart + gpsOffset, littleEndian, result, "gps")
                    break
                }
            }
        } else if (ifdType === "exif") {
            switch (tag) {
                case 0x829A: { // ExposureTime
                    const val = getTagValue(view, tiffStart, entryOffset, littleEndian) as number
                    if (val !== undefined) {
                        result.exposureTime = val < 1 ? `1/${Math.round(1 / val)}` : `${val}`
                    }
                    break
                }
                case 0x829D: { // FNumber
                    const fn = getTagValue(view, tiffStart, entryOffset, littleEndian) as number
                    if (fn !== undefined) result.fNumber = `f/${fn.toFixed(1)}`
                    break
                }
                case 0x8827: // ISOSpeedRatings
                    result.iso = getTagValue(view, tiffStart, entryOffset, littleEndian) as number
                    break
                case 0x9003: // DateTimeOriginal
                    result.dateTime = getTagValue(view, tiffStart, entryOffset, littleEndian) as string
                    break
                case 0x920A: { // FocalLength
                    const fl = getTagValue(view, tiffStart, entryOffset, littleEndian) as number
                    if (fl !== undefined) result.focalLength = `${fl.toFixed(1)}mm`
                    break
                }
            }
        } else if (ifdType === "gps") {
            switch (tag) {
                case 0x0001: { // GPSLatitudeRef
                    const ref = getTagValue(view, tiffStart, entryOffset, littleEndian) as string
                    if (ref === "S" && result.gpsLatitude) {
                        result.gpsLatitude = -result.gpsLatitude
                    }
                    break
                }
                case 0x0002: { // GPSLatitude
                    const latOffset = readUint32(view, entryOffset + 8, littleEndian)
                    result.gpsLatitude = parseGpsCoordinate(view, tiffStart + latOffset, littleEndian)
                    break
                }
                case 0x0003: { // GPSLongitudeRef
                    const ref = getTagValue(view, tiffStart, entryOffset, littleEndian) as string
                    if (ref === "W" && result.gpsLongitude) {
                        result.gpsLongitude = -result.gpsLongitude
                    }
                    break
                }
                case 0x0004: { // GPSLongitude
                    const lonOffset = readUint32(view, entryOffset + 8, littleEndian)
                    result.gpsLongitude = parseGpsCoordinate(view, tiffStart + lonOffset, littleEndian)
                    break
                }
            }
        }
    }
}

export function ExifViewerTool() {
    const t = useTranslations("ExifViewer")
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [exifData, setExifData] = useState<ExifData | null>(null)
    const [cleanedUrl, setCleanedUrl] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback(async (f: File) => {
        setFile(f)
        setCleanedUrl(null)
        setIsProcessing(true)

        const url = URL.createObjectURL(f)
        setPreview(url)

        // Get image dimensions
        const img = new Image()
        img.src = url
        await new Promise<void>((resolve) => { img.onload = () => resolve() })

        // Parse EXIF
        const buffer = await f.arrayBuffer()
        const exifParsed = parseExifFromBuffer(buffer)

        setExifData({
            fileName: f.name,
            fileSize: f.size,
            fileType: f.type,
            width: img.naturalWidth,
            height: img.naturalHeight,
            lastModified: new Date(f.lastModified).toLocaleString(),
            ...exifParsed,
        })

        setIsProcessing(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f && f.type.startsWith("image/")) handleFile(f)
    }, [handleFile])

    const handleRemoveExif = useCallback(async () => {
        if (!file || !preview) return
        setIsProcessing(true)

        const img = new Image()
        img.src = preview
        await new Promise<void>((resolve) => { img.onload = () => resolve() })

        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) { setIsProcessing(false); return }

        ctx.drawImage(img, 0, 0)

        const outputType = file.type === "image/png" ? "image/png" : "image/jpeg"
        const quality = file.type === "image/png" ? undefined : 0.95

        canvas.toBlob((blob) => {
            if (blob) {
                setCleanedUrl(URL.createObjectURL(blob))
                toast.success(t("removeSuccess"))
            }
            setIsProcessing(false)
        }, outputType, quality)
    }, [file, preview, t])

    const handleDownload = useCallback(() => {
        if (!cleanedUrl || !file) return
        const a = document.createElement("a")
        a.href = cleanedUrl
        const ext = file.name.split(".").pop() || "jpg"
        a.download = `${file.name.replace(/\.[^.]+$/, "")}_clean.${ext}`
        a.click()
        toast.success(t("downloaded"))
    }, [cleanedUrl, file, t])

    const handleReset = useCallback(() => {
        setFile(null)
        setPreview(null)
        setExifData(null)
        setCleanedUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }, [])

    const copyValue = useCallback((value: string, field: string) => {
        navigator.clipboard.writeText(value)
        setCopiedField(field)
        toast.success(t("copied"))
        setTimeout(() => setCopiedField(null), 2000)
    }, [t])

    const renderInfoRow = (label: string, value: string | number | undefined, fieldKey: string) => {
        if (value === undefined || value === "") return null
        const strVal = String(value)
        return (
            <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium">{strVal}</span>
                    <button
                        onClick={() => copyValue(strVal, fieldKey)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {copiedField === fieldKey ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Privacy Warning */}
            <GlassCard className="p-4 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{t("privacyTitle")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("privacyDesc")}</p>
                    </div>
                </div>
            </GlassCard>

            {/* Upload Area */}
            {!file && (
                <GlassCard
                    className="p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">{t("dropTitle")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t("dropDesc")}</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/heic,image/heif,image/webp,image/tiff"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFile(f)
                        }}
                    />
                </GlassCard>
            )}

            {/* Image Preview + EXIF Data */}
            {file && exifData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Preview */}
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-sm">{t("preview")}</h3>
                            <Button variant="ghost" size="sm" onClick={handleReset}>
                                <Trash2 className="h-4 w-4 mr-1" /> {t("reset")}
                            </Button>
                        </div>
                        {preview && (
                            <div className="rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={preview} alt="Preview" className="max-w-full max-h-[400px] object-contain" />
                            </div>
                        )}
                    </GlassCard>

                    {/* EXIF Info */}
                    <GlassCard className="p-4">
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Info className="h-4 w-4" /> {t("exifInfo")}
                        </h3>
                        <div className="space-y-0">
                            {/* File Info */}
                            <div className="mb-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("fileInfo")}</p>
                                {renderInfoRow(t("fileName"), exifData.fileName, "fileName")}
                                {renderInfoRow(t("fileSize"), formatBytes(exifData.fileSize), "fileSize")}
                                {renderInfoRow(t("fileType"), exifData.fileType, "fileType")}
                                {renderInfoRow(t("dimensions"), `${exifData.width} x ${exifData.height}`, "dimensions")}
                                {renderInfoRow(t("lastModified"), exifData.lastModified, "lastModified")}
                            </div>

                            {/* Camera Info */}
                            {(exifData.cameraMake || exifData.cameraModel || exifData.exposureTime || exifData.fNumber || exifData.iso) && (
                                <div className="mb-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Camera className="h-3 w-3" /> {t("cameraInfo")}
                                    </p>
                                    {renderInfoRow(t("cameraMake"), exifData.cameraMake, "cameraMake")}
                                    {renderInfoRow(t("cameraModel"), exifData.cameraModel, "cameraModel")}
                                    {renderInfoRow(t("exposure"), exifData.exposureTime, "exposure")}
                                    {renderInfoRow(t("aperture"), exifData.fNumber, "aperture")}
                                    {renderInfoRow("ISO", exifData.iso, "iso")}
                                    {renderInfoRow(t("focalLength"), exifData.focalLength, "focalLength")}
                                    {renderInfoRow(t("software"), exifData.software, "software")}
                                    {renderInfoRow(t("dateTaken"), exifData.dateTime, "dateTaken")}
                                </div>
                            )}

                            {/* GPS Info */}
                            {(exifData.gpsLatitude !== undefined && exifData.gpsLongitude !== undefined) && (
                                <div className="mb-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {t("gpsInfo")}
                                    </p>
                                    {renderInfoRow(t("latitude"), exifData.gpsLatitude.toFixed(6), "lat")}
                                    {renderInfoRow(t("longitude"), exifData.gpsLongitude.toFixed(6), "lon")}
                                </div>
                            )}

                            {/* No camera info message */}
                            {!exifData.cameraMake && !exifData.cameraModel && !exifData.exposureTime && !exifData.gpsLatitude && (
                                <div className="text-center py-4">
                                    <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">{t("noExifData")}</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Actions */}
            {file && (
                <GlassCard className="p-4">
                    <div className="flex flex-wrap gap-3 items-center justify-center">
                        <Button
                            onClick={handleRemoveExif}
                            disabled={isProcessing || !!cleanedUrl}
                            className="gap-2"
                        >
                            <ShieldAlert className="h-4 w-4" />
                            {isProcessing ? t("processing") : t("removeExif")}
                        </Button>
                        {cleanedUrl && (
                            <Button onClick={handleDownload} variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                {t("downloadClean")}
                            </Button>
                        )}
                    </div>
                    {cleanedUrl && (
                        <p className="text-center text-xs text-green-600 dark:text-green-400 mt-3">
                            {t("cleanedNote")}
                        </p>
                    )}
                </GlassCard>
            )}
        </div>
    )
}
