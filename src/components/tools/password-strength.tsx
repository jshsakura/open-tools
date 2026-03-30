"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Info,
  Clock,
  Zap,
  Server,
  Activity
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

export function PasswordStrength() {
  const t = useTranslations("PasswordStrength")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const analysis = useMemo(() => {
    if (!password) return null

    let score = 0
    const checks = {
      length: password.length >= 12,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
    }

    if (password.length > 0) score += Math.min(password.length, 8)
    if (checks.hasUpper) score += 2
    if (checks.hasLower) score += 2
    if (checks.hasNumber) score += 2
    if (checks.hasSymbol) score += 3
    if (password.length >= 12) score += 3

    // Simple entropy calculation (bits)
    let charsetSize = 0
    if (checks.hasLower) charsetSize += 26
    if (checks.hasUpper) charsetSize += 26
    if (checks.hasNumber) charsetSize += 10
    if (checks.hasSymbol) charsetSize += 33
    const entropy = Math.floor(password.length * Math.log2(charsetSize || 1))

    // Time to crack (simplified)
    // 10^9 guesses per second (standard PC)
    const guessesPerSec = 1e9
    const totalGuesses = Math.pow(charsetSize || 1, password.length)
    const secondsToCrack = totalGuesses / guessesPerSec

    const formatTime = (s: number) => {
      if (s < 1) return "< 1 sec"
      if (s < 60) return `${Math.round(s)} secs`
      if (s < 3600) return `${Math.round(s/60)} mins`
      if (s < 86400) return `${Math.round(s/3600)} hours`
      if (s < 31536000) return `${Math.round(s/86400)} days`
      if (s < 3153600000) return `${Math.round(s/31536000)} years`
      return "Centuries"
    }

    let level = "weak"
    let color = "bg-rose-500"
    if (score > 15) { level = "strong"; color = "bg-emerald-500" }
    else if (score > 10) { level = "good"; color = "bg-blue-500" }
    else if (score > 6) { level = "fair"; color = "bg-amber-500" }

    return {
      score,
      level,
      color,
      entropy,
      time: formatTime(secondsToCrack),
      checks
    }
  }, [password])

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pass-input" className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              {t("input")}
            </Label>
            <div className="relative">
              <Input
                id="pass-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-background/50 h-12 text-lg font-mono"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {analysis && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Strength Meter */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium">{t("level")}: <span className={cn("font-bold uppercase", analysis.color.replace("bg-", "text-"))}>{t(analysis.level)}</span></span>
                  <span className="text-xs text-muted-foreground">{analysis.entropy} bits</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden flex gap-1 p-0.5">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "h-full flex-1 rounded-sm transition-all duration-500",
                        i <= (analysis.level === "strong" ? 3 : analysis.level === "good" ? 2 : analysis.level === "fair" ? 1 : 0) ? analysis.color : "bg-muted-foreground/10"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Crack Time Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Desktop PC</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums">{analysis.time}</span>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Server className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Supercomputer</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums">{analysis.level === "strong" ? "Months/Years" : "Seconds/Mins"}</span>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Offline Attack</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums text-rose-500 font-mono">Instant</span>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  {t("suggestions")}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(analysis.checks).map(([key, passed]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", passed ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>
                        {passed ? <Check className="w-2.5 h-2.5" /> : <Info className="w-2.5 h-2.5" />}
                      </div>
                      <span className={passed ? "text-foreground" : "text-muted-foreground"}>
                        {key === "length" ? "12+ Characters" : 
                         key === "hasUpper" ? "Uppercase Letters" :
                         key === "hasLower" ? "Lowercase Letters" :
                         key === "hasNumber" ? "Numbers" : "Special Symbols"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
