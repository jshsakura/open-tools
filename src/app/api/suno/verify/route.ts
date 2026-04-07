import { NextRequest, NextResponse } from "next/server";
import { extractUrlishInput } from "@/lib/url-input";

interface SunoClip {
    id: string;
    title: string;
    image: string;
    audioUrl: string;
    description: string;
}

type SourcePlatform = "suno" | "mureka";

const BROWSER_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | null {
    return typeof value === "string" ? value : null;
}

function normalizeMediaUrl(value: string, source: SourcePlatform): string {
    const cleaned = value.replace(/\\u002F/g, "/").replace(/\\\//g, "/").trim();

    if (!cleaned) {
        return "";
    }

    if (cleaned.startsWith("https://") || cleaned.startsWith("http://")) {
        return cleaned;
    }

    if (cleaned.startsWith("//")) {
        return `https:${cleaned}`;
    }

    if (source === "mureka") {
        if (cleaned.startsWith("/")) {
            return `https://www.mureka.ai${cleaned}`;
        }

        return `https://static-cos.mureka.ai/${cleaned.replace(/^\/+/, "")}`;
    }

    return cleaned;
}

function isLikelyAudioUrl(value: string, source: SourcePlatform): boolean {
    const normalized = normalizeMediaUrl(value, source).toLowerCase();

    if (!normalized) {
        return false;
    }

    return /\.(mp3|m4a|wav|ogg)(\?|$)/.test(normalized) || normalized.includes("audio") || normalized.includes("stream");
}

function extractIdFromAudioUrl(audioUrl: string): string {
    const normalized = audioUrl.split("?")[0] ?? audioUrl;
    const segments = normalized.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] ?? "track";
    return lastSegment.replace(/\.[a-z0-9]+$/i, "") || "track";
}

function isNonEmptyString(value: string | null): value is string {
    return typeof value === "string" && value.length > 0;
}

function parseJsonSafely(value: string): unknown | null {
    try {
        return JSON.parse(value) as unknown;
    } catch {
        return null;
    }
}

function extractAssignedJson(html: string, variableName: string): unknown[] {
    const escapedName = variableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`${escapedName}\\s*=\\s*([\\s\\S]*?)<\\/script>`, "gi");
    const results: unknown[] = [];

    for (const match of html.matchAll(regex)) {
        const assignedValue = match[1]?.trim() ?? "";
        const normalizedValue = assignedValue.replace(/;\s*$/, "").trim();
        const parsed = parseJsonSafely(normalizedValue);

        if (parsed !== null) {
            results.push(parsed);
        }
    }

    return results;
}

function getMurekaPlaylistIdentifier(url: string): string | null {
    try {
        const pathname = new URL(url).pathname;
        const segments = pathname.split("/").filter(Boolean);
        const playlistIndex = segments.findIndex((segment) => segment === "playlist");

        if (playlistIndex === -1) {
            return null;
        }

        return segments[playlistIndex + 1] ?? null;
    } catch {
        return null;
    }
}

async function fetchMurekaPlaylistClips(url: string): Promise<SunoClip[]> {
    const playlistIdentifier = getMurekaPlaylistIdentifier(url);

    if (!playlistIdentifier) {
        return [];
    }

    const apiUrl = new URL("https://www.mureka.ai/api/pgc/playlist/detail");
    if (/^\d+$/.test(playlistIdentifier)) {
        apiUrl.searchParams.set("playlist_id", playlistIdentifier);
    } else {
        apiUrl.searchParams.set("share_key", playlistIdentifier);
    }

    const response = await fetch(apiUrl.toString(), {
        headers: {
            ...BROWSER_HEADERS,
            Referer: url,
            Accept: "application/json, text/plain, */*",
        },
    });

    if (!response.ok) {
        return [];
    }

    const payload = (await response.json()) as unknown;
    const clips = extractClipsFromObject(payload, "mureka");

    return clips;
}

function extractClipsFromObject(root: unknown, source: SourcePlatform): SunoClip[] {
    const clips: SunoClip[] = [];
    const seen = new Set<string>();

    const visit = (value: unknown) => {
        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }

        if (!isRecord(value)) {
            return;
        }

        const metadata = isRecord(value.metadata) ? value.metadata : null;
        const rawAudioUrl = [
            getString(value.audio_url),
            getString(value.audioUrl),
            getString(value.mp3_url),
            getString(value.mp3Url),
            getString(value.media_url),
            getString(value.mediaUrl),
            getString(value.song_path),
            getString(value.stream_url),
            getString(value.streamUrl),
            getString(value.url),
        ].filter(isNonEmptyString).find((candidate) => isLikelyAudioUrl(candidate, source));

        if (rawAudioUrl) {
            const audioUrl = normalizeMediaUrl(rawAudioUrl, source);
            const rawId = [
                getString(value.id),
                getString(value.clip_id),
                getString(value.audio_id),
                getString(value.song_id),
                getString(value.track_id),
            ].filter(isNonEmptyString)[0];
            const id = rawId ?? extractIdFromAudioUrl(audioUrl);

            if (!seen.has(id)) {
                const title = [
                    getString(value.title),
                    getString(value.name),
                    getString(value.song_title),
                    metadata ? getString(metadata.title) : null,
                ].filter(isNonEmptyString)[0] ?? `Track ${clips.length + 1}`;

                const image = [
                    getString(value.image_large_url),
                    getString(value.image_url),
                    getString(value.image),
                    getString(value.cover),
                    getString(value.cover_url),
                    getString(value.thumbnail_url),
                    metadata ? getString(metadata.image_url) : null,
                ].filter(isNonEmptyString)[0] ?? "";

                const description = [
                    getString(value.description),
                    metadata ? getString(metadata.prompt) : null,
                    metadata ? getString(metadata.description) : null,
                    getString(value.prompt),
                ].filter(isNonEmptyString)[0] ?? "";

                seen.add(id);
                clips.push({
                    id,
                    title,
                    image: image ? normalizeMediaUrl(image, source) : "",
                    audioUrl,
                    description,
                });
            }
        }

        Object.values(value).forEach(visit);
    };

    visit(root);
    return clips;
}

