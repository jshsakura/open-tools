# Open Tools - Open Source Developer Platform

## 📋 Overview

Open Tools is a comprehensive, free-to-use developer utilities platform built with modern web technologies. It currently ships **103 live tool routes**, and the homepage catalog in `src/lib/tools-catalog.ts` now covers all of them across 6 primary categories with an `AI` overlay tag for browser-side AI workflows.

**Tech Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS
**Architecture:** Client-first processing with selective server APIs
**Internationalization:** Multi-language support (English, Korean)

Recent UX updates include a **personalized popular-tools ranking**: tools you use more often rise toward the front of the homepage catalog in your browser and display a small star badge on their card icon.

---

## 🛠️ Current Tool Catalog

The live homepage catalog in `src/lib/tools-catalog.ts` currently defines **103 tools**, matching the full set of shipped `/tools/*` routes. The homepage uses six primary tags (`Development`, `Image`, `Video`, `Design`, `Security`, `Utilities`) plus an `AI` overlay tag for local AI workflows.

### Category Snapshot

| Category | Count | Notes |
|----------|-------|-------|
| Development | 32 | Formatters, converters, generators, API tooling, SEO helpers, and developer suites |
| Image | 13 | Conversion, cleanup, metadata, collage, crop, meme, and watermark workflows |
| Video | 4 | Suno, YouTube, local encoding, and 3D model preview |
| Design | 14 | CSS generators, color tooling, SVG helpers, favicon creation, and screenshot polish |
| Security | 12 | Encryption, hashing, JWT, passwords, passphrases, ports, and torrent-risk lookup |
| Utilities | 28 | OCR, PDFs, DNS/IP tools, timers, Korean-language helpers, and general-purpose workflows |
| AI (overlay) | 2 | Applied to browser-side image cleanup tools |

### Development (32)

- **.env File Editor** (`env-editor`): Edit environment variable files (.env) and compare differences between two files side by side.
- **API Tester** (`webhook-tester`): Send REST API requests directly from your browser and analyze responses with an HTTP client tool.
- **Base64 Encoder/Decoder** (`base64-converter`): Convert between text and Base64 in real-time with clipboard support.
- **CSS Minifier / Beautifier** (`css-minifier`): Minify or beautify CSS code with size comparison and instant copy.
- **CURL to Code Converter** (`curl-to-code`): Convert CURL commands into ready-to-use code for JavaScript Fetch, Axios, Python Requests, and more.
- **Code Formatter & Beautifier** (`code-formatter`): Instantly format and beautify JavaScript, TypeScript, JSON, CSS, HTML, and SQL. Configurable indent size, semicolons, and one-click minification.
- **Cron Expression Generator** (`cron-generator`): Create and verify cron jobs with human-readable descriptions and next execution times.
- **Data Tools Suite** (`data-tools`): JSON/CSV/Excel conversion, SQL formatting, and Slug generation.
- **Developer Tools** (`dev-tools`): Collection of developer utilities including Docker, permissions, and validation.
- **Git Diff Viewer** (`git-diff-viewer`): Paste git diff or unified diff output to visualize changes with syntax highlighting.
- **HTML Entity Encoder / Decoder** (`html-entity-encoder`): Encode special characters to HTML entities and decode them back instantly.
- **HTML to JSX Converter** (`html-to-jsx`): Transform standard HTML code into React-compatible JSX. Automatically handles attribute mapping like class to className.
- **HTTP Header Analyzer** (`http-header-analyzer`): Analyze HTTP response headers from any URL and score security header configuration.
- **JSON Formatter & Converter** (`json-formatter`): Format, validate, and convert JSON to YAML, CSV, and TypeScript types instantly.
- **JSON ↔ YAML Converter** (`json-yaml-converter`): Fast and clean conversion between JSON and YAML formats with syntax highlighting.
- **JSON to TypeScript/Zod** (`json-to-types`): Automatically generate TypeScript interfaces and Zod schemas from your JSON data with custom naming.
- **JSON-LD Schema Generator** (`json-ld-generator`): Generate structured data (JSON-LD) for SEO. Supports Article, Product, FAQ, and more schema types.
- **Meta Tag Generator** (`meta-tag-generator`): Generate SEO-optimized HTML meta tags, Open Graph, and Twitter Card code automatically.
- **Number Base Converter** (`number-base-converter`): Convert numbers between Binary, Octal, Decimal, and Hexadecimal with BigInt support.
- **RegEx Tester** (`regex-tester`): Test and debug your regular expressions with real-time highlighting and group extraction.
- **Robots.txt Generator** (`robots-txt-generator`): Create robots.txt files for search engine crawlers with preset templates.
- **SQL Formatter & Beautifier** (`sql-formatter`): Format and beautify SQL queries instantly for cleaner debugging, reviews, and sharing.
- **SQL to JSON/CSV Converter** (`sql-converter`): Transform SQL INSERT statements into clean JSON or CSV data formats locally.
- **SVG to JSX Converter** (`svg-to-jsx`): Transform raw SVG code into high-quality, typed React components instantly.
- **Sitemap Generator** (`sitemap-generator`): Add URLs and generate XML sitemap files to improve search engine indexing.
- **Spring Boot Banner Generator** (`banner-generator`): Create stunning ASCII art banners with ANSI colors for your Spring Boot applications.
- **String Case Converter** (`string-case-converter`): Convert text between camelCase, PascalCase, snake_case, kebab-case and 8 more formats.
- **TOML/INI Converter** (`toml-converter`): Convert between TOML, INI, and JSON formats with auto-detection and live preview.
- **UUID Generator** (`uuid-generator`): Generate UUID v4 and v7 with bulk generation and clipboard support.
- **Unix Timestamp Converter** (`unix-timestamp`): Two-way conversion between Unix timestamps and human-readable dates.
- **XML Formatter & Validator** (`xml-formatter`): Format, validate, and convert XML to JSON with real-time error detection.
- **YAML / JSON Converter** (`yaml-converter`): Convert between YAML and JSON formats with ease. Supports nested structures and error highlighting.

