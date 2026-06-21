"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Info,
  AlertTriangle,
  Zap,
  Server,
  Wifi,
  Activity,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import {
  estimateStrength,
  formatCrackTime,
  type StrengthScore,
} from "./password-strength.utils"

const LEVEL_KEYS = ["weak", "weak", "fair", "good", "strong"] as const
const LEVEL_COLORS = [
  "bg-rose-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-emerald-500",
] as const

const CHECK_LABELS: Record<string, string> = {
  length: "12+ Characters",
  hasUpper: "Uppercase Letters",
  hasLower: "Lowercase Letters",
  hasNumber: "Numbers",
  hasSymbol: "Special Symbols",
}

function filledSegments(score: StrengthScore): number {
  // map 0..4 score onto a 4-segment meter
  return Math.max(1, score)
}

export function PasswordStrength() {
  const t = useTranslations("PasswordStrength")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const analysis = useMemo(() => {
    if (!password) return null
    const result = estimateStrength(password)
    const checks = {
      length: password.length >= 12,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
    }
    return { ...result, checks }
  }, [password])

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                  <span className="text-sm font-medium">
                    {t("level")}:{" "}
                    <span className={cn("font-bold uppercase", LEVEL_COLORS[analysis.score].replace("bg-", "text-"))}>
                      {t(LEVEL_KEYS[analysis.score])}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {analysis.entropyBits} {t("entropy")}
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden flex gap-1 p-0.5">
                  {[1, 2, 3, 4].map((segment) => (
                    <div
                      key={segment}
                      className={cn(
                        "h-full flex-1 rounded-sm transition-all duration-500",
                        segment <= filledSegments(analysis.score)
                          ? LEVEL_COLORS[analysis.score]
                          : "bg-muted-foreground/10"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Crack Time Cards — derived from penalized entropy */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t("attackOnline")}</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums">
                    {formatCrackTime(analysis.crackTimes.onlineSeconds)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t("attackOffline")}</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums">
                    {formatCrackTime(analysis.crackTimes.offlineSeconds)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Server className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t("attackSupercomputer")}</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums">
                    {formatCrackTime(analysis.crackTimes.supercomputerSeconds)}
                  </span>
                </div>
              </div>

              {/* Warnings */}
              {analysis.warnings.length > 0 && (
                <div className="space-y-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  {analysis.warnings.map((w) => (
                    <div key={w} className="flex items-center gap-2 text-xs text-amber-600">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{t(`warning.${w}`)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  {t("suggestions")}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(analysis.checks).map(([key, passed]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center",
                          passed ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {passed ? <Check className="w-2.5 h-2.5" /> : <Info className="w-2.5 h-2.5" />}
                      </div>
                      <span className={passed ? "text-foreground" : "text-muted-foreground"}>
                        {CHECK_LABELS[key]}
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
      aria-hidden="true"
      focusable="false"
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