function extractJsonScriptContents(html: string): string[] {
    const matches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];

    return matches
        .map((match) => match[1]?.trim() ?? "")
        .filter((content) => content.startsWith("{") || content.startsWith("["));
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        const normalizedUrl = typeof url === "string" ? extractUrlishInput(url) : "";
        const source: SourcePlatform = normalizedUrl.includes("mureka.ai") ? "mureka" : "suno";

        if (!normalizedUrl || (!normalizedUrl.includes("suno.com") && !normalizedUrl.includes("mureka.ai"))) {
            return NextResponse.json(
                { error: "Invalid URL. Please provide a valid Suno.com or Mureka.ai link." },
                { status: 400 }
            );
        }

        const response = await fetch(normalizedUrl, {
            headers: BROWSER_HEADERS,
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch Suno page. Please check the link." },
                { status: 404 }
            );
        }

        const html = await response.text();

        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);

        if (nextDataMatch) {
            const json = parseJsonSafely(nextDataMatch[1]);
            if (json !== null) {
                const clips = extractClipsFromObject(json, source);

                if (clips.length > 0) {
                    return NextResponse.json(clips);
                }
            }
        }

        for (const parsed of extractAssignedJson(html, "window.__INITIAL_STATE__")) {
            const clips = extractClipsFromObject(parsed, source);

            if (clips.length > 0) {
                return NextResponse.json(clips);
            }
        }

        for (const scriptContent of extractJsonScriptContents(html)) {
            const parsed = parseJsonSafely(scriptContent);
            if (parsed !== null) {
                const clips = extractClipsFromObject(parsed, source);

                if (clips.length > 0) {
                    return NextResponse.json(clips);
                }
            }
        }

        const cdnAudioPattern = /https:\/\/cdn\d?\.suno\.ai\/([a-f0-9-]+)\.mp3/g;
        const cdnMatches = [...html.matchAll(cdnAudioPattern)];
        
        const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]*)"/i);
        const ogTitle = ogTitleMatch ? ogTitleMatch[1] : null;
        
        if (cdnMatches.length > 0) {
            const clips: SunoClip[] = [];
            const seenIds = new Set<string>();
            
            for (const match of cdnMatches) {
                const songId = match[1];
                if (seenIds.has(songId)) continue;
                seenIds.add(songId);
                
                const songTitle = clips.length === 0 && ogTitle 
                    ? ogTitle.replace(/\s*\|\s*Suno\s*$/i, '').trim()
                    : `Suno Song (${songId.slice(0, 8)})`;
                
                clips.push({
                    id: songId,
                    title: songTitle,
                    image: `https://cdn2.suno.ai/image_${songId}.jpeg`,
                    audioUrl: `https://cdn1.suno.ai/${songId}.mp3`,
                    description: "AI-generated music from Suno"
                });
            }
            
            if (clips.length > 0) {
                return NextResponse.json(clips);
            }
        }

        if (normalizedUrl.includes("mureka.ai")) {
            if (normalizedUrl.includes("/playlist/")) {
                const playlistClips = await fetchMurekaPlaylistClips(normalizedUrl);

                if (playlistClips.length > 0) {
                    return NextResponse.json(playlistClips);
                }
            }

            const mp3UrlMatches = [...html.matchAll(/"mp3_url"\s*:\s*"([^"]+)"/g)];

            if (mp3UrlMatches.length > 0) {
                const clips = mp3UrlMatches.map((match, index) => {
                    const audioUrl = normalizeMediaUrl(match[1], "mureka");
                    const id = extractIdFromAudioUrl(audioUrl);
                    return {
                        id,
                        title: `Mureka Track ${index + 1}`,
                        image: "",
                        audioUrl,
                        description: "Downloaded from Mureka.ai",
                    } satisfies SunoClip;
                });

                return NextResponse.json(clips);
            }
        }

        const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/i);
        const title = titleMatch ? titleMatch[1] : "Unknown Title";

        const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/i);
        const image = imageMatch ? imageMatch[1] : "";

        let audioUrl = "";
        const audioMatch = html.match(/<meta property="og:audio" content="([^"]*)"/i);
        if (audioMatch) audioUrl = audioMatch[1];

        if (!audioUrl) {
            const cdnMatch = html.match(/"(https:\/\/cdn\d?\.suno\.ai\/[^"]+\.mp3)"/);
            if (cdnMatch) audioUrl = cdnMatch[1];
        }

        const descMatch = html.match(/<meta property="og:description" content="([^"]*)"/i);
        const description = descMatch ? descMatch[1] : "";

        if (!audioUrl) {
            return NextResponse.json(
                { error: "Could not find audio URL. Please ensure the song/playlist is public." },
                { status: 422 }
            );
        }

        return NextResponse.json([{
            id: extractIdFromAudioUrl(audioUrl),
            title,
            image,
            audioUrl,
            description
        }]);

    } catch (error) {
        console.error("Suno verify error:", error);
        return NextResponse.json(
            { error: "Internal server error while processing the link." },
            { status: 500 }
        );
    }
}
