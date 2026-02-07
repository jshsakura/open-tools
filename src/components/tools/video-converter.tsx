"use client"

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import {
    Upload,
    Video,
    Music,
    FileImage,
    Download,
    Loader2,
    X,
    Scissors,
    Shield,
    FileVideo,
    Settings,
    Play,
    Pause
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function VideoConverter() {
    const t = useTranslations('VideoConverter');
    const [loaded, setLoaded] = useState(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [resultName, setResultName] = useState("");

    // Trim State
    const [duration, setDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(10);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Options State
    const [targetFormat, setTargetFormat] = useState("mp4");
    const [quality, setQuality] = useState("medium");
    const [audioFormat, setAudioFormat] = useState("mp3");
    const [audioBitrate, setAudioBitrate] = useState("192k");
    const [gifFps, setGifFps] = useState(10);
    const [gifWidth, setGifWidth] = useState(320);

    const ffmpegRef = useRef<FFmpeg | null>(null);

    useEffect(() => {
        loadFFmpeg();
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            if (resultUrl) URL.revokeObjectURL(resultUrl);
        }
    }, [])

    const loadFFmpeg = async () => {
        try {
            if (!ffmpegRef.current) {
                ffmpegRef.current = new FFmpeg();
            }
            const ffmpeg = ffmpegRef.current;

            ffmpeg.on('log', ({ message }) => {
                console.log(message);
            });
            ffmpeg.on('progress', ({ progress }) => {
                setProgress(Math.round(progress * 100));
            });

            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setLoaded(true);
        } catch (error) {
            console.error('FFmpeg load error:', error);
            toast.error('Failed to load FFmpeg. Please check your connection.');
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setVideoFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setResultUrl(null);
            setProgress(0);

            // Reset trim values
            setStartTime(0);
            // Duration will be set when metadata loads
        }
    }

    const onLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.target as HTMLVideoElement;
        setDuration(video.duration);
        setEndTime(video.duration);
    }

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        }
        return `${mm}:${ss}`;
    }

    const processVideo = async (action: 'convert' | 'trim' | 'audio' | 'gif') => {
        if (!videoFile || !loaded) return;
        setProcessing(true);
        setProgress(0);

        try {
            const ffmpeg = ffmpegRef.current;
            if (!ffmpeg) return;

            const inputName = 'input.' + videoFile.name.split('.').pop();

            await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

            let outputName = "";
            let command: string[] = [];

            switch (action) {
                case 'convert':
                    outputName = `output.${targetFormat}`;
                    command = ['-i', inputName];
                    if (targetFormat === 'mp4') {
                        command.push('-c:v', 'libx264', '-preset', 'veryfast');
                    }
                    command.push(outputName);
                    break;

                case 'trim':
                    outputName = `trimmed.${videoFile.name.split('.').pop() || 'mp4'}`;
                    // Use -ss before -i for faster seeking
                    command = [
                        '-ss', startTime.toString(),
                        '-to', endTime.toString(),
                        '-i', inputName,
                        '-c', 'copy', // Stream copy for fast trimming without re-encoding
                        outputName
                    ];
                    break;

                case 'audio':
                    outputName = `audio.${audioFormat}`;
                    command = ['-i', inputName, '-vn']; // No video
                    if (audioFormat === 'mp3') {
                        command.push('-ab', audioBitrate);
                    }
                    command.push(outputName);
                    break;

                case 'gif':
                    outputName = 'output.gif';
                    command = [
                        '-i', inputName,
                        '-vf', `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos`,
                        '-ss', startTime.toString(),
                        '-to', endTime.toString(),
                        outputName
                    ];
                    break;
            }

            console.log('Running command:', command);
            await ffmpeg.exec(command);

            const data = await ffmpeg.readFile(outputName) as any;
            const blobType = action === 'audio' ? `audio/${audioFormat}` :
                action === 'gif' ? 'image/gif' :
                    `video/${outputName.split('.').pop()}`;

            const url = URL.createObjectURL(new Blob([data.buffer], { type: blobType }));

            setResultUrl(url);
            setResultName(outputName);
            toast.success("Process complete!");

        } catch (error) {
            console.error('Processing error:', error);
            toast.error("An error occurred during processing.");
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Preview / Upload */}
            <div className="w-full lg:w-1/2 space-y-6">
                <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col">
                    {!loaded && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-sm font-medium">{t('ffmpegLoading')}</p>
                        </div>
                    )}

                    {!videoFile ? (
                        <div className={cn(
                            "relative flex-1 flex flex-col items-center justify-center p-12 m-1 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group",
                        )}>
                            <Input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            <div className="text-center space-y-6 relative z-0">
                                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                                    <Upload className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{t('inputPlaceholder')}</p>
                                    <p className="text-sm text-muted-foreground mt-2">MP4, WebM, MOV, AVI</p>
                                </div>
                                <Button variant="secondary" className="mt-4 pointer-events-none">
                                    Choose Video
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex-1 bg-black rounded-xl overflow-hidden group">
                            <video
                                ref={videoRef}
                                src={previewUrl!}
                                className="w-full h-full object-contain"
                                controls
                                onLoadedMetadata={onLoadedMetadata}
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-4 right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                    setVideoFile(null);
                                    setPreviewUrl(null);
                                    setResultUrl(null);
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </GlassCard>

                {/* Result Area (Sticky at bottom left if exists) */}
                {resultUrl && (
                    <GlassCard className="p-6 rounded-xl border-primary/20 animate-in slide-in-from-left duration-300">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                <FileVideo className="w-8 h-8 text-primary" />
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-1">
                                <h3 className="font-bold text-lg">Process Complete!</h3>
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">{resultName}</p>
                            </div>
                            <Button asChild size="lg" className="rounded-xl shadow-lg hover:shadow-primary/20 transition-all w-full sm:w-auto">
                                <a href={resultUrl} download={resultName}>
                                    <Download className="mr-2 h-5 w-5" />
                                    Download
                                </a>
                            </Button>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Right Column: Editor Tools (Always Visible) */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl overflow-hidden flex flex-col">
                    <Tabs defaultValue="convert" className="w-full flex-1 flex flex-col">
                        <div className="p-4 border-b border-border/10 bg-secondary/30 backdrop-blur-md">
                            <TabsList className="grid w-full grid-cols-4 h-12 bg-background/50 p-1 rounded-xl">
                                <TabsTrigger value="convert" className="rounded-lg">{t('tabs.convert')}</TabsTrigger>
                                <TabsTrigger value="trim" className="rounded-lg">{t('tabs.trim')}</TabsTrigger>
                                <TabsTrigger value="audio" className="rounded-lg">{t('tabs.audio')}</TabsTrigger>
                                <TabsTrigger value="gif" className="rounded-lg">{t('tabs.gif')}</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6 flex-1 relative">
                            {/* Overlay when no file selected */}
                            {!videoFile && (
                                <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-b-2xl">
                                    <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                            <Video className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="font-medium text-muted-foreground">Please select a video file to enable editing tools</p>
                                    </div>
                                </div>
                            )}

                            {/* Convert Tab */}
                            <TabsContent value="convert" className="space-y-8 mt-0 h-full">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <Label className="text-base">{t('convert.format')}</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['mp4', 'webm', 'mkv', 'avi'].map((fmt) => (
                                                <div
                                                    key={fmt}
                                                    onClick={() => setTargetFormat(fmt)}
                                                    className={cn(
                                                        "cursor-pointer rounded-xl border-2 p-4 flex items-center justify-between transition-all",
                                                        targetFormat === fmt
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "border-muted hover:border-primary/50 hover:bg-muted/50"
                                                    )}
                                                >
                                                    <span className="font-mono font-bold uppercase">{fmt}</span>
                                                    {targetFormat === fmt && <div className="w-3 h-3 rounded-full bg-primary" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-base">{t('convert.quality')}</Label>
                                        <Select value={quality} onValueChange={setQuality} disabled={!videoFile}>
                                            <SelectTrigger className="h-12 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="high">High Quality (Slower)</SelectItem>
                                                <SelectItem value="medium">Medium Quality (Balanced)</SelectItem>
                                                <SelectItem value="low">Low Quality (Faster)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-auto pt-8">
                                    <Button
                                        className="w-full h-14 text-lg rounded-xl shadow-lg"
                                        onClick={() => processVideo('convert')}
                                        disabled={!videoFile || processing}
                                    >
                                        {processing ? <Loader2 className="animate-spin mr-2" /> : <Video className="mr-2" />}
                                        {t('convert.action')}
                                    </Button>

                                    {processing && (
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Converting...</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Trim Tab */}
                            <TabsContent value="trim" className="space-y-8 mt-0 h-full">
                                <div className="space-y-8">
                                    <div className="flex justify-between items-end px-2">
                                        <div className="text-center">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Start</Label>
                                            <div className="text-3xl font-mono font-bold text-primary">{formatTime(startTime)}</div>
                                        </div>
                                        <div className="pb-2 text-muted-foreground">
                                            <Scissors className="w-6 h-6" />
                                        </div>
                                        <div className="text-center">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">End</Label>
                                            <div className="text-3xl font-mono font-bold text-primary">{formatTime(endTime)}</div>
                                        </div>
                                    </div>

                                    <div className="relative pt-6 pb-2 px-2 bg-secondary/20 rounded-xl p-4 border border-border/50">
                                        {/* Timeline Visual */}
                                        <div className="absolute top-4 left-4 right-4 flex justify-between text-[10px] text-muted-foreground/50 pointer-events-none select-none font-mono">
                                            <span>00:00</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>

                                        <Slider
                                            value={[startTime, endTime]}
                                            max={duration || 100} // Fallback if no duration yet
                                            step={0.1}
                                            minStepsBetweenThumbs={1}
                                            disabled={!videoFile}
                                            onValueChange={([start, end]) => {
                                                setStartTime(start);
                                                setEndTime(end);
                                                if (videoRef.current) {
                                                    if (Math.abs(videoRef.current.currentTime - start) > 0.5) {
                                                        videoRef.current.currentTime = start;
                                                    }
                                                }
                                            }}
                                            className="py-6 mt-2"
                                        />
                                        <p className="text-center text-xs text-muted-foreground mt-4">
                                            Dual-handle slider: Drag ends to trim
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Manual Start</Label>
                                            <Input
                                                type="number"
                                                value={startTime}
                                                onChange={(e) => setStartTime(Number(e.target.value))}
                                                step={0.1}
                                                className="font-mono h-11"
                                                disabled={!videoFile}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Manual End</Label>
                                            <Input
                                                type="number"
                                                value={endTime}
                                                onChange={(e) => setEndTime(Number(e.target.value))}
                                                step={0.1}
                                                className="font-mono h-11"
                                                disabled={!videoFile}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-8">
                                    <Button
                                        className="w-full h-14 text-lg rounded-xl shadow-lg"
                                        onClick={() => processVideo('trim')}
                                        disabled={!videoFile || processing}
                                    >
                                        {processing ? <Loader2 className="animate-spin mr-2" /> : <Scissors className="mr-2" />}
                                        {t('trim.action')}
                                    </Button>

                                    {processing && (
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Trimming...</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Audio Tab */}
                            <TabsContent value="audio" className="space-y-8 mt-0 h-full">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <Label className="text-base">{t('audio.format')}</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['mp3', 'wav', 'aac'].map((fmt) => (
                                                <div
                                                    key={fmt}
                                                    onClick={() => setAudioFormat(fmt)}
                                                    className={cn(
                                                        "cursor-pointer rounded-xl border-2 p-3 text-center transition-all",
                                                        audioFormat === fmt
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "border-muted hover:border-primary/50 hover:bg-muted/50"
                                                    )}
                                                >
                                                    <span className="font-mono font-bold uppercase">{fmt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-base">{t('audio.bitrate')}</Label>
                                        <Select value={audioBitrate} onValueChange={setAudioBitrate} disabled={!videoFile}>
                                            <SelectTrigger className="h-12 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="320k">320kbps (High Quality)</SelectItem>
                                                <SelectItem value="192k">192kbps (Standard)</SelectItem>
                                                <SelectItem value="128k">128kbps (Voice)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-auto pt-8">
                                    <Button
                                        className="w-full h-14 text-lg rounded-xl shadow-lg"
                                        onClick={() => processVideo('audio')}
                                        disabled={!videoFile || processing}
                                    >
                                        {processing ? <Loader2 className="animate-spin mr-2" /> : <Music className="mr-2" />}
                                        {t('audio.action')}
                                    </Button>

                                    {processing && (
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Extracting...</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* GIF Tab */}
                            <TabsContent value="gif" className="space-y-8 mt-0 h-full">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <Label className="text-base">{t('gif.fps')}</Label>
                                            <span className="font-mono font-bold text-primary">{gifFps} FPS</span>
                                        </div>
                                        <Slider
                                            value={[gifFps]}
                                            onValueChange={([val]) => setGifFps(val)}
                                            min={1}
                                            max={30}
                                            step={1}
                                            disabled={!videoFile}
                                            className="py-4"
                                        />
                                        <p className="text-xs text-muted-foreground text-right">Higher FPS = Smoother but larger file</p>
                                    </div>

                                    <div className="h-px bg-border/30 my-4" />

                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <Label className="text-base">{t('gif.width')}</Label>
                                            <span className="font-mono font-bold text-primary">{gifWidth} px</span>
                                        </div>
                                        <Slider
                                            value={[gifWidth]}
                                            onValueChange={([val]) => setGifWidth(val)}
                                            min={100}
                                            max={800}
                                            step={10}
                                            disabled={!videoFile}
                                            className="py-4"
                                        />
                                        <p className="text-xs text-muted-foreground text-right">Standard: 320-480px</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-8">
                                    <Button
                                        className="w-full h-14 text-lg rounded-xl shadow-lg"
                                        onClick={() => processVideo('gif')}
                                        disabled={!videoFile || processing}
                                    >
                                        {processing ? <Loader2 className="animate-spin mr-2" /> : <FileImage className="mr-2" />}
                                        {t('gif.action')}
                                    </Button>

                                    {processing && (
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Creating GIF...</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </GlassCard>
            </div>
        </div>
    )
}
