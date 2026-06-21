"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { AlarmClock, Bell, BellOff, Pause, Play, RotateCcw, Timer } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { breakdownMs, formatCountdown, parseDurationToMs } from "./countdown-timer.utils"

type Mode = "datetime" | "duration"

interface PersistedState {
  mode: Mode
  /** Absolute epoch ms the countdown ends at (when active). */
  endsAt: number | null
  /** Remaining ms captured at pause time, for duration mode. */
  pausedRemaining: number | null
  /** Original duration in ms, so reset can restore it. */
  durationMs: number | null
  /** Raw datetime-local input string, so the field repopulates on refresh. */
  targetInput: string
}

const STORAGE_KEY = "countdown-timer-state"
const TICK_MS = 250

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    if (parsed.mode !== "datetime" && parsed.mode !== "duration") return null
    return {
      mode: parsed.mode,
      endsAt: typeof parsed.endsAt === "number" ? parsed.endsAt : null,
      pausedRemaining: typeof parsed.pausedRemaining === "number" ? parsed.pausedRemaining : null,
      durationMs: typeof parsed.durationMs === "number" ? parsed.durationMs : null,
      targetInput: typeof parsed.targetInput === "string" ? parsed.targetInput : "",
    }
  } catch {
    return null
  }
}

function playBeep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.value = 0.25
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.stop(ctx.currentTime + 0.6)
  } catch {
    /* audio not supported */
  }
}

