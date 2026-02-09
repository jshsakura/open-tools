"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Code2,
    Copy,
    CheckCircle2,
    Trash2,
    RefreshCcw,
    AlertCircle,
    FileCode,
    Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

export function XmlFormatterTool() {
    const t = useTranslations('XmlFormatter')
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [jsonOutput, setJsonOutput] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [copiedJson, setCopiedJson] = useState(false)

    const formatXml = (xml: string): string => {
        const PADDING = '  '
        const reg = /(>)(<)(\/*)/g
        let formatted = ''
        let pad = 0

        xml = xml.replace(reg, '$1\n$2$3')

        xml.split('\n').forEach((node) => {
            let indent = 0
            if (node.match(/.+<\/\w[^>]*>$/)) {
                indent = 0
            } else if (node.match(/^<\/\w/) && pad > 0) {
                pad -= 1
            } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                indent = 1
            } else {
                indent = 0
            }

            formatted += PADDING.repeat(pad) + node + '\n'
            pad += indent
        })

        return formatted.trim()
    }

    const xmlToJson = (xml: string): any => {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xml, "text/xml")

        const parseError = xmlDoc.querySelector("parsererror")
        if (parseError) {
            throw new Error("Invalid XML structure")
        }

        const xmlToJsonRecursive = (node: any): any => {
            const obj: any = {}

            if (node.nodeType === 1) { // Element
                if (node.attributes.length > 0) {
                    obj["@attributes"] = {}
                    for (let j = 0; j < node.attributes.length; j++) {
                        const attribute = node.attributes.item(j)
                        obj["@attributes"][attribute!.nodeName] = attribute!.nodeValue
                    }
                }
            } else if (node.nodeType === 3) { // Text
                return node.nodeValue
            }

            if (node.hasChildNodes()) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    const child = node.childNodes.item(i)
                    const nodeName = child!.nodeName

                    if (nodeName === "#text") {
                        const text = child!.nodeValue?.trim()
                        if (text) {
                            return text
                        }
                    } else {
                        if (typeof obj[nodeName] === "undefined") {
                            obj[nodeName] = xmlToJsonRecursive(child)
                        } else {
                            if (typeof obj[nodeName].push === "undefined") {
                                const old = obj[nodeName]
                                obj[nodeName] = []
                                obj[nodeName].push(old)
                            }
                            obj[nodeName].push(xmlToJsonRecursive(child))
                        }
                    }
                }
            }
            return obj
        }

        return xmlToJsonRecursive(xmlDoc)
    }

    const handleFormat = () => {
        setError(null)
        setOutput("")
        setJsonOutput("")

        if (!input.trim()) {
            setError("입력된 XML이 없습니다.")
            return
        }

        try {
            // Validate XML
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(input, "text/xml")
            const parseError = xmlDoc.querySelector("parsererror")

            if (parseError) {
                const errorText = parseError.textContent || "XML 구문 오류"
                setError(errorText)
                return
            }

            // Format XML
            const formatted = formatXml(input)
            setOutput(formatted)

            // Convert to JSON
            const json = xmlToJson(input)
            setJsonOutput(JSON.stringify(json, null, 2))

        } catch (e: any) {
            setError(e.message || "XML 처리 중 오류가 발생했습니다.")
        }
    }

    const copyToClipboard = (text: string, isJson: boolean = false) => {
        navigator.clipboard.writeText(text)
        if (isJson) {
            setCopiedJson(true)
            setTimeout(() => setCopiedJson(false), 2000)
        } else {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const clear = () => {
        setInput("")
        setOutput("")
        setJsonOutput("")
        setError(null)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Panel */}
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-primary" />
                                {t('xmlInput')}
                            </CardTitle>
                            <CardDescription>{t('pasteXml')}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={clear} className="text-muted-foreground/50 hover:text-rose-500">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                        <Textarea
                            placeholder='<?xml version="1.0"?><root><item>value</item></root>'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 min-h-[400px] font-mono text-[13px] bg-background/50 border-primary/10 transition-all focus-visible:ring-primary focus-visible:ring-offset-0"
                        />
                        {error && (
                            <div className="flex items-start gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-in slide-in-from-top-2">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-bold mb-1">{t('validationError')}</p>
                                    <p className="text-[11px] leading-relaxed opacity-90">{error}</p>
                                </div>
                            </div>
                        )}
                        <Button className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg" onClick={handleFormat}>
                            <Sparkles className="h-4 w-4" />
                            {t('formatValidate')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Output Panel */}
                <div className="space-y-6">
                    {/* Formatted XML */}
                    <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <FileCode className="h-4 w-4 text-green-500" />
                                    {t('formattedXml')}
                                </CardTitle>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-xl gap-2 font-bold h-8"
                                disabled={!output}
                                onClick={() => copyToClipboard(output)}
                            >
                                {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                {copied ? t('copied') : t('copy')}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                        <Textarea
                            readOnly
                            value={output}
                            placeholder={t('outputPlaceholder')}
                            className="min-h-[200px] font-mono text-[12px] bg-background/80 border-primary/10 transition-all"
                        />
                        </CardContent>
                    </Card>

                    {/* JSON Conversion */}
                    <Card className="border-indigo-500/20 bg-card/60 backdrop-blur-sm shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                            <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <RefreshCcw className="h-4 w-4 text-indigo-500" />
                            {t('xmlToJson')}
                        </CardTitle>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-xl gap-2 font-bold h-8"
                        disabled={!jsonOutput}
                        onClick={() => copyToClipboard(jsonOutput, true)}
                    >
                        {copiedJson ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedJson ? t('copied') : t('copy')}
                    </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                        <Textarea
                            readOnly
                            value={jsonOutput}
                            placeholder={t('jsonPlaceholder')}
                            className="min-h-[200px] font-mono text-[12px] bg-background/80 border-indigo-500/10 transition-all"
                        />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Info Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6 space-y-3 bg-green-500/5 border-green-500/10 rounded-[24px]">
                    <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                    <h4 className="font-bold text-sm">{t('validation')}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('validationDesc')}
                </p>
                </Card>

                <Card className="p-6 space-y-3 bg-primary/5 border-primary/10 rounded-[24px]">
                    <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="h-5 w-5" />
                        <h4 className="font-bold text-sm">{t('formatting')}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('formattingDesc')}
                    </p>
                </Card>

                <Card className="p-6 space-y-3 bg-indigo-500/5 border-indigo-500/10 rounded-[24px]">
                    <div className="flex items-center gap-2 text-indigo-500">
                        <RefreshCcw className="h-5 w-5" />
                        <h4 className="font-bold text-sm">{t('conversion')}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('conversionDesc')}
                    </p>
                </Card>
            </div>
        </div>
    )
}