### Image (13)

- **AI Background Remover** (`background-remover`): Experience sophisticated AI-powered background removal directly in your browser.
- **AI Image Eraser** (`image-eraser`): Brush over logos, stamps, or small distractions and erase them locally with WebGPU or WASM.
- **Base64 Image Viewer** (`base64-image`): Safely decode, preview, and analyze base64 encoded image strings.
- **Image Compressor** (`image-compressor`): Reduce image file size and optimize quality directly in your browser.
- **Image Cropper** (`image-cropper`): Precisely crop, rotate, and flip images with 6 aspect ratio presets and rule-of-thirds grid overlay. All processing happens locally.
- **Image EXIF Viewer & Remover** (`exif-viewer`): View and remove EXIF metadata (camera, GPS, date) from images for privacy protection.
- **Image Filter & Effects** (`image-filters`): Transform photos with 8 one-click presets (Vintage, B&W, Vivid, etc.) and fine-tune brightness, contrast, saturation, blur, sepia, and more.
- **Image Format Converter** (`image-converter`): Batch convert images between PNG, JPG, WebP, and AVIF with compression options.
- **Image Resizer** (`image-resizer`): Resize images to custom or preset dimensions for social media platforms.
- **Image Watermark** (`image-watermark`): Protect your images with custom text watermarks. Supports single placement, tiled patterns, adjustable opacity, font size, and color.
- **Meme Generator** (`meme-generator`): Create viral-ready memes with classic Impact font text. Customize font size, stroke width, colors, and download as high-quality PNG.
- **Photo Collage Maker** (`collage-maker`): Combine multiple photos into stunning collages. Choose from 6 grid layouts, adjust gaps, rounded corners, background color, and export up to 3000px.
- **YouTube Thumbnail Extractor** (`youtube-thumbnail`): Get high-resolution thumbnails from any YouTube video URL instantly.

### Video (4)

- **3D Model Viewer** (`3d-viewer`): Preview and analyze 3D models (OBJ, STL, GLTF/GLB) directly in your browser.
- **Local Video Encoder (WASM)** (`video-converter`): Convert video to MP4/MP3/GIF locally in your browser. Privacy focused, no uploads.
- **Suno AI Downloader** (`suno-downloader`): Download Suno.com songs easily by pasting sharing link. High-quality MP3 download.
- **YouTube Downloader** (`youtube-downloader`): High-quality YouTube video and audio downloader. Processed safely in your browser.

### Design (14)

