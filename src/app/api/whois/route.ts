import { NextRequest, NextResponse } from "next/server"
import dns from "dns"

const resolver = new dns.promises.Resolver()
resolver.setServers(["8.8.8.8", "1.1.1.1"])

export async function GET(request: NextRequest) {
    const domain = request.nextUrl.searchParams.get("domain")

    if (!domain) {
        return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 })
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain)) {
        return NextResponse.json({ error: "Invalid domain format" }, { status: 400 })
    }

    try {
        const results: Record<string, unknown> = { domain }

        const lookups = [
            resolver.resolve4(domain).then(r => { results.a = r }).catch(() => {}),
            resolver.resolve6(domain).then(r => { results.aaaa = r }).catch(() => {}),
            resolver.resolveMx(domain).then(r => { results.mx = r }).catch(() => {}),
            resolver.resolveNs(domain).then(r => { results.ns = r }).catch(() => {}),
            resolver.resolveTxt(domain).then(r => { results.txt = r }).catch(() => {}),
            resolver.resolveSoa(domain).then(r => { results.soa = r }).catch(() => {}),
        ]

        await Promise.all(lookups)

        return NextResponse.json(results)
    } catch {
        return NextResponse.json({ error: "DNS lookup failed" }, { status: 500 })
    }
}
