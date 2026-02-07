"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileArchive, X, Loader2, Image as ImageIcon, Smartphone, Monitor, FileCode, Download } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export function FaviconGenerator() {
    const t = useTranslations('Catalog.FaviconGenerator');
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setOriginalImage(file);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
            toast.success(t("ready") || "Image is ready!");
        }
    }

    const generateFavicons = async () => {
        if (!originalImage || !previewUrl) return;

        setIsGenerating(true);
        const loadingToast = toast.loading(t("generating") || "Generating...");

        try {
            const img = document.createElement('img');

            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error("Timeout")), 10000);
                img.onload = () => {
                    clearTimeout(timeout);
                    resolve(null);
                };
                img.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error("Image failed to load"));
                };
                img.src = previewUrl;
            });

            const sizes = [
                { width: 16, height: 16, name: 'favicon-16x16.png' },
                { width: 32, height: 32, name: 'favicon-32x32.png' },
                { width: 48, height: 48, name: 'favicon-48x48.png' },
                { width: 180, height: 180, name: 'apple-touch-icon.png' },
                { width: 192, height: 192, name: 'android-chrome-192x192.png' },
                { width: 512, height: 512, name: 'android-chrome-512x512.png' }
            ];

            const generateBlob = (width: number, height: number): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';

                        const aspect = img.width / img.height;
                        let sx = 0, sy = 0, sw = img.width, sh = img.height;

                        if (aspect > 1) {
                            sw = img.height;
                            sx = (img.width - img.height) / 2;
                        } else {
                            sh = img.width;
                            sy = (img.height - img.width) / 2;
                        }

                        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);

                        canvas.toBlob((blob) => {
                            if (blob) {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result as string);
                                reader.readAsDataURL(blob);
                            } else {
                                reject(new Error("Blob generation failed"));
                            }
                        }, 'image/png');
                    } else {
                        reject(new Error("Canvas context failed"));
                    }
                });
            };

            const files: Array<{ name: string; data: string }> = [];

            for (const size of sizes) {
                try {
                    const dataUrl = await generateBlob(size.width, size.height);
                    files.push({ name: size.name, data: dataUrl });
                    console.log(`Generated ${size.name}`);
                } catch (e) {
                    console.error(`Failed to generate ${size.name}`, e);
                    throw new Error(`Failed to generate ${size.name}: ${e}`);
                }
            }

            const icoDataUrl = await generateBlob(32, 32);
            files.push({ name: 'favicon.ico', data: icoDataUrl });
            console.log("Generated favicon.ico");

            const manifest = {
                name: "App Name",
                short_name: "App",
                icons: [
                    { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
                    { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png" }
                ],
                theme_color: "#ffffff",
                background_color: "#ffffff",
                display: "standalone"
            };
            files.push({ name: 'site.webmanifest', data: `data:application/json;base64,${btoa(JSON.stringify(manifest, null, 2))}` });
            console.log("Generated site.webmanifest");

            console.log("Sending to API...");
            const response = await fetch('/api/favicon-zip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${errorText}`);
            }

            console.log("ZIP received from API");

            const blob = await response.blob();
            const filename = `favicons-${Date.now()}.zip`;

            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: filename,
                        types: [
                            {
                                description: 'ZIP Archive',
                                accept: { 'application/zip': ['.zip'] },
                            },
                        ],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                } catch (err: any) {
                    if (err.name === 'AbortError') {
                        console.log('File picker cancelled by user');
                        return;
                    }
                    throw err;
                }
            } else {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
            }

            toast.dismiss(loadingToast);
            toast.success("Favicon ZIP downloaded!");

        } catch (error) {
            console.error("[FaviconGenerator] Error:", error);
            toast.dismiss(loadingToast);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast.error(`Generation failed: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOriginalImage(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        toast.info("Image cleared");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <GlassCard className="p-8 rounded-2xl">
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer relative min-h-[300px]">
                    {!originalImage ? (
                        <>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="text-center space-y-2 relative z-10 text-muted-foreground">
                                <Upload className="w-12 h-12 mx-auto" />
                                <p className="text-lg font-medium">{t("dropTitle")}</p>
                                <p className="text-sm">{t("dropDesc")}</p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-4 relative z-20 w-full">
                            <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden shadow-lg border border-border/40 bg-secondary/50">
                                <Image src={previewUrl!} alt="Preview" fill className="object-contain" />
                            </div>
                            <div>
                                <p className="font-medium text-lg text-foreground">{originalImage.name}</p>
                                <p className="text-muted-foreground text-sm uppercase tracking-wider font-bold">
                                    {isGenerating ? t("generating") : (t("ready") || "READY TO GENERATE")}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleRemove} className="cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                                <X className="mr-2 h-4 w-4" />
                                {t("remove")}
                            </Button>
                        </div>
                    )}
                </div>

                {originalImage && (
                    <div className="mt-8 flex flex-col items-center gap-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
                            {['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png'].map((file) => (
                                <div key={file} className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/40 border border-border/10 text-[11px] text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                    {file}
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={generateFavicons}
                            disabled={isGenerating}
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-xl transform transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20 cursor-pointer min-w-[200px] font-bold text-base"
                        >
                            {isGenerating ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <FileArchive className="mr-2 h-5 w-5" />
                            )}
                            {isGenerating ? t("generating") : (t("generate") || "Generate Favicon Set")}
                        </Button>
                    </div>
                )}
            </GlassCard>

            <div className="text-center text-sm text-muted-foreground bg-secondary/30 p-8 rounded-3xl border border-border/20 backdrop-blur-md">
                <p className="font-bold text-foreground mb-4 text-base">{t("formats")}</p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 opacity-90 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> ICO (32x32)</span>
                    <span className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> PNG (16, 32, 48)</span>
                    <span className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Apple (180x180)</span>
                    <span className="flex items-center gap-1.5"><Monitor className="h-3.5 w-3.5" /> Android (192, 512)</span>
                    <span className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> webmanifest</span>
                </div>
            </div>
        </div>
    )
}
