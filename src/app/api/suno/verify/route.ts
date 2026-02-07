import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url || (!url.includes("suno.com") && !url.includes("mureka.ai"))) {
            return NextResponse.json(
                { error: "Invalid URL. Please provide a valid Suno.com or Mureka.ai link." },
                { status: 400 }
            );
        }

        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch Suno page. Please check the link." },
                { status: 404 }
            );
        }

        const html = await response.text();

        // Check if it's a playlist or multiple songs page
        // Suno stores data in <script id="__NEXT_DATA__" type="application/json">...</script>
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);

        if (nextDataMatch) {
            try {
                const json = JSON.parse(nextDataMatch[1]);
                // Navigate to find clips. The structure varies but usually props.pageProps.initialState... or props.pageProps.clip...
                // Let's search recursively or look for specific keys.

                const clips: any[] = [];

                // Helper to find clips in the JSON object
                const findClips = (obj: any) => {
                    if (!obj || typeof obj !== 'object') return;

                    if (Array.isArray(obj)) {
                        obj.forEach(findClips);
                        return;
                    }

                    // Suno Clip Structure usually has: id, title, audio_url, image_url (or metadata with image)
                    if (obj.audio_url && obj.title && obj.id) {
                        // Avoid duplicates
                        if (!clips.find(c => c.id === obj.id)) {
                            clips.push({
                                id: obj.id,
                                title: obj.title || "Untitled",
                                image: obj.image_large_url || obj.image_url || "",
                                audioUrl: obj.audio_url,
                                description: obj.metadata?.prompt || ""
                            });
                        }
                    }

                    // Recursive search
                    Object.values(obj).forEach(findClips);
                };

                findClips(json);

                if (clips.length > 0) {
                    return NextResponse.json(clips);
                }

            } catch (e) {
                console.error("Error parsing NEXT_DATA", e);
            }
        }

        // Fallback for Mureka or single pages simple regex if NEXT_DATA failed or empty
        if (url.includes("mureka.ai")) {
            // ... (Existing Mureka logic)
            const murekaTitleMatch = html.match(/"title"\s*:\s*"([^"]+)"/);
            const murekaTitle = murekaTitleMatch ? murekaTitleMatch[1] : "Mureka Song";

            const murekaImageMatch = html.match(/"cover"\s*:\s*"([^"]+)"/);
            let murekaImage = murekaImageMatch ? murekaImageMatch[1] : "";
            if (murekaImage && !murekaImage.startsWith("http")) {
                murekaImage = `https://static-cos.mureka.ai/${murekaImage}`;
            }

            const murekaAudioMatch = html.match(/"mp3_url"\s*:\s*"([^"]+)"/);
            let murekaAudio = murekaAudioMatch ? murekaAudioMatch[1] : "";

            if (murekaAudio) {
                if (!murekaAudio.startsWith("http")) {
                    murekaAudio = `https://static-cos.mureka.ai/${murekaAudio}`;
                }

                return NextResponse.json([{
                    title: murekaTitle,
                    image: murekaImage,
                    audioUrl: murekaAudio,
                    description: "Downloaded from Mureka.ai"
                }]);
            }
        }

        // Fallback OG Meta Extraction (Single Song)
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
