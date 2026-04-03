"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  CheckCircle2,
  Copy,
  ExternalLink,
  Gauge,
  Globe,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { extractUrlishInput } from "@/lib/url-input";

type Recommendation = {
  severity: "critical" | "warning" | "good";
  title: string;
  description: string;
};

type AnalysisResult = {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  redirected: boolean;
  responseTime: number;
  contentType: string;
  overall: {
    score: number;
    criticalIssues: Recommendation[];
    warnings: Recommendation[];
    strengths: Recommendation[];
  };
  meta: {
    title: string | null;
    titleLength: number;
    description: string | null;
    descriptionLength: number;
    canonical: string | null;
    robots: string | null;
    xRobotsTag: string | null;
    viewport: string | null;
    lang: string | null;
    charset: string | null;
  };
  indexability: {
    indexable: boolean;
  };
  headings: {
    h1Items: string[];
    h1Count: number;
    h2Count: number;
    h3Count: number;
  };
  images: {
    total: number;
    missingAlt: number;
    withAlt: number;
  };
  links: {
    total: number;
    internal: number;
    external: number;
    nofollow: number;
  };
  social: {
    openGraph: {
      title: string | null;
      description: string | null;
      image: string | null;
      url: string | null;
      presentCount: number;
    };
    twitter: {
      card: string | null;
      title: string | null;
      description: string | null;
      image: string | null;
      presentCount: number;
    };
  };
  structuredData: {
    count: number;
    types: string[];
  };
};

function getGrade(score: number) {
  if (score >= 90) return { label: "A", tone: "text-emerald-500", bg: "bg-emerald-500/10" };
  if (score >= 75) return { label: "B", tone: "text-sky-500", bg: "bg-sky-500/10" };
  if (score >= 60) return { label: "C", tone: "text-amber-500", bg: "bg-amber-500/10" };
  if (score >= 40) return { label: "D", tone: "text-orange-500", bg: "bg-orange-500/10" };
  return { label: "F", tone: "text-red-500", bg: "bg-red-500/10" };
}

function getSeverityStyles(severity: Recommendation["severity"]) {
  if (severity === "critical") {
    return {
      badge: "bg-red-500/10 text-red-500 border-red-500/20",
      icon: <TriangleAlert className="h-4 w-4 text-red-500" />,
    };
  }

  if (severity === "warning") {
    return {
      badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <Activity className="h-4 w-4 text-amber-500" />,
    };
  }

  return {
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
  };
}

