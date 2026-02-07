"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { jwtDecode } from "jwt-decode"
import { AlertCircle, CheckCircle2, Key, FileJson, ShieldCheck, Database, Lock } from "lucide-react"
import dynamic from 'next/dynamic'

// Dynamically import react-json-view to avoid SSR issues
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false })

export function JwtDebugger() {
    const t = useTranslations('JwtDebugger');

    const [token, setToken] = useState("")
    const [header, setHeader] = useState<any>(null)
    const [payload, setPayload] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        if (!token.trim()) {
            setHeader(null)
            setPayload(null)
            setError(null)
            setIsValid(false)
            return
        }

        try {
            // Decode Header
            const decodedHeader = jwtDecode(token, { header: true })
            setHeader(decodedHeader)

            // Decode Payload
            const decodedPayload = jwtDecode(token)
            setPayload(decodedPayload)

            setIsValid(true)
            setError(null)
        } catch (e: any) {
            setIsValid(false)
            setError("Invalid Token Format")
            setHeader(null)
            setPayload(null)
        }
    }, [token])

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] min-h-[600px] grid lg:grid-cols-2 gap-6 pb-12">
            {/* Input Section */}
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Key className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Encoded Token</h2>
                </div>

                <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative group">
                    <Textarea
                        placeholder="Paste your JWT here (eyJ...)"
                        className="flex-1 w-full h-full resize-none border-0 bg-transparent p-6 font-mono text-sm leading-relaxed focus-visible:ring-0 field-sizing-content"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                    {!token && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                            <p className="text-sm text-muted-foreground">Paste valid JWT to decode</p>
                        </div>
                    )}
                </GlassCard>

                {error && token && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium text-sm">{error}</span>
                    </div>
                )}
            </div>

            {/* Output Section */}
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                        <FileJson className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Decoded</h2>
                    {isValid && (
                        <div className="ml-auto px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Valid Signature Format
                        </div>
                    )}
                </div>

                <GlassCard className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                        {/* Header Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Header</span>
                            </div>
                            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                                {header ? (
                                    <ReactJson
                                        src={header}
                                        theme="isotope"
                                        style={{ backgroundColor: 'transparent', fontSize: '13px' }}
                                        name={false}
                                        displayDataTypes={false}
                                        enableClipboard={false}
                                    />
                                ) : (
                                    <span className="text-muted-foreground text-sm italic opacity-50">Waiting for token...</span>
                                )}
                            </div>
                        </div>

                        {/* Payload Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Database className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Payload</span>
                            </div>
                            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                                {payload ? (
                                    <ReactJson
                                        src={payload}
                                        theme="isotope"
                                        style={{ backgroundColor: 'transparent', fontSize: '13px' }}
                                        name={false}
                                        displayDataTypes={false}
                                        enableClipboard={false}
                                    />
                                ) : (
                                    <span className="text-muted-foreground text-sm italic opacity-50">Waiting for token...</span>
                                )}
                            </div>
                        </div>

                        {/* Signature Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Signature</span>
                            </div>
                            <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 text-xs font-mono text-blue-600/70 dark:text-blue-400 break-all leading-relaxed">
                                HMACSHA256(<br />
                                &nbsp;&nbsp;base64UrlEncode(header) + "." +<br />
                                &nbsp;&nbsp;base64UrlEncode(payload),<br />
                                &nbsp;&nbsp;your-256-bit-secret<br />
                                )
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
