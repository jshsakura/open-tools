# Open Tools - Open Source Developer Platform

## 📋 Overview

Open Tools is a comprehensive, free-to-use developer utilities platform built with modern web technologies. It provides 45+ specialized tools organized across 5 major categories, all designed to run securely in your browser without requiring server-side processing for sensitive operations.

**Tech Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS
**Architecture:** Client-first processing with selective server APIs
**Internationalization:** Multi-language support (English, Korean)

---

## 🛠️ Tool Categories & Features

### 🔒 Security & Encryption (6 Tools)

#### **AES Encryption**
- **Algorithm:** AES-GCM (Galois/Counter Mode)
- **Features:** Secure client-side encryption and decryption
- **Use Case:** Protect sensitive text data with military-grade encryption

#### **Bcrypt Generator**
- **Algorithm:** Bcrypt with configurable cost factor
- **Features:** Generate password hashes and verify existing hashes
- **Use Case:** Secure password storage and authentication systems

#### **HMAC Generator**
- **Algorithms:** MD5, SHA1, SHA256
- **Features:** Key-based message authentication codes
- **Use Case:** API request signing and message integrity verification

#### **RSA Key Generator**
- **Format:** PEM (Privacy Enhanced Mail)
- **Features:** Generate public/private key pairs
- **Use Case:** Asymmetric encryption and digital signatures

#### **JWT Debugger**
- **Support:** JSON Web Token decoding and validation
- **Features:** Parse headers, payloads, and signatures
- **Use Case:** Analyze and debug JWT tokens for authentication systems

#### **Hash Generator**
- **Algorithms:** MD5, SHA-1, SHA-256, SHA-512
- **Features:** Client-side hash computation
- **Use Case:** File integrity checks and data fingerprinting

---

### 🎬 Media Processing (8 Tools)

#### **AI Background Remover**
- **Technology:** @imgly/background-removal with ONNX Runtime
- **Features:** Browser-based AI inference for precise object segmentation
- **Use Case:** Extract objects from images for design and e-commerce

#### **Image Converter**
- **Formats:** PNG, JPG, WebP, AVIF
- **Features:** Batch conversion with compression options
- **Use Case:** Optimize images for web and mobile applications

#### **Image Compressor**
- **Technology:** browser-image-compression
- **Features:** Reduce file size while maintaining quality
- **Use Case:** Image optimization for faster loading times

#### **Local Video Encoder (WASM)**
- **Technology:** FFmpeg compiled to WebAssembly
- **Formats:** MP4, MP3, GIF
- **Features:** Browser-based video conversion without server uploads
- **Use Case:** Privacy-focused video processing

#### **YouTube Downloader**
- **Technology:** Puppeteer + FFmpeg WASM
- **Features:** Download video, audio, and subtitles with quality selection
- **Processing:** Browser-side fetching and merging
- **Use Case:** Save YouTube content for offline viewing

#### **YouTube Thumbnail Extractor**
- **Features:** Extract high-res thumbnails (maxresdefault, sddefault, etc.)
- **Use Case:** Preview and download video thumbnails

#### **Suno AI Downloader**
- **Technology:** Suno.com API integration
- **Features:** High-quality MP3 download from sharing links
- **Use Case:** Save AI-generated music from Suno platform

#### **3D Model Viewer**
- **Technology:** Three.js + three-stdlib
- **Formats:** OBJ, STL, GLTF/GLB
- **Features:** Interactive 3D rendering with camera controls
- **Use Case:** Preview and analyze 3D models directly in browser

---

### 🎨 Design & CSS Tools (7 Tools)

#### **Border Radius Generator**
- **Features:** Visual control for individual corner values
- **Output:** CSS code with real-time preview
- **Use Case:** Create complex border-radius shapes

#### **Box Shadow Generator**
- **Features:** Intensity, color, offset, blur, and spread controls
- **Output:** CSS box-shadow property
- **Use Case:** Design depth and elevation effects

#### **CSS Gradient Generator**
- **Types:** Linear and radial gradients
- **Features:** Color stops, angle, and position controls
- **Output:** CSS background property
- **Use Case:** Create modern gradient backgrounds

#### **Color Palette Extractor**
- **Technology:** Canvas API color quantization
- **Features:** Extract dominant and complementary colors
- **Use Case:** Design system creation and color harmony

#### **Glassmorphism Generator**
- **Features:** Blur, opacity, border, and background controls
- **Output:** CSS for frosted-glass effects
- **Use Case:** Modern UI design with glass effects

#### **Favicon Generator**
- **Output:** Multi-format favicons (ICO, PNG, SVG)
- **Features:** Generate complete favicon sets for all platforms
- **Use Case:** Web application branding

#### **Banner Generator (Spring Boot)**
- **Technology:** Figlet ASCII art library
- **Features:** ANSI color support for terminal output
- **Use Case:** Create colorful ASCII art banners for Spring Boot apps

---

### 💻 Development & Utilities (15 Tools)

#### **JSON ↔ YAML Converter**
- **Technology:** js-yaml parser
- **Features:** Two-way conversion with syntax highlighting
- **Use Case:** Configuration file transformation

#### **SQL to JSON/CSV Converter**
- **Features:** Parse SQL INSERT statements to structured data
- **Output:** JSON or CSV format
- **Use Case:** Database export and data migration

#### **SQL Formatter**
- **Technology:** sql-formatter
- **Features:** Beautify and format SQL queries
- **Use Case:** Improve code readability

