"use client"

import { useState, useRef } from 'react'
import { getToolById } from "@/lib/tools-catalog"
import { ToolPageHeader } from "@/components/tool-page-header"
import { useTranslations } from 'next-intl'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Loader2, Music, Video, AlertCircle, ScanText, Captions } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type YoutubeQuality = {
  id: string
  label: string
  ext?: string
  isSubtitle?: boolean
  videoUrl?: string | null
  audioUrl?: string | null
  subtitleUrl?: string | null
  totalSize?: number
  videoFilesize?: number
  audioFilesize?: number
}

type YoutubeMetadata = {
  title: string
  thumbnail?: string
  duration?: number
  qualities?: YoutubeQuality[]
  subtitles?: Record<string, string>
}

export function YoutubeDownloaderPageClient() {
  const t = useTranslations('Catalog')
  const tool = getToolById('youtube-downloader')
  const [url, setUrl] = useState('')
  const [proxy, setProxy] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<YoutubeMetadata | null>(null)
  const [qualities, setQualities] = useState<YoutubeQuality[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const ffmpegRef = useRef<FFmpeg | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadFFmpeg = async () => {
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg()
    }
    const ffmpeg = ffmpegRef.current
    if (ffmpeg.loaded) return

    setStatus(t('YouTubeDownloader.steps.loadingFFmpeg') || 'Loading FFmpeg core...')
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })
    setStatus(t('YouTubeDownloader.steps.ready') || 'Ready')
  }

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return t('YouTubeDownloader.sizeUnknown')
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleAnalyze = async () => {
    if (!url) return
    setAnalyzing(true)
    setError(null)
    setMetadata(null)
    setQualities([])

    try {
      let apiUrl = `/api/youtube/extract?url=${encodeURIComponent(url)}`
      if (proxy) apiUrl += `&proxy=${encodeURIComponent(proxy)}`

      const response = await fetch(apiUrl)
      const data = (await response.json()) as YoutubeMetadata & { error?: string }

      if (data.error) throw new Error(data.error)

      setMetadata(data)

      const allQualities = [...(data.qualities || [])]

      if (data.subtitles) {
        Object.entries(data.subtitles).forEach(([lang, subtitleUrl]) => {
          allQualities.push({
            id: `sub-${lang}`,
            label: t('YouTubeDownloader.subtitleLabel', { lang: lang.toUpperCase() }),
            ext: 'srt',
            isSubtitle: true,
            videoUrl: null,
            audioUrl: null,
            subtitleUrl,
            totalSize: 0,
          })
        })
      }

      setQualities(allQualities)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze video'
      setError(message)
    } finally {
      setAnalyzing(false)
    }
  }

  const startDownload = async (quality: YoutubeQuality) => {
    setDownloadingId(quality.id)
    setLoading(true)
    setError(null)
    setProgress(0)

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    try {
      if (quality.isSubtitle && quality.subtitleUrl && metadata) {
        setStatus('Downloading subtitle...')
        const response = await fetch(quality.subtitleUrl)
        const blob = await response.blob()
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${metadata.title}.${quality.id.replace('sub-', '')}.srt`
        a.click()

        setProgress(100)
        setStatus(t('YouTubeDownloader.steps.completed'))
        setLoading(false)
        return
      }

      await loadFFmpeg()
      const ffmpeg = ffmpegRef.current
      if (!ffmpeg) throw new Error('FFmpeg not loaded')

      const getProxyUrl = (mediaUrl: string) => `/api/cors-proxy?url=${encodeURIComponent(mediaUrl)}`

      const fetchWithProgress = async (
        mediaUrl: string,
        totalSize: number | null,
        onProgress: (p: number, loaded: number, total: number) => void,
      ): Promise<Uint8Array> => {
        const response = await fetch(mediaUrl, { signal })
        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`)

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const contentLength = response.headers.get('content-length')
        const total = totalSize || (contentLength ? parseInt(contentLength, 10) : 0)

        const chunks: Uint8Array[] = []
        let receivedLength = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          chunks.push(value)
          receivedLength += value.length

          if (total > 0) {
            onProgress(Math.min(99, (receivedLength / total) * 100), receivedLength, total)
          } else {
            onProgress(0, receivedLength, 0)
          }
        }

        const result = new Uint8Array(receivedLength)
        let position = 0
        for (const chunk of chunks) {
          result.set(chunk, position)
          position += chunk.length
        }

        onProgress(100, receivedLength, total)
        return result
      }

      if (quality.videoUrl) {
        setStatus(t('YouTubeDownloader.steps.downloadingVideo'))
        setProgress(10)

        const videoSize = quality.videoFilesize || 0
        const videoData = await fetchWithProgress(getProxyUrl(quality.videoUrl), videoSize, (p, loaded, total) => {
          setProgress(10 + Math.round(p * 0.3))
          if (total > 0) {
            setStatus(`${t('YouTubeDownloader.steps.downloadingVideo')} (${Math.round(p)}% - ${formatBytes(loaded)} / ${formatBytes(total)})`)
          } else {
            setStatus(`${t('YouTubeDownloader.steps.downloadingVideo')} (${formatBytes(loaded)})`)
          }
        })

        if (videoData.byteLength === 0) {
          throw new Error(t('YouTubeDownloader.errors.emptyFile'))
        }

        await ffmpeg.writeFile('input_video.mp4', videoData)
      }

      if (quality.audioUrl) {
        setStatus(t('YouTubeDownloader.steps.downloadingAudio'))
        setProgress(40)

        const audioSize = quality.audioFilesize || 0
        const audioData = await fetchWithProgress(getProxyUrl(quality.audioUrl), audioSize, (p, loaded, total) => {
          setProgress(40 + Math.round(p * 0.2))
          if (total > 0) {
            setStatus(`${t('YouTubeDownloader.steps.downloadingAudio')} (${Math.round(p)}% - ${formatBytes(loaded)} / ${formatBytes(total)})`)
          } else {
            setStatus(`${t('YouTubeDownloader.steps.downloadingAudio')} (${formatBytes(loaded)})`)
          }
        })

        if (audioData.byteLength === 0) {
          throw new Error('Downloaded audio file is empty.')
        }

        await ffmpeg.writeFile('input_audio.m4a', audioData)
      }

      setProgress(60)
      setStatus(t('YouTubeDownloader.steps.muxing'))

      ffmpeg.on('progress', ({ progress: muxProgress }) => {
        setProgress(60 + Math.round(muxProgress * 35))
      })

      if (quality.id === 'audio') {
        await ffmpeg.exec(['-i', 'input_audio.m4a', '-vn', '-acodec', 'libmp3lame', 'output.mp3'])
        const outData = await ffmpeg.readFile('output.mp3')
        if (typeof outData === 'string') throw new Error('Unexpected text output from FFmpeg')
        if (!metadata) throw new Error('Missing metadata')
        downloadBlob(outData, `${metadata.title}.mp3`, 'audio/mpeg')
      } else {
        if (quality.videoUrl && quality.audioUrl) {
          await ffmpeg.exec(['-i', 'input_video.mp4', '-i', 'input_audio.m4a', '-c', 'copy', 'output.mp4'])
        } else {
          await ffmpeg.exec(['-i', 'input_video.mp4', '-c', 'copy', 'output.mp4'])
        }

        const outData = await ffmpeg.readFile('output.mp4')
        if (typeof outData === 'string') throw new Error('Unexpected text output from FFmpeg')
        if (!metadata) throw new Error('Missing metadata')
        downloadBlob(outData, `${metadata.title}.mp4`, 'video/mp4')
      }

      setProgress(100)
      setStatus(t('YouTubeDownloader.steps.completed'))
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus(t('YouTubeDownloader.steps.cancelled'))
      } else {
        const message = err instanceof Error ? err.message : t('YouTubeDownloader.errors.download')
        setError(message)
      }
    } finally {
      setLoading(false)
      setDownloadingId(null)
    }
  }

  const downloadBlob = (data: Uint8Array | ArrayBuffer, filename: string, type: string) => {
    const rawBytes = data instanceof Uint8Array ? data : new Uint8Array(data)
    const blobData = new Uint8Array(rawBytes)
    const blob = new Blob([blobData.buffer], { type })
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    a.click()
    URL.revokeObjectURL(downloadUrl)
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl"><div className="mb-12 space-y-4">
      {tool && (
        <ToolPageHeader
          title={t('YouTubeDownloader.title')}
          description={t('YouTubeDownloader.description')}
          icon={tool.icon}
          colorClass={tool.color}
        />
      )}
    </div>

      <Card className="border-border/40 bg-card/20 backdrop-blur-sm shadow-xl rounded-[24px] overflow-hidden">
        <CardContent className="space-y-6 pt-6">
          <div className="flex justify-end mb-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="advanced-mode" className="text-xs text-muted-foreground cursor-pointer">{t('YouTubeDownloader.advancedSettings')}</Label>
              <Switch id="advanced-mode" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
            </div>
          </div>

          {showAdvanced && (
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">{t('YouTubeDownloader.proxyLabel')}</Label>
              <Input placeholder="http://user:pass@host:port" value={proxy} onChange={(e) => setProxy(e.target.value)} className="h-10 text-sm" />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 text-lg px-4 rounded-xl"
              />
            </div>
            <Button onClick={handleAnalyze} disabled={analyzing || !url || loading} className="h-12 px-8 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all">
              {analyzing ? <Loader2 className="animate-spin mr-2" /> : <ScanText className="mr-2" />}
              {analyzing ? t('YouTubeDownloader.analyzing') : t('YouTubeDownloader.analyze')}
            </Button>
          </div>

          <div className="space-y-4 min-h-[200px]">
            {analyzing ? (
              <div className="space-y-4">
                <div className="flex gap-4 p-4 border border-border/40 rounded-xl bg-secondary/50">
                  <div className="w-32 h-20 bg-muted animate-pulse rounded-lg" />
                  <div className="space-y-2 flex-1 py-1">
                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              </div>
            ) : metadata ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
                <div className="flex items-start gap-4 p-4 bg-secondary/20 rounded-xl border border-border/50">
                  {metadata.thumbnail && (
                    <img src={metadata.thumbnail} alt={t('YouTubeDownloader.thumbnailAlt')} className="w-32 rounded-lg shadow-sm object-cover aspect-video" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg line-clamp-2 leading-tight">{metadata.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t('YouTubeDownloader.durationLabel', { duration: metadata.duration ?? 0 })}</p>
                  </div>
                </div>

                <Tabs defaultValue="video" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/60 p-2 rounded-2xl h-14 items-center">
                    <TabsTrigger value="video" className="rounded-xl h-full gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:bg-background/40 cursor-pointer">
                      <Video className="w-4 h-4" />
                      {t('YouTubeDownloader.tabs.video')}
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="rounded-xl h-full gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:bg-background/40 cursor-pointer">
                      <Music className="w-4 h-4" />
                      {t('YouTubeDownloader.tabs.audio')}
                    </TabsTrigger>
                    <TabsTrigger value="subtitle" className="rounded-xl h-full gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:bg-background/40 cursor-pointer">
                      <Captions className="w-4 h-4" />
                      {t('YouTubeDownloader.tabs.subtitle')}
                    </TabsTrigger>
                  </TabsList>

                  {['video', 'audio', 'subtitle'].map(type => (
                    <TabsContent key={type} value={type} className="space-y-3 mt-0">
                      {qualities.filter(q => {
                        if (type === 'subtitle') return q.isSubtitle
                        if (type === 'audio') return q.id === 'audio'
                        return !q.isSubtitle && q.id !== 'audio'
                      }).map((q) => (
                        <div key={q.id || q.label} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/40 hover:border-primary/50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg transition-colors ${q.isSubtitle ? 'bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20' : (q.id === 'audio' ? 'bg-violet-500/10 text-violet-500 group-hover:bg-violet-500/20' : 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20')}`}>
                              {q.isSubtitle ? <Captions className="h-5 w-5" /> : (q.id === 'audio' ? <Music className="h-5 w-5" /> : <Video className="h-5 w-5" />)}
                            </div>
                            <div>
                              <div className="font-bold text-sm">{q.label}</div>
                              <div className="text-xs text-muted-foreground">{formatBytes(q.totalSize || 0)}</div>
                            </div>
                          </div>
                          <Button size="sm" variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => startDownload(q)} disabled={loading}>
                            {downloadingId === q.id ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('YouTubeDownloader.processing')}</>
                            ) : (
                              <><Download className="mr-2 h-4 w-4" /> {t('YouTubeDownloader.downloadBtn')}</>
                            )}
                          </Button>
                        </div>
                      ))}
                      {qualities.filter(q => {
                        if (type === 'subtitle') return q.isSubtitle
                        if (type === 'audio') return q.id === 'audio'
                        return !q.isSubtitle && q.id !== 'audio'
                      }).length === 0 && (
                        <div className="text-center p-8 text-muted-foreground bg-secondary/5 rounded-xl border border-dashed border-border/30">
                          {t('YouTubeDownloader.noFormats', { type: t(`tabs.${type}`) })}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/40 rounded-2xl text-muted-foreground/40 bg-muted/5">
                <ScanText className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">{t('YouTubeDownloader.emptyState')}</p>
              </div>
            )}
          </div>

          {loading && (
            <div className="space-y-3 p-6 bg-secondary/10 rounded-xl border border-border/20">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{status}</span>
                <span className="text-primary font-bold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 rounded-full" />
              <Button variant="ghost" size="sm" onClick={handleCancel} className="text-muted-foreground hover:text-destructive h-8 px-4 text-xs mb-2">
                {t('YouTubeDownloader.cancel')}
              </Button>
              <p className="text-xs text-muted-foreground/80 text-center max-w-[90%] flex items-center gap-1 justify-center">
                <AlertCircle className="w-3 h-3 inline pb-[1px]" />
                {t('YouTubeDownloader.speedNote')}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('YouTubeDownloader.errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 space-y-4">
        <Card className="border-border/40 bg-card/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">{t('YouTubeDownloader.flowTitle')}</CardTitle>
            <CardDescription>{t('YouTubeDownloader.flowDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
              <p>{t('YouTubeDownloader.flowStep1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
              <p>{t('YouTubeDownloader.flowStep2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</div>
              <p>{t('YouTubeDownloader.flowStep3')}</p>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-amber-500/30 bg-amber-500/5">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">{t('YouTubeDownloader.limitationsTitle')}</AlertTitle>
          <AlertDescription className="text-amber-700/80">
            {t('YouTubeDownloader.limitationsDesc')}
          </AlertDescription>
        </Alert>
      </div></div>
  )
}
