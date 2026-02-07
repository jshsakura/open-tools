
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const fetchHeaders = new Headers();

        // Forward Range header if present
        const range = request.headers.get('range');
        if (range) {
            fetchHeaders.set('Range', range);
        }

        // Use a standard browser User-Agent to avoid 403s (Must match yt-dlp extraction)
        fetchHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        fetchHeaders.set('Referer', 'https://www.youtube.com/');

        const response = await fetch(url, { headers: fetchHeaders });

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch resource: ${response.statusText}` }, { status: response.status });
        }

        const responseHeaders = new Headers();

        // Copy critical headers for streaming
        ['content-type', 'content-length', 'accept-ranges', 'content-range'].forEach(header => {
            const value = response.headers.get(header);
            if (value) responseHeaders.set(header, value);
        });

        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Range');

        // Optimize for streaming - disable caching
        responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
        });

    } catch (error: any) {
        console.error('CORS Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to fetch resource', details: error.message }, { status: 500 });
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Range',
        },
    });
}
