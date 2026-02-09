type FlareSolverrResponse = {
    status: string;
    message?: string;
    solution?: {
        response?: string;
        status?: number;
    };
};

export async function scrapeTorrentHistory(ip: string): Promise<string> {
    if (!ip) {
        throw new Error('IP address required');
    }

    const url = `https://iknowwhatyoudownload.com/en/peer/?ip=${ip}`;
    const flaresolverrUrl = process.env.FLARESOLVERR_URL || 'http://localhost:8191';

    const res = await fetch(`${flaresolverrUrl}/v1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cmd: 'request.get',
            url,
            maxTimeout: 45000,
        }),
    });

    if (!res.ok) {
        throw new Error(`FlareSolverr HTTP ${res.status}`);
    }

    const data = (await res.json()) as FlareSolverrResponse;
    if (data.status !== 'ok' || !data.solution?.response) {
        throw new Error(`FlareSolverr error: ${data.message || 'no response'}`);
    }

    return data.solution.response;
}
