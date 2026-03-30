"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/tool-card";
import {
  getToolPopularity,
  isPopularTool,
  readToolPopularityMap,
  TOOL_POPULARITY_STORAGE_KEY,
  TOOL_POPULARITY_UPDATED_EVENT,
  type ToolPopularityMap,
} from "@/lib/tool-popularity";
import { toolsCatalog } from "@/lib/tools-catalog";
import {
  Image as ImageIcon,
  Video,
  ShieldCheck,
  Zap,
  LayoutGrid,
  Search,
  Terminal,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeClient() {
  const t = useTranslations();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [popularityMap, setPopularityMap] = useState<ToolPopularityMap>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const syncPopularity = () => {
      setPopularityMap(readToolPopularityMap());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === TOOL_POPULARITY_STORAGE_KEY) {
        syncPopularity();
      }
    };

    syncPopularity();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(TOOL_POPULARITY_UPDATED_EVENT, syncPopularity);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(TOOL_POPULARITY_UPDATED_EVENT, syncPopularity);
    };
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [updateScrollState, selectedTag]);

  const tools = useMemo(
    () =>
      toolsCatalog
        .map((tool) => ({
          ...tool,
          title: t(tool.titleKey),
          description: t(tool.descriptionKey),
          popularity: getToolPopularity(tool.id, popularityMap),
          isPopular: isPopularTool(tool.id, popularityMap),
        }))
        .sort(
          (a, b) =>
            b.popularity - a.popularity || a.title.localeCompare(b.title),
        ),
    [popularityMap, t],
  );

  const allTags = useMemo(() => {
    return [
      "Development",
      "Image",
      "Video",
      "Design",
      "Security",
      "Utilities",
    ];
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const filteredTools = useMemo(() => {
    if (isSearching) {
      const q = searchQuery.trim().toLowerCase();
      return tools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q),
      );
    }
    if (!selectedTag) return tools;
    return tools.filter((tool) => tool.tags.includes(selectedTag));
  }, [tools, selectedTag, searchQuery, isSearching]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tool of tools) {
      for (const tag of tool.tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    return counts;
  }, [tools]);

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
      <div className="flex flex-col items-center gap-12 text-center">
        {/* Hero Section */}
        <section className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-sm animate-fade-in hover:bg-primary/10 transition-colors group/badge">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse group-hover/badge:scale-110 transition-transform"></span>
            {t("Hero.badge")}
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground select-none drop-shadow-sm break-keep">
            {t("Hero.title_1")}{" "}
            <span className="text-primary">{t("Hero.title_2")}</span>{" "}
            {t("Hero.title_3")}
          </h1>

          <p className="hidden sm:block text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {t("Hero.description")}
          </p>
          <p className="block sm:hidden text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            {t("Hero.description_mobile")}
          </p>
        </section>

        {/* Search Bar */}
        <section className="w-full flex flex-col items-center">
          <div
            className={cn(
              "relative w-full max-w-2xl mx-auto group",
              "transition-all duration-300",
            )}
          >
            {/* Glow layer */}
            <div
              className={cn(
                "absolute -inset-[2px] rounded-2xl -z-10",
                "bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20",
                "opacity-0 group-focus-within:opacity-100",
                "blur-md transition-opacity duration-300",
              )}
            />

            <div
              className={cn(
                "flex items-center h-14 px-5 gap-3",
                "rounded-2xl overflow-hidden",
                "bg-background/80 backdrop-blur-md",
                "border-2 border-primary/20",
                "focus-within:border-primary/50",
                "shadow-[0_4px_24px_hsl(var(--primary)/0.08)]",
                "focus-within:shadow-[0_8px_32px_hsl(var(--primary)/0.18)]",
                "transition-all duration-300",
              )}
            >
              {/* Search icon */}
              <Search
                className={cn(
                  "w-5 h-5 shrink-0 text-primary/60",
                  "group-focus-within:text-primary group-focus-within:scale-110",
                  "transition-all duration-200",
                )}
              />

              {/* Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Home.searchPlaceholder")}
                className={cn(
                  "flex-1 min-w-0 bg-transparent outline-none",
                  "text-base text-foreground placeholder:text-muted-foreground/50",
                  "caret-primary",
                )}
              />

              {/* Result count badge */}
              {isSearching && (
                <span
                  className={cn(
                    "shrink-0 inline-flex items-center justify-center",
                    "px-2.5 py-0.5 rounded-full",
                    "text-xs font-semibold",
                    "bg-primary/10 text-primary ring-1 ring-primary/20",
                    "whitespace-nowrap",
                  )}
                >
                  {t("Home.searchResultCount", { count: filteredTools.length })}
                </span>
              )}

              {/* Clear button */}
              {isSearching && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label={t("Home.searchClear")}
                  className={cn(
                    "shrink-0 flex items-center justify-center w-6 h-6 rounded-full",
                    "bg-muted text-muted-foreground",
                    "hover:bg-primary/15 hover:text-primary",
                    "transition-colors duration-150",
                  )}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Filter Controls — hidden while searching */}
        {!isSearching && (
          <section className="w-full">
            <div className="relative">
              {canScrollLeft && (
                <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background to-transparent z-10 transition-opacity duration-200" />
              )}
              {canScrollRight && (
                <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent z-10 transition-opacity duration-200" />
              )}
              <div
                ref={scrollRef}
                onScroll={updateScrollState}
                className="overflow-x-auto pb-1 scrollbar-hide"
              >
                <div className="flex min-w-full w-max items-center justify-center gap-2 px-4">
                  <Button
                    variant={selectedTag === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(null)}
                    className="rounded-full px-4 cursor-pointer shrink-0"
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    {t("Home.allTools")}
                    <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-2 text-[11px] font-semibold rounded-full bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20">
                      {tools.length}
                    </span>
                  </Button>
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                      className={cn(
                        "rounded-full px-4 transition-all duration-300 cursor-pointer shrink-0",
                        selectedTag === tag && "shadow-lg shadow-primary/20",
                      )}
                    >
                      {t(`Category.${tag}`)}
                      <span className="ml-2 inline-flex items-center justify-center h-4 min-w-4 px-1.5 text-[10px] font-semibold rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                        {tagCounts[tag] || 0}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tools Grid */}
        <section
          id="catalog"
          className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 pb-20 space-y-16"
        >
          {isSearching ? (
            /* ── Search Results View ── */
            filteredTools.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    title={tool.title}
                    description={tool.description}
                    icon={tool.icon}
                    href={tool.href}
                    color={tool.color}
                    isPopular={tool.isPopular}
                    tags={tool.tags}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center gap-4 text-muted-foreground">
                <Search className="w-14 h-14 opacity-15" />
                <p className="text-lg font-semibold">
                  {t("Home.searchNoResults", { query: searchQuery })}
                </p>
                <p className="text-sm opacity-60">
                  {t("Home.searchNoResultsHint")}
                </p>
              </div>
            )
          ) : selectedTag ? (
            /* ── Tag Filtered View (Single Grid) ── */
            <div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    title={tool.title}
                    description={tool.description}
                    icon={tool.icon}
                    href={tool.href}
                    color={tool.color}
                    isPopular={tool.isPopular}
                    tags={tool.tags}
                  />
                ))}
              </div>
              {filteredTools.length === 0 && (
                <div className="py-20 text-center text-muted-foreground">
                  No tools found for this category.
                </div>
              )}
            </div>
          ) : (
            /* ── Categorized View (Sections) ── */
            allTags.map((category) => {
              const categoryTools = tools.filter((tool) =>
                tool.tags.includes(category),
              );
              if (categoryTools.length === 0) return null;

              const CategoryIcon =
                (
                  {
                    Development: Terminal,
                    Image: ImageIcon,
                    Video,
                    Design: Wand2,
                    Security: ShieldCheck,
                    Utilities: Zap,
                  } as Record<string, React.ElementType>
                )[category] ?? LayoutGrid;

              return (
                <div key={category} className="space-y-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2 px-1">
                    <CategoryIcon className="w-6 h-6 text-primary" />
                    {t(`Catalog.Categories.${category}`)}
                    <span className="text-sm font-normal text-foreground/80 ml-2 bg-muted/70 border border-border/60 px-2 py-0.5 rounded-full">
                      {categoryTools.length}
                    </span>
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        id={tool.id}
                        title={tool.title}
                        description={tool.description}
                        icon={tool.icon}
                        href={tool.href}
                        color={tool.color}
                        isPopular={tool.isPopular}
                        tags={tool.tags}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
