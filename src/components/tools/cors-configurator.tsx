"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Clipboard, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { generateCors, type CorsTarget } from "./cors-configurator.utils"

const ALL_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const

const PRESETS: { id: CorsTarget; label: string }[] = [
  { id: "nginx", label: "NGINX" },
  { id: "express", label: "Express" },
  { id: "spring", label: "Spring" },
  { id: "apache", label: "Apache" },
  { id: "vercel", label: "Vercel" },
]

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

export function CorsConfigurator() {
  const t = useTranslations("CorsConfigurator.ui")
  const [preset, setPreset] = useState<CorsTarget>("nginx")
  const [origin, setOrigin] = useState("*")
  const [methods, setMethods] = useState<string[]>(["GET", "POST", "OPTIONS"])
  const [allowedHeaders, setAllowedHeaders] = useState("Content-Type, Authorization")
  const [exposedHeaders, setExposedHeaders] = useState("")
  const [allowCredentials, setAllowCredentials] = useState(false)
  const [maxAge, setMaxAge] = useState(86400)

  const toggleMethod = (method: string) => {
    setMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    )
  }

  const { config, credentialsWildcardWarning } = generateCors(
    {
      origin,
      methods,
      allowedHeaders: parseList(allowedHeaders),
      exposedHeaders: parseList(exposedHeaders),
      allowCredentials,
      maxAge,
    },
    preset
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(config)
    toast.success(t("copied"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("framework")}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.id}
                  variant={preset === p.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreset(p.id)}
                  className="text-xs"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("allowedOrigins")}
            </label>
            <Input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="https://example.com"
              className="bg-background/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("allowedMethods")}
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_METHODS.map((method) => {
                const active = methods.includes(method)
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => toggleMethod(method)}
                    className={
                      "rounded-md border px-3 py-1 text-xs font-medium transition-colors " +
                      (active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background/50 text-muted-foreground hover:bg-muted")
                    }
                  >
                    {method}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("allowedHeaders")}
            </label>
            <Input
              value={allowedHeaders}
              onChange={(e) => setAllowedHeaders(e.target.value)}
              placeholder={t("headersPlaceholder")}
              className="bg-background/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("exposedHeaders")}
            </label>
            <Input
              value={exposedHeaders}
              onChange={(e) => setExposedHeaders(e.target.value)}
              placeholder={t("headersPlaceholder")}
              className="bg-background/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("maxAge")}
            </label>
            <Input
              type="number"
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value))}
              className="bg-background/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="allowCredentials"
              checked={allowCredentials}
              onCheckedChange={setAllowCredentials}
            />
            <Label htmlFor="allowCredentials" className="text-xs font-semibold text-muted-foreground">
              {t("allowCredentials")}
            </Label>
          </div>

          {credentialsWildcardWarning && (
            <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-600 dark:text-amber-400">
              <TriangleAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{t("credentialsWarning")}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">{t("framework")}</span>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              <Clipboard className="w-3.5 h-3.5" />
              {t("exportConfig")}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all">
            {config}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
