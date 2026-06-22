"use client"

import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { FORMATS, BITRATES, OUTPUT_FORMATS, type AudioFormat } from "./audio-shared.utils"

interface AudioOutputPickerProps {
    format: AudioFormat
    onFormatChange: (format: AudioFormat) => void
    bitrate: number
    onBitrateChange: (bitrate: number) => void
    disabled?: boolean
    formatLabel: string
    bitrateLabel: string
    losslessNote: string
}

/**
 * Shared output-format + bitrate selector used by the filter-based audio tools
 * (merger, volume, speed, fade). Presentational only — labels are passed in so
 * each tool keeps its own i18n namespace.
 */
export function AudioOutputPicker({
    format,
    onFormatChange,
    bitrate,
    onBitrateChange,
    disabled,
    formatLabel,
    bitrateLabel,
    losslessNote,
}: AudioOutputPickerProps) {
    const isLossy = FORMATS[format].lossy

    return (
        <>
            <div className="space-y-4">
                <Label className="text-base">{formatLabel}</Label>
                <div className="grid grid-cols-5 gap-2">
                    {OUTPUT_FORMATS.map((fmt) => (
                        <div
                            key={fmt}
                            onClick={() => !disabled && onFormatChange(fmt)}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-3 text-center transition-all",
                                disabled && "pointer-events-none opacity-50",
                                format === fmt
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-muted hover:border-primary/50 hover:bg-muted/50",
                            )}
                        >
                            <span className="font-mono font-bold uppercase text-xs">
                                {FORMATS[fmt].ext}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Label className="text-base">{bitrateLabel}</Label>
                <Select
                    value={String(bitrate)}
                    onValueChange={(v) => onBitrateChange(Number(v))}
                    disabled={disabled || !isLossy}
                >
                    <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {BITRATES.map((b) => (
                            <SelectItem key={b} value={String(b)}>
                                {b}k
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {!isLossy && <p className="text-xs text-muted-foreground">{losslessNote}</p>}
            </div>
        </>
    )
}
