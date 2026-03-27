"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, Dices, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function generateUUIDv4(): string {
    return crypto.randomUUID()
}

function generateUUIDv7(): string {
    const timestamp = Date.now()
    const timestampHex = timestamp.toString(16).padStart(12, "0")
    const randomBytes = new Uint8Array(10)
    crypto.getRandomValues(randomBytes)
    const hex = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    // Format: tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
    const raw =
        timestampHex.slice(0, 8) +
        timestampHex.slice(8, 12) +
        "7" +
        hex.slice(0, 3) +
        ((parseInt(hex.slice(3, 4), 16) & 0x3) | 0x8).toString(16) +
        hex.slice(4, 7) +
        hex.slice(7, 19)
    return (
        raw.slice(0, 8) +
        "-" +
        raw.slice(8, 12) +
        "-" +
        raw.slice(12, 16) +
        "-" +
        raw.slice(16, 20) +
        "-" +
        raw.slice(20, 32)
    )
}

export function UuidGenerator() {
    const t = useTranslations("UuidGenerator")
    const [version, setVersion] = useState<"v4" | "v7">("v4")
    const [uuids, setUuids] = useState<string[]>([])
    const [bulkCount, setBulkCount] = useState(1)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [totalGenerated, setTotalGenerated] = useState(0)

    const generate = useCallback(() => {
        const count = Math.max(1, Math.min(100, bulkCount))
        const newUuids: string[] = []
        for (let i = 0; i < count; i++) {
            newUuids.push(version === "v4" ? generateUUIDv4() : generateUUIDv7())
        }
        setUuids((prev) => [...newUuids, ...prev])
        setTotalGenerated((prev) => prev + count)
    }, [version, bulkCount])

    const copyToClipboard = useCallback(
        async (text: string, index: number) => {
            await navigator.clipboard.writeText(text)
            setCopiedIndex(index)
            toast.success(t("copied"))
            setTimeout(() => setCopiedIndex(null), 1500)
        },
        [t]
    )

    const copyAll = useCallback(async () => {
        if (uuids.length === 0) return
        await navigator.clipboard.writeText(uuids.join("\n"))
        toast.success(t("copiedAll"))
    }, [uuids, t])

    const clear = useCallback(() => {
        setUuids([])
    }, [])

    return (
        <div className="space-y-6">
            <GlassCard className="p-6">
                <div className="space-y-4">
                    {/* Version selector */}
                    <div className="space-y-2">
                        <Label>{t("version")}</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={version === "v4" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setVersion("v4")}
                            >
                                UUID v4
                            </Button>
                            <Button
                                variant={version === "v7" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setVersion("v7")}
                            >
                                UUID v7
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {version === "v4" ? t("v4Desc") : t("v7Desc")}
                        </p>
                    </div>

                    {/* Bulk count */}
                    <div className="space-y-2">
                        <Label>{t("count")}</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={bulkCount}
                                onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                                className="w-24"
                            />
                            <span className="text-xs text-muted-foreground">{t("countHint")}</span>
                        </div>
                    </div>

                    {/* Generate button */}
                    <div className="flex gap-2 items-center">
                        <Button onClick={generate} className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            {t("generate")}
                        </Button>
                        <Button variant="outline" onClick={copyAll} disabled={uuids.length === 0} className="gap-2">
                            <Copy className="w-4 h-4" />
                            {t("copyAll")}
                        </Button>
                        <Button variant="ghost" onClick={clear} disabled={uuids.length === 0} className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            {t("clear")}
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>
                            {t("totalGenerated")}: <strong>{totalGenerated}</strong>
                        </span>
                        <span>
                            {t("currentList")}: <strong>{uuids.length}</strong>
                        </span>
                    </div>
                </div>
            </GlassCard>

            {/* UUID list */}
            {uuids.length > 0 && (
                <GlassCard className="p-6">
                    <Label className="mb-3 block">{t("results")}</Label>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {uuids.map((uuid, index) => (
                            <div
                                key={`${uuid}-${index}`}
                                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                            >
                                <code className="flex-1 text-sm font-mono break-all select-all">
                                    {uuid}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(uuid, index)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                >
                                    {copiedIndex === index ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    )
}
