"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from 'next-intl'
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function RegexTester() {
    const t = useTranslations('RegexTester');
    const [regexStr, setRegexStr] = useState("")
    const [flags, setFlags] = useState("gm")
    const [testString, setTestString] = useState("The quick brown fox jumps over the lazy dog.\n1234567890\nuser@example.com")
    const [matches, setMatches] = useState<RegExpMatchArray | null>(null)
    const [error, setError] = useState<string | null>(null)

    const processedMatches = useMemo(() => {
        if (!regexStr) return [];
        try {
            const re = new RegExp(regexStr, flags);
            const matches = [...testString.matchAll(re)];
            return matches;
        } catch (e) {
            return [];
        }
    }, [regexStr, flags, testString]);

    useEffect(() => {
        if (!regexStr) {
            setError(null)
            return
        }
        try {
            new RegExp(regexStr, flags)
            setError(null)
        } catch (e: any) {
            setError(e.message)
        }
    }, [regexStr, flags])

    const HighlightedText = () => {
        if (!regexStr || error) return <div className="whitespace-pre-wrap font-mono text-sm text-foreground">{testString}</div>;

        let lastIndex = 0;
        const parts = [];

        // We need to handle overlapping or ensuring we push correctly.
        // matchAll returns matched objects with index.

        try {
            // Re-run matchAll because iterator is consumed
            const re = new RegExp(regexStr, flags);
            const matches = [...testString.matchAll(re)];

            if (matches.length === 0) return <div className="whitespace-pre-wrap font-mono text-sm text-foreground">{testString}</div>;

            matches.forEach((match, i) => {
                const start = match.index!;
                const end = start + match[0].length;

                if (start > lastIndex) {
                    parts.push(<span key={`text-${i}`}>{testString.slice(lastIndex, start)}</span>);
                }

                parts.push(
                    <span key={`match-${i}`} className="bg-rose-500/20 text-rose-500 rounded-sm font-bold border-b border-rose-500/50">
                        {match[0]}
                    </span>
                );
                lastIndex = end;
            });

            if (lastIndex < testString.length) {
                parts.push(<span key="text-end">{testString.slice(lastIndex)}</span>);
            }

            return <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{parts}</div>;

        } catch (e) {
            return <div className="whitespace-pre-wrap font-mono text-sm text-foreground">{testString}</div>;
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <GlassCard className="p-6 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                        <Label>Regular Expression</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/</span>
                            <Input
                                value={regexStr}
                                onChange={(e) => setRegexStr(e.target.value)}
                                placeholder="e.g. [a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}"
                                className="pl-6 font-mono bg-secondary/50 border-border/40 focus:ring-rose-500/50"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/{flags}</span>
                        </div>
                    </div>

                    <div className="w-full md:w-32 space-y-2">
                        <Label>Flags</Label>
                        <Input
                            value={flags}
                            onChange={(e) => setFlags(e.target.value)}
                            placeholder="gimsuy"
                            className="font-mono bg-secondary/50 border-border/40 focus:ring-rose-500/50"
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </GlassCard>

            <div className="grid md:grid-cols-2 gap-6 h-[500px]">
                <div className="flex flex-col gap-2 h-full">
                    <Label className="text-muted-foreground ml-1">Test String</Label>
                    <Textarea
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        className="flex-1 resize-none font-mono text-sm bg-secondary/50 border-border/40 focus:ring-rose-500/50 leading-relaxed"
                        placeholder="Enter text to test regex against..."
                    />
                </div>

                <div className="flex flex-col gap-2 h-full">
                    <div className="flex justify-between items-center">
                        <Label className="text-muted-foreground ml-1">Matches</Label>
                        <Badge variant="outline" className="text-muted-foreground">
                            {processedMatches.length} matches
                        </Badge>
                    </div>
                    <div className="flex-1 bg-secondary/50 border border-border/40 rounded-xl p-3 overflow-auto">
                        <HighlightedText />
                    </div>
                </div>
            </div>

            <GlassCard className="p-6 rounded-2xl">
                <Label className="text-lg font-semibold mb-4 block">Match Details</Label>
                {processedMatches.length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {processedMatches.map((match, i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30 items-start text-sm font-mono">
                                <div className="min-w-[40px] text-muted-foreground">#{i + 1}</div>
                                <div className="flex-1 break-all">
                                    <span className="text-rose-500 font-bold">{match[0]}</span>
                                    {match.length > 1 && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Groups: {JSON.stringify(match.slice(1))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Idx: {match.index}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No matches found
                    </div>
                )}
            </GlassCard>
        </div>
    )
}
