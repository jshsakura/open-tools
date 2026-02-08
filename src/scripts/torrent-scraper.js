const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function scrape(ip) {
    if (!ip) {
        console.error("Error: IP address required");
        process.exit(1);
    }

    const url = `https://iknowwhatyoudownload.com/en/peer/?ip=${ip}`;
    let browser;

    try {
        // Detect executable path for OCI A1 (ARM64) support
        // On ARM64 Linux, the bundled Chromium (x86) won't work.
        // We must use the system-installed Chromium.
        let executablePath = undefined; // Use bundled by default (Mac/Win)

        if (process.platform === 'linux') {
            const fs = require('fs');
            const possiblePaths = [
                '/usr/bin/chromium-browser', // Ubuntu/Debian
                '/usr/bin/chromium',         // Alpine/Arch/Oracle Linux
                '/usr/bin/google-chrome-stable'
            ];

            for (const path of possiblePaths) {
                if (fs.existsSync(path)) {
                    executablePath = path;
                    console.error(`[INFO] Using system Chromium: ${path}`);
                    break;
                }
            }
        }

        browser = await puppeteer.launch({
            headless: "new",
            executablePath, // Will be undefined locally (bundled), specific path on Linux
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Set a realistic viewport
        await page.setViewport({ width: 1366, height: 768 });

        // Navigate
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for potential Cloudflare challenge or content
        // If we see the table, we are good.
        try {
            await page.waitForSelector('.table-responsive', { timeout: 10000 });
        } catch (e) {
            // If table not found, maybe just print content anyway, could be empty result or still loading
        }

        const content = await page.content();
        console.log(content);

    } catch (error) {
        console.error("Scraping Error:", error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

const args = process.argv.slice(2);
scrape(args[0]);
