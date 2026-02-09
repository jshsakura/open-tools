"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Download, FileImage, RefreshCw, X } from "lucide-react"
import Image from "next/image"
import browserImageCompression from 'browser-image-compression';

interface ConvertedImage {
    name: string;
    url: string;
    size: string;
    type: string;
}

export function ImageConverter() {
    const t = useTranslations('ImageConverter');
    const tcatalog = useTranslations('Catalog.ImageConverter');
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setOriginalImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setConvertedImages([]);
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const convertImage = async (format: 'image/png' | 'image/jpeg' | 'image/webp') => {
        if (!originalImage) return;

        setIsConverting(true);
        try {
            const options = {
                maxSizeMB: 10, // Max size, effectively no limit for conversion unless compression is desired
                maxWidthOrHeight: 4096, // Limit dimension to prevent crash
                useWebWorker: true,
                fileType: format
            }

            // Note: browser-image-compression mainly focuses on compression. 
            // For format conversion, we might need a different approach if strict format conversion is needed without compression.
            // But it supports fileType in options.
            const compressedFile = await browserImageCompression(originalImage, options);

            // Rename extension
            const ext = format.split('/')[1];
            const newName = originalImage.name.substring(0, originalImage.name.lastIndexOf('.')) + '.' + (ext === 'jpeg' ? 'jpg' : ext);

            const converted: ConvertedImage = {
                name: newName,
                url: URL.createObjectURL(compressedFile),
                size: formatSize(compressedFile.size),
                type: format
            };

            setConvertedImages(prev => [...prev, converted]);

        } catch (error) {
            console.error(error);
        } finally {
            setIsConverting(false);
        }
    }

    // Fallback Canvas conversion if library has issues or for simpler control
    const convertWithCanvas = async (format: 'image/png' | 'image/jpeg' | 'image/webp') => {
        if (!originalImage || !previewUrl) return;
        setIsConverting(true);

        const img = document.createElement('img');
        img.src = previewUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const ext = format.split('/')[1];
                        const newName = originalImage.name.substring(0, originalImage.name.lastIndexOf('.')) + '.' + (ext === 'jpeg' ? 'jpg' : ext);
                        const converted: ConvertedImage = {
                            name: newName,
                            url: URL.createObjectURL(blob),
                            size: formatSize(blob.size),
                            type: format
                        };
                        setConvertedImages([converted]);
                    }
                    setIsConverting(false);
                }, format, 0.9);
            }
        };
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{t('introTitle')}</h2>
                <p className="text-muted-foreground">{t('introDesc')}</p>
                <p className="text-sm text-muted-foreground">{t('supportedFormats')}</p>
            </div>

            <GlassCard className="p-8 rounded-2xl">
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer relative">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                    />
                    {originalImage ? (
                        <div className="text-center space-y-4">
                            <div className="relative w-64 h-64 mx-auto rounded-lg overflow-hidden shadow-lg border border-border/40 bg-muted/20">
                                <Image src={previewUrl!} alt="Preview" fill className="object-cover" />
                            </div>
                            <div>
                                <p className="font-medium text-lg">{originalImage.name}</p>
                                <p className="text-muted-foreground">{formatSize(originalImage.size)}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setOriginalImage(null);
                                setPreviewUrl(null);
                                setConvertedImages([]);
                            }} className="relative z-10 pointer-events-auto">
                                <X className="mr-2 h-4 w-4" />
                                {t('remove')}
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="text-lg font-medium">{t('clickOrDrag')}</p>
                            <p className="text-sm text-muted-foreground">{tcatalog('dropDesc')}</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                        onClick={() => convertWithCanvas('image/png')}
                        disabled={isConverting || !originalImage}
                        className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20"
                    >
                        {isConverting ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <FileImage className="mr-2 h-4 w-4" />}
                        {t('convertToPng')}
                    </Button>
                    <Button
                        onClick={() => convertWithCanvas('image/jpeg')}
                        disabled={isConverting || !originalImage}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20"
                    >
                        {isConverting ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <FileImage className="mr-2 h-4 w-4" />}
                        {t('convertToJpg')}
                    </Button>
                    <Button
                        onClick={() => convertWithCanvas('image/webp')}
                        disabled={isConverting || !originalImage}
                        className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20"
                    >
                        {isConverting ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <FileImage className="mr-2 h-4 w-4" />}
                        {t('convertToWebp')}
                    </Button>
                </div>
            </GlassCard>

            {convertedImages.length > 0 && (
                <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4">
                    {convertedImages.map((img, idx) => (
                        <GlassCard key={idx} className="p-4 flex items-center justify-between rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-muted/20 rounded-lg">
                                    <FileImage className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-semibold">{img.name}</p>
                                    <p className="text-sm text-muted-foreground">{img.size}</p>
                                </div>
                            </div>
                            <Button onClick={() => {
                                const link = document.createElement('a');
                                link.href = img.url;
                                link.download = img.name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}>
                                <Download className="mr-2 h-4 w-4" />
                                {t('download')}
                            </Button>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    )
}
