"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTranslations } from "next-intl"
import {
    Copy,
    Trash2,
    RefreshCw,
    Fingerprint,
    Upload,
    FileText,
    CheckCircle2,
    XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { md5 } from "@/lib/md5"

type Hashes = {
    md5: string
    sha1: string
    sha256: string
    sha512: string
}

const EMPTY_HASHES: Hashes = { md5: "", sha1: "", sha256: "", sha512: "" }

// Read large files in chunks so progress can be reported. MD5 is computed only
// for text input (Web Crypto has no MD5); for files we show the SHA family.
const FILE_CHUNK_SIZE = 4 * 1024 * 1024 // 4 MiB

function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
}

export function HashGenerator() {
    const t = useTranslations("HashGenerator")
    const [input, setInput] = useState("")
    const [hashes, setHashes] = useState<Hashes>(EMPTY_HASHES)
    const [isCalculating, setIsCalculating] = useState(false)
    const [fileName, setFileName] = useState("")
    const [progress, setProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [expected, setExpected] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Text hashing (debounced). Skipped while a file result is displayed so the
    // file's hashes are not overwritten by an empty text input.
    useEffect(() => {
        if (fileName) return
        if (!input) {
            setHashes(EMPTY_HASHES)
            return
        }

        const calculateHashes = async () => {
            setIsCalculating(true)
            try {
                const data = new TextEncoder().encode(input)
                const [sha1, sha256, sha512] = await Promise.all([
                    crypto.subtle.digest("SHA-1", data),
                    crypto.subtle.digest("SHA-256", data),
                    crypto.subtle.digest("SHA-512", data),
                ])
                setHashes({
                    md5: md5(input),
                    sha1: bufferToHex(sha1),
                    sha256: bufferToHex(sha256),
                    sha512: bufferToHex(sha512),
                })
            } catch (error) {
                console.error("Hashing failed:", error)
                toast.error(t("error"))
            } finally {
                setIsCalculating(false)
            }
        }

        const timer = setTimeout(calculateHashes, 100)
        return () => clearTimeout(timer)
    }, [input, fileName, t])

    const hashFile = useCallback(
        async (file: File) => {
            setIsCalculating(true)
            setProgress(0)
            setInput("")
            setFileName(file.name)
            setHashes(EMPTY_HASHES)

            try {
                // Web Crypto's digest is one-shot, so accumulate the whole file
                // into a single ArrayBuffer while reporting read progress.
                const buffer = new Uint8Array(file.size)
                let offset = 0
                while (offset < file.size) {
                    const slice = file.slice(offset, offset + FILE_CHUNK_SIZE)
                    const chunk = new Uint8Array(await slice.arrayBuffer())
                    buffer.set(chunk, offset)
                    offset += chunk.length
                    setProgress(file.size === 0 ? 100 : Math.round((offset / file.size) * 100))
                }

                const [sha1, sha256, sha512] = await Promise.all([
                    crypto.subtle.digest("SHA-1", buffer),
                    crypto.subtle.digest("SHA-256", buffer),
                    crypto.subtle.digest("SHA-512", buffer),
                ])
                setHashes({
                    md5: "",
                    sha1: bufferToHex(sha1),
                    sha256: bufferToHex(sha256),
                    sha512: bufferToHex(sha512),
                })
            } catch (error) {
                console.error("File hashing failed:", error)
                toast.error(t("error"))
                setFileName("")
            } finally {
                setIsCalculating(false)
            }
        },
        [t]
    )

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) hashFile(file)
        e.target.value = ""
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) hashFile(file)
    }

    const clear = () => {
        setInput("")
        setFileName("")
        setExpected("")
        setHashes(EMPTY_HASHES)
        setProgress(0)
    }

    const copyToClipboard = (text: string, algorithm: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast.success(t("copied", { algorithm }))
    }

    // Compare the expected hash (case/whitespace-insensitive) against any of the
    // computed hashes. null = nothing to compare yet.
    const normalizedExpected = expected.trim().toLowerCase()
    const computed = [hashes.md5, hashes.sha1, hashes.sha256, hashes.sha512].filter(Boolean)
    const matchState: "idle" | "match" | "mismatch" =
        normalizedExpected.length === 0 || computed.length === 0
            ? "idle"
            : computed.includes(normalizedExpected)
              ? "match"
              : "mismatch"

    const hasContent = Boolean(input || fileName)

    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard className="p-6 rounded-2xl overflow-hidden min-h-[500px] flex flex-col gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <Label className="text-lg font-semibold flex items-center gap-2">
                            <Fingerprint className="w-5 h-5 text-primary" />
                            {t("input")}
                        </Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clear}
                            disabled={!hasContent && !expected}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {t("clear")}
                        </Button>
                    </div>
                    <Textarea
                        placeholder={t("placeholder")}
                        value={input}
                        onChange={(e) => {
                            setFileName("")
                            setInput(e.target.value)
                        }}
                        className="min-h-[120px] font-mono whitespace-pre-wrap bg-background/50 focus:bg-background transition-all resize-y"
                    />
                </div>

                {/* File Hashing (Checksum) */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                        {t("fileLabel")}
                    </Label>
                    <div
                        onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                            isDragging
                                ? "border-primary bg-primary/10"
                                : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30"
                        }`}
                    >
                        {fileName ? (
                            <FileText className="w-6 h-6 text-primary" />
                        ) : (
                            <Upload className="w-6 h-6 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                            {fileName || t("fileDropHint")}
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={onFileChange}
                        />
                    </div>
                    {isCalculating && fileName && (
                        <div className="space-y-1">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-right">
                                {t("fileProgress", { percent: progress })}
                            </p>
                        </div>
                    )}
                </div>

                {/* Hashes Grid */}
                <div className="grid gap-6">
                    <HashRow
                        label="MD5"
                        value={hashes.md5}
                        loading={isCalculating}
                        onCopy={() => copyToClipboard(hashes.md5, "MD5")}
                    />
                    <HashRow
                        label="SHA-1"
                        value={hashes.sha1}
                        loading={isCalculating}
                        onCopy={() => copyToClipboard(hashes.sha1, "SHA-1")}
                    />
                    <HashRow
                        label="SHA-256"
                        value={hashes.sha256}
                        loading={isCalculating}
                        onCopy={() => copyToClipboard(hashes.sha256, "SHA-256")}
                    />
                    <HashRow
                        label="SHA-512"
                        value={hashes.sha512}
                        loading={isCalculating}
                        onCopy={() => copyToClipboard(hashes.sha512, "SHA-512")}
                        textArea
                    />
                </div>

                {/* Compare against expected hash */}
                <div className="space-y-2">
                    <Label
                        htmlFor="expected-hash"
                        className="text-sm font-medium text-muted-foreground"
                    >
                        {t("compareLabel")}
                    </Label>
                    <Input
                        id="expected-hash"
                        value={expected}
                        onChange={(e) => setExpected(e.target.value)}
                        placeholder={t("comparePlaceholder")}
                        className="font-mono text-xs"
                    />
                    {matchState === "match" && (
                        <p className="flex items-center gap-1.5 text-sm text-green-500">
                            <CheckCircle2 className="w-4 h-4" />
                            {t("compareMatch")}
                        </p>
                    )}
                    {matchState === "mismatch" && (
                        <p className="flex items-center gap-1.5 text-sm text-destructive">
                            <XCircle className="w-4 h-4" />
                            {t("compareMismatch")}
                        </p>
                    )}
                </div>
            </GlassCard>
        </div>
    )
}

function HashRow({
    label,
    value,
    loading,
    onCopy,
    textArea = false,
}: {
    label: string
    value: string
    loading: boolean
    onCopy: () => void
    textArea?: boolean
}) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
            <div className="relative group">
                {textArea ? (
                    <Textarea
                        readOnly
                        value={value}
                        className="font-mono text-xs bg-muted/30 text-foreground/90 min-h-[80px] pr-10 resize-none"
                    />
                ) : (
                    <Input
                        readOnly
                        value={value}
                        className="font-mono text-xs bg-muted/30 text-foreground/90 h-10 pr-10"
                    />
                )}

                <div className="absolute top-0 right-0 p-1 h-full flex items-start pt-[6px] pr-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={onCopy}
                        disabled={!value || loading}
                    >
                        {loading ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
