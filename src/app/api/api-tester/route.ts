import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, method, headers: reqHeaders, body: reqBody } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
        if (!allowedMethods.includes(method?.toUpperCase())) {
            return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
        }

        const fetchHeaders: Record<string, string> = {};
        if (reqHeaders && typeof reqHeaders === 'object') {
            for (const [key, value] of Object.entries(reqHeaders)) {
                if (key && value && typeof value === 'string') {
                    fetchHeaders[key] = value;
                }
            }
        }

        const startTime = Date.now();

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const fetchOptions: RequestInit = {
            method: method?.toUpperCase() || 'GET',
            headers: fetchHeaders,
            signal: controller.signal,
            redirect: 'follow',
        };

        if (['POST', 'PUT', 'PATCH'].includes(method?.toUpperCase()) && reqBody) {
            fetchOptions.body = reqBody;
        }

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeout);

        const elapsed = Date.now() - startTime;

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        let responseBody = '';
        try {
            responseBody = await response.text();
        } catch {
            responseBody = '[Could not read response body]';
        }

        return NextResponse.json({
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            body: responseBody,
            time: elapsed,
            url: response.url,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Request failed', details: error.message },
            { status: 500 }
        );
    }
}
