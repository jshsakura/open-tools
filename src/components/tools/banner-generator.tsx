"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Copy,
    CheckCircle2,
    Download,
    Sparkles,
    Terminal,
    Palette,
    Type
} from "lucide-react"
import { cn } from "@/lib/utils"

// Full font list - all importable fonts
const FONTS = [
    'Standard',
    'Slant',
    'Shadow',
    'Big',
    'Small',
    'Banner',
    'Block',
    'Bubble',
    'Digital',
    'Mini',
    'Alligator',
    'Avatar',
    'Banner3',
    'Banner4',
    'Bell',
    'Big Chief',
    'Binary',
    'Broadway',
    'Colossal',
    'Computer',
    'Cyberlarge',
    'Cybermedium',
    'Cybersmall',
    'Doh',
    'Doom',
    'Dot Matrix',
    'Epic',
    'Graffiti',
    'Isometric1',
    'Isometric2',
    'Isometric3',
    'Isometric4',
    'Larry 3D',
    'Letters',
    'Ogre',
    'Rectangles',
    'Roman',
    'Rounded',
    'Script',
    'Speed',
    'Star Wars',
    'Straight',
    'Thick',
    'Thin'
]

const ANSI_COLORS = [
    { name: 'Default', code: '', preview: '#888888', textClass: 'text-foreground' },
    // Bright Colors
    { name: 'Bright Black', code: '${AnsiColor.BRIGHT_BLACK}', preview: '#6B7280', textClass: 'text-gray-500' },
    { name: 'Bright Red', code: '${AnsiColor.BRIGHT_RED}', preview: '#EF4444', textClass: 'text-red-500' },
    { name: 'Bright Green', code: '${AnsiColor.BRIGHT_GREEN}', preview: '#10B981', textClass: 'text-green-500' },
    { name: 'Bright Yellow', code: '${AnsiColor.BRIGHT_YELLOW}', preview: '#F59E0B', textClass: 'text-yellow-500' },
    { name: 'Bright Blue', code: '${AnsiColor.BRIGHT_BLUE}', preview: '#3B82F6', textClass: 'text-blue-500' },
    { name: 'Bright Magenta', code: '${AnsiColor.BRIGHT_MAGENTA}', preview: '#A855F7', textClass: 'text-purple-500' },
    { name: 'Bright Cyan', code: '${AnsiColor.BRIGHT_CYAN}', preview: '#06B6D4', textClass: 'text-cyan-500' },
    { name: 'Bright White', code: '${AnsiColor.BRIGHT_WHITE}', preview: '#FFFFFF', textClass: 'text-white' },
    // Standard Colors
    { name: 'Black', code: '${AnsiColor.BLACK}', preview: '#1F2937', textClass: 'text-gray-800' },
    { name: 'Red', code: '${AnsiColor.RED}', preview: '#DC2626', textClass: 'text-red-600' },
    { name: 'Green', code: '${AnsiColor.GREEN}', preview: '#16A34A', textClass: 'text-green-600' },
    { name: 'Yellow', code: '${AnsiColor.YELLOW}', preview: '#CA8A04', textClass: 'text-yellow-600' },
    { name: 'Blue', code: '${AnsiColor.BLUE}', preview: '#2563EB', textClass: 'text-blue-600' },
    { name: 'Magenta', code: '${AnsiColor.MAGENTA}', preview: '#9333EA', textClass: 'text-purple-600' },
    { name: 'Cyan', code: '${AnsiColor.CYAN}', preview: '#0891B2', textClass: 'text-cyan-600' },
    { name: 'White', code: '${AnsiColor.WHITE}', preview: '#E5E7EB', textClass: 'text-gray-200' },
]

