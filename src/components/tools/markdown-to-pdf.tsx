"use client"

import { useState, useRef, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Download, FileText, Eye, Code, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const DEFAULT_MD = `# Hello World

This is a **Markdown to PDF** converter.

## Features

- Write Markdown on the left
- Preview rendered HTML on the right
- Export to PDF with one click

### Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Table

| Feature | Status |
|---------|--------|
| Bold | ✅ |
| Italic | ✅ |
| Lists | ✅ |
| Code | ✅ |
| Tables | ✅ |

> This is a blockquote with some important information.

---

Made with ❤️ using Open Tools
`

function parseMarkdown(md: string): string {
    let html = md
        // Code blocks
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold & italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Strikethrough
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        // Blockquote
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        // Horizontal rule
        .replace(/^---$/gm, '<hr />')
        // Unordered list
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

    // Tables
    html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm, (_, header, _sep, body) => {
        const ths = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join('')
        const rows = body.trim().split('\n').map((row: string) => {
            const tds = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join('')
            return `<tr>${tds}</tr>`
        }).join('')
        return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`
    })

    // Paragraphs
    html = html.replace(/^(?!<[a-z])((?!<).+)$/gm, '<p>$1</p>')

    return html
}

const PDF_STYLES = `
    body { font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.7; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { font-size: 2em; font-weight: 800; margin: 1.5em 0 0.5em; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; font-weight: 700; margin: 1.3em 0 0.4em; }
    h3 { font-size: 1.2em; font-weight: 600; margin: 1em 0 0.3em; }
    p { margin: 0.6em 0; }
    strong { font-weight: 700; }
    em { font-style: italic; }
    a { color: #3b82f6; text-decoration: underline; }
    ul { padding-left: 1.5em; margin: 0.5em 0; }
    li { margin: 0.25em 0; }
    blockquote { border-left: 4px solid #3b82f6; margin: 1em 0; padding: 0.5em 1em; background: #f0f7ff; color: #374151; border-radius: 0 8px 8px 0; }
    pre.code-block { background: #1e293b; color: #e2e8f0; padding: 1em; border-radius: 8px; overflow-x: auto; font-size: 0.9em; }
    code.inline-code { background: #f1f5f9; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; color: #e11d48; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 2em 0; }
    img { max-width: 100%; border-radius: 8px; }
    del { text-decoration: line-through; color: #9ca3af; }
`

export function MarkdownToPdf() {
    const t = useTranslations("MarkdownToPdf")
    const [markdown, setMarkdown] = useState(DEFAULT_MD)
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
    const [copiedHtml, setCopiedHtml] = useState(false)

    const html = parseMarkdown(markdown)

    const exportPdf = () => {
        const printWindow = window.open("", "_blank")
        if (!printWindow) { toast.error(t("popupBlocked")); return }
        printWindow.document.write(`<!DOCTYPE html><html><head><style>${PDF_STYLES}</style></head><body>${html}</body></html>`)
        printWindow.document.close()
        setTimeout(() => { printWindow.print() }, 300)
        toast.success(t("exported"))
    }

    const copyHtml = () => {
        navigator.clipboard.writeText(html)
        setCopiedHtml(true)
        toast.success(t("copiedHtml"))
        setTimeout(() => setCopiedHtml(false), 2000)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            {/* Actions */}
            <GlassCard className="p-4 flex flex-wrap items-center gap-3">
                <Button onClick={exportPdf} className="gap-2 font-bold">
                    <Download className="w-4 h-4" />
                    {t("exportPdf")}
                </Button>
                <Button variant="outline" onClick={copyHtml} className="gap-2">
                    {copiedHtml ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {t("copyHtml")}
                </Button>
                <div className="ml-auto flex text-xs font-mono text-muted-foreground gap-4">
                    <span>{markdown.length} {t("chars")}</span>
                    <span>{markdown.split(/\n/).length} {t("lines")}</span>
                </div>
            </GlassCard>

            {/* Mobile tabs */}
            <div className="flex gap-2 lg:hidden">
                <Button size="sm" variant={activeTab === "edit" ? "default" : "outline"} onClick={() => setActiveTab("edit")} className="gap-1">
                    <Code className="w-3 h-3" /> {t("edit")}
                </Button>
                <Button size="sm" variant={activeTab === "preview" ? "default" : "outline"} onClick={() => setActiveTab("preview")} className="gap-1">
                    <Eye className="w-3 h-3" /> {t("preview")}
                </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Editor */}
                <GlassCard className={cn("p-0 overflow-hidden", activeTab !== "edit" && "hidden lg:block")}>
                    <div className="border-b border-border/10 bg-muted/30 p-3 flex items-center gap-2">
                        <Code className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold">Markdown</span>
                    </div>
                    <Textarea
                        value={markdown}
                        onChange={e => setMarkdown(e.target.value)}
                        className="min-h-[600px] border-0 rounded-none font-mono text-sm resize-none focus-visible:ring-0 p-4"
                        placeholder={t("placeholder")}
                    />
                </GlassCard>

                {/* Preview */}
                <GlassCard className={cn("p-0 overflow-hidden", activeTab !== "preview" && "hidden lg:block")}>
                    <div className="border-b border-border/10 bg-muted/30 p-3 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold">{t("preview")}</span>
                    </div>
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none p-6 min-h-[600px] overflow-auto"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </GlassCard>
            </div>
        </div>
    )
}
