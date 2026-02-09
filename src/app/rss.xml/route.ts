import { tools } from '@/lib/tools-data';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://opentools.example.com';

function escapeXml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function getByPath(obj: Record<string, any>, path: string) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const localeParam = url.searchParams.get('locale') || 'ko';
    const locale = localeParam === 'en' || localeParam === 'ko' ? localeParam : 'ko';

    const catalog = (await import(`../../../messages/${locale}/catalog.json`)).default as Record<string, any>;

    const now = new Date().toUTCString();
    const channelTitle = locale === 'ko' ? 'OpenTools 도구 목록' : 'OpenTools Tool List';
    const channelDescription =
        locale === 'ko'
            ? 'OpenTools의 모든 도구 목록과 제목'
            : 'All tools and titles from OpenTools';

    const items = tools
        .map((tool) => {
            const title = getByPath(catalog, tool.titleKey) || tool.id;
            const link = `${baseUrl}/${locale}${tool.href}`;
            return [
                '<item>',
                `<title>${escapeXml(String(title))}</title>`,
                `<link>${escapeXml(link)}</link>`,
                `<guid isPermaLink="true">${escapeXml(link)}</guid>`,
                `<pubDate>${now}</pubDate>`,
                '</item>',
            ].join('');
        })
        .join('');

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '<channel>',
        `<title>${escapeXml(channelTitle)}</title>`,
        `<link>${escapeXml(baseUrl)}</link>`,
        `<description>${escapeXml(channelDescription)}</description>`,
        `<atom:link href="${escapeXml(`${baseUrl}/rss.xml?locale=ko`)}" rel="self" type="application/rss+xml" />`,
        `<atom:link href="${escapeXml(`${baseUrl}/rss.xml?locale=en`)}" rel="alternate" type="application/rss+xml" />`,
        `<language>${locale}</language>`,
        `<lastBuildDate>${now}</lastBuildDate>`,
        items,
        '</channel>',
        '</rss>',
    ].join('');

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
        },
    });
}
