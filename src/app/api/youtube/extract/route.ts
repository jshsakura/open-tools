import { exec } from 'child_process';
import { promisify } from 'util';
import { NextResponse } from 'next/server';

const execPromise = promisify(exec);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // Use -j (JSON) to get all metadata including subtitles
        const proxy = searchParams.get('proxy');
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
        let command = `yt-dlp -j --user-agent "${userAgent}" "${videoUrl}"`;
        if (proxy) {
            command += ` --proxy "${proxy}"`;
        }
        const { stdout } = await execPromise(command);
        const metadata = JSON.parse(stdout);

        const formats = metadata.formats || [];

        // Extract subtitles
        const subtitles: Record<string, string> = {};

        // Manual subtitles
        if (metadata.subtitles) {
            for (const lang in metadata.subtitles) {
                const srt = metadata.subtitles[lang].find((s: any) => s.ext === 'srt' || s.ext === 'vtt');
                if (srt) subtitles[lang] = srt.url;
            }
        }

        // Automatic captions (fallback)
        if (Object.keys(subtitles).length === 0 && metadata.automatic_captions) {
            for (const lang in metadata.automatic_captions) {
                const srt = metadata.automatic_captions[lang].find((s: any) => s.ext === 'srt' || s.ext === 'vtt');
                if (srt) subtitles[lang] = srt.url;
            }
        }

        // 1. Find best audio (m4a) to merge with video-only streams
        // Sort by filesize to approximate bitrate/quality
        const audioFormats = formats.filter((f: any) => f.acodec !== 'none' && f.vcodec === 'none');
        const bestAudio = audioFormats.find((f: any) => f.ext === 'm4a') || audioFormats[0];

        // 2. Identify unique video qualities (MP4 preferred)
        const qualityMap = new Map();

        formats.forEach((f: any) => {
            // We prioritize MP4 container for web compatibility
            // vcodec != none means it has video
            // Protocol check: exclude 'm3u8', 'm3u8_native', 'dash' explicitly, prefer 'https'
            const isDirectLink = f.protocol === 'https' || f.protocol === 'http' || (f.url && !f.url.includes('manifest.googlevideo.com'));

            if (f.vcodec !== 'none' && (f.ext === 'mp4' || f.ext === 'webm') && isDirectLink) {
                const height = f.height || 0;
                if (height > 0) {
                    // We want the best bitrate for this resolution
                    // But we prefer MP4 over WebM if bitrate is similar, or just distinct entries?
                    // Let's grouping by height.
                    const existing = qualityMap.get(height);

                    // Helper: score format (MP4 > WebM, High Bitrate > Low)
                    const getScore = (fmt: any) => {
                        let score = fmt.tbr || 0;
                        if (fmt.ext === 'mp4') score += 1000; // Prefer MP4
                        return score;
                    };

                    if (!existing || getScore(f) > getScore(existing)) {
                        qualityMap.set(height, f);
                    }
                }
            }
        });

        // 3. Create options list
        const qualities = Array.from(qualityMap.values())
            .sort((a: any, b: any) => b.height - a.height) // Descending resolution
            .map((f: any) => {
                const isVideoOnly = f.acodec === 'none';
                // If video-only, we MUST have an audio track to merge
                const audioUrl = isVideoOnly && bestAudio ? bestAudio.url : null;
                const audioSize = (isVideoOnly && bestAudio) ? (bestAudio.filesize || bestAudio.filesize_approx || 0) : 0;
                const videoSize = f.filesize || f.filesize_approx || 0;

                return {
                    id: f.format_id,
                    height: f.height,
                    label: `${f.height}p${f.fps > 30 ? '60' : ''}`,
                    ext: f.ext,
                    videoUrl: f.url,
                    audioUrl: audioUrl,
                    videoFilesize: videoSize,
                    audioFilesize: audioSize,
                    totalSize: videoSize + audioSize
                };
            });

        // Add Audio Only option
        if (bestAudio) {
            qualities.push({
                id: 'audio',
                height: 0,
                label: 'Audio Only',
                ext: 'mp3',
                videoUrl: null,
                audioUrl: bestAudio.url,
                videoFilesize: 0,
                audioFilesize: bestAudio.filesize || bestAudio.filesize_approx || 0,
                totalSize: bestAudio.filesize || bestAudio.filesize_approx || 0
            });
        }

        return NextResponse.json({
            title: metadata.title,
            thumbnail: metadata.thumbnail,
            duration: metadata.duration,
            qualities: qualities,
            subtitles: Object.keys(subtitles).length > 0 ? subtitles : null
        });
    } catch (error: any) {
        console.error('yt-dlp extraction error:', error);
        return NextResponse.json({
            error: 'Failed to extract YouTube URL. Make sure yt-dlp is installed on the server.',
            details: error.message
        }, { status: 500 });
    }
}
