"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { 
  FileCode, 
  Copy, 
  Trash2, 
  Check, 
  Code2,
  Wand2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

export function HtmlToJsx() {
  const t = useTranslations("HtmlToJsx")
  const [html, setHtml] = useState("")
  const [jsx, setJsx] = useState("")
  const [copied, setCopied] = useState(false)

  const convertHtmlToJsx = useCallback((input: string): string => {
    let result = input

    // 1. Attributes mapping
    const mappings: Record<string, string> = {
      "class=": "className=",
      "for=": "htmlFor=",
      "tabindex=": "tabIndex=",
      "onclick=": "onClick=",
      "onchange=": "onChange=",
      "onfocus=": "onFocus=",
      "onblur=": "onBlur=",
      "oninput=": "onInput=",
      "onsubmit=": "onSubmit=",
      "autocomplete=": "autoComplete=",
      "autofocus=": "autoFocus=",
      "readonly=": "readOnly=",
      "maxlength=": "maxLength=",
      "minlength=": "minLength=",
      "srcset=": "srcSet=",
      "usemap=": "useMap=",
      "frameborder=": "frameBorder=",
      "allowfullscreen": "allowFullScreen",
    }

    Object.entries(mappings).forEach(([htmlAttr, jsxAttr]) => {
      const regex = new RegExp(`\\s${htmlAttr}`, "gi")
      result = result.replace(regex, ` ${jsxAttr}`)
    })

    // 2. Self-closing tags
    const selfClosingTags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]
    selfClosingTags.forEach(tag => {
      const regex = new RegExp(`<${tag}([^>]*[^/])>`, "gi")
      result = result.replace(regex, `<${tag}$1 />`)
    })

    // 3. Style attribute to object
    result = result.replace(/style="([^"]*)"/gi, (match, styleStr) => {
      const styleObj = styleStr.split(";").reduce((acc: any, curr: string) => {
        const [prop, val] = curr.split(":")
        if (prop && val) {
          const camelProp = prop.trim().replace(/-([a-z])/g, g => g[1].toUpperCase())
          acc[camelProp] = val.trim()
        }
        return acc
      }, {})
      return `style={${JSON.stringify(styleObj)}}`
    })

    // 4. Remove comments
    result = result.replace(/<!--[\s\S]*?-->/g, "")

    return result
  }, [])

  useEffect(() => {
    if (!html.trim()) {
      setJsx("")
      return
    }
    setJsx(convertHtmlToJsx(html))
  }, [html, convertHtmlToJsx])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsx)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
        <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5" />
                {t("input")}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHtml("")}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {t("clear")}
              </Button>
            </div>
            <Textarea
              placeholder={t("placeholder")}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="min-h-[450px] font-mono text-sm bg-background/30 focus:bg-background/50 transition-all resize-none"
              autoFocus
            />
          </div>

          {/* Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5" />
                {t("output")}
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!jsx}
                className="h-7 px-2 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? "Copied" : t("copy")}
              </Button>
            </div>
            <pre className="min-h-[450px] p-4 rounded-md bg-muted/30 border border-border/50 font-mono text-sm overflow-auto whitespace-pre-wrap break-all">
              {jsx || <span className="text-muted-foreground/50 italic">JSX result will appear here...</span>}
            </pre>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
