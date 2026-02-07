"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Info, Clock } from "lucide-react"
import cronstrue from 'cronstrue';
import { CronExpressionParser } from 'cron-parser';

const PRESETS = [
    { label: "Every minute", value: "* * * * *" },
    { label: "Every 5 minutes", value: "*/5 * * * *" },
    { label: "Every hour", value: "0 * * * *" },
    { label: "Daily at midnight", value: "0 0 * * *" },
    { label: "Every Monday at 9am", value: "0 9 * * 1" },
    { label: "End of month", value: "0 0 28-31 * *" },
]

export function CronGenerator() {
    const t = useTranslations('CronGenerator');
    const [expression, setExpression] = useState("* * * * *")
    const [humanReadable, setHumanReadable] = useState("")
    const [nextRuns, setNextRuns] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        if (!expression.trim()) {
            setHumanReadable("")
            setNextRuns([])
            setError(null)
            return
        }

        // 1. Describe
        try {
            const desc = cronstrue.toString(expression)
            setHumanReadable(desc)
            setError(null)
        } catch (e) {
            setError("Invalid cron expression")
            setHumanReadable("")
            setNextRuns([])
            return; // Stop if invalid syntax
        }

        // 2. Predict next runs
        try {
            const interval = CronExpressionParser.parse(expression)
            const runs = []
            for (let i = 0; i < 5; i++) {
                runs.push(interval.next().toString())
            }
            setNextRuns(runs)
        } catch (e) {
            console.error("Next run calculation failed:", e)
            setNextRuns([])
            // Don't set global error if just prediction fails, unless we want to warn
        }
    }, [expression])

    const handleCopy = () => {
        navigator.clipboard.writeText(expression)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    return (
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <GlassCard className="p-8 rounded-2xl space-y-6">
                    <div className="space-y-2">
                        <Label>Cron Expression</Label>
                        <div className="flex gap-2">
                            <Input
                                value={expression}
                                onChange={(e) => setExpression(e.target.value)}
                                className="h-14 text-2xl font-mono bg-muted/20 border-border/40 focus:ring-cyan-500/50 rounded-xl text-center tracking-widest"
                            />
                            <Button
                                size="icon"
                                className="h-14 w-14 rounded-xl shrink-0"
                                onClick={handleCopy}
                            >
                                {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>

                    {error ? (
                        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-center font-medium">
                            {error}
                        </div>
                    ) : (
                        <div className="p-6 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-center space-y-2">
                            <div className="text-sm text-cyan-500/80 font-medium uppercase tracking-wider">Schedule</div>
                            <div className="text-xl md:text-2xl font-bold text-foreground">
                                “{humanReadable}”
                            </div>
                        </div>
                    )}
                </GlassCard>

                <div className="grid grid-cols-2 gap-3">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => setExpression(preset.value)}
                            className="p-3 rounded-xl bg-muted/20 hover:bg-muted/40 border border-border/40 text-sm text-left transition-colors flex flex-col gap-1 group"
                        >
                            <span className="font-medium text-foreground">{preset.label}</span>
                            <span className="font-mono text-xs text-muted-foreground group-hover:text-cyan-500 transition-colors">{preset.value}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <GlassCard className="p-8 rounded-2xl h-full">
                    <Label className="text-lg font-semibold mb-6 block flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-500" />
                        Next Runs
                    </Label>

                    {nextRuns.length > 0 ? (
                        <div className="space-y-3 relative">
                            {/* Timeline line */}
                            <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-border/40" />

                            {nextRuns.map((run, i) => (
                                <div key={i} className="flex gap-4 items-center relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-background border border-border/40 flex items-center justify-center shrink-0 text-xs font-mono text-muted-foreground">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 p-3 rounded-xl bg-muted/20 border border-border/40 font-mono text-sm">
                                        {run}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground italic">
                            Enter a valid cron expression to see upcoming schedule.
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    )
}