export function CountdownTimer() {
  const t = useTranslations("CountdownTimer")

  const [mode, setMode] = useState<Mode>("duration")
  const [targetInput, setTargetInput] = useState("")
  const [hoursInput, setHoursInput] = useState("0")
  const [minutesInput, setMinutesInput] = useState("5")
  const [secondsInput, setSecondsInput] = useState("0")

  // The active countdown target (epoch ms) and paused remaining (ms).
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [pausedRemaining, setPausedRemaining] = useState<number | null>(null)
  const [durationMs, setDurationMs] = useState<number | null>(null)

  const [remaining, setRemaining] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  // Guards against firing the "time's up" alert more than once per countdown.
  const firedRef = useRef(false)

  const isRunning = endsAt !== null
  const isFinished = isRunning && remaining <= 0

  // Hydrate from localStorage after mount to avoid SSR mismatch.
  useEffect(() => {
    const stored = loadState()
    if (stored) {
      setMode(stored.mode)
      setEndsAt(stored.endsAt)
      setPausedRemaining(stored.pausedRemaining)
      setDurationMs(stored.durationMs)
      setTargetInput(stored.targetInput)
      if (stored.endsAt) {
        setRemaining(Math.max(0, stored.endsAt - Date.now()))
        firedRef.current = stored.endsAt - Date.now() <= 0
      } else if (stored.pausedRemaining != null) {
        setRemaining(stored.pausedRemaining)
      }
    }
    setHydrated(true)
  }, [])

  // Persist whenever the active target changes.
  useEffect(() => {
    if (!hydrated) return
    const snapshot: PersistedState = { mode, endsAt, pausedRemaining, durationMs, targetInput }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    } catch {
      /* ignore quota errors */
    }
  }, [hydrated, mode, endsAt, pausedRemaining, durationMs, targetInput])

  const handleFinish = useCallback(() => {
    if (firedRef.current) return
    firedRef.current = true
    toast.success(t("timesUpTitle"), { description: t("timesUpBody") })
    if (soundEnabled) playBeep()
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(t("timesUpTitle"), { body: t("timesUpBody") })
      } catch {
        /* notifications unavailable */
      }
    }
  }, [soundEnabled, t])

  // The ticking loop. Recompute remaining from the absolute target each tick so
  // it stays accurate even when the tab is throttled.
  useEffect(() => {
    if (endsAt === null) return

    const tick = () => {
      const left = endsAt - Date.now()
      setRemaining(Math.max(0, left))
      if (left <= 0) {
        handleFinish()
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    tick()
    intervalRef.current = setInterval(tick, TICK_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [endsAt, handleFinish])

  const requestNotifications = () => {
    if (typeof Notification === "undefined") return
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }
  }

  const startDatetime = () => {
    const target = new Date(targetInput).getTime()
    if (Number.isNaN(target)) {
      toast.error(t("invalidDate"))
      return
    }
    if (target <= Date.now()) {
      toast.error(t("pastDate"))
      return
    }
    requestNotifications()
    firedRef.current = false
    setPausedRemaining(null)
    setDurationMs(null)
    setEndsAt(target)
  }

  const startDuration = (fromMs?: number) => {
    const ms =
      fromMs ??
      parseDurationToMs(Number(hoursInput), Number(minutesInput), Number(secondsInput))
    if (ms <= 0) {
      toast.error(t("invalidDuration"))
      return
    }
    requestNotifications()
    firedRef.current = false
    setDurationMs(ms)
    setPausedRemaining(null)
    setEndsAt(Date.now() + ms)
  }

  const pause = () => {
    if (endsAt === null) return
    const left = Math.max(0, endsAt - Date.now())
    setPausedRemaining(left)
    setRemaining(left)
    setEndsAt(null)
  }

  const resume = () => {
    if (pausedRemaining === null) return
    firedRef.current = false
    setEndsAt(Date.now() + pausedRemaining)
    setPausedRemaining(null)
  }

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    firedRef.current = false
    setEndsAt(null)
    setPausedRemaining(null)
    setRemaining(0)
  }

  const switchMode = (next: Mode) => {
    if (next === mode) return
    reset()
    setMode(next)
  }

  const parts = breakdownMs(remaining)
  const display = formatCountdown(parts)
  const isPaused = !isRunning && pausedRemaining !== null && pausedRemaining > 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </header>

      {/* Mode selector */}
      <div className="flex justify-center gap-2">
        {([
          { value: "duration" as const, icon: Timer, label: t("modeDuration") },
          { value: "datetime" as const, icon: AlarmClock, label: t("modeDatetime") },
        ]).map(({ value, icon: Icon, label }) => (
          <Button
            key={value}
            variant={mode === value ? "default" : "outline"}
            size="sm"
            onClick={() => switchMode(value)}
            className="gap-1.5"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>

      {/* Live display */}
      <GlassCard
        className={cn(
          "flex flex-col items-center p-10 transition-colors",
          isFinished ? "border-rose-500/40 bg-rose-500/5" : null,
        )}
      >
        {parts.days > 0 && (
          <div className="mb-1 text-sm font-bold uppercase tracking-widest text-primary">
            {t("daysLabel", { days: parts.days })}
          </div>
        )}
        <div
          className={cn(
            "font-mono text-6xl font-black tabular-nums tracking-tighter sm:text-7xl",
            isFinished ? "text-rose-500" : null,
          )}
        >
          {parts.days > 0
            ? display.replace(/^\d+d\s/, "")
            : display}
        </div>
        <div className="mt-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {isFinished ? t("finishedLabel") : isRunning ? t("runningLabel") : isPaused ? t("pausedLabel") : t("idleLabel")}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={reset} className="h-12 w-12 rounded-full" aria-label={t("reset")}>
            <RotateCcw className="h-5 w-5" />
          </Button>

          {isRunning ? (
            <Button size="lg" onClick={pause} className="h-20 w-20 rounded-full text-xl shadow-lg" aria-label={t("pause")}>
              <Pause className="h-8 w-8" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => (isPaused ? resume() : mode === "datetime" ? startDatetime() : startDuration())}
              className="h-20 w-20 rounded-full text-xl shadow-lg"
              aria-label={t("start")}
            >
              <Play className="ml-1 h-8 w-8" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="h-12 w-12 rounded-full"
            aria-label={soundEnabled ? t("soundOff") : t("soundOn")}
          >
            {soundEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </Button>
        </div>
      </GlassCard>

      {/* Inputs */}
      <GlassCard className="space-y-5 p-6">
        {mode === "datetime" ? (
          <div className="space-y-2">
            <Label>{t("targetLabel")}</Label>
            <Input
              type="datetime-local"
              value={targetInput}
              disabled={isRunning}
              onChange={(e) => setTargetInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("targetHint")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Label>{t("durationLabel")}</Label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: hoursInput, set: setHoursInput, label: t("hours"), max: 99 },
                { value: minutesInput, set: setMinutesInput, label: t("minutes"), max: 59 },
                { value: secondsInput, set: setSecondsInput, label: t("seconds"), max: 59 },
              ] as const).map(({ value, set, label, max }) => (
                <div key={label} className="space-y-1">
                  <Input
                    type="number"
                    min={0}
                    max={max}
                    value={value}
                    disabled={isRunning}
                    onChange={(e) => set(e.target.value)}
                    className="text-center font-mono"
                  />
                  <p className="text-center text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { label: t("preset1m"), ms: 60_000 },
                { label: t("preset5m"), ms: 5 * 60_000 },
                { label: t("preset10m"), ms: 10 * 60_000 },
                { label: t("preset25m"), ms: 25 * 60_000 },
              ]).map(({ label, ms }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  disabled={isRunning}
                  onClick={() => {
                    const parts = breakdownMs(ms)
                    setHoursInput(String(parts.hours))
                    setMinutesInput(String(parts.minutes))
                    setSecondsInput(String(parts.seconds))
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
