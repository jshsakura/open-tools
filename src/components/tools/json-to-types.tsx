"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { 
  FileJson, 
  Copy, 
  Trash2, 
  Check, 
  Settings2,
  Code2,
  Braces,
  ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type TargetType = "interface" | "type" | "zod"

export function JsonToTypes() {
  const t = useTranslations("JsonToTypes")
  const [json, setJson] = useState("")
  const [output, setOutput] = useState("")
  const [rootName, setRootName] = useState("Root")
  const [targetType, setTargetType] = useState<TargetType>("interface")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!json.trim()) {
      setOutput("")
      setError(null)
      return
    }

    try {
      const parsed = JSON.parse(json)
      const generated = generateTypes(parsed, rootName, targetType)
      setOutput(generated)
      setError(null)
    } catch (e) {
      setError(t("invalidJson"))
      setOutput("")
    }
  }, [json, rootName, targetType, t])

  const generateTypes = (obj: any, name: string, type: TargetType): string => {
    if (type === "zod") {
      return generateZodSchema(obj, name)
    }
    return generateTs(obj, name, type === "interface")
  }

  const toPascalCase = (str: string) => {
    return str.replace(/(\w)(\w*)/g, (_, g1, g2) => g1.toUpperCase() + g2.toLowerCase()).replace(/[^\w]/g, "")
  }

  const generateTs = (obj: any, name: string, isInterface: boolean): string => {
    let result = ""
    const subTypes: string[] = []

    const processObject = (o: any, n: string): string => {
      let str = isInterface ? `interface ${n} {\n` : `type ${n} = {\n`
      
      for (const key in o) {
        const value = o[key]
        const typeOf = typeof value
        let tsType = ""

        if (value === null) {
          tsType = "any"
        } else if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === "object") {
            const subName = toPascalCase(key) + "Item"
            subTypes.push(processObject(value[0], subName))
            tsType = `${subName}[]`
          } else {
            tsType = `${value.length > 0 ? typeof value[0] : "any"}[]`
          }
        } else if (typeOf === "object") {
          const subName = toPascalCase(key)
          subTypes.push(processObject(value, subName))
          tsType = subName
        } else {
          tsType = typeOf
        }

        str += `  ${key}: ${tsType};\n`
      }
      
      str += "}"
      return str
    }

    result = processObject(obj, name)
    return [...subTypes, result].join("\n\n")
  }

  const generateZodSchema = (obj: any, name: string): string => {
    let result = `import { z } from "zod";\n\n`
    const subSchemas: string[] = []

    const processObject = (o: any, n: string): string => {
      let str = `const ${n}Schema = z.object({\n`
      
      for (const key in o) {
        const value = o[key]
        let zodType = ""

        if (value === null) {
          zodType = "z.any()"
        } else if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === "object") {
            const subName = toPascalCase(key) + "Item"
            subSchemas.push(processObject(value[0], subName))
            zodType = `z.array(${subName}Schema)`
          } else {
            zodType = `z.array(z.${value.length > 0 ? typeof value[0] : "any"}())`
          }
        } else if (typeof value === "object") {
          const subName = toPascalCase(key)
          subSchemas.push(processObject(value, subName))
          zodType = `${subName}Schema`
        } else {
          zodType = `z.${typeof value}()`
        }

        str += `  ${key}: ${zodType},\n`
      }
      
      str += "});"
      return str
    }

    const mainSchema = processObject(obj, name)
    return result + [...subSchemas, mainSchema].join("\n\n")
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              {t("rootName")}
            </Label>
            <Input
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              placeholder="Root"
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              {t("targetType")}
            </Label>
            <Select value={targetType} onValueChange={(v) => setTargetType(v as TargetType)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interface">{t("typescript")} ({t("interface")})</SelectItem>
                <SelectItem value="type">{t("typescript")} ({t("type")})</SelectItem>
                <SelectItem value="zod">{t("zod")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Braces className="w-3.5 h-3.5" />
                {t("input")}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setJson("")}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {t("clear")}
              </Button>
            </div>
            <Textarea
              placeholder={t("placeholder")}
              value={json}
              onChange={(e) => setJson(e.target.value)}
              className={cn(
                "min-h-[450px] font-mono text-sm bg-background/30 focus:bg-background/50 transition-all resize-none",
                error && "border-destructive/50 focus-visible:ring-destructive"
              )}
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>

          {/* Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t("output")}
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!output}
                className="h-7 px-2 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? "Copied" : t("copy")}
              </Button>
            </div>
            <div className="relative group">
              <pre className="min-h-[450px] p-4 rounded-md bg-muted/30 border border-border/50 font-mono text-sm overflow-auto whitespace-pre-wrap break-all">
                {output || <span className="text-muted-foreground/50 italic">{t("outputPlaceholder") || "Generated code will appear here..."}</span>}
              </pre>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
