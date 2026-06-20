"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"

const ALL_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const

type Preset = "nginx" | "express" | "spring"

const PRESETS: { id: Preset; label: string }[] = [
  { id: "nginx", label: "NGINX" },
  { id: "express", label: "Express" },
  { id: "spring", label: "Spring" },
]

function buildConfig(preset: Preset, origin: string, methods: string[]): string {
  const methodList = methods.join(", ")
  if (preset === "express") {
    return `// Express (cors middleware)
import cors from "cors"

app.use(cors({
  origin: "${origin}",
  methods: [${methods.map((m) => `"${m}"`).join(", ")}],
}))`
  }
  if (preset === "spring") {
    return `// Spring (WebMvcConfigurer)
@Override
public void addCorsMappings(CorsRegistry registry) {
  registry.addMapping("/**")
    .allowedOrigins("${origin}")
    .allowedMethods(${methods.map((m) => `"${m}"`).join(", ")});
}`
  }
  return `# NGINX
add_header 'Access-Control-Allow-Origin' '${origin}' always;
add_header 'Access-Control-Allow-Methods' '${methodList}' always;`
}

export function CorsConfigurator() {
  const t = useTranslations("CorsConfigurator.ui")
  const [preset, setPreset] = useState<Preset>("nginx")
  const [origin, setOrigin] = useState("*")
  const [methods, setMethods] = useState<string[]>(["GET", "POST", "OPTIONS"])

  const toggleMethod = (method: string) => {
    setMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    )
  }

  const configStr = buildConfig(preset, origin, methods)

  const handleCopy = () => {
    navigator.clipboard.writeText(configStr)
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
            {configStr}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
