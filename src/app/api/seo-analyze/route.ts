import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

type Severity = "critical" | "warning" | "good";

type Recommendation = {
  severity: Severity;
  title: string;
  description: string;
};

const USER_AGENT =
  "Mozilla/5.0 (compatible; OpenToolsSEOAnalyzer/1.0; +https://github.com/jshsakura/open-tools)";

function getTextLength(value: string | null) {
  return value?.trim().length ?? 0;
}

function normalizeUrl(value: string) {
  const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return new URL(normalized);
}

function addRecommendation(
  list: Recommendation[],
  severity: Severity,
  title: string,
  description: string,
) {
  list.push({ severity, title, description });
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url")?.trim();

  if (!rawUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let targetUrl: URL;

  try {
    targetUrl = normalizeUrl(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const startedAt = Date.now();

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    const responseTime = Date.now() - startedAt;
    const finalUrl = response.url;
    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        {
          error: "Unsupported content type",
          details: contentType || "unknown",
          status: response.status,
          finalUrl,
        },
        { status: 400 },
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const finalLocation = new URL(finalUrl);
    const requestedUrl = targetUrl.toString();

    const title = $("title").first().text().trim() || null;
    const description = $("meta[name='description']").attr("content")?.trim() || null;
    const canonical = $("link[rel='canonical']").attr("href")?.trim() || null;
    const robots = $("meta[name='robots']").attr("content")?.trim() || null;
    const xRobotsTag = response.headers.get("x-robots-tag");
    const viewport = $("meta[name='viewport']").attr("content")?.trim() || null;
    const lang = $("html").attr("lang")?.trim() || null;
    const charset = $("meta[charset]").attr("charset")?.trim() || null;

    const h1Items = $("h1")
      .map((_, element) => $(element).text().trim())
      .get()
      .filter(Boolean);
    const h2Count = $("h2").length;
    const h3Count = $("h3").length;

    const images = $("img");
    const missingAlt = images
      .toArray()
      .filter((element) => !($(element).attr("alt") ?? "").trim()).length;

    const links = $("a[href]")
      .toArray()
      .map((element) => {
        const href = $(element).attr("href")?.trim() ?? "";
        const rel = $(element).attr("rel")?.toLowerCase() ?? "";

        try {
          const resolved = new URL(href, finalUrl);
          return {
            href: resolved.toString(),
            external: resolved.host !== finalLocation.host,
            nofollow: rel.includes("nofollow"),
          };
        } catch {
          return {
            href,
            external: false,
            nofollow: rel.includes("nofollow"),
          };
        }
      });

    const ogFields = {
      title: $("meta[property='og:title']").attr("content")?.trim() || null,
      description: $("meta[property='og:description']").attr("content")?.trim() || null,
      image: $("meta[property='og:image']").attr("content")?.trim() || null,
      url: $("meta[property='og:url']").attr("content")?.trim() || null,
    };

    const twitterFields = {
      card: $("meta[name='twitter:card']").attr("content")?.trim() || null,
      title: $("meta[name='twitter:title']").attr("content")?.trim() || null,
      description: $("meta[name='twitter:description']").attr("content")?.trim() || null,
      image: $("meta[name='twitter:image']").attr("content")?.trim() || null,
    };

    const structuredDataScripts = $("script[type='application/ld+json']")
      .toArray()
      .map((element) => $(element).html()?.trim() || "")
      .filter(Boolean);

    const structuredDataTypes = structuredDataScripts.flatMap((script) => {
      try {
        const parsed = JSON.parse(script) as
          | { "@type"?: string | string[] }
          | Array<{ "@type"?: string | string[] }>;

        const items = Array.isArray(parsed) ? parsed : [parsed];

        return items.flatMap((item) => {
          const type = item?.["@type"];
          return Array.isArray(type) ? type : type ? [type] : [];
        });
      } catch {
        return [];
      }
    });

    const recommendations: Recommendation[] = [];
    let score = 100;

    if (!title) {
      score -= 18;
      addRecommendation(recommendations, "critical", "Missing title tag", "Add a unique <title> element so search engines and browsers can label the page correctly.");
    } else if (getTextLength(title) < 30 || getTextLength(title) > 60) {
      score -= 6;
      addRecommendation(recommendations, "warning", "Title length could be improved", "Aim for roughly 30-60 characters so the title is descriptive without being truncated in search results.");
    } else {
      addRecommendation(recommendations, "good", "Title tag looks healthy", "The page has a present title with a search-friendly length range.");
    }

    if (!description) {
      score -= 14;
      addRecommendation(recommendations, "critical", "Missing meta description", "Add a concise summary that explains the page and improves search snippet quality.");
    } else if (getTextLength(description) < 70 || getTextLength(description) > 160) {
      score -= 5;
      addRecommendation(recommendations, "warning", "Meta description length could be improved", "Descriptions generally work best around 120-160 characters for search previews.");
    }

    const robotsText = `${robots ?? ""} ${xRobotsTag ?? ""}`.toLowerCase();
    const indexable = !robotsText.includes("noindex");
    if (!indexable) {
      score -= 18;
      addRecommendation(recommendations, "critical", "Page is marked noindex", "Robots directives currently block this page from appearing in search indexes.");
    }

    if (!canonical) {
      score -= 8;
      addRecommendation(recommendations, "warning", "Missing canonical URL", "A canonical tag helps search engines consolidate duplicate or near-duplicate URLs.");
    }

    if (h1Items.length === 0) {
      score -= 10;
      addRecommendation(recommendations, "critical", "Missing H1 heading", "Add a single clear H1 to communicate the primary topic of the page.");
    } else if (h1Items.length > 1) {
      score -= 5;
      addRecommendation(recommendations, "warning", "Multiple H1 headings detected", "Multiple H1s are sometimes valid, but a single primary heading is usually clearer for structure and SEO.");
    }

    if (!viewport) {
      score -= 6;
      addRecommendation(recommendations, "warning", "Missing viewport meta tag", "Responsive viewport settings are important for mobile usability and search visibility.");
    }

    if (!lang) {
      score -= 4;
      addRecommendation(recommendations, "warning", "Missing html lang attribute", "Set the page language so crawlers and assistive technologies can interpret content correctly.");
    }

    if (images.length > 0 && missingAlt > 0) {
      score -= Math.min(10, missingAlt * 2);
      addRecommendation(recommendations, "warning", "Some images are missing alt text", "Add meaningful alt text to informative images for accessibility and image search context.");
    }

    const ogPresent = Object.values(ogFields).filter(Boolean).length;
    if (ogPresent === 0) {
      score -= 8;
      addRecommendation(recommendations, "warning", "Open Graph tags are missing", "Add OG tags so links shared in social channels render useful previews.");
    }

    const twitterPresent = Object.values(twitterFields).filter(Boolean).length;
    if (twitterPresent === 0) {
      score -= 4;
      addRecommendation(recommendations, "warning", "Twitter card tags are missing", "Twitter/X cards improve social previews and help keep messaging consistent.");
    }

    if (structuredDataTypes.length === 0) {
      score -= 4;
      addRecommendation(recommendations, "warning", "No structured data detected", "JSON-LD can help search engines understand entities like products, articles, or FAQs.");
    } else {
      addRecommendation(recommendations, "good", "Structured data detected", `Detected schema types: ${structuredDataTypes.join(", ")}.`);
    }

    const https = finalLocation.protocol === "https:";
    if (!https) {
      score -= 12;
      addRecommendation(recommendations, "critical", "HTTPS is not enabled", "Serve the page over HTTPS so crawlers and users receive a secure canonical version.");
    }

    if (response.status >= 400) {
      score -= 20;
      addRecommendation(recommendations, "critical", "Page returned an error status", "Search engines cannot reliably index pages that respond with client or server errors.");
    } else if (response.status >= 300) {
      score -= 4;
      addRecommendation(recommendations, "warning", "Page resolved through a redirect", "Redirects are not always harmful, but the final canonical destination should be intentional.");
    }

    const criticalIssues = recommendations.filter((item) => item.severity === "critical");
    const warnings = recommendations.filter((item) => item.severity === "warning");
    const strengths = recommendations.filter((item) => item.severity === "good");

    return NextResponse.json({
      requestedUrl,
      finalUrl,
      status: response.status,
      redirected: requestedUrl !== finalUrl,
      responseTime,
      contentType,
      overall: {
        score: clampScore(score),
        criticalIssues,
        warnings,
        strengths,
      },
      meta: {
        title,
        titleLength: getTextLength(title),
        description,
        descriptionLength: getTextLength(description),
        canonical,
        robots,
        xRobotsTag,
        viewport,
        lang,
        charset,
      },
      indexability: {
        indexable,
      },
      headings: {
        h1Items,
        h1Count: h1Items.length,
        h2Count,
        h3Count,
      },
      images: {
        total: images.length,
        missingAlt,
        withAlt: images.length - missingAlt,
      },
      links: {
        total: links.length,
        internal: links.filter((link) => !link.external).length,
        external: links.filter((link) => link.external).length,
        nofollow: links.filter((link) => link.nofollow).length,
      },
      social: {
        openGraph: {
          ...ogFields,
          presentCount: ogPresent,
        },
        twitter: {
          ...twitterFields,
          presentCount: twitterPresent,
        },
      },
      structuredData: {
        count: structuredDataScripts.length,
        types: [...new Set(structuredDataTypes)],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to analyze URL",
        details: message,
      },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
