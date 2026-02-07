"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { format } from 'sql-formatter'
import { Copy, Trash2, Play, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GlassCard } from "@/components/ui/glass-card"

// Actually, I'll use a simple copy feedback state.

type SqlDialect = "sql" | "mysql" | "postgresql" | "plsql" | "tsql" | "bigquery";
type KeywordCase = "preserve" | "upper" | "lower";

export function SqlFormatter() {
    const t = useTranslations('SqlFormatter');
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [dialect, setDialect] = useState<SqlDialect>("sql");
    const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleFormat = () => {
        setError(null);
        if (!input.trim()) return;

        try {
            const formatted = format(input, {
                language: dialect,
                keywordCase: keywordCase,
                linesBetweenQueries: 2,
            });
            setOutput(formatted);
        } catch (err) {
            setError(t('errorMessage'));
            console.error(err);
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleClear = () => {
        setInput("");
        setOutput("");
        setError(null);
    };

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Controls Bar */}
            <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl">
                <div className="flex items-center gap-4">
                    <Select value={dialect} onValueChange={(v) => setDialect(v as SqlDialect)}>
                        <SelectTrigger className="w-[140px] border-border/40 bg-secondary/50 text-foreground backdrop-blur-md">
                            <SelectValue placeholder="Dialect" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sql">Standard SQL</SelectItem>
                            <SelectItem value="mysql">MySQL</SelectItem>
                            <SelectItem value="postgresql">PostgreSQL</SelectItem>
                            <SelectItem value="plsql">Oracle PL/SQL</SelectItem>
                            <SelectItem value="tsql">SQL Server</SelectItem>
                            <SelectItem value="bigquery">BigQuery</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={keywordCase} onValueChange={(v) => setKeywordCase(v as KeywordCase)}>
                        <SelectTrigger className="w-[140px] border-border/40 bg-secondary/50 text-foreground backdrop-blur-md">
                            <SelectValue placeholder="Case" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="upper">UPPERCASE</SelectItem>
                            <SelectItem value="lower">lowercase</SelectItem>
                            <SelectItem value="preserve">Preserve</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleClear}
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('clear')}
                    </Button>
                    <Button
                        onClick={handleFormat}
                        className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                    >
                        <Play className="h-4 w-4 mr-2" />
                        {t('format')}
                    </Button>
                </div>
            </GlassCard>

            {/* Editor Area */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input */}
                <div className="relative flex flex-col h-full rounded-2xl border border-border/40 bg-secondary/50 backdrop-blur-md overflow-hidden group focus-within:border-primary/50 transition-colors">
                    <div className="absolute top-0 left-0 right-0 p-2 bg-white/5 border-b border-white/10 text-xs font-medium text-muted-foreground">
                        Input SQL
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('inputPlaceholder')}
                        className="flex-1 w-full h-full resize-none bg-transparent p-4 pt-10 text-sm font-mono text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                        spellCheck={false}
                    />
                </div>

                {/* Output */}
                <div className="relative flex flex-col h-full rounded-2xl border border-border/40 bg-secondary/80 backdrop-blur-md overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 p-2 bg-white/5 border-b border-white/10 flex justify-between items-center text-xs font-medium text-muted-foreground">
                        <span>Output SQL</span>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50"
                            disabled={!output}
                        >
                            {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {isCopied ? "Copied!" : "Copy"}
                        </button>
                    </div>

                    {error ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-destructive p-4">
                            <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <textarea
                            value={output}
                            readOnly
                            placeholder={t('outputPlaceholder')}
                            className="flex-1 w-full h-full resize-none bg-transparent p-4 pt-10 text-sm font-mono text-primary/90 focus:outline-none selection:bg-primary/30"
                            spellCheck={false}
                        />
                    )}
                </div>
            </div>
        </div >
    )
}
