"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { ArrowRight, Copy, RefreshCw, AlertCircle } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import jsyaml from 'js-yaml'
import { cn } from "@/lib/utils"

export function JsonYamlConverter() {
    const t = useTranslations('JsonYaml');

    const [jsonInput, setJsonInput] = useState("")
    const [yamlInput, setYamlInput] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("json-to-yaml")

    // Conversion Handlers
    const convertJsonToYaml = () => {
        setError(null)
        if (!jsonInput.trim()) return

        try {
            const parsed = JSON.parse(jsonInput)
            const yaml = jsyaml.dump(parsed)
            setYamlInput(yaml)
        } catch (e: any) {
            setError("Invalid JSON: " + e.message)
        }
    }

    const convertYamlToJson = () => {
        setError(null)
        if (!yamlInput.trim()) return

        try {
            const parsed = jsyaml.load(yamlInput)
            const json = JSON.stringify(parsed, null, 2)
            setJsonInput(json)
        } catch (e: any) {
            setError("Invalid YAML: " + e.message)
        }
    }

    // Auto-convert when switching tabs or input changes? 
    // Manual trigger is safer for large inputs.

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <div className="max-w-6xl mx-auto">
            <GlassCard className="p-6 rounded-2xl">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                        <TabsList className="bg-muted/30 p-1 rounded-xl">
                            <TabsTrigger value="json-to-yaml" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                                JSON → YAML
                            </TabsTrigger>
                            <TabsTrigger value="yaml-to-json" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                                YAML → JSON
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={activeTab === 'json-to-yaml' ? convertJsonToYaml : convertYamlToJson}
                                className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {t('convert')}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20 text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 h-[600px]">
                        {/* Editor 1: Input */}
                        <div className="flex flex-col gap-2 h-full">
                            <Label className="text-muted-foreground ml-1">
                                {activeTab === 'json-to-yaml' ? 'JSON Input' : 'YAML Input'}
                            </Label>
                            <Textarea
                                className="flex-1 font-mono text-sm bg-muted/20 border-border/40 resize-none focus-visible:ring-primary/50 rounded-xl leading-relaxed"
                                placeholder={activeTab === 'json-to-yaml' ? '{"key": "value"}' : 'key: value'}
                                value={activeTab === 'json-to-yaml' ? jsonInput : yamlInput}
                                onChange={(e) => activeTab === 'json-to-yaml' ? setJsonInput(e.target.value) : setYamlInput(e.target.value)}
                            />
                        </div>

                        {/* Editor 2: Output */}
                        <div className="flex flex-col gap-2 h-full">
                            <div className="flex justify-between items-center">
                                <Label className="text-muted-foreground ml-1">
                                    {activeTab === 'json-to-yaml' ? 'YAML Output' : 'JSON Output'}
                                </Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => copyToClipboard(activeTab === 'json-to-yaml' ? yamlInput : jsonInput)}
                                >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy
                                </Button>
                            </div>
                            <Textarea
                                className="flex-1 font-mono text-sm bg-muted/30 border-border/40 resize-none focus-visible:ring-primary/50 rounded-xl leading-relaxed text-muted-foreground"
                                readOnly
                                value={activeTab === 'json-to-yaml' ? yamlInput : jsonInput}
                                placeholder="Result will appear here..."
                            />
                        </div>
                    </div>
                </Tabs>
            </GlassCard>
        </div>
    )
}