export function BannerGeneratorTool() {
    const t = useTranslations()
    const [text, setText] = useState("SPRING BOOT")
    const [selectedFont, setSelectedFont] = useState("Standard")
    const [selectedColor, setSelectedColor] = useState(ANSI_COLORS[0])
    const [asciiArt, setAsciiArt] = useState("")
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const figletRef = useRef<any>(null)
    const loadedFontsRef = useRef<Set<string>>(new Set())

    useEffect(() => {
        const loadFiglet = async () => {
            try {
                const figletModule = await import('figlet')
                figletRef.current = figletModule.default || figletModule
                console.log('✅ Figlet loaded')
                setLoading(false)
                // Generate initial art
                generateAscii(text, selectedFont)
            } catch (err: any) {
                console.error('❌ Figlet load failed:', err)
                setError('Failed to load library')
                setLoading(false)
            }
        }
        loadFiglet()
    }, [])

    useEffect(() => {
        if (!loading && figletRef.current && text) {
            const timer = setTimeout(() => generateAscii(text, selectedFont), 300)
            return () => clearTimeout(timer)
        }
    }, [text, selectedFont, loading])

    const loadFontModule = async (fontName: string) => {
        if (loadedFontsRef.current.has(fontName)) {
            return true
        }

        try {
            console.log(`📦 Loading font: ${fontName}`)
            const fontModule = await import(`figlet/importable-fonts/${fontName}.js`)
            figletRef.current.parseFont(fontName, fontModule.default)
            loadedFontsRef.current.add(fontName)
            console.log(`✅ Font ${fontName} loaded`)
            return true
        } catch (err: any) {
            console.error(`❌ Font ${fontName} failed:`, err)
            return false
        }
    }

    const generateAscii = async (inputText: string, font: string) => {
        if (!figletRef.current || !inputText.trim()) {
            setAsciiArt("")
            return
        }

        try {
            // Load font first
            const loaded = await loadFontModule(font)
            if (!loaded) {
                throw new Error(`Font ${font} unavailable`)
            }

            // Generate ASCII
            figletRef.current.text(
                inputText,
                { font: font },
                (err: any, result: string) => {
                    if (err) {
                        console.error('❌ Generation error:', err)
                        setError(err.message)
                        setAsciiArt("Error generating ASCII art")
                        return
                    }
                    console.log('✅ Generated successfully')
                    setAsciiArt(result || "")
                    setError("")
                }
            )
        } catch (error: any) {
            console.error('❌ Error:', error)
            setError(error.message)
            setAsciiArt("Error: " + error.message)
        }
    }

    const getFinalOutput = () => {
        if (!selectedColor.code) return asciiArt
        return `${selectedColor.code}\n${asciiArt}\n\${AnsiColor.DEFAULT}`
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(getFinalOutput())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadBanner = () => {
        const blob = new Blob([getFinalOutput()], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'banner.txt'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Input Section */}
            <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl">
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Type className="h-4 w-4 text-blue-500" />
                            Text Input
                        </label>
                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="SPRING BOOT"
                            className="text-lg font-mono"
                            maxLength={50}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Font & Color Selection */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Font Selector */}
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl">
                    <CardHeader className="border-b border-border/10 px-4 pt-4 pb-2">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-green-500" />
                            Font Style
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2 rounded-xl bg-secondary/20 border border-border/10">
                            {FONTS.map((font) => (
                                <Button
                                    key={font}
                                    variant={selectedFont === font ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedFont(font)}
                                    className={cn(
                                        "justify-start font-mono transition-all text-xs",
                                        selectedFont === font && "ring-2 ring-primary ring-offset-2"
                                    )}
                                >
                                    {font}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Color Selector */}
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl">
                    <CardHeader className="border-b border-border/10 px-4 pt-4 pb-2">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Palette className="h-5 w-5 text-pink-500" />
                            ANSI Color
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-2 rounded-xl bg-secondary/20 border border-border/10">
                            {ANSI_COLORS.map((color) => (
                                <Button
                                    key={color.name}
                                    variant={selectedColor.name === color.name ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        "justify-start gap-2 transition-all h-auto py-2.5",
                                        selectedColor.name === color.name && "ring-2 ring-primary ring-offset-2"
                                    )}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full border border-border/20 shrink-0"
                                        style={{ backgroundColor: color.preview }}
                                    />
                                    <span className="text-xs font-mono">{color.name}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview & Export */}
            <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl">
                <CardHeader className="border-b border-border/10 px-4 pt-4 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-500" />
                                Preview
                            </CardTitle>
                            <CardDescription>Your generated ASCII art banner</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyToClipboard}
                                disabled={!asciiArt || loading}
                                className="gap-2"
                            >
                                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={downloadBanner}
                                disabled={!asciiArt || loading}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-green-500/20 via-transparent to-primary/20 rounded-[20px] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative bg-secondary border border-border/20 rounded-[20px] p-8 overflow-x-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Sparkles className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <p className="text-destructive font-bold">⚠️ {error}</p>
                                    <p className="text-xs text-muted-foreground">Check browser console for details</p>
                                </div>
                            ) : (
                                <pre className={cn(
                                    "font-mono text-[10px] sm:text-xs leading-tight whitespace-pre",
                                    selectedColor.textClass
                                )}>
                                    {asciiArt || "Enter text above to generate ASCII art..."}
                                </pre>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Info */}
            <div className="flex items-center gap-3 p-6 rounded-[24px] bg-secondary/20 border border-border/10">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Terminal className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Spring Boot Banner:</strong> Place the generated banner.txt file in your src/main/resources directory to customize your Spring Boot startup banner.
                </p>
            </div>
        </div>
    )
}
