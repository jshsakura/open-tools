import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { scrapeTorrentHistory } from '@/scripts/torrent-scraper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    let debugLog: string[] = [];
    const TIMEOUT = 45000; // 45 seconds timeout for Puppeteer

    try {
        // 1. Resolve Client IP
        let ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();

        // Localhost/Dev fallback: Resolve actual public IP via external service
        if (!ip || ip === '127.0.0.1' || ip === '::1') {
            try {
                const ipRes = await fetch('https://api.ipify.org?format=json', { next: { revalidate: 3600 } });
                if (ipRes.ok) {
                    const data = await ipRes.json();
                    ip = data.ip;
                    debugLog.push(`Resolved Localhost Public IP: ${ip}`);
                }
            } catch (e) {
                console.error("IP resolution failed", e);
                ip = '127.0.0.1';
            }
        }
        debugLog.push(`Target IP: ${ip}`);

        // Fetch ISP & Geo Info (Server-side)
        let isp = undefined;
        let geo = undefined;
        try {
            const ispRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,lat,lon,isp,org,as,query`);
            if (ispRes.ok) {
                const ispData = await ispRes.json();
                isp = ispData.isp || ispData.org;
                geo = {
                    country: ispData.country,
                    city: ispData.city,
                    region: ispData.regionName,
                    lat: ispData.lat,
                    lon: ispData.lon,
                    asn: ispData.as
                };
                debugLog.push(`Resolved ISP: ${isp}, Loc: ${geo.city}, ${geo.country}`);
            }
        } catch (e) {
            console.error("ISP fetch failed", e);
        }

        // 2. Fetch via Puppeteer (Node.js)
        const html = await Promise.race<string>([
            scrapeTorrentHistory(ip),
            new Promise<string>((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout after ${TIMEOUT}ms`)), TIMEOUT),
            ),
        ]);

        // 3. Parse HTML
        const $ = cheerio.load(html);

        const downloads: any[] = [];
        let riskScore = 0;

        // The site often puts the table in .table-responsive
        $('.table-responsive table tbody tr').each((_: any, row: any) => {
            const $row = $(row);
            // Title is usually in the first cell, inside a div
            const title = $row.find('td').first().find('div').eq(0).text().trim();
            const category = $row.find('.category-label').text().trim() || 'Unknown';
            const size = $row.find('td').eq(1).text().trim();
            const date = $row.find('td').eq(2).text().trim();

            if (title) {
                const lowerTitle = title.toLowerCase();
                const lowerCat = category.toLowerCase();

                const d: any = {
                    title,
                    category,
                    size,
                    date,
                    isSensitive: false
                };

                // Risk Analysis Logic
                // 1. Adult Content
                if (lowerCat.includes('xxx') || lowerTitle.includes('porn') || lowerTitle.includes('adult') || lowerTitle.includes('18+') || lowerTitle.includes('hentai')) {
                    riskScore += 20;
                    d.isSensitive = true;
                    d.categoryType = 'adult';
                }
                // 2. Software Piracy (Cracks/Keygens)
                else if (lowerCat.includes('software') || lowerTitle.includes('crack') || lowerTitle.includes('keygen') || lowerTitle.includes('repack') || lowerTitle.includes('patch')) {
                    riskScore += 10;
                    d.isSensitive = true;
                    d.categoryType = 'software';
                }
                // 3. Copyrighted Movies (High Quality/BluRay)
                else if (lowerCat.includes('movie') || lowerTitle.includes('1080p') || lowerTitle.includes('bluray') || lowerTitle.includes('hdrip')) {
                    riskScore += 2;
                    d.isSensitive = true;
                    d.categoryType = 'copyright';
                }
                // 4. General
                else {
                    riskScore += 1;
                    d.categoryType = 'general';
                }

                downloads.push(d);
            }
        });

        // Base risk for having valid history
        if (downloads.length > 0) riskScore += 5;

        // Cap Score
        riskScore = Math.min(riskScore, 100);

        // Determine Level
        let riskLevel = 'Safe';
        if (riskScore > 0) riskLevel = 'Low';
        if (riskScore >= 20) riskLevel = 'Moderate';
        if (riskScore >= 50) riskLevel = 'Critical';

        return NextResponse.json({
            ip,
            isp,
            geo,
            downloads,
            riskScore,
            riskLevel,
            debugLog
        });

    } catch (error: any) {
        console.error('Torrent History Error:', error);

        // Return structured error so UI handles it gracefully
        return NextResponse.json({
            error: error.message || String(error),
            debugLog,
            isBlocked: error.message?.includes('Timeout') || error.message?.includes('403') // Hint to UI
        }, { status: 500 }); // Return 500 to indicate failure, but with JSON body
    }
}