export function SeoAnalyzerTool() {
  const t = useTranslations("SeoAnalyzer");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const analyze = useCallback(async () => {
    const extracted = extractUrlishInput(url);

    if (!extracted) {
      setError(t("errorInvalidUrl"));
      return;
    }

    let normalized = extracted;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    setUrl(normalized);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/seo-analyze?url=${encodeURIComponent(normalized)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("errorFetch"));
        return;
      }

      setResult(data);
    } catch {
      setError(t("errorFetch"));
    } finally {
      setLoading(false);
    }
  }, [t, url]);

  const report = useMemo(() => {
    if (!result) return "";

    return [
      `${t("score")}: ${result.overall.score}/100`,
      `${t("finalUrl")}: ${result.finalUrl}`,
      `${t("titleTag")}: ${result.meta.title ?? t("notSet")}`,
      `${t("metaDescription")}: ${result.meta.description ?? t("notSet")}`,
      `${t("canonical")}: ${result.meta.canonical ?? t("notSet")}`,
      `${t("structuredData")}: ${result.structuredData.types.join(", ") || t("notSet")}`,
    ].join("\n");
  }, [result, t]);

  const copyReport = useCallback(async () => {
    if (!report) return;

    await navigator.clipboard.writeText(report);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 2000);
  }, [report, t]);

  const grade = getGrade(result?.overall.score ?? 0);
  const recommendationGroups = result
    ? [...result.overall.criticalIssues, ...result.overall.warnings, ...result.overall.strengths]
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-background via-background to-primary/5">
        <CardContent className="p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <Badge className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                {t("heroBadge")}
              </Badge>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{t("heroTitle")}</h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {t("heroDescription")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{t("checks.meta")}</Badge>
                <Badge variant="outline">{t("checks.social")}</Badge>
                <Badge variant="outline">{t("checks.indexing")}</Badge>
                <Badge variant="outline">{t("checks.structure")}</Badge>
              </div>
            </div>

            <div className="rounded-3xl border border-border/50 bg-background/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder={t("placeholder")}
                    className="pl-10"
                    onKeyDown={(event) => event.key === "Enter" && analyze()}
                  />
                </div>
                <Button onClick={analyze} disabled={loading || !url.trim()} className="shrink-0">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  {loading ? t("analyzing") : t("analyze")}
                </Button>
              </div>
              {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{t("score")}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-black tracking-tight">{result.overall.score}</p>
                    <p className="text-xs text-muted-foreground">/100</p>
                  </div>
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl font-black", grade.bg, grade.tone)}>
                    {grade.label}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{t("indexability")}</p>
                <p className={cn("mt-3 text-2xl font-black", result.indexability.indexable ? "text-emerald-500" : "text-red-500")}>
                  {result.indexability.indexable ? t("indexable") : t("blocked")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{t("status")}</p>
                <p className={cn("mt-3 text-2xl font-black", result.status < 400 ? "text-emerald-500" : "text-red-500")}>
                  {result.status}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{t("responseTime")}</p>
                <p className="mt-3 text-2xl font-black text-sky-500">{result.responseTime}ms</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{t("recommendations")}</h3>
                    <p className="text-sm text-muted-foreground">{t("recommendationsDescription")}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyReport} disabled={!report}>
                    {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? t("copied") : t("copyReport")}
                  </Button>
                </div>

                <div className="space-y-3">
                  {recommendationGroups.map((item) => {
                    const styles = getSeverityStyles(item.severity);

                    return (
                      <div key={`${item.severity}-${item.title}`} className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{styles.icon}</div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{item.title}</p>
                              <Badge className={cn("border", styles.badge)}>{t(`severity.${item.severity}`)}</Badge>
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold">{t("crawlSnapshot")}</h3>
                  <p className="text-sm text-muted-foreground">{t("crawlSnapshotDescription")}</p>
                </div>

                <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{t("requestedUrl")}</span>
                    <span className="truncate text-right font-medium">{result.requestedUrl}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{t("finalUrl")}</span>
                    <a href={result.finalUrl} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 truncate text-right font-medium text-primary">
                      <span className="truncate">{result.finalUrl}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{t("redirected")}</span>
                    <span className="font-medium">{result.redirected ? t("yes") : t("no")}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{t("contentType")}</span>
                    <span className="font-medium">{result.contentType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-sky-500" />
                  <h3 className="text-lg font-bold">{t("metadata")}</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("titleTag")}</p>
                    <p className="font-medium">{result.meta.title ?? t("notSet")}</p>
                    <p className="text-xs text-muted-foreground">{result.meta.titleLength} {t("characters")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("metaDescription")}</p>
                    <p className="font-medium">{result.meta.description ?? t("notSet")}</p>
                    <p className="text-xs text-muted-foreground">{result.meta.descriptionLength} {t("characters")}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground">{t("canonical")}</p>
                      <p className="font-medium break-all">{result.meta.canonical ?? t("notSet")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("robots")}</p>
                      <p className="font-medium">{result.meta.robots ?? t("notSet")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("language")}</p>
                      <p className="font-medium">{result.meta.lang ?? t("notSet")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("viewport")}</p>
                      <p className="font-medium break-all">{result.meta.viewport ?? t("notSet")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-violet-500" />
                  <h3 className="text-lg font-bold">{t("contentStructure")}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-muted/30 p-4">
                    <p className="text-muted-foreground">{t("h1")}</p>
                    <p className="mt-1 text-2xl font-black">{result.headings.h1Count}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-4">
                    <p className="text-muted-foreground">{t("h2")}</p>
                    <p className="mt-1 text-2xl font-black">{result.headings.h2Count}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-4">
                    <p className="text-muted-foreground">{t("images")}</p>
                    <p className="mt-1 text-2xl font-black">{result.images.total}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-4">
                    <p className="text-muted-foreground">{t("missingAlt")}</p>
                    <p className="mt-1 text-2xl font-black">{result.images.missingAlt}</p>
                  </div>
                </div>

                {result.headings.h1Items.length > 0 ? (
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">{t("h1Preview")}</p>
                    <div className="space-y-2">
                      {result.headings.h1Items.map((item) => (
                        <div key={item} className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-sm font-medium">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-bold">{t("socialAndSchema")}</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="rounded-2xl bg-muted/30 p-4">
                    <p className="text-muted-foreground">{t("openGraph")}</p>
                    <p className="mt-1 font-semibold">{result.social.openGraph.presentCount}/4</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-4">
                    <p className="text-muted-foreground">{t("twitterCards")}</p>
                    <p className="mt-1 font-semibold">{result.social.twitter.presentCount}/4</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-4">
                    <p className="text-muted-foreground">{t("structuredData")}</p>
                    <p className="mt-1 font-semibold">
                      {result.structuredData.types.length > 0 ? result.structuredData.types.join(", ") : t("notSet")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold">{t("linkProfile")}</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl bg-muted/30 p-4 text-sm">
                    <p className="text-muted-foreground">{t("total")}</p>
                    <p className="mt-1 text-2xl font-black">{result.links.total}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-4 text-sm">
                    <p className="text-muted-foreground">{t("internal")}</p>
                    <p className="mt-1 text-2xl font-black">{result.links.internal}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-4 text-sm">
                    <p className="text-muted-foreground">{t("external")}</p>
                    <p className="mt-1 text-2xl font-black">{result.links.external}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-4 text-sm">
                    <p className="text-muted-foreground">{t("nofollow")}</p>
                    <p className="mt-1 text-2xl font-black">{result.links.nofollow}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold">{t("imageCoverage")}</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-muted/30 p-4 text-sm">
                    <p className="text-muted-foreground">{t("total")}</p>
                    <p className="mt-1 text-2xl font-black">{result.images.total}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-4 text-sm">
                    <p className="text-muted-foreground">{t("withAlt")}</p>
                    <p className="mt-1 text-2xl font-black">{result.images.withAlt}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-4 text-sm">
                    <p className="text-muted-foreground">{t("missingAlt")}</p>
                    <p className="mt-1 text-2xl font-black">{result.images.missingAlt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
