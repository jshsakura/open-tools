"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { ArrowRightLeft, Database, Ruler, Thermometer, Scale, Sparkles } from "lucide-react"
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

    // Length state
    const [lengthValue, setLengthValue] = useState(1)
    const [lengthFrom, setLengthFrom] = useState("m")
    const [lengthTo, setLengthTo] = useState("cm")
    const [lengthResult, setLengthResult] = useState("")

    // Weight state
    const [weightValue, setWeightValue] = useState(1)
    const [weightFrom, setWeightFrom] = useState("kg")
    const [weightTo, setWeightTo] = useState("g")
    const [weightResult, setWeightResult] = useState("")

    // Temperature state
    const [tempValue, setTempValue] = useState(25)
    const [tempFrom, setTempFrom] = useState("C")
    const [tempTo, setTempTo] = useState("F")
    const [tempResult, setTempResult] = useState("")

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

    const formatNumber = (value: number) =>
        value.toLocaleString(undefined, { maximumFractionDigits: 6 })

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
        let formatted = formatNumber(result)

        // If it's a very small number or huge number, maybe scientific? 
        // For now simple float is fine for typical dev use.
        setDataResult(formatted)

    }, [dataValue, fromUnit, toUnit])

    // Length conversions (base: meter)
    const lengthUnits: Record<string, number> = {
        mm: 0.001,
        cm: 0.01,
        m: 1,
        km: 1000,
        in: 0.0254,
        ft: 0.3048,
        yd: 0.9144,
        mi: 1609.344
    }

    useEffect(() => {
        if (isNaN(lengthValue)) {
            setLengthResult("-")
            return
        }
        const base = lengthValue * lengthUnits[lengthFrom]
        const result = base / lengthUnits[lengthTo]
        setLengthResult(formatNumber(result))
    }, [lengthValue, lengthFrom, lengthTo])

    // Weight conversions (base: gram)
    const weightUnits: Record<string, number> = {
        mg: 0.001,
        g: 1,
        kg: 1000,
        oz: 28.349523125,
        lb: 453.59237
    }

    useEffect(() => {
        if (isNaN(weightValue)) {
            setWeightResult("-")
            return
        }
        const base = weightValue * weightUnits[weightFrom]
        const result = base / weightUnits[weightTo]
        setWeightResult(formatNumber(result))
    }, [weightValue, weightFrom, weightTo])

    // Temperature conversions
    const convertTemperature = (value: number, from: string, to: string) => {
        if (isNaN(value)) return NaN
        let celsius = value
        if (from === "F") celsius = (value - 32) * (5 / 9)
        if (from === "K") celsius = value - 273.15
        if (to === "C") return celsius
        if (to === "F") return (celsius * 9) / 5 + 32
        if (to === "K") return celsius + 273.15
        return value
    }

    useEffect(() => {
        if (isNaN(tempValue)) {
            setTempResult("-")
            return
        }
        const result = convertTemperature(tempValue, tempFrom, tempTo)
        setTempResult(isNaN(result) ? "-" : formatNumber(result))
    }, [tempValue, tempFrom, tempTo])


    const inputClass = "h-12 text-lg font-mono bg-secondary/50 border-border/40 rounded-xl"
    const selectClass = "w-28 h-12 bg-secondary/50 border-border/40 rounded-xl"

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold text-primary w-fit">
                <Sparkles className="h-4 w-4" />
                {t('badge')}
            </div>
            <Tabs defaultValue="px-rem" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6 bg-secondary/50 backdrop-blur-md p-1 rounded-2xl">
                    <TabsTrigger value="px-rem" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                        <Ruler className="w-4 h-4 mr-2" />
                        {t('tabs.pxRem')}
                    </TabsTrigger>
                    <TabsTrigger value="data" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                        <Database className="w-4 h-4 mr-2" />
                        {t('tabs.data')}
                    </TabsTrigger>
                    <TabsTrigger value="length" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                        <Ruler className="w-4 h-4 mr-2" />
                        {t('tabs.length')}
                    </TabsTrigger>
                    <TabsTrigger value="weight" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                        <Scale className="w-4 h-4 mr-2" />
                        {t('tabs.weight')}
                    </TabsTrigger>
                    <TabsTrigger value="temperature" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                        <Thermometer className="w-4 h-4 mr-2" />
                        {t('tabs.temperature')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="px-rem">
                    <GlassCard className="p-8 rounded-2xl space-y-8">
                        {/* Base Size Setting */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/40">
                            <Label htmlFor="base-size" className="text-muted-foreground font-medium">
                                {t('baseFontSize')}
                            </Label>
                            <Input
                                id="base-size"
                                type="number"
                                value={baseSize}
                                onChange={(e) => handleBaseChange(e.target.value)}
                                className="w-24 h-10 text-right bg-transparent border-border/40 focus:ring-primary/50"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex-1 w-full space-y-2">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">{t('pixels')}</Label>
                                <Input
                                    type="number"
                                    value={pxValue || ""}
                                    onChange={(e) => handlePxChange(e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div className="text-muted-foreground">
                                <ArrowRightLeft className="w-6 h-6" />
                            </div>

                            <div className="flex-1 w-full space-y-2">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">{t('rem')}</Label>
                                <Input
                                    type="number"
                                    value={remValue || ""}
                                    onChange={(e) => handleRemChange(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground bg-secondary/50 p-4 rounded-xl border border-border/40">
                            {t('formula')}: <code>{pxValue}px / {baseSize} = {remValue}rem</code>
                        </div>
                    </GlassCard>
                </TabsContent>

                <TabsContent value="data">
                    <GlassCard className="p-8 rounded-2xl space-y-8">
                        <div className="flex flex-col gap-6">
                            <div className="space-y-4">
                                <Label className="text-muted-foreground">{t('valueToConvert')}</Label>
                                <div className="flex gap-4">
                                    <Input
                                        type="number"
                                        value={dataValue}
                                        onChange={(e) => setDataValue(parseFloat(e.target.value))}
                                        className={inputClass + " flex-1"}
                                    />
                                    <Select value={fromUnit} onValueChange={setFromUnit}>
                                        <SelectTrigger className={selectClass}>
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
                                <Label className="text-muted-foreground">{t('convertedResult')}</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center px-4 h-14 text-xl font-mono bg-primary/10 border border-primary/20 text-primary flex-1 rounded-xl overflow-x-auto whitespace-nowrap">
                                        {dataResult}
                                    </div>
                                    <Select value={toUnit} onValueChange={setToUnit}>
                                        <SelectTrigger className={selectClass}>
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

                <TabsContent value="length">
                    <GlassCard className="p-8 rounded-2xl space-y-8">
                        <div className="flex flex-col gap-6">
                            <div className="space-y-4">
                                <Label className="text-muted-foreground">{t('valueToConvert')}</Label>
                                <div className="flex gap-4">
                                    <Input
                                        type="number"
                                        value={lengthValue}
                                        onChange={(e) => setLengthValue(parseFloat(e.target.value))}
                                        className={inputClass + " flex-1"}
                                    />
                                    <Select value={lengthFrom} onValueChange={setLengthFrom}>
                                        <SelectTrigger className={selectClass}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(lengthUnits).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-center text-muted-foreground">
                                <ArrowRightLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-muted-foreground">{t('convertedResult')}</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center px-4 h-14 text-xl font-mono bg-primary/10 border border-primary/20 text-primary flex-1 rounded-xl overflow-x-auto whitespace-nowrap">
                                        {lengthResult}
                                    </div>
                                    <Select value={lengthTo} onValueChange={setLengthTo}>
                                        <SelectTrigger className={selectClass}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(lengthUnits).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </TabsContent>

                <TabsContent value="weight">
                    <GlassCard className="p-8 rounded-2xl space-y-8">
                        <div className="flex flex-col gap-6">
                            <div className="space-y-4">
                                <Label className="text-muted-foreground">{t('valueToConvert')}</Label>
                                <div className="flex gap-4">
                                    <Input
                                        type="number"
                                        value={weightValue}
                                        onChange={(e) => setWeightValue(parseFloat(e.target.value))}
                                        className={inputClass + " flex-1"}
                                    />
                                    <Select value={weightFrom} onValueChange={setWeightFrom}>
                                        <SelectTrigger className={selectClass}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(weightUnits).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-center text-muted-foreground">
                                <ArrowRightLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-muted-foreground">{t('convertedResult')}</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center px-4 h-14 text-xl font-mono bg-primary/10 border border-primary/20 text-primary flex-1 rounded-xl overflow-x-auto whitespace-nowrap">
                                        {weightResult}
                                    </div>
                                    <Select value={weightTo} onValueChange={setWeightTo}>
                                        <SelectTrigger className={selectClass}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(weightUnits).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </TabsContent>

                <TabsContent value="temperature">
                    <GlassCard className="p-8 rounded-2xl space-y-8">
                        <div className="flex flex-col gap-6">
                            <div className="space-y-4">
                                <Label className="text-muted-foreground">{t('valueToConvert')}</Label>
                                <div className="flex gap-4">
                                    <Input
                                        type="number"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(parseFloat(e.target.value))}
                                        className={inputClass + " flex-1"}
                                    />
                                    <Select value={tempFrom} onValueChange={setTempFrom}>
                                        <SelectTrigger className={selectClass}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["C", "F", "K"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-center text-muted-foreground">
                                <ArrowRightLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-muted-foreground">{t('convertedResult')}</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center px-4 h-14 text-xl font-mono bg-primary/10 border border-primary/20 text-primary flex-1 rounded-xl overflow-x-auto whitespace-nowrap">
                                        {tempResult}
                                    </div>
                                    <Select value={tempTo} onValueChange={setTempTo}>
                                        <SelectTrigger className={selectClass}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["C", "F", "K"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
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
