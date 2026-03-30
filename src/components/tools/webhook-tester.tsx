"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Send, Plus, Trash2, Copy, CheckCircle2, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { extractUrlishInput } from "@/lib/url-input"

interface HeaderPair {
    id: string
    key: string
    value: string
}

interface ApiResponse {
    status: number
    statusText: string
    headers: Record<string, string>
    body: string
    time: number
    url: string
}

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const
type HttpMethod = (typeof METHODS)[number]

const METHOD_COLORS: Record<HttpMethod, string> = {
    GET: "bg-green-500",
    POST: "bg-blue-500",
    PUT: "bg-amber-500",
    DELETE: "bg-red-500",
    PATCH: "bg-purple-500",
}

function formatJson(str: string): string {
    try {
        return JSON.stringify(JSON.parse(str), null, 2)
    } catch {
        return str
    }
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 9)
}

export function WebhookTesterTool() {
    const t = useTranslations("WebhookTester")
    const [method, setMethod] = useState<HttpMethod>("GET")
    const [url, setUrl] = useState("")
    const [headers, setHeaders] = useState<HeaderPair[]>([
        { id: generateId(), key: "Content-Type", value: "application/json" },
    ])
    const [body, setBody] = useState("")
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<ApiResponse | null>(null)
    const [error, setError] = useState("")
    const [copiedBody, setCopiedBody] = useState(false)
    const [activeTab, setActiveTab] = useState("body")

    const addHeader = useCallback(() => {
        setHeaders((prev) => [...prev, { id: generateId(), key: "", value: "" }])
    }, [])

    const removeHeader = useCallback((id: string) => {
        setHeaders((prev) => prev.filter((h) => h.id !== id))
    }, [])

    const updateHeader = useCallback((id: string, field: "key" | "value", val: string) => {
        setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: val } : h)))
    }, [])

    const sendRequest = useCallback(async () => {
        let targetUrl = extractUrlishInput(url)
        if (!targetUrl) return

        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = "https://" + targetUrl
        }

        setUrl(targetUrl)

        setLoading(true)
        setError("")
        setResponse(null)

        try {
            const reqHeaders: Record<string, string> = {}
            headers.forEach((h) => {
                if (h.key.trim() && h.value.trim()) {
                    reqHeaders[h.key.trim()] = h.value.trim()
                }
            })

            const payload: Record<string, unknown> = {
                url: targetUrl,
                method,
                headers: reqHeaders,
            }

            if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
                payload.body = body
            }

            const res = await fetch("/api/api-tester", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || t("errorRequest"))
                return
            }

            setResponse(data)
        } catch {
            setError(t("errorRequest"))
        } finally {
            setLoading(false)
        }
    }, [url, method, headers, body, t])

    const copyResponseBody = useCallback(() => {
        if (!response) return
        navigator.clipboard.writeText(response.body)
        setCopiedBody(true)
        toast.success(t("copied"))
        setTimeout(() => setCopiedBody(false), 2000)
    }, [response, t])

    const statusColor = response
        ? response.status < 300
            ? "text-green-500"
            : response.status < 400
            ? "text-blue-500"
            : response.status < 500
            ? "text-yellow-500"
            : "text-red-500"
        : ""

    return (
        <div className="space-y-6">
            {/* Request */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    {/* Method + URL */}
                    <div className="flex gap-3">
                        <Select value={method} onValueChange={(v) => setMethod(v as HttpMethod)}>
                            <SelectTrigger className="w-[130px]">
                                <div className="flex items-center gap-2">
                                    <span className={cn("w-2 h-2 rounded-full", METHOD_COLORS[method])} />
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {METHODS.map((m) => (
                                    <SelectItem key={m} value={m}>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("w-2 h-2 rounded-full", METHOD_COLORS[m])} />
                                            {m}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder={t("urlPlaceholder")}
                            className="flex-1 font-mono text-sm"
                            onKeyDown={(e) => e.key === "Enter" && sendRequest()}
                        />
                        <Button onClick={sendRequest} disabled={loading || !url.trim()}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            {t("sendBtn")}
                        </Button>
                    </div>

                    {/* Headers */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">{t("headers")}</Label>
                            <Button variant="ghost" size="sm" onClick={addHeader}>
                                <Plus className="h-3 w-3 mr-1" />
                                {t("addHeader")}
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {headers.map((h) => (
                                <div key={h.id} className="flex gap-2 items-center">
                                    <Input
                                        value={h.key}
                                        onChange={(e) => updateHeader(h.id, "key", e.target.value)}
                                        placeholder={t("headerKey")}
                                        className="flex-1 font-mono text-sm"
                                    />
                                    <Input
                                        value={h.value}
                                        onChange={(e) => updateHeader(h.id, "value", e.target.value)}
                                        placeholder={t("headerValue")}
                                        className="flex-1 font-mono text-sm"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeHeader(h.id)} className="shrink-0">
                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Body (only for POST/PUT/PATCH) */}
                    {["POST", "PUT", "PATCH"].includes(method) && (
                        <div>
                            <Label className="text-sm font-medium mb-2 block">{t("body")}</Label>
                            <Textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder={t("bodyPlaceholder")}
                                className="font-mono text-sm min-h-[120px]"
                            />
                        </div>
                    )}

                    {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
            </Card>

            {/* Response */}
            {response && (
                <Card>
                    <CardContent className="p-6 space-y-4">
                        {/* Status bar */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <h3 className="text-lg font-semibold">{t("response")}</h3>
                            <Badge variant="outline" className={cn("text-base font-mono font-bold", statusColor)}>
                                {response.status} {response.statusText}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                                <Clock className="h-3.5 w-3.5" />
                                {response.time}ms
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList>
                                <TabsTrigger value="body">{t("responseBody")}</TabsTrigger>
                                <TabsTrigger value="headers">
                                    {t("responseHeaders")}
                                    <Badge variant="secondary" className="ml-1.5 text-xs">
                                        {Object.keys(response.headers).length}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="body" className="mt-4">
                                <div className="relative">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="absolute top-2 right-2 z-10"
                                        onClick={copyResponseBody}
                                    >
                                        {copiedBody ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                        {copiedBody ? t("copied") : t("copy")}
                                    </Button>
                                    <pre className="bg-muted rounded-lg p-4 overflow-auto max-h-[500px] text-sm font-mono whitespace-pre-wrap break-all">
                                        {formatJson(response.body)}
                                    </pre>
                                </div>
                            </TabsContent>

                            <TabsContent value="headers" className="mt-4">
                                <div className="rounded-lg border overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left px-4 py-2 font-medium">{t("headerKey")}</th>
                                                <th className="text-left px-4 py-2 font-medium">{t("headerValue")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(response.headers).map(([key, value]) => (
                                                <tr key={key} className="border-b last:border-0 hover:bg-muted/30">
                                                    <td className="px-4 py-2 font-mono text-xs font-semibold whitespace-nowrap">{key}</td>
                                                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground break-all">{value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