- **CSS Border Radius Generator** (`border-radius-generator`): Create complex CSS border-radius values visually with real-time feedback.
- **CSS Box Shadow Generator** (`box-shadow-generator`): Design sleek CSS box shadow effects with control over intensity, color, and offset.
- **CSS Glassmorphism Generator** (`glassmorphism`): Design sleek frosted-glass UI elements with real-time CSS code generation.
- **CSS Gradient Generator** (`css-gradient-generator`): Visually generate linear and radial CSS gradients and copy the resulting code.
- **Color Converter** (`color-converter`): Convert colors between HEX, RGB, and HSL formats with live preview and related colors.
- **Color Name Finder** (`color-name-finder`): Pick any color to see its closest named match, live HEX/RGB values, and one-click copy support.
- **Color Palette Extractor** (`color-palette`): Extract harmonious color palettes from any image using the Canvas API.
- **Favicon Generator** (`favicon-generator`): Generate multi-format favicons (ICO, PNG) from any image or text snippet.
- **CSS Pattern Generator** (`css-pattern`): Create beautiful geometric background patterns using only CSS. Copy code for stripes, dots, and grids.
- **Direct ICO Converter** (`ico-converter`): Convert PNG, JPG, or SVG images directly into .ico favicon files for your website or app.
- **Image Color Picker** (`color-picker`): Extract precise colors from any image with a pixel-level magnifying loupe. Pick multiple colors and copy HEX, RGB, HSL values instantly.
- **SVG Optimizer** (`svg-optimizer`): Optimize and minify SVG files by removing unnecessary data and reducing file size.
- **SVG Path Visualizer** (`svg-visualizer`): Visualize and edit SVG path data (d attribute). See how changes to coordinates affect the drawing in real-time.
- **Screenshot Beautifier** (`screenshot-beautifier`): Add device frames, backgrounds, and shadows to your screenshots for beautiful exports.

### Security (12)

- **AES-256 Encryption & Decryption** (`aes-crypto`): Military-grade AES-256-GCM encryption with PBKDF2 key derivation. Encrypt and decrypt text 100% locally in your browser — no server uploads.
- **Bcrypt Generator** (`bcrypt-generator`): Generate and verify Bcrypt passwords hashes for secure authentication.
- **Diceware Passphrase Generator** (`passphrase-generator`): Generate highly secure yet memorable passwords using random word combinations (Diceware method).
- **HMAC Generator** (`hmac-generator`): Create Hash-based Message Authentication Codes (MD5, SHA1, SHA256).
- **Hash Generator** (`hash-generator`): Calculate MD5, SHA-1, SHA-256, and SHA-512 hashes client-side.
- **IP Torrent History Check** (`torrent-history`): Analyze your public IP address to see torrent download traces and potential security risks.
- **JWT Debugger** (`jwt-debugger`): Decode and analyze JSON Web Tokens locally. Check headers, payloads, and signatures.
- **Local Port Scanner** (`port-scanner`): Check if specific ports on your network or local machine are open and responsive.
- **Password Generator** (`password-generator`): Generate secure random passwords with customizable length, characters, and strength meter.
- **Password Strength Analyzer** (`password-strength`): Evaluate the security of your passwords with entropy analysis and estimated time to crack.
- **RSA Key Generator** (`rsa-generator`): Generate RSA Public and Private Key pairs (PEM format).
- **Security & Encryption** (`security-tools`): Suite of security tools including AES, RSA, Bcrypt, JWT, HMAC, and Hashing.

### Utilities (28)