#### **XML Formatter & Validator**
- **Features:** Format XML with indentation, validate structure
- **Output:** Clean XML with JSON conversion option
- **Use Case:** XML processing and debugging

#### **Base64 Encoder/Decoder**
- **Features:** Real-time encoding/decoding with clipboard support
- **Use Case:** Data encoding for URLs and APIs

#### **Base64 Image Viewer**
- **Features:** Decode and preview base64 image strings
- **Use Case:** Debug encoded image data

#### **URL Encoder/Decoder**
- **Features:** URL-safe encoding with special character handling
- **Use Case:** Prepare data for HTTP requests

#### **SVG to JSX Converter**
- **Features:** Transform raw SVG to React JSX components
- **Output:** Typed React component code
- **Use Case:** Integrate SVG assets in React applications

#### **Regex Tester**
- **Features:** Real-time matching with group extraction
- **Highlighting:** Match highlighting and error detection
- **Use Case:** Develop and debug regular expressions

#### **Cron Expression Generator**
- **Technology:** cronstrue for human-readable descriptions
- **Features:** Build cron jobs with next execution time preview
- **Use Case:** Schedule automated tasks

#### **Unit Converter**
- **Categories:** Data (MB/GB), CSS (PX/REM), and more
- **Features:** Multi-unit conversion
- **Use Case:** Convert measurements across different systems

#### **QR Code Generator**
- **Features:** Custom colors, sizes, and error correction levels
- **Output:** High-quality QR code images
- **Use Case:** Generate QR codes for links, WiFi, contact info

#### **Developer Tools Suite**
- **Docker Converter:** Convert docker run commands to docker-compose
- **Chmod Calculator:** Calculate file permission modes
- **Business Validator:** Korean business number validation

---

### 🔌 Network & System Tools (7 Tools)

#### **My IP & Location**
- **Features:** Public IP detection, ISP lookup, geolocation
- **Data Source:** IP geolocation APIs
- **Use Case:** Network diagnostics and security checks

#### **Browser Info Analyzer**
- **Features:** Browser version, OS, screen resolution, User Agent
- **Use Case:** Device and environment detection

#### **Port Scanner**
- **Technology:** Server-side port checking
- **Features:** Check open ports on local network
- **Use Case:** Network security assessment

#### **Network Speed Test**
- **Features:** Download, upload speed, and ping measurement
- **Technology:** Browser-based network performance API
- **Use Case:** Internet connection quality assessment

#### **IP Torrent History Check**
- **Features:** Analyze public IP for torrent traces
- **Data Source:** Torrent tracking databases
- **Use Case:** Privacy and security risk assessment

---

### 📄 Document & File Tools (4 Tools)

#### **PDF Tools Suite**

**PDF Merge**
- **Features:** Combine multiple PDFs into one
- **Technology:** pdf-lib
- **Use Case:** Document consolidation

**PDF Split**
- **Features:** Extract specific pages from PDFs
- **Technology:** pdf-lib
- **Use Case:** Document segmentation

**PDF to Image**
- **Features:** Convert PDF pages to JPG/PNG
- **Technology:** pdfjs-dist
- **Use Case:** Preview and share PDF content as images

#### **Document Viewer**
- **Formats:** HWP (Korean), DOCX
- **Technology:** hwp.js, docx-preview
- **Use Case:** Preview documents without desktop software

---

### 🧩 Data & Text Processing (3 Tools)

#### **Data Tools Suite**
- **JSON/CSV/Excel Converter:** Cross-format data conversion
- **SQL Formatter:** Query beautification
- **URL Slug Generator:** SEO-friendly URL creation

#### **Text Tools Suite**
- **OCR Tool:** Extract text from images using Tesseract.js
- **Lorem Ipsum Generator:** Generate placeholder text
- **Hangul Processor:** Korean text processing (es-hangul)

#### **K-Series Tools (Korean)**
- **JSON Converter:** JSON to Korean-specific formats
- **Slug Generator:** Korean URL slug creation with transliteration

---

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

### Docker Support
- **Multi-stage Build:** Optimized production images
- **Port:** 3033 (configurable)
- **Environment Variables:** External API keys (optional)

### CI/CD
- **GitHub Actions:** Automated Docker image publishing
- **Automated Builds:** Triggered on push to main branch

### Environment Configuration
```bash
PORT=3033              # Application port
NODE_ENV=production    # Environment mode
```

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

| Category | Tool Count | Primary Features |
|----------|------------|-----------------|
| Security & Encryption | 6 | AES, RSA, Bcrypt, JWT, HMAC, Hashing |
| Media Processing | 8 | Video, Image, Audio, 3D, AI Background Removal |
| Design & CSS | 7 | Border Radius, Shadows, Gradients, Colors, Favicons |
| Development & Utilities | 15 | Converters, Generators, Formatters, Validators |
| Network & System | 7 | IP, Port Scanner, Speed Test, Browser Info |
| Documents & Files | 4 | PDF Merge/Split/Convert, Document Viewer |
| Data & Text Processing | 3 | OCR, Data Conversion, Text Processing |
| **Total** | **45+** | Comprehensive developer toolkit |

---

## 🎨 Project Highlights

### Modern Web Technologies
- **WebAssembly:** High-performance client-side video processing
- **AI/ML:** Background removal and OCR in browser
- **Progressive Web App:** Fast, responsive, mobile-friendly
- **Dark Mode:** Automatic theme detection and switching

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
docker run -p 3033:3033 open-tools
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
