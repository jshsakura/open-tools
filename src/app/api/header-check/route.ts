import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        new URL(url);
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            },
            redirect: 'follow',
            signal: controller.signal,
        });

        clearTimeout(timeout);

        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });

        return NextResponse.json({
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            headers,
        });
    } catch (error: any) {
        // If HEAD fails, try GET with a small body read
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                },
                redirect: 'follow',
                signal: controller.signal,
            });

            clearTimeout(timeout);

            // Immediately abort body reading to save bandwidth
            controller.abort();

            const headers: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                headers[key] = value;
            });

            return NextResponse.json({
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                headers,
            });
        } catch (fallbackError: any) {
            return NextResponse.json(
                { error: 'Failed to fetch headers', details: fallbackError.message },
                { status: 500 }
            );
        }
    }
}
