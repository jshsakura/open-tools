"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Plus, Trash2, Clock, Globe, Search } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

const DEFAULT_CITIES = [
    { name: "London", zone: "Europe/London" },
    { name: "New York", zone: "America/New_York" },
    { name: "Tokyo", zone: "Asia/Tokyo" },
    { name: "Seoul", zone: "Asia/Seoul" }
]

export function TimeZoneConverter() {
    const t = useTranslations('TimeZoneConverter');
    const [selectedCities, setSelectedCities] = useState(DEFAULT_CITIES)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [offsetMinutes, setOffsetMinutes] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const timer = setInterval(() => {
            if (offsetMinutes === 0) {
                setCurrentTime(new Date())
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [offsetMinutes])

    const displayedTime = new Date(currentTime.getTime() + offsetMinutes * 60000)

    const formatTime = (date: Date, timeZone: string) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone
        }).format(date)
    }

    const formatDate = (date: Date, timeZone: string) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            timeZone
        }).format(date)
    }

    const addCity = () => {
        // Simple mock search - in a real app, this would use a timezone database
        try {
            // Check if it's a valid timezone
            new Intl.DateTimeFormat('en-US', { timeZone: searchQuery })
            const cityName = searchQuery.split('/').pop()?.replace('_', ' ') || searchQuery
            setSelectedCities([...selectedCities, { name: cityName, zone: searchQuery }])
            setSearchQuery("")
            toast.success("City added")
        } catch (e) {
            toast.error("Invalid timezone format. Try 'Europe/Paris' or 'America/Los_Angeles'")
        }
    }

    const removeCity = (index: number) => {
        setSelectedCities(selectedCities.filter((_, i) => i !== index))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <GlassCard className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                            <Clock className="w-6 h-6 text-primary" />
                            {t('currentTime')}
                        </h3>
                        <p className="text-muted-foreground">
                            {displayedTime.toLocaleTimeString()} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                        </p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={t('searchCity')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                                onKeyDown={(e) => e.key === 'Enter' && addCity()}
                            />
                        </div>
                        <Button onClick={addCity}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('addCity')}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6 mb-8">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>-24h</span>
                        <span>{t('baseCity')}</span>
                        <span>+24h</span>
                    </div>
                    <Slider
                        value={[offsetMinutes]}
                        min={-1440}
                        max={1440}
                        step={15}
                        onValueChange={([val]) => setOffsetMinutes(val)}
                        className="py-4"
                    />
                    <div className="flex justify-center">
                        <Button variant="outline" size="sm" onClick={() => setOffsetMinutes(0)}>
                            Reset to Now
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {selectedCities.map((city, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40 group hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <Globe className="w-5 h-5 text-primary/60" />
                                <div>
                                    <h4 className="font-semibold text-lg">{city.name}</h4>
                                    <p className="text-xs text-muted-foreground font-mono">{city.zone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xl font-mono font-bold">
                                        {formatTime(displayedTime, city.zone)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {formatDate(displayedTime, city.zone)}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => removeCity(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    )
}
