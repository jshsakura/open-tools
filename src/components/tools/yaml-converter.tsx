"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Copy, RefreshCw, AlertCircle, Trash2 } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import jsyaml from 'js-yaml'
import { toast } from "sonner"

export function YamlConverter() {
    const t = useTranslations('YamlConverter');

    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'toYaml' | 'toJson'>('toJson')

    const detectFormatAndConvert = (val: string) => {
        if (!val.trim()) {
            setOutput("")
            setError(null)
            return
        }

        try {
            // Try parsing as JSON first
            const parsed = JSON.parse(val)
            setMode('toYaml')
            const yaml = jsyaml.dump(parsed)
            setOutput(yaml)
            setError(null)
        } catch (e1) {
            try {
                // Try parsing as YAML
                const parsed = jsyaml.load(val)
                if (typeof parsed === 'string' && parsed === val) {
                   // It's just a string, not really YAML/JSON structure
                }
                setMode('toJson')
                const json = JSON.stringify(parsed, null, 2)
                setOutput(json)
                setError(null)
            } catch (e2: any) {
                setError(e2.message)
            }
        }
    }

    const handleConvert = (targetMode: 'toYaml' | 'toJson') => {
        setError(null)
        if (!input.trim()) return

        try {
            if (targetMode === 'toYaml') {
                const parsed = JSON.parse(input)
                setOutput(jsyaml.dump(parsed))
            } else {
                const parsed = jsyaml.load(input)
                setOutput(JSON.stringify(parsed, null, 2))
            }
            setMode(targetMode)
        } catch (e: any) {
            setError(e.message)
        }
    }

    const copyToClipboard = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        toast.success(t('copy'))
    }

    const clearInput = () => {
        setInput("")
        setOutput("")
        setError(null)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <GlassCard className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">{t('input')}</Label>
                            <Button variant="ghost" size="sm" onClick={clearInput} className="text-muted-foreground h-8">
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('clear')}
                            </Button>
                        </div>
                        <Textarea
                            className="min-h-[400px] font-mono text-sm bg-muted/20 resize-none"
                            placeholder={t('placeholder')}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value)
                                // detectFormatAndConvert(e.target.value) // Optional auto-detect
                            }}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">{t('output')}</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant={mode === 'toJson' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleConvert('toJson')}
                                    className="h-8"
                                >
                                    {t('toJson')}
                                </Button>
                                <Button
                                    variant={mode === 'toYaml' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleConvert('toYaml')}
                                    className="h-8"
                                >
                                    {t('toYaml')}
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <Textarea
                                className="min-h-[400px] font-mono text-sm bg-muted/30 resize-none"
                                value={output}
                                readOnly
                            />
                            {output && (
                                <Button
                                    size="sm"
                                    className="absolute top-2 right-2 h-8"
                                    onClick={copyToClipboard}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    {t('copy')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mt-6 bg-red-500/10 border-red-500/20 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                    </Alert>
                )}
            </GlassCard>
        </div>
    )
}