- **CSV Editor** (`csv-editor`): Edit CSV data in an intuitive spreadsheet-like table. Import CSV files, add/remove rows and columns, and export as CSV or JSON.
- **Document Viewer** (`hwp-viewer`): Instantly view HWP and DOCX files in your browser.
- **Domain / DNS Lookup** (`whois-lookup`): Look up DNS records (A, AAAA, MX, NS, TXT, SOA) for any domain name.
- **IP Subnet Calculator** (`subnet-calculator`): Calculate network address, broadcast, subnet mask, and usable host range from IP/CIDR.
- **Image to Text (OCR)** (`ocr`): Extract text from images instantly using Tesseract OCR. Supports Korean, English, Japanese, and Chinese.
- **Korean Tools Suite** (`k-series`): A collection of useful tools tailored for Korean users and services.
- **List Sorter & Deduplicator** (`list-sorter`): Organize text lists by sorting alphabetically, removing duplicates, and cleaning whitespace instantly.
- **Loan & Mortgage Calculator** (`loan-calculator`): Calculate monthly payments, total interest, and view a detailed amortization schedule for different repayment types.
- **Markdown Preview** (`markdown-preview`): Write Markdown and instantly preview the rendered HTML output side by side.
- **Markdown to PDF** (`markdown-to-pdf`): Write Markdown with a live side-by-side preview and export to beautifully styled PDF. Supports tables, code blocks, blockquotes, and more.
- **Merge PDF** (`pdf-merge`): Combine multiple PDF files into one for free. No file limits.
- **Morse Code Converter** (`morse-converter`): Translate text to Morse code and vice versa. Includes audio playback and visual signal support.
- **My IP & Location** (`my-ip`): Instantly check your public IP address, ISP, and detailed geographic location.
- **Network Speed Test** (`speed-test`): Measure your internet download, upload speeds, and ping latency in real-time.
- **PDF to Image** (`pdf-to-image`): Convert PDF pages to high-quality JPG or PNG images.
- **PDF Tools** (`pdf-tools`): All-in-one PDF utilities: Merge, Split, and Convert to Image.
- **Pomodoro Focus Timer** (`pomodoro-timer`): Boost productivity with the Pomodoro technique. Circular progress timer, customizable work/break durations, sound alerts, and session tracking.
- **QR Code Generator** (`qr-generator`): Generate customizable QR codes for URLs, text, email, and phone numbers.
- **Split PDF** (`pdf-split`): Extract specific pages from a PDF file quickly.
- **Text & Content Suite** (`text-tools`): Lorem Ipsum generator and Hangul processing tools.
- **Text Diff** (`text-diff`): Compare two texts side-by-side with line and word-level diff highlighting.
- **Text Similarity Checker** (`text-similarity`): Compare two texts and calculate their similarity percentage using advanced string algorithms.
- **Text to Speech (TTS)** (`text-to-speech`): Convert text to natural speech with voice selection, speed, and pitch controls.
- **URL Encoder/Decoder** (`url-converter`): Safe and fast URL encoding/decoding for developers.
- **Unit Converter** (`unit-converter`): Convert between various units including Data (MB to GB), CSS (PX to REM), and more.
- **Visual Time Zone Converter** (`time-zone-converter`): Compare times across different cities worldwide. Visual slider to see how time shifts across zones.
- **What is my Browser?** (`browser-info`): Analyze your browser version, OS, screen resolution, and user agent details.
- **Word Counter** (`word-counter`): Count words, characters, sentences, paragraphs and estimate reading time instantly.

### AI Overlay (2)

- **AI Background Remover** (`background-remover`): Experience sophisticated AI-powered background removal directly in your browser.
- **AI Image Eraser** (`image-eraser`): Brush over logos, stamps, or small distractions and erase them locally with WebGPU or WASM.

## 🔧 Technical Capabilities

### Client-Side Processing
Most tools process data entirely in browser for privacy and performance:
- **Cryptography:** AES, RSA, HMAC, Hash generation
- **Media:** Video conversion (FFmpeg WASM), image processing
- **Data:** JSON/YAML conversion, XML formatting
- **AI:** Background removal, OCR (Tesseract.js)

### Server-Side APIs
Selective server endpoints for browser-restricted operations:
- **Port Scanning:** Check network port availability
- **CORS Proxy:** Bypass cross-origin restrictions
- **YouTube Processing:** Video metadata and extraction
- **Torrent History:** IP-based lookup services

### Key Libraries & Technologies

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **UI Components** | Shadcn UI, Framer Motion, Lucide Icons |
| **Media Processing** | FFmpeg WASM, PDF.js, PDF-lib, Tesseract.js |
| **3D Rendering** | Three.js, three-stdlib |
| **AI/ML** | @imgly/background-removal, ONNX Runtime, Vercel AI SDK |
| **Cryptography** | bcryptjs, crypto-js, node-forge |
| **Data Processing** | XLSX, PapaParse, sql-formatter, js-yaml |
| **Web Scraping** | Puppeteer, Puppeteer Extra (stealth) |
| **Utilities** | QR Code, Figlet, Cron Parser, Diff |

---

## 🌐 Architecture Highlights

