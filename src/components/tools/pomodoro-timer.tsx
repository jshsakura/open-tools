"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Play, Pause, RotateCcw, Coffee, Brain, Settings2, Volume2, VolumeX, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type TimerPhase = "work" | "shortBreak" | "longBreak"

const PHASE_COLORS: Record<TimerPhase, { bg: string; ring: string; text: string }> = {
    work: { bg: "bg-rose-500/10", ring: "stroke-rose-500", text: "text-rose-500" },
    shortBreak: { bg: "bg-emerald-500/10", ring: "stroke-emerald-500", text: "text-emerald-500" },
    longBreak: { bg: "bg-sky-500/10", ring: "stroke-sky-500", text: "text-sky-500" },
}

export function PomodoroTimer() {
    const t = useTranslations("PomodoroTimer")

    // Settings
    const [workDuration, setWorkDuration] = useState(25)
    const [shortBreakDuration, setShortBreakDuration] = useState(5)
    const [longBreakDuration, setLongBreakDuration] = useState(15)
    const [longBreakInterval, setLongBreakInterval] = useState(4)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [showSettings, setShowSettings] = useState(false)

    // Timer state
    const [phase, setPhase] = useState<TimerPhase>("work")
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isRunning, setIsRunning] = useState(false)
    const [completedPomodoros, setCompletedPomodoros] = useState(0)
    const [totalFocusMinutes, setTotalFocusMinutes] = useState(0)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const audioRef = useRef<AudioContext | null>(null)

    const getDuration = useCallback((p: TimerPhase) => {
        switch (p) {
            case "work": return workDuration * 60
            case "shortBreak": return shortBreakDuration * 60
            case "longBreak": return longBreakDuration * 60
        }
    }, [workDuration, shortBreakDuration, longBreakDuration])

    const playSound = useCallback(() => {
        if (!soundEnabled) return
        try {
            if (!audioRef.current) audioRef.current = new AudioContext()
            const ctx = audioRef.current
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.frequency.value = 800
            gain.gain.value = 0.3
            osc.start()
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
            osc.stop(ctx.currentTime + 0.5)

            // Second beep
            setTimeout(() => {
                const osc2 = ctx.createOscillator()
                const gain2 = ctx.createGain()
                osc2.connect(gain2)
                gain2.connect(ctx.destination)
                osc2.frequency.value = 1000
                gain2.gain.value = 0.3
                osc2.start()
                gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
                osc2.stop(ctx.currentTime + 0.5)
            }, 300)
        } catch { /* audio not supported */ }
    }, [soundEnabled])

    const switchPhase = useCallback((nextPhase: TimerPhase) => {
        setPhase(nextPhase)
        setTimeLeft(getDuration(nextPhase))
        setIsRunning(false)
    }, [getDuration])

    // Timer effect
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        playSound()
                        if (phase === "work") {
                            const newCount = completedPomodoros + 1
                            setCompletedPomodoros(newCount)
                            setTotalFocusMinutes(prev => prev + workDuration)
                            if (newCount % longBreakInterval === 0) {
                                switchPhase("longBreak")
                            } else {
                                switchPhase("shortBreak")
                            }
                        } else {
                            switchPhase("work")
                        }
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [isRunning, phase, completedPomodoros, longBreakInterval, workDuration, playSound, switchPhase])

    // Update document title
    useEffect(() => {
        const mins = Math.floor(timeLeft / 60)
        const secs = timeLeft % 60
        const phaseEmoji = phase === "work" ? "🔴" : "🟢"
        document.title = `${phaseEmoji} ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} - Pomodoro`
        return () => { document.title = "Open Tools" }
    }, [timeLeft, phase])

    const toggleTimer = () => setIsRunning(!isRunning)

    const reset = () => {
        setIsRunning(false)
        setTimeLeft(getDuration(phase))
    }

    const resetAll = () => {
        setIsRunning(false)
        setPhase("work")
        setTimeLeft(workDuration * 60)
        setCompletedPomodoros(0)
        setTotalFocusMinutes(0)
    }

    const totalDuration = getDuration(phase)
    const progress = 1 - timeLeft / totalDuration
    const mins = Math.floor(timeLeft / 60)
    const secs = timeLeft % 60
    const colors = PHASE_COLORS[phase]

    // SVG circle params
    const radius = 140
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference * (1 - progress)

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2 text-center">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            {/* Phase selector */}
            <div className="flex justify-center gap-2">
                {([
                    { value: "work" as const, icon: Brain, label: t("work") },
                    { value: "shortBreak" as const, icon: Coffee, label: t("shortBreak") },
                    { value: "longBreak" as const, icon: Coffee, label: t("longBreak") },
                ]).map(({ value, icon: Icon, label }) => (
                    <Button
                        key={value}
                        variant={phase === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => switchPhase(value)}
                        className={cn("gap-1.5", phase === value && PHASE_COLORS[value].text)}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                    </Button>
                ))}
            </div>

            {/* Timer */}
            <GlassCard className="p-10 flex flex-col items-center">
                <div className="relative w-[320px] h-[320px]">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 320 320">
                        {/* Background circle */}
                        <circle cx="160" cy="160" r={radius} fill="none" strokeWidth="8" className="stroke-border/20" />
                        {/* Progress circle */}
                        <circle
                            cx="160" cy="160" r={radius}
                            fill="none" strokeWidth="8" strokeLinecap="round"
                            className={cn(colors.ring, "transition-all duration-1000")}
                            style={{ strokeDasharray: circumference, strokeDashoffset }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-7xl font-black tracking-tighter font-mono tabular-nums">
                            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                        </div>
                        <div className={cn("text-sm font-bold uppercase tracking-widest mt-2", colors.text)}>
                            {phase === "work" ? t("focusTime") : t("breakTime")}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 mt-8">
                    <Button variant="outline" size="icon" onClick={reset} className="rounded-full w-12 h-12">
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                    <Button
                        size="lg"
                        onClick={toggleTimer}
                        className={cn("rounded-full w-20 h-20 text-xl shadow-lg", colors.bg, colors.text)}
                    >
                        {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} className="rounded-full w-12 h-12">
                        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>
                </div>
            </GlassCard>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <GlassCard className="p-4 text-center">
                    <div className="text-3xl font-black">{completedPomodoros}</div>
                    <div className="text-xs text-muted-foreground font-bold mt-1">{t("completed")}</div>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                    <div className="text-3xl font-black">{totalFocusMinutes}</div>
                    <div className="text-xs text-muted-foreground font-bold mt-1">{t("focusMinutes")}</div>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                    <div className="text-3xl font-black flex items-center justify-center gap-1">
                        {Array.from({ length: longBreakInterval }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-colors",
                                    i < (completedPomodoros % longBreakInterval) ? "bg-rose-500" : "bg-border/40"
                                )}
                            />
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground font-bold mt-1">{t("untilLongBreak")}</div>
                </GlassCard>
            </div>

            {/* Settings */}
            <GlassCard className="p-6 space-y-6">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 text-sm font-bold w-full"
                >
                    <Settings2 className="w-4 h-4 text-primary" />
                    {t("settings")}
                    <span className="ml-auto text-muted-foreground text-xs">{showSettings ? "▲" : "▼"}</span>
                </button>

                {showSettings && (
                    <div className="space-y-6 pt-2">
                        {([
                            { key: "workDuration", value: workDuration, set: setWorkDuration, min: 1, max: 60 },
                            { key: "shortBreakDuration", value: shortBreakDuration, set: setShortBreakDuration, min: 1, max: 30 },
                            { key: "longBreakDuration", value: longBreakDuration, set: setLongBreakDuration, min: 5, max: 60 },
                            { key: "longBreakInterval", value: longBreakInterval, set: setLongBreakInterval, min: 2, max: 8 },
                        ] as const).map(({ key, value, set, min, max }) => (
                            <div key={key} className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <Label className="font-bold">{t(key)}</Label>
                                    <span className="font-mono text-primary">
                                        {value}{key !== "longBreakInterval" ? ` ${t("min")}` : ""}
                                    </span>
                                </div>
                                <Slider
                                    value={[value]}
                                    onValueChange={([v]) => {
                                        set(v)
                                        if (!isRunning) {
                                            if (key === "workDuration" && phase === "work") setTimeLeft(v * 60)
                                            if (key === "shortBreakDuration" && phase === "shortBreak") setTimeLeft(v * 60)
                                            if (key === "longBreakDuration" && phase === "longBreak") setTimeLeft(v * 60)
                                        }
                                    }}
                                    min={min}
                                    max={max}
                                    step={1}
                                />
                            </div>
                        ))}

                        <Button variant="outline" size="sm" onClick={resetAll} className="w-full gap-1">
                            <RotateCcw className="w-3 h-3" /> {t("resetAll")}
                        </Button>
                    </div>
                )}
            </GlassCard>
        </div>
    )
}
