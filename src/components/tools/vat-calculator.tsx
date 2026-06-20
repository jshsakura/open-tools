"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Receipt } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { computeVat, type VatMode } from "./vat-calculator.utils"

type Mode = VatMode

const formatNumber = (n: number) =>
    Number.isFinite(n) ? Math.round(n).toLocaleString() : "0"

export function VatCalculator() {
    const t = useTranslations("VatCalculator")
    const [mode, setMode] = useState<Mode>("addVat")
    const [amount, setAmount] = useState("")
    const [rate, setRate] = useState("10")

    const value = parseFloat(amount.replaceAll(",", ""))
    const ratePct = parseFloat(rate)
    const hasInput = Number.isFinite(value) && value > 0 && Number.isFinite(ratePct)

    const { net, vat, gross } = hasInput
        ? computeVat(value, ratePct, mode)
        : { net: 0, vat: 0, gross: 0 }

    const rows: { label: string; value: number; highlight?: boolean }[] = [
        { label: t("net"), value: net, highlight: mode === "extractVat" },
        { label: t("vat", { rate: ratePct || 0 }), value: vat, highlight: true },
        { label: t("gross"), value: gross, highlight: mode === "addVat" },
    ]

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            <GlassCard className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-2">
                    {(["addVat", "extractVat"] as Mode[]).map((m) => (
                        <Button key={m} variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)} className="text-sm">
                            {t(m)}
                        </Button>
                    ))}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold">{mode === "addVat" ? t("inputNet") : t("inputGross")}</Label>
                    <Input
                        inputMode="numeric"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="h-12 text-lg font-bold tabular-nums"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Label className="text-xs font-bold whitespace-nowrap">{t("rate")}</Label>
                    <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="h-9 w-24 text-sm"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5" /> {t("result")}
                </div>
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                            row.highlight ? "bg-primary/10" : "bg-secondary/40"
                        }`}
                    >
                        <span className="text-sm font-medium">{row.label}</span>
                        <span className={`text-lg font-bold tabular-nums ${row.highlight ? "text-primary" : ""}`}>
                            {formatNumber(row.value)}
                        </span>
                    </div>
                ))}
            </GlassCard>
        </div>
    )
}
