import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

export async function scrapeTorrentHistory(ip: string): Promise<string> {
    if (!ip) {
        throw new Error('IP address required');
    }

    const url = `https://iknowwhatyoudownload.com/en/peer/?ip=${ip}`;
    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;

    try {
        let executablePath: string | undefined = undefined;

        if (process.platform === 'linux') {
            const possiblePaths = [
                '/usr/bin/chromium-browser',
                '/usr/bin/chromium',
                '/usr/bin/google-chrome-stable',
            ];

            for (const path of possiblePaths) {
                if (fs.existsSync(path)) {
                    executablePath = path;
                    break;
                }
            }
        }

        browser = await puppeteer.launch({
            headless: true,
            executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        try {
            await page.waitForSelector('.table-responsive', { timeout: 10000 });
        } catch {
            // If the table is missing, still return the HTML.
        }

        return await page.content();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Scraping Error: ${message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
