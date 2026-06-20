"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Search, CornerDownLeft, Clock, ArrowUpDown } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "@/i18n/routing"
import { toolsCatalog } from "@/lib/tools-catalog"
import { TOOL_ALIASES } from "@/lib/tool-aliases"
import {
    getToolPopularity,
    queueToolPopularityIncrement,
    readToolPopularityMap,
    TOOL_POPULARITY_STORAGE_KEY,
    TOOL_POPULARITY_UPDATED_EVENT,
    type ToolPopularityMap,
} from "@/lib/tool-popularity"
import { useCommandPalette } from "@/lib/command-palette-store"
import { cn } from "@/lib/utils"

const MAX_RESULTS = 8

export function CommandPalette() {
    const t = useTranslations("CommandPalette")
    const tRoot = useTranslations()
    const router = useRouter()
    const { open, setOpen, toggle } = useCommandPalette()

    const [query, setQuery] = useState("")
    const [activeIndex, setActiveIndex] = useState(0)
    const [popularityMap, setPopularityMap] = useState<ToolPopularityMap>({})
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    // Global ⌘K / Ctrl+K shortcut.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                toggle()
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [toggle])

    // Keep popularity in sync (read on mount, follow cross-tab/in-app updates).
    useEffect(() => {
        const syncPopularity = () => setPopularityMap(readToolPopularityMap())
        const handleStorage = (event: StorageEvent) => {
            if (event.key === TOOL_POPULARITY_STORAGE_KEY) syncPopularity()
        }
        syncPopularity()
        window.addEventListener("storage", handleStorage)
        window.addEventListener(TOOL_POPULARITY_UPDATED_EVENT, syncPopularity)
        return () => {
            window.removeEventListener("storage", handleStorage)
            window.removeEventListener(TOOL_POPULARITY_UPDATED_EVENT, syncPopularity)
        }
    }, [])

    // Reset the query each time the palette opens.
    useEffect(() => {
        if (!open) return
        const resetOnOpen = () => {
            setQuery("")
            setActiveIndex(0)
            setPopularityMap(readToolPopularityMap())
        }
        resetOnOpen()
    }, [open])

    const indexedTools = useMemo(
        () =>
            toolsCatalog
                .filter((tool) => !(tool as { hidden?: boolean }).hidden)
                .map((tool) => {
                    const title = tRoot(tool.titleKey)
                    const description = tRoot(tool.descriptionKey)
                    return {
                        id: tool.id,
                        href: tool.href,
                        icon: tool.icon,
                        color: tool.color,
                        title,
                        description,
                        tags: tool.tags as string[],
                        searchText: [
                            title,
                            description,
                            tool.id.replaceAll("-", " "),
                            ...(tool.tags as string[]),
                            TOOL_ALIASES[tool.id] ?? "",
                        ]
                            .join(" ")
                            .toLowerCase(),
                    }
                }),
        [tRoot],
    )

    const results = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) {
            // No query: show most-used tools as quick access.
            return [...indexedTools]
                .map((tool) => ({ ...tool, score: getToolPopularity(tool.id, popularityMap) }))
                .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
                .slice(0, MAX_RESULTS)
        }
        return indexedTools
            .filter((tool) => tool.searchText.includes(q))
            .sort(
                (a, b) =>
                    getToolPopularity(b.id, popularityMap) - getToolPopularity(a.id, popularityMap) ||
                    a.title.localeCompare(b.title),
            )
            .slice(0, MAX_RESULTS)
    }, [query, indexedTools, popularityMap])

    const isEmptyQuery = query.trim().length === 0

    // Derived, always-in-range active index (results can shrink as you type).
    const active = results.length ? Math.min(activeIndex, results.length - 1) : 0

    const select = (href: string, id: string) => {
        queueToolPopularityIncrement(id)
        setOpen(false)
        router.push(href)
    }

    const onListKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setActiveIndex((active + 1) % Math.max(results.length, 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveIndex((active - 1 + results.length) % Math.max(results.length, 1))
        } else if (e.key === "Enter") {
            e.preventDefault()
            const tool = results[active]
            if (tool) select(tool.href, tool.id)
        }
    }

    // Scroll active row into view.
    useEffect(() => {
        const node = listRef.current?.querySelector(`[data-index="${active}"]`)
        node?.scrollIntoView({ block: "nearest" })
    }, [active])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                showCloseButton={false}
                className="top-[12%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
                onKeyDown={onListKeyDown}
            >
                <DialogTitle className="sr-only">{t("title")}</DialogTitle>

                <div className="flex items-center gap-3 border-b border-border/60 px-4">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        autoFocus
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setActiveIndex(0)
                        }}
                        placeholder={t("placeholder")}
                        className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>

                <div ref={listRef} className="max-h-[min(60vh,380px)] overflow-y-auto p-2">
                    {isEmptyQuery && (
                        <div className="flex items-center gap-1.5 px-2 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            <Clock className="h-3 w-3" /> {t("recent")}
                        </div>
                    )}

                    {results.length === 0 ? (
                        <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                            {t("noResults", { query: query.trim() })}
                        </div>
                    ) : (
                        results.map((tool, i) => {
                            const Icon = tool.icon
                            return (
                                <button
                                    key={tool.id}
                                    data-index={i}
                                    onClick={() => select(tool.href, tool.id)}
                                    onMouseMove={() => setActiveIndex(i)}
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                                        i === active ? "bg-accent" : "hover:bg-accent/50",
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 shrink-0", tool.color)} />
                                    <span className="flex min-w-0 flex-col">
                                        <span className="truncate text-sm font-semibold">{tool.title}</span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {tool.description}
                                        </span>
                                    </span>
                                    {i === active && (
                                        <CornerDownLeft className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    )}
                                </button>
                            )
                        })
                    )}
                </div>

                <div className="flex items-center gap-4 border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <ArrowUpDown className="h-3 w-3" /> {t("hintNav")}
                    </span>
                    <span className="flex items-center gap-1">
                        <CornerDownLeft className="h-3 w-3" /> {t("hintOpen")}
                    </span>
                    <span className="ml-auto hidden sm:inline">esc {t("hintClose")}</span>
                </div>
            </DialogContent>
        </Dialog>
    )
}
