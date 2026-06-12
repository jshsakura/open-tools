import { execFile } from 'child_process';
import { promisify } from 'util';
import { NextResponse } from 'next/server';

const execFilePromise = promisify(execFile);

// yt-dlp -j metadata for format-rich videos can be several MB; the default
// 1MB exec buffer truncates it and fails the parse.
const YT_DLP_MAX_BUFFER = 32 * 1024 * 1024;
const YT_DLP_TIMEOUT_MS = 60_000;

const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

// Restrict extraction to YouTube hosts. Arguments are passed to execFile as an
// array (no shell), so there is no command-injection surface — this check is a
// defense-in-depth guard against pointing yt-dlp at arbitrary SSRF targets.
const ALLOWED_HOSTS = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'youtu.be',
    'www.youtu.be',
    'youtube-nocookie.com',
    'www.youtube-nocookie.com',
]);

function isValidYoutubeUrl(raw: string): boolean {
    try {
        const parsed = new URL(raw);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
        return ALLOWED_HOSTS.has(parsed.hostname.toLowerCase());
    } catch {
        return false;
    }
}

function isValidProxy(raw: string): boolean {
    try {
        const parsed = new URL(raw);
        return ['http:', 'https:', 'socks4:', 'socks5:', 'socks5h:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');
    const proxy = searchParams.get('proxy');

    if (!videoUrl) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!isValidYoutubeUrl(videoUrl)) {
        return NextResponse.json({ error: 'A valid YouTube URL is required' }, { status: 400 });
    }

    if (proxy && !isValidProxy(proxy)) {
        return NextResponse.json({ error: 'Invalid proxy URL' }, { status: 400 });
    }

    try {
        // Args passed as an array → executed without a shell, so user input is
        // never interpreted as shell syntax.
        const args = ['-j', '--no-warnings', '--user-agent', USER_AGENT];
        if (proxy) args.push('--proxy', proxy);
        args.push(videoUrl);

        const { stdout } = await execFilePromise('yt-dlp', args, {
            maxBuffer: YT_DLP_MAX_BUFFER,
            timeout: YT_DLP_TIMEOUT_MS,
        });
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

        // Add Audio Only option (downloaded as MP3 client-side via ffmpeg.wasm)
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
        const notInstalled = error?.code === 'ENOENT';
        return NextResponse.json({
            error: notInstalled
                ? 'yt-dlp is not installed on the server.'
                : 'Failed to extract YouTube URL. The video may be unavailable or restricted.',
            details: error.message,
        }, { status: 500 });
    }
}
