"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { ArrowRightLeft, Database, Ruler } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function UnitConverter() {
    const t = useTranslations('UnitConverter');

    // Px <-> Rem state
    const [baseSize, setBaseSize] = useState(16)
    const [pxValue, setPxValue] = useState(16)
    const [remValue, setRemValue] = useState(1)

    // Data state
    const [dataValue, setDataValue] = useState(1)
    const [fromUnit, setFromUnit] = useState("GB")
    const [toUnit, setToUnit] = useState("MB")
    const [dataResult, setDataResult] = useState("")

    // Handlers for Px/Rem
    const handlePxChange = (val: string) => {
        const px = parseFloat(val)
        setPxValue(px)
        if (!isNaN(px) && baseSize > 0) {
            setRemValue(parseFloat((px / baseSize).toFixed(4)))
        } else {
            setRemValue(0)
        }
    }

    const handleRemChange = (val: string) => {
        const rem = parseFloat(val)
        setRemValue(rem)
        if (!isNaN(rem)) {
            setPxValue(parseFloat((rem * baseSize).toFixed(1)))
        } else {
            setPxValue(0)
        }
    }

    const handleBaseChange = (val: string) => {
        const base = parseFloat(val)
        setBaseSize(base)
        if (!isNaN(base) && base > 0) {
            setRemValue(parseFloat((pxValue / base).toFixed(4)))
        }
    }

    // Handlers for Data
    const units = ["B", "KB", "MB", "GB", "TB", "PB"]

    useEffect(() => {
        if (isNaN(dataValue)) {
            setDataResult("-")
            return
        }

        const fromIndex = units.indexOf(fromUnit)
        const toIndex = units.indexOf(toUnit)

        // Calculate power difference
        // e.g. GB (3) -> MB (2) = diff -1.  1 GB = 1024 MB.  
        // Wait, standard memory is 1024.
        const diff = fromIndex - toIndex
        const multiplier = Math.pow(1024, diff)

        const result = dataValue * multiplier

        // Format nicely
        let formatted = result.toLocaleString(undefined, { maximumFractionDigits: 6 })

        // If it's a very small number or huge number, maybe scientific? 
        // For now simple float is fine for typical dev use.
        setDataResult(formatted)

    }, [dataValue, fromUnit, toUnit])


    return (
        <div className="max-w-2xl mx-auto">
            <Tabs defaultValue="px-rem" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 backdrop-blur-md p-1 rounded-xl">
                    <TabsTrigger value="px-rem" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                        <Ruler className="w-4 h-4 mr-2" />
                        PX ↔ REM
                    </TabsTrigger>
                    <TabsTrigger value="data" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                        <Database className="w-4 h-4 mr-2" />
                        Data Units
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="px-rem">
                    <GlassCard className="p-8 rounded-2xl space-y-8">
                        {/* Base Size Setting */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/40">
                            <Label htmlFor="base-size" className="text-muted-foreground font-medium">
                                Base Font Size (px)
                            </Label>
                            <Input
                                id="base-size"
                                type="number"
                                value={baseSize}
                                onChange={(e) => handleBaseChange(e.target.value)}
                                className="w-24 text-right bg-transparent border-border/40 focus:ring-primary/50"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex-1 w-full space-y-2">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Pixels (px)</Label>
                                <Input
                                    type="number"
                                    value={pxValue || ""}
                                    onChange={(e) => handlePxChange(e.target.value)}
                                    className="h-14 text-2xl font-mono bg-secondary/50 border-border/40 focus:ring-primary/50 rounded-xl"
                                />
                            </div>

                            <div className="text-muted-foreground">
                                <ArrowRightLeft className="w-6 h-6" />
                            </div>

                            <div className="flex-1 w-full space-y-2">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Rem</Label>
                                <Input
                                    type="number"
                                    value={remValue || ""}
                                    onChange={(e) => handleRemChange(e.target.value)}
                                    className="h-14 text-2xl font-mono bg-secondary/50 border-border/40 focus:ring-primary/50 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground bg-secondary/50 p-4 rounded-xl border border-border/40">
                            Formula: <code>{pxValue}px / {baseSize} = {remValue}rem</code>
                        </div>
                    </GlassCard>
                </TabsContent>

                <TabsContent value="data">
                    <GlassCard className="p-8 rounded-2xl space-y-8">
                        <div className="flex flex-col gap-6">
                            <div className="space-y-4">
                                <Label className="text-muted-foreground">Value to Convert</Label>
                                <div className="flex gap-4">
                                    <Input
                                        type="number"
                                        value={dataValue}
                                        onChange={(e) => setDataValue(parseFloat(e.target.value))}
                                        className="h-14 text-xl font-mono bg-secondary/50 border-border/40 flex-1 rounded-xl"
                                    />
                                    <Select value={fromUnit} onValueChange={setFromUnit}>
                                        <SelectTrigger className="w-28 h-14 bg-secondary/50 border-border/40 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-center text-muted-foreground">
                                <ArrowRightLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-muted-foreground">Converted Result</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center px-4 h-14 text-xl font-mono bg-primary/10 border border-primary/20 text-primary flex-1 rounded-xl overflow-x-auto whitespace-nowrap">
                                        {dataResult}
                                    </div>
                                    <Select value={toUnit} onValueChange={setToUnit}>
                                        <SelectTrigger className="w-28 h-14 bg-secondary/50 border-border/40 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </TabsContent>
            </Tabs>
        </div>
    )
}
