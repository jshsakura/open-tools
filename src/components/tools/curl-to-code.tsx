"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { 
  Terminal, 
  Copy, 
  Trash2, 
  Check, 
  Code2,
  Globe,
  Settings2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Language = "fetch" | "axios" | "python" | "go"

export function CurlToCode() {
  const t = useTranslations("CurlToCode")
  const [curl, setCurl] = useState("")
  const [output, setOutput] = useState("")
  const [language, setLanguage] = useState<Language>("fetch")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseCurl = useCallback((curl: string) => {
    const args = curl.trim().replace(/^curl\s+/, "").split(/\s+(?=(?:[^'"]*['"][^'"]*['"])*[^'"]*$)/)
    const result: any = {
      url: "",
      method: "GET",
      headers: {},
      data: null,
    }

    for (let i = 0; i < args.length; i++) {
      let arg = args[i].replace(/^['"]|['"]$/g, "")
      
      if (arg.startsWith("http")) {
        result.url = arg
      } else if (arg === "-X" || arg === "--request") {
        result.method = args[++i].replace(/^['"]|['"]$/g, "").toUpperCase()
      } else if (arg === "-H" || arg === "--header") {
        const header = args[++i].replace(/^['"]|['"]$/g, "")
        const [key, ...value] = header.split(":")
        result.headers[key.trim()] = value.join(":").trim()
      } else if (arg === "-d" || arg === "--data" || arg === "--data-raw") {
        result.data = args[++i].replace(/^['"]|['"]$/g, "")
        if (result.method === "GET") result.method = "POST"
      }
    }

    if (!result.url && args[0]) {
       result.url = args[0].replace(/^['"]|['"]$/g, "")
    }

    return result
  }, [])

  const generateCode = useCallback((parsed: any, lang: Language): string => {
    const { url, method, headers, data } = parsed
    
    switch (lang) {
      case "fetch":
        return `fetch("${url}", {
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 2)},
  ${data ? `body: ${data.startsWith("{") ? `JSON.stringify(${data})` : `"${data}"`}` : ""}
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));`

      case "axios":
        return `import axios from "axios";

const options = {
  method: "${method}",
  url: "${url}",
  headers: ${JSON.stringify(headers, null, 2)},
  ${data ? `data: ${data.startsWith("{") ? data : `"${data}"`}` : ""}
};

axios.request(options).then(function (response) {
  console.log(response.data);
}).catch(function (error) {
  console.error(error);
});`

      case "python":
        return `import requests

url = "${url}"
headers = ${JSON.stringify(headers, null, 4)}
${data ? `data = ${data.startsWith("{") ? data : `"${data}"`}` : ""}

response = requests.request("${method}", url, headers=headers${data ? ", data=data" : ""})

print(response.json())`

      case "go":
        return `package main

import (
	"fmt"
	"net/http"
	"io/ioutil"
)

func main() {
	url := "${url}"
	req, _ := http.NewRequest("${method}", url, nil)

	${Object.entries(headers).map(([k, v]) => `req.Header.Add("${k}", "${v}")`).join("\n\t")}

	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := ioutil.ReadAll(res.Body)

	fmt.Println(string(body))
}`
      default:
        return ""
    }
  }, [])

  useEffect(() => {
    if (!curl.trim()) {
      setOutput("")
      setError(null)
      return
    }

    try {
      const parsed = parseCurl(curl)
      const generated = generateCode(parsed, language)
      setOutput(generated)
      setError(null)
    } catch (e) {
      setError(t("invalidCurl"))
      setOutput("")
    }
  }, [curl, language, parseCurl, generateCode, t])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
        <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                {t("targetLanguage")}
              </Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger className="w-[200px] bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fetch">JavaScript (Fetch)</SelectItem>
                  <SelectItem value="axios">JavaScript (Axios)</SelectItem>
                  <SelectItem value="python">Python (Requests)</SelectItem>
                  <SelectItem value="go">Go (Native)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                {t("input")}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurl("")}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {t("clear")}
              </Button>
            </div>
            <Textarea
              placeholder={t("placeholder")}
              value={curl}
              onChange={(e) => setCurl(e.target.value)}
              className={cn(
                "min-h-[400px] font-mono text-sm bg-background/30 focus:bg-background/50 transition-all resize-none",
                error && "border-destructive/50 focus-visible:ring-destructive"
              )}
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>

          {/* Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5" />
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
            <pre className="min-h-[400px] p-4 rounded-md bg-muted/30 border border-border/50 font-mono text-sm overflow-auto whitespace-pre-wrap break-all">
              {output || <span className="text-muted-foreground/50 italic">Generated code will appear here...</span>}
            </pre>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