### Privacy-First Design
- **No Data Storage:** All client-side processing stays in browser
- **No Tracking:** No user data collection or analytics
- **Local Personalization Only:** Popular-tool ranking is stored in browser localStorage per user
- **Local Processing:** Sensitive operations never leave device

### Performance Optimization
- **Static Generation:** Next.js static site generation where possible
- **Lazy Loading:** Tools load on-demand
- **WASM:** High-performance client-side processing
- **CDN Delivery:** Optimized asset delivery

### Internationalization
- **Languages:** English, Korean (extensible)
- **Framework:** next-intl for locale-aware routing
- **User Preferences:** Browser-based language detection

### Modern Development Practices
- **TypeScript:** Full type safety
- **ESLint:** Code quality enforcement
- **Tailwind CSS:** Utility-first styling
- **Component-Based:** Reusable UI components
- **Docker Ready:** Containerized deployment

---

## 📦 Deployment

### GitHub Actions (Automated Docker Publishing)

The project uses GitHub Actions to automatically build and publish Docker images to Docker Hub with multi-architecture support (amd64 + arm64).

**Setup Required:**

1. **Generate Docker Hub Access Token:**
   - Go to [Docker Hub Account Settings](https://hub.docker.com/settings/security)
   - Navigate to **Security > Access Tokens**
   - Click **New Access Token**
   - Set permissions: `Read, Write, Delete`
   - Copy the generated token

2. **Configure GitHub Secrets:**
   - Go to your repository **Settings > Secrets and variables > Actions**
   - Add the following secrets:
     - `DOCKERHUB_USERNAME`: Your Docker Hub username
     - `DOCKERHUB_TOKEN`: The access token generated above

**Triggering Builds:**

- **Push to main:** Builds and pushes `latest` tag
- **Push tags:** Builds versioned tags (e.g., `v1.0.0` → `1.0.0`, `1.0`, `1`)
- **Manual:** Trigger via GitHub Actions UI

**Build Features:**
- Multi-architecture: `linux/amd64` and `linux/arm64`
- BuildKit caching for faster builds
- GitHub Actions cache optimization

### Docker Compose

Quick deployment using Docker Compose:

```bash
# Option 1: Using env file
cp .env.example .env
# Edit .env with your DOCKERHUB_USERNAME and local DATABASE_VOLUME_PATH if needed
docker-compose up -d

# Option 2: Override at runtime
DOCKERHUB_USERNAME=your-username IMAGE_TAG=latest DATABASE_VOLUME_PATH=./data docker-compose up -d
```

**Environment Variables (Docker Compose):**

```bash
# Required for image pull
DOCKERHUB_USERNAME=your-dockerhub-username  # Your Docker Hub username
IMAGE_TAG=latest                             # Version tag (default: latest)

# Optional: Application config
NODE_ENV=production                         # Environment mode
PORT=3033                                  # Application port
DATABASE_PATH=/app/data/database.db        # SQLite database file path for persistent app data
DATABASE_VOLUME_PATH=./data                # Local host directory mounted into /app/data
```

**SQLite data persistence:**

- The app stores server-side SQLite data in a local database file.
- In Docker Compose, the app stores that file at `/app/data/database.db` and bind-mounts a local host directory such as `./data` into `/app/data`.
- Keep `DATABASE_PATH=/app/data/database.db` and set `DATABASE_VOLUME_PATH=./data` (or another local path) when you want that database to survive container recreation or image updates.

**Resource Limits (Docker Compose):**

```yaml
resources:
  limits:
    cpus: '2'
    memory: 2G
  reservations:
    cpus: '0.5'
    memory: 512M
```

### Manual Docker Build

```bash
# Build for current architecture
docker build -t open-tools .

# Build for multiple architectures (requires buildx)
docker buildx build --platform linux/amd64,linux/arm64 -t open-tools .

# Run container with persistent app database
docker run -p 3033:3033 \
  --env NODE_ENV=production \
  --env DATABASE_PATH=/app/data/database.db \
  --volume "$(pwd)/data:/app/data" \
  open-tools
```

### Environment Configuration

- `DATABASE_PATH` is optional in local development. If unset, the app falls back to `database.db` in the project root.
- In Docker Compose, `DATABASE_VOLUME_PATH` controls which local host directory is mounted into `/app/data`.
- For Docker deployments, set `DATABASE_PATH=/app/data/database.db` and `DATABASE_VOLUME_PATH=./data` (or your preferred local path) to persist the SQLite file.

---

## 🎯 Use Cases

### For Developers
- Debug and validate JWT tokens, regular expressions, and cron expressions
- Convert data formats (JSON, YAML, CSV, XML, SQL)
- Generate code snippets (CSS gradients, shadows, SVG components)
- Test network performance and connectivity

### For Designers
- Extract color palettes from images
- Generate CSS effects (glassmorphism, shadows, gradients)
- Create favicons and UI elements
- Preview 3D models

### For Security Professionals
- Generate encryption keys and hashes
- Verify message authenticity (HMAC)
- Check IP addresses and port availability
- Analyze torrent history for risk assessment

### For Content Creators
- Download and convert media content
- Remove backgrounds from images
- Extract text from images (OCR)
- Generate QR codes for sharing

---

## 🔒 Privacy & Security

- **Client-First:** Sensitive operations process locally
- **No Data Retention:** No user data storage
- **Open Source:** Code available for audit
- **HTTPS Only:** Encrypted connections
- **No Third-Party Tracking:** No analytics or user tracking

---

## 🤝 Technology Stack Details

### Frontend Framework
- **Next.js 16.1.6:** App Router, Server Components, Static Generation
- **React 19.2.3:** Concurrent features, Server Actions
- **TypeScript 5:** Type safety and developer experience

### Styling & UI
- **Tailwind CSS 4:** Utility-first CSS framework
- **Shadcn UI:** Accessible, customizable component library
- **Framer Motion:** Animation library for smooth interactions
- **Lucide React:** Consistent icon system

### Internationalization
- **next-intl 4.8.2:** Locale-aware routing and translations
- **Supported Languages:** English, Korean

### Build & Deployment
- **Docker:** Containerization with multi-stage builds
- **GitHub Actions:** Automated CI/CD pipeline
- **ESLint:** Code quality and consistency

---

## 📊 Tool Statistics

| Group | Count | Coverage |
|------|------:|----------|
| Development | 32 | Formatters, converters, generators, API tooling, SEO helpers, and developer suites |
| Utilities | 28 | OCR, PDFs, document viewing, DNS/IP/network checks, Korean-language helpers, and general workflows |
| Image | 13 | Conversion, compression, cleanup, metadata, crop, collage, watermarking, and meme creation |
| Design | 14 | CSS generators, palette tools, favicon creation, SVG optimization, visualization, and screenshot polish |
| Security | 12 | Encryption, hashing, JWT, passwords, passphrases, ports, and torrent-risk inspection |
| Video | 4 | Suno, YouTube, local encoding, and 3D model preview |
| AI overlay* | 2 | Local AI-assisted image cleanup tools |
| **Homepage catalog total** | **103** | Live catalog defined in `src/lib/tools-catalog.ts` |
| **Full shipped route total** | **103** | Homepage catalog matches all live `/tools/*` routes |

\* `AI` is a secondary overlay tag, so those tools are already counted in their primary category totals.

---

## 🎨 Project Highlights

### Modern Web Technologies
- **WebAssembly:** High-performance client-side video processing
- **AI/ML:** Background removal and OCR in browser
- **Progressive Web App:** Fast, responsive, mobile-friendly
- **Dark Mode:** Automatic theme detection and switching
- **Personalized Catalog:** Frequently used tools float upward locally with a star badge

### Developer Experience
- **Hot Reload:** Instant development feedback
- **Type Safety:** Full TypeScript coverage
- **Component Library:** Reusable Shadcn UI components
- **API Routes:** Backend capabilities for specific needs

### Performance
- **Static Generation:** Pre-rendered pages for instant loading
- **Code Splitting:** Optimize bundle size
- **Lazy Loading:** Load tools on-demand
- **Image Optimization:** Next.js automatic optimization

---

## 🚀 Getting Started

### Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3033](http://localhost:3033) with your browser to see the result.

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t open-tools .
docker run -p 3033:3033 \
  --env DATABASE_PATH=/app/data/database.db \
  --volume "$(pwd)/data:/app/data" \
  open-tools
```

Or use Docker Compose:

```bash
docker-compose up -d
```

---

## 📝 License

This is an open-source project. See LICENSE file for details.

---

**Built with ❤️ using Next.js, React, and modern web technologies**
