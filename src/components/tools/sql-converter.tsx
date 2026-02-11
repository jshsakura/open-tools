"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, FileJson, FileSpreadsheet, ArrowRightLeft, Database } from "lucide-react"
import Papa from 'papaparse';

export function SqlConverter() {
    const t = useTranslations('Catalog');
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [inputType, setInputType] = useState<"sql" | "table">("sql");
    const [outputFormat, setOutputFormat] = useState<"json" | "csv">("json");
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        convertData();
    }, [input, inputType, outputFormat]);

    const convertData = () => {
        if (!input.trim()) {
            setOutput("");
            setError(null);
            return;
        }

        try {
            let data: any[] = [];

            if (inputType === "sql") {
                // Basic INSERT parsing
                // Matches: INSERT INTO table (col1, col2) VALUES (val1, val2), (val3, val4);
                // This is a simplified regex approach.
                const valuesMatch = input.match(/VALUES\s*([\s\S]+);?/i);
                if (valuesMatch) {
                    const valuesStr = valuesMatch[1];
                    // Split mostly by ),( but be careful about strings. 
                    // For "sanjzbari" (simple) tools, we can try robust splitting or just eval if safe (not safe here).
                    // Let's use a simple regex split for row groups: \),\s*\(
                    // And trim leading ( and trailing )

                    // Improved strategy: 
                    // 1. Extract column names if available: INSERT INTO t (c1, c2)
                    // 2. Extract value groups.

                    const colsMatch = input.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)/i);
                    const columns = colsMatch ? colsMatch[1].split(',').map(c => c.trim().replace(/['"`]/g, '')) : [];

                    // Remove VALUES keyword and split by ), (
                    // This is hacky but works for standard generated dumps
                    const rowsStr = valuesStr.trim();
                    const rows = rowsStr.split(/\)\s*,\s*\(/);

                    data = rows.map(row => {
                        // Clean start/end parenthesis for first/last items if split retained them or not
                        let cleanedRow = row.replace(/^\(/, '').replace(/\)$/, ''); // Simple cleanup

                        // Split values by comma, respecting quotes is hard with simple split.
                        // We will use PapaParse to parse the *row string* as a CSV line!
                        // Values in SQL are often comma separated like CSV.
                        const parsed = Papa.parse(cleanedRow, { quoteChar: "'", delimiter: ",", skipEmptyLines: true });
                        const values = parsed.data[0] as any[];

                        if (columns.length > 0 && values.length === columns.length) {
                            return columns.reduce((acc, col, idx) => ({ ...acc, [col]: values[idx] }), {});
                        }
                        return values; // Return array if no columns
                    });
                } else {
                    throw new Error("Could not parse SQL INSERT statement.");
                }
            } else {
                // Table (TSV/CSV)
                // Auto-detect delimiter
                const parsed = Papa.parse(input, { header: true, dynamicTyping: true, skipEmptyLines: true });
                if (parsed.errors.length > 0) {
                    // Try simpler tab separation if papa fails or just generic split
                    // But Papa allows auto-detect.
                    console.warn("Papa parse warning:", parsed.errors);
                }
                data = parsed.data;
            }

            if (outputFormat === "json") {
                setOutput(JSON.stringify(data, null, 2));
            } else {
                setOutput(Papa.unparse(data));
            }
            setError(null);
        } catch (e) {
            setError("Error parsing input. Please check the format.");
            setOutput("");
            console.error(e);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-350px)] min-h-[450px]">
            <GlassCard className="h-full flex flex-col p-6 rounded-2xl gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Tabs value={inputType} onValueChange={(v) => setInputType(v as "sql" | "table")} className="w-full sm:w-auto">
                        <TabsList className="bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="sql" className="rounded-lg px-4 py-2">
                                <Database className="w-4 h-4 mr-2" />
                                {t('SqlConverter.inputLabelSql')}
                            </TabsTrigger>
                            <TabsTrigger value="table" className="rounded-lg px-4 py-2">
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                {t('SqlConverter.inputLabelTable')}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <ArrowRightLeft className="hidden sm:block text-muted-foreground" />

                    <Tabs value={outputFormat} onValueChange={(v) => setOutputFormat(v as "json" | "csv")} className="w-full sm:w-auto">
                        <TabsList className="bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="json" className="rounded-lg px-4 py-2">
                                <FileJson className="w-4 h-4 mr-2" />
                                JSON
                            </TabsTrigger>
                            <TabsTrigger value="csv" className="rounded-lg px-4 py-2">
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                CSV
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 grid md:grid-cols-2 gap-6 min-h-0">
                    <div className="flex flex-col gap-2 min-h-0 relative">
                        <div className="flex justify-between items-center h-8">
                            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('SqlConverter.inputLabelSql')}</Label>
                        </div>
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={inputType === 'sql' ? t('SqlConverter.placeholderSql') : t('SqlConverter.placeholderTable')}
                            className="flex-1 font-mono text-sm bg-secondary/50 border-border/40 resize-none focus-visible:ring-indigo-500/50 rounded-xl leading-relaxed p-4"
                        />
                        {error && (
                            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-destructive/90 text-destructive-foreground text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 min-h-0">
                        <div className="flex justify-between items-center h-8">
                            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('SqlConverter.outputLabel', { format: outputFormat.toUpperCase() })}</Label>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCopy}
                                className="h-8 text-xs hover:bg-white/10"
                                disabled={!output}
                            >
                                {isCopied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                                {isCopied ? t('SqlConverter.copied') : t('SqlConverter.copy')}
                            </Button>
                        </div>
                        <Textarea
                            value={output}
                            readOnly
                            className="flex-1 font-mono text-sm bg-secondary/80 border-border/40 resize-none focus-visible:ring-indigo-500/50 rounded-xl leading-relaxed p-4 text-muted-foreground"
                        />
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}
