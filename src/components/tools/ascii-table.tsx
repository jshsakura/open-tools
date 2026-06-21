"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassCard } from "@/components/ui/glass-card"
import {
  ASCII_DATA,
  ASCII_MAX,
  type AsciiRow,
  filterAscii,
} from "./ascii-table.utils"

type ViewMode = "all" | "printable" | "control" | "extended"

const VIEW_MODES: ViewMode[] = ["all", "printable", "control", "extended"]

function selectByView(rows: AsciiRow[], view: ViewMode): AsciiRow[] {
  switch (view) {
    case "printable":
      return rows.filter((row) => !row.isControl && !row.isExtended)
    case "control":
      return rows.filter((row) => row.isControl)
    case "extended":
      return rows.filter((row) => row.isExtended)
    case "all":
    default:
      return rows.filter((row) => row.dec <= ASCII_MAX)
  }
}

export function AsciiTable() {
  const t = useTranslations("AsciiTable")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("all")

  const rows = useMemo(() => {
    const scoped = selectByView(ASCII_DATA, view)
    return filterAscii(query, scoped)
  }, [query, view])

  const copy = (text: string, label: string) => {
    if (!text) {
      toast.error(t("nothingToCopy"))
      return
    }
    navigator.clipboard.writeText(text)
    toast.success(t("copiedValue", { value: label }))
  }

  const displayChar = (row: AsciiRow) =>
    row.char && row.char !== " " ? row.char : row.name

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <GlassCard className="space-y-4 p-6">
        <div className="space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9 text-base font-mono"
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t("searchHint")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {VIEW_MODES.map((mode) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={view === mode ? "default" : "outline"}
              onClick={() => setView(mode)}
            >
              {t(`view.${mode}`)}
            </Button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">{t("col.char")}</th>
                <th className="px-4 py-3 font-medium">{t("col.dec")}</th>
                <th className="px-4 py-3 font-medium">{t("col.hex")}</th>
                <th className="px-4 py-3 font-medium">{t("col.oct")}</th>
                <th className="px-4 py-3 font-medium">{t("col.bin")}</th>
                <th className="px-4 py-3 font-medium">{t("col.desc")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    {t("noResults")}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr
                  key={row.dec}
                  className="cursor-pointer border-b border-border/30 transition-colors hover:bg-muted/30"
                  onClick={() =>
                    copy(
                      row.char || row.name,
                      row.char && row.char !== " " ? row.char : row.name,
                    )
                  }
                  title={t("rowCopyHint")}
                >
                  <td className="px-4 py-2.5 font-mono text-base font-bold">
                    {displayChar(row)}
                  </td>
                  <td
                    className="px-4 py-2.5 font-mono text-muted-foreground hover:text-foreground"
                    onClick={(event) => {
                      event.stopPropagation()
                      copy(String(row.dec), String(row.dec))
                    }}
                  >
                    {row.dec}
                  </td>
                  <td
                    className="px-4 py-2.5 font-mono text-muted-foreground hover:text-foreground"
                    onClick={(event) => {
                      event.stopPropagation()
                      copy(`0x${row.hex}`, `0x${row.hex}`)
                    }}
                  >
                    0x{row.hex}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">
                    {row.oct}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">
                    {row.bin}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {row.isControl ? `${row.name} — ${row.description}` : row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <p className="text-center text-xs text-muted-foreground">
        {t("countNote", { count: rows.length })}
      </p>
    </div>
  )
}
