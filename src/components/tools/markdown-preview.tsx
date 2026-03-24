"use client"

import { useState, useCallback } from "react"
import { Copy, CheckCircle2, Eye, Code2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ─── Pure-TS Markdown Parser ──────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function parseInline(text: string): string {
  // Stash inline code spans first so inner content isn't touched
  const stash: string[] = []
  let s = text.replace(/`([^`]+)`/g, (_, code) => {
    const i = stash.length
    stash.push(`<code class="md-code-inline">${escapeHtml(code)}</code>`)
    return `\x02${i}\x02`
  })

  // Bold + italic (***text***)
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
  // Bold (**text**)
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  // Italic (*text*)
  s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
  // Strikethrough (~~text~~)
  s = s.replace(/~~(.+?)~~/g, "<del>$1</del>")
  // Links [text](url)
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>'
  )

  // Restore stashed inline codes
  stash.forEach((code, i) => {
    s = s.replace(`\x02${i}\x02`, code)
  })

  return s
}

function parseMarkdown(md: string): string {
  if (!md.trim()) return ""

  // ── 1. Stash fenced code blocks ──────────────────────────────────────────
  const blockStash: string[] = []
  let src = md.replace(/```([\w]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const i = blockStash.length
    const langAttr = lang ? ` data-lang="${escapeHtml(lang)}"` : ""
    blockStash.push(
      `<pre class="md-pre"${langAttr}><code class="md-code-block">${escapeHtml(code.replace(/\n$/, ""))}</code></pre>`
    )
    return `\x01BLOCK${i}\x01`
  })

  const lines = src.split("\n")
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // ── Block stash placeholder ───────────────────────────────────────────
    if (/^\x01BLOCK\d+\x01$/.test(line.trim())) {
      const idx = Number(line.trim().replace(/\x01BLOCK(\d+)\x01/, "$1"))
      out.push(blockStash[idx])
      i++
      continue
    }

    // ── Headings ──────────────────────────────────────────────────────────
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      out.push(`<h${level} class="md-h${level}">${parseInline(headingMatch[2])}</h${level}>`)
      i++
      continue
    }

    // ── Horizontal rule ───────────────────────────────────────────────────
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line)) {
      out.push('<hr class="md-hr" />')
      i++
      continue
    }

    // ── Blockquote ────────────────────────────────────────────────────────
    if (line.startsWith("> ") || line === ">") {
      const bqLines: string[] = []
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
        bqLines.push(lines[i].replace(/^>\s?/, ""))
        i++
      }
      out.push(`<blockquote class="md-blockquote">${parseInline(bqLines.join("<br/>"))}</blockquote>`)
      continue
    }

    // ── Unordered list ────────────────────────────────────────────────────
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(`<li class="md-li">${parseInline(lines[i].replace(/^[-*+]\s+/, ""))}</li>`)
        i++
      }
      out.push(`<ul class="md-ul">${items.join("")}</ul>`)
      continue
    }

    // ── Ordered list ──────────────────────────────────────────────────────
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li class="md-li">${parseInline(lines[i].replace(/^\d+\.\s+/, ""))}</li>`)
        i++
      }
      out.push(`<ol class="md-ol">${items.join("")}</ol>`)
      continue
    }

    // ── Empty line ────────────────────────────────────────────────────────
    if (line.trim() === "") {
      i++
      continue
    }

    // ── Paragraph ─────────────────────────────────────────────────────────
    const pLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i]) &&
      !lines[i].startsWith("> ") &&
      lines[i] !== ">" &&
      !/^\x01BLOCK\d+\x01$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i])
      i++
    }
    if (pLines.length > 0) {
      out.push(`<p class="md-p">${parseInline(pLines.join("<br/>"))}</p>`)
    }
  }

  return out.join("\n")
}

// ─── Default sample ───────────────────────────────────────────────────────────

const DEFAULT_MARKDOWN = `# Markdown Preview

Welcome to the **Markdown Preview** tool! Type in the left panel to see the rendered output on the right.

## Features

- **Bold text** and *italic text*
- ~~Strikethrough~~ support
- \`inline code\`
- Links: [Open Tools](https://github.com)

## Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Blockquote

> "The best tool is the one you actually use."

## Lists

### Unordered
- Item one
- Item two
- Item three

### Ordered
1. First step
2. Second step
3. Third step

---

*Happy writing!*
`

// ─── Component ────────────────────────────────────────────────────────────────

