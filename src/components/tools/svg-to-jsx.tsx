"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    MonitorPlay,
    Copy,
    CheckCircle2,
    Code2,
    Trash2,
    RefreshCcw,
    Sparkles
} from "lucide-react"

export function SvgToJsxTool() {
    const t = useTranslations('SvgToJsx')
    const [svgInput, setSvgInput] = useState("")
    const [jsxOutput, setJsxOutput] = useState("")
    const [copied, setCopied] = useState(false)
    const [componentName, setComponentName] = useState("IconComponent")

    const convertToJsx = () => {
        if (!svgInput) return

        let jsx = svgInput.trim()

        // 1. Remove XML declarations and comments
        jsx = jsx.replace(/<\?xml.*\?>/gi, "")
        jsx = jsx.replace(/<!--[\s\S]*?-->/g, "")

        // 2. Map kebab-case attributes to camelCase
        const attrMap: Record<string, string> = {
            "accent-height": "accentHeight",
            "alignment-baseline": "alignmentBaseline",
            "arabic-form": "arabicForm",
            "baseline-shift": "baselineShift",
            "cap-height": "capHeight",
            "clip-path": "clipPath",
            "clip-rule": "clipRule",
            "color-interpolation": "colorInterpolation",
            "color-interpolation-filters": "colorInterpolationFilters",
            "color-profile": "colorProfile",
            "color-rendering": "colorRendering",
            "dominant-baseline": "dominantBaseline",
            "enable-background": "enableBackground",
            "fill-opacity": "fillOpacity",
            "fill-rule": "fillRule",
            "flood-color": "floodColor",
            "flood-opacity": "floodOpacity",
            "font-family": "fontFamily",
            "font-size": "fontSize",
            "font-size-adjust": "fontSizeAdjust",
            "font-stretch": "fontStretch",
            "font-style": "fontStyle",
            "font-variant": "fontVariant",
            "font-weight": "fontWeight",
            "glyph-name": "glyphName",
            "glyph-orientation-horizontal": "glyphOrientationHorizontal",
            "glyph-orientation-vertical": "glyphOrientationVertical",
            "horiz-adv-x": "horizAdvX",
            "horiz-origin-x": "horizOriginX",
            "image-rendering": "imageRendering",
            "letter-spacing": "letterSpacing",
            "lighting-color": "lightingColor",
            "marker-end": "markerEnd",
            "marker-mid": "markerMid",
            "marker-start": "markerStart",
            "overline-position": "overlinePosition",
            "overline-thickness": "overlineThickness",
            "paint-order": "paintOrder",
            "panose-1": "panose1",
            "pointer-events": "pointerEvents",
            "rendering-intent": "renderingIntent",
            "shape-rendering": "shapeRendering",
            "stop-color": "stopColor",
            "stop-opacity": "stopOpacity",
            "strikethrough-position": "strikethroughPosition",
            "strikethrough-thickness": "strikethroughThickness",
            "stroke-dasharray": "strokeDasharray",
            "stroke-dashoffset": "strokeDashoffset",
            "stroke-linecap": "strokeLinecap",
            "stroke-linejoin": "strokeLinejoin",
            "stroke-miterlimit": "strokeMiterlimit",
            "stroke-opacity": "strokeOpacity",
            "stroke-width": "strokeWidth",
            "text-anchor": "textAnchor",
            "text-decoration": "textDecoration",
            "text-rendering": "textRendering",
            "underline-position": "underlinePosition",
            "underline-thickness": "underlineThickness",
            "unicode-bidi": "unicodeBidi",
            "unicode-range": "unicodeRange",
            "units-per-em": "unitsPerEm",
            "v-alphabetic": "vAlphabetic",
            "v-hanging": "vHanging",
            "v-ideographic": "vIdeographic",
            "v-mathematical": "vMathematical",
            "vector-effect": "vectorEffect",
            "vert-adv-y": "vertAdvY",
            "vert-origin-x": "vertOriginX",
            "vert-origin-y": "vertOriginY",
            "word-spacing": "wordSpacing",
            "writing-mode": "writingMode",
            "x-height": "xHeight",
            "xlink:actuate": "xlinkActuate",
            "xlink:arcrole": "xlinkArcrole",
            "xlink:href": "xlinkHref",
            "xlink:role": "xlinkRole",
            "xlink:show": "xlinkShow",
            "xlink:title": "xlinkTitle",
            "xlink:type": "xlinkType",
            "xml:base": "xmlBase",
            "xml:lang": "xmlLang",
            "xml:space": "xmlSpace",
            "class": "className"
        }

        Object.keys(attrMap).forEach(attr => {
            const regex = new RegExp(`\\s${attr}=`, "g")
            jsx = jsx.replace(regex, ` ${attrMap[attr]}=`)
        })

        // 3. Convert style string to object (simple cases)
        jsx = jsx.replace(/style="([^"]*)"/g, (match, styleString) => {
            const styleObj = styleString.split(';').reduce((acc: any, curr: string) => {
                const [prop, val] = curr.split(':').map(s => s.trim())
                if (prop && val) {
                    const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
                    acc[camelProp] = val
                }
                return acc
            }, {})
            return `style={${JSON.stringify(styleObj)}}`
        })

        // 4. Wrap in component boilerplate
        const output = `export default function ${componentName}(props) {\n  return (\n    ${jsx.split('\n').map(line => '    ' + line).join('\n').trim()}\n  );\n}`

        setJsxOutput(output)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(jsxOutput)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const clearInput = () => {
        setSvgInput("")
        setJsxOutput("")
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Panel */}
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-primary" />
                                {t('svgSource')}
                            </CardTitle>
                            <CardDescription>{t('pasteSvg')}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={clearInput} className="text-muted-foreground/50 hover:text-rose-500">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder='<svg width="100" height="100" ...>'
                            value={svgInput}
                            onChange={(e) => setSvgInput(e.target.value)}
                            className="min-h-[400px] font-mono text-[13px] bg-background/50 border-primary/10 transition-all focus-visible:ring-primary focus-visible:ring-offset-0"
                        />
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">{t('componentName')}</label>
                                <input
                                    className="w-full h-10 px-3 rounded-xl bg-background/50 border border-primary/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={componentName}
                                    onChange={(e) => setComponentName(e.target.value)}
                                />
                            </div>
                            <Button className="h-auto px-8 rounded-2xl gap-2 font-bold self-end shadow-lg" onClick={convertToJsx}>
                                <Sparkles className="h-4 w-4" />
                                {t('convert')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Output Panel */}
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <RefreshCcw className="h-5 w-5 text-orange-500" />
                                {t('jsxOutput')}
                            </CardTitle>
                            <CardDescription>{t('readyForReact')}</CardDescription>
                        </div>
                        <Button
                            className="rounded-xl gap-2 font-bold"
                            disabled={!jsxOutput}
                            onClick={copyToClipboard}
                        >
                            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? t('copied') : t('copyCode')}
                        </Button>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 via-transparent to-orange-500/20 rounded-[20px] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                            <Textarea
                                readOnly
                                value={jsxOutput}
                                placeholder={t('outputPlaceholder')}
                                className="min-h-[460px] font-mono text-[13px] bg-background/80 border-primary/10 transition-all backdrop-blur-md relative"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Help / Info */}
            <section className="p-8 rounded-[32px] bg-secondary/20 border border-border/20 backdrop-blur-md max-w-4xl">
                <div className="flex gap-6 items-start">
                    <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500 shrink-0">
                        <MonitorPlay className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">{t('whyUse')}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t('whyUseDesc')}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