export function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)
  const [copiedMd, setCopiedMd] = useState(false)
  const [copiedHtml, setCopiedHtml] = useState(false)

  const renderedHtml = parseMarkdown(markdown)

  const copy = useCallback((text: string, setter: (v: boolean) => void) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setter(true)
      setTimeout(() => setter(false), 2000)
    })
  }, [])

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>
            {markdown.length} chars · {markdown.split("\n").length} lines
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMarkdown("")}
            disabled={!markdown}
            className="gap-1.5 h-8 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy(markdown, setCopiedMd)}
            disabled={!markdown}
            className="gap-1.5 h-8 text-xs"
          >
            {copiedMd ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedMd ? "Copied!" : "Copy Markdown"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy(renderedHtml, setCopiedHtml)}
            disabled={!renderedHtml}
            className="gap-1.5 h-8 text-xs"
          >
            {copiedHtml ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Code2 className="w-3.5 h-3.5" />
            )}
            {copiedHtml ? "Copied!" : "Copy HTML"}
          </Button>
        </div>
      </div>

      {/* Split panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <Card className="flex flex-col min-h-[600px] border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-muted-foreground" />
              Markdown Input
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              spellCheck={false}
              placeholder="Start typing Markdown here…"
              className={cn(
                "flex-1 w-full resize-none bg-transparent p-4",
                "font-mono text-sm leading-relaxed",
                "focus:outline-none placeholder:text-muted-foreground/50",
                "min-h-[560px]"
              )}
            />
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="flex flex-col min-h-[600px] border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {renderedHtml ? (
              <div
                className="md-prose p-5 h-full"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground/40 text-sm p-8 text-center">
                Your rendered preview will appear here
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prose styles injected via a style tag */}
      <style>{`
        .md-prose { font-size: 0.9375rem; line-height: 1.75; color: inherit; }

        .md-h1 { font-size: 2rem;    font-weight: 800; letter-spacing: -0.03em; margin: 1.25rem 0 0.75rem; line-height: 1.2; }
        .md-h2 { font-size: 1.5rem;  font-weight: 700; letter-spacing: -0.02em; margin: 1.1rem  0 0.6rem;  line-height: 1.3; border-bottom: 1px solid hsl(var(--border)/0.6); padding-bottom: 0.25rem; }
        .md-h3 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .md-h4 { font-size: 1.1rem;  font-weight: 600; margin: 0.9rem 0 0.4rem; }
        .md-h5 { font-size: 1rem;    font-weight: 600; margin: 0.8rem 0 0.3rem; }
        .md-h6 { font-size: 0.9rem;  font-weight: 600; margin: 0.7rem 0 0.3rem; color: hsl(var(--muted-foreground)); }

        .md-p  { margin: 0.65rem 0; }

        .md-ul, .md-ol { margin: 0.6rem 0 0.6rem 1.4rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .md-ul { list-style-type: disc; }
        .md-ol { list-style-type: decimal; }
        .md-li { padding-left: 0.25rem; }

        .md-blockquote {
          margin: 0.75rem 0;
          padding: 0.6rem 1rem;
          border-left: 3px solid hsl(var(--primary)/0.7);
          background: hsl(var(--muted)/0.35);
          border-radius: 0 0.375rem 0.375rem 0;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }

        .md-pre {
          margin: 0.85rem 0;
          padding: 1rem 1.25rem;
          background: hsl(var(--secondary)/0.6);
          border: 1px solid hsl(var(--border)/0.5);
          border-radius: 0.625rem;
          overflow-x: auto;
        }
        .md-pre[data-lang]::before {
          content: attr(data-lang);
          display: block;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: hsl(var(--muted-foreground)/0.7);
          margin-bottom: 0.5rem;
          font-family: ui-monospace, monospace;
        }
        .md-code-block {
          font-family: ui-monospace, "Cascadia Code", "Fira Code", monospace;
          font-size: 0.8125rem;
          line-height: 1.65;
          white-space: pre;
        }
        .md-code-inline {
          font-family: ui-monospace, "Cascadia Code", "Fira Code", monospace;
          font-size: 0.8125rem;
          padding: 0.1em 0.45em;
          border-radius: 0.3rem;
          background: hsl(var(--secondary)/0.7);
          border: 1px solid hsl(var(--border)/0.4);
        }

        .md-hr {
          border: none;
          border-top: 1px solid hsl(var(--border)/0.7);
          margin: 1.2rem 0;
        }

        .md-link {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: hsl(var(--primary)/0.4);
        }
        .md-link:hover { text-decoration-color: hsl(var(--primary)); }

        .md-prose strong { font-weight: 700; }
        .md-prose em     { font-style: italic; }
        .md-prose del    { opacity: 0.6; text-decoration: line-through; }
      `}</style>
    </div>
  )
}
