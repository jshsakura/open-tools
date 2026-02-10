import {
    Music,
    Database,
    Ruler,
    FileJson,
    ShieldCheck,
    Regex,
    Clock,
    MonitorPlay,
    Video,
    Image as ImageIcon,
    Sparkles,
    LayoutGrid,
    Zap,
    Search,
    Info,
    Globe,
    FileCode,
    Terminal,
    QrCode,
    Wand2,
    Link,
    Minimize2,
    Maximize,
    FileText,
    Files,
    Box,
    ScanText,
    Layers,
    Fingerprint
} from "lucide-react"
import { YouTubeIcon } from "@/components/icons/youtube-icon"

export const toolsCatalog = [
    {
        id: "torrent-history",
        titleKey: "Catalog.TorrentHistory.title",
        descriptionKey: "Catalog.TorrentHistory.description",
        icon: Fingerprint,
        href: "/tools/torrent-history",
        color: "text-red-600",
        tags: ["Security"]
    },
    {
        id: "security-tools",
        titleKey: "Catalog.SecurityTools.title",
        descriptionKey: "Catalog.SecurityTools.description",
        icon: ShieldCheck,
        href: "/tools/security-tools",
        color: "text-emerald-600",
        tags: ["Security"]
    },
    {
        id: "background-remover",
        titleKey: "Catalog.BackgroundRemover.title",
        descriptionKey: "Catalog.BackgroundRemover.description",
        icon: Wand2,
        href: "/tools/background-remover",
        color: "text-purple-500",
        tags: ["Media", "AI"]
    },
    {
        id: "banner-generator",
        titleKey: "Catalog.BannerGenerator.title",
        descriptionKey: "Catalog.BannerGenerator.description",
        icon: Terminal,
        href: "/tools/banner-generator",
        color: "text-orange-500",
        tags: ["Development"]
    },
    {
        id: "base64-converter",
        titleKey: "Catalog.Base64Converter.title",
        descriptionKey: "Catalog.Base64Converter.description",
        icon: FileCode,
        href: "/tools/base64-converter",
        color: "text-emerald-600",
        tags: ["Development"]
    },
    {
        id: "base64-image",
        titleKey: "Catalog.Base64Image.title",
        descriptionKey: "Catalog.Base64Image.description",
        icon: ImageIcon,
        href: "/tools/base64-image",
        color: "text-purple-500",
        tags: ["Media"]
    },
    {
        id: "border-radius-generator",
        titleKey: "Catalog.BorderRadiusGenerator.title",
        descriptionKey: "Catalog.BorderRadiusGenerator.description",
        icon: Maximize,
        href: "/tools/border-radius-generator",
        color: "text-green-500",
        tags: ["Design"]
    },
    {
        id: "box-shadow-generator",
        titleKey: "Catalog.BoxShadowGenerator.title",
        descriptionKey: "Catalog.BoxShadowGenerator.description",
        icon: Layers,
        href: "/tools/box-shadow-generator",
        color: "text-indigo-500",
        tags: ["Design"]
    },
    {
        id: "browser-info",
        titleKey: "Catalog.BrowserInfo.title",
        descriptionKey: "Catalog.BrowserInfo.description",
        icon: MonitorPlay,
        href: "/tools/browser-info",
        color: "text-blue-500",
        tags: ["Development", "Utilities"]
    },
    {
        id: "color-palette",
        titleKey: "Catalog.ColorPalette.title",
        descriptionKey: "Catalog.ColorPalette.description",
        icon: Sparkles,
        href: "/tools/color-palette",
        color: "text-pink-500",
        tags: ["Design"]
    },
    {
        id: "cron-generator",
        titleKey: "Catalog.CronGenerator.title",
        descriptionKey: "Catalog.CronGenerator.description",
        icon: Clock,
        href: "/tools/cron-generator",
        color: "text-yellow-500",
        tags: ["Development"]
    },
    {
        id: "favicon-generator",
        titleKey: "Catalog.FaviconGenerator.title",
        descriptionKey: "Catalog.FaviconGenerator.description",
        icon: Files,
        href: "/tools/favicon-generator",
        color: "text-indigo-500",
        tags: ["Design"]
    },
    {
        id: "glassmorphism",
        titleKey: "Catalog.Glassmorphism.title",
        descriptionKey: "Catalog.Glassmorphism.description",
        icon: Layers,
        href: "/tools/glassmorphism",
        color: "text-sky-500",
        tags: ["Design"]
    },
    {
        id: "css-gradient-generator",
        titleKey: "Catalog.GradientGenerator.title",
        descriptionKey: "Catalog.GradientGenerator.description",
        icon: Sparkles,
        href: "/tools/css-gradient-generator",
        color: "text-blue-500",
        tags: ["Design"]
    },
    {
        id: "image-compressor",
        titleKey: "Catalog.ImageCompressor.title",
        descriptionKey: "Catalog.ImageCompressor.description",
        icon: ImageIcon,
        href: "/tools/image-compressor",
        color: "text-purple-500",
        tags: ["Media"]
    },
    {
        id: "image-converter",
        titleKey: "Catalog.ImageConverter.title",
        descriptionKey: "Catalog.ImageConverter.description",
        icon: ImageIcon,
        href: "/tools/image-converter",
        color: "text-emerald-500",
        tags: ["Media"]
    },
    {
        id: "json-yaml-converter",
        titleKey: "Catalog.JsonYaml.title",
        descriptionKey: "Catalog.JsonYaml.description",
        icon: FileJson,
        href: "/tools/json-yaml-converter",
        color: "text-emerald-600",
        tags: ["Development", "Utilities"]
    },
    {
        id: "jwt-debugger",
        titleKey: "Catalog.JwtDebugger.title",
        descriptionKey: "Catalog.JwtDebugger.description",
        icon: ShieldCheck,
        href: "/tools/jwt-debugger",
        color: "text-emerald-600",
        tags: ["Security"]
    },
    {
        id: "regex-tester",
        titleKey: "Catalog.RegexTester.title",
        descriptionKey: "Catalog.RegexTester.description",
        icon: Regex,
        href: "/tools/regex-tester",
        color: "text-indigo-500",
        tags: ["Development"]
    },
    {
        id: "my-ip",
        titleKey: "Catalog.MyIp.title",
        descriptionKey: "Catalog.MyIp.description",
        icon: Globe,
        href: "/tools/my-ip",
        color: "text-sky-500",
        tags: ["Utilities"]
    },
    {
        id: "port-scanner",
        titleKey: "Catalog.PortScanner.title",
        descriptionKey: "Catalog.PortScanner.description",
        icon: Search,
        href: "/tools/port-scanner",
        color: "text-orange-500",
        tags: ["Security"]
    },
    {
        id: "qr-generator",
        titleKey: "Catalog.QrGenerator.title",
        descriptionKey: "Catalog.QrGenerator.description",
        icon: QrCode,
        href: "/tools/qr-generator",
        color: "text-green-600",
        tags: ["Utilities"]
    },
    {
        id: "sql-converter",
        titleKey: "Catalog.SqlConverter.title",
        descriptionKey: "Catalog.SqlConverter.description",
        icon: Database,
        href: "/tools/sql-converter",
        color: "text-blue-600",
        tags: ["Development", "Data"]
    },
    {
        id: "sql-formatter",
        titleKey: "Catalog.SqlFormatter.title",
        descriptionKey: "Catalog.SqlFormatter.description",
        icon: Database,
        href: "/tools/sql-formatter",
        color: "text-blue-500",
        tags: ["Development", "Data"]
    },
    {
        id: "speed-test",
        titleKey: "Catalog.SpeedTest.title",
        descriptionKey: "Catalog.SpeedTest.description",
        icon: Zap,
        href: "/tools/speed-test",
        color: "text-yellow-500",
        tags: ["Utilities"]
    },
    {
        id: "suno-downloader",
        titleKey: "Catalog.SunoDownloader.title",
        descriptionKey: "Catalog.SunoDownloader.description",
        icon: Music,
        href: "/tools/suno-downloader",
        color: "text-pink-500",
        tags: ["Media"]
    },
    {
        id: "svg-to-jsx",
        titleKey: "Catalog.SvgToJsx.title",
        descriptionKey: "Catalog.SvgToJsx.description",
        icon: FileCode,
        href: "/tools/svg-to-jsx",
        color: "text-indigo-500",
        tags: ["Development"]
    },
    {
        id: "unit-converter",
        titleKey: "Catalog.UnitConverter.title",
        descriptionKey: "Catalog.UnitConverter.description",
        icon: Ruler,
        href: "/tools/unit-converter",
        color: "text-emerald-500",
        tags: ["Utilities"]
    },
    {
        id: "url-converter",
        titleKey: "Catalog.UrlConverter.title",
        descriptionKey: "Catalog.UrlConverter.description",
        icon: Link,
        href: "/tools/url-converter",
        color: "text-cyan-500",
        tags: ["Utilities"]
    },
    {
        id: "video-converter",
        titleKey: "Catalog.VideoConverter.title",
        descriptionKey: "Catalog.VideoConverter.description",
        icon: Video,
        href: "/tools/video-converter",
        color: "text-rose-500",
        tags: ["Media"]
    },
    {
        id: "data-tools",
        titleKey: "Catalog.DataTools.title",
        descriptionKey: "Catalog.DataTools.description",
        icon: Database,
        href: "/tools/data-tools",
        color: "text-blue-600",
        tags: ["Data"]
    },
    {
        id: "text-tools",
        titleKey: "Catalog.TextTools.title",
        descriptionKey: "Catalog.TextTools.description",
        icon: FileText,
        href: "/tools/text-tools",
        color: "text-emerald-600",
        tags: ["Utilities"]
    },
    {
        id: "dev-tools",
        titleKey: "Catalog.DevTools.title",
        descriptionKey: "Catalog.DevTools.description",
        icon: Terminal,
        href: "/tools/dev-tools",
        color: "text-orange-500",
        tags: ["Development"]
    },
    {
        id: "hwp-viewer",
        titleKey: "Catalog.HwpViewer.title",
        descriptionKey: "Catalog.HwpViewer.description",
        icon: FileText,
        href: "/tools/hwp-viewer",
        color: "text-blue-600",
        tags: ["Utilities"]
    },
    {
        id: "xml-formatter",
        titleKey: "Catalog.XmlFormatter.title",
        descriptionKey: "Catalog.XmlFormatter.description",
        icon: FileCode,
        href: "/tools/xml-formatter",
        color: "text-indigo-500",
        tags: ["Development"]
    },
    {
        id: "pdf-tools",
        titleKey: "Catalog.PdfTools.title",
        descriptionKey: "Catalog.PdfTools.description",
        icon: Files,
        href: "/tools/pdf-tools",
        color: "text-red-500",
        tags: ["Utilities"]
    },
    {
        id: "3d-viewer",
        titleKey: "Catalog.Basic3dViewer.title",
        descriptionKey: "Catalog.Basic3dViewer.description",
        icon: Box,
        href: "/tools/3d-viewer",
        color: "text-purple-500",
        tags: ["Media"]
    },
    {
        id: "youtube-downloader",
        titleKey: "Catalog.YouTubeDownloader.title",
        descriptionKey: "Catalog.YouTubeDownloader.description",
        icon: YouTubeIcon,
        href: "/tools/youtube-downloader",
        color: "text-red-600",
        tags: ["Media"]
    },
    {
        id: "youtube-thumbnail",
        titleKey: "Catalog.YoutubeThumbnail.title",
        descriptionKey: "Catalog.YoutubeThumbnail.description",
        icon: YouTubeIcon,
        href: "/tools/youtube-thumbnail",
        color: "text-red-600",
        tags: ["Media"]
    },
    {
        id: "aes-crypto",
        titleKey: "Catalog.AesCrypto.title",
        descriptionKey: "Catalog.AesCrypto.description",
        icon: ShieldCheck,
        href: "/tools/aes-crypto",
        color: "text-emerald-600",
        tags: ["Security"]
    },
    {
        id: "bcrypt-generator",
        titleKey: "Catalog.BcryptGenerator.title",
        descriptionKey: "Catalog.BcryptGenerator.description",
        icon: ShieldCheck,
        href: "/tools/bcrypt-generator",
        color: "text-emerald-600",
        tags: ["Security"]
    },
    {
        id: "hmac-generator",
        titleKey: "Catalog.HmacGenerator.title",
        descriptionKey: "Catalog.HmacGenerator.description",
        icon: ShieldCheck,
        href: "/tools/hmac-generator",
        color: "text-emerald-600",
        tags: ["Security"]
    },
    {
        id: "rsa-generator",
        titleKey: "Catalog.RsaGenerator.title",
        descriptionKey: "Catalog.RsaGenerator.description",
        icon: ShieldCheck,
        href: "/tools/rsa-generator",
        color: "text-emerald-600",
        tags: ["Security"]
    },
    {
        id: "hash-generator",
        titleKey: "Catalog.HashGenerator.title",
        descriptionKey: "Catalog.HashGenerator.description",
        icon: ShieldCheck,
        href: "/tools/hash-generator",
        color: "text-emerald-600",
        tags: ["Security"]
    },
    {
        id: "pdf-merge",
        titleKey: "Catalog.PdfMerge.title",
        descriptionKey: "Catalog.PdfMerge.description",
        icon: Files,
        href: "/tools/pdf-merge",
        color: "text-red-500",
        tags: ["Utilities"]
    },
    {
        id: "pdf-split",
        titleKey: "Catalog.PdfSplit.title",
        descriptionKey: "Catalog.PdfSplit.description",
        icon: Files,
        href: "/tools/pdf-split",
        color: "text-red-500",
        tags: ["Utilities"]
    },
    {
        id: "pdf-to-image",
        titleKey: "Catalog.PdfToImage.title",
        descriptionKey: "Catalog.PdfToImage.description",
        icon: Files,
        href: "/tools/pdf-to-image",
        color: "text-red-500",
        tags: ["Utilities"]
    },
    {
        id: "k-series",
        titleKey: "Catalog.KSeries.title",
        descriptionKey: "Catalog.KSeries.description",
        icon: LayoutGrid,
        href: "/tools/k-series",
        color: "text-blue-500",
        tags: ["Korea"]
    },
    {
        id: "pdf-tools-collection",
        titleKey: "Catalog.PdfTools.title",
        descriptionKey: "Catalog.PdfTools.description",
        icon: Files,
        href: "/tools/pdf-tools",
        color: "text-red-500",
        tags: ["Utilities"]
    },
    {
        id: "url-converter-collection",
        titleKey: "Catalog.UrlConverter.title",
        descriptionKey: "Catalog.UrlConverter.description",
        icon: Link,
        href: "/tools/url-converter",
        color: "text-cyan-500",
        tags: ["Utilities"]
    },
    {
        id: "sql-converter-collection",
        titleKey: "Catalog.SqlConverter.title",
        descriptionKey: "Catalog.SqlConverter.description",
        icon: Database,
        href: "/tools/sql-converter",
        color: "text-blue-600",
        tags: ["Data"]
    },
    {
        id: "sql-formatter-collection",
        titleKey: "Catalog.SqlFormatter.title",
        descriptionKey: "Catalog.SqlFormatter.description",
        icon: Database,
        href: "/tools/sql-formatter",
        color: "text-blue-500",
        tags: ["Data"]
    },
    {
        id: "text-tools-collection",
        titleKey: "Catalog.TextTools.title",
        descriptionKey: "Catalog.TextTools.description",
        icon: FileText,
        href: "/tools/text-tools",
        color: "text-emerald-600",
        tags: ["Utilities"]
    },
    {
        id: "data-tools-collection",
        titleKey: "Catalog.DataTools.title",
        descriptionKey: "Catalog.DataTools.description",
        icon: Database,
        href: "/tools/data-tools",
        color: "text-blue-600",
        tags: ["Data"]
    },
    {
        id: "dev-tools-collection",
        titleKey: "Catalog.DevTools.title",
        descriptionKey: "Catalog.DevTools.description",
        icon: Terminal,
        href: "/tools/dev-tools",
        color: "text-orange-500",
        tags: ["Development"]
    },
    {
        id: "security-tools-collection",
        titleKey: "Catalog.SecurityTools.title",
        descriptionKey: "Catalog.SecurityTools.description",
        icon: ShieldCheck,
        href: "/tools/security-tools",
        color: "text-emerald-600",
        tags: ["Security"]
    },
    {
        id: "basic-3d-viewer",
        titleKey: "Catalog.Basic3dViewer.title",
        descriptionKey: "Catalog.Basic3dViewer.description",
        icon: Box,
        href: "/tools/3d-viewer",
        color: "text-purple-500",
        tags: ["Media"]
    },
    {
        id: "youtube-thumbnail-collection",
        titleKey: "Catalog.YoutubeThumbnail.title",
        descriptionKey: "Catalog.YoutubeThumbnail.description",
        icon: YouTubeIcon,
        href: "/tools/youtube-thumbnail",
        color: "text-red-600",
        tags: ["Media"]
    },
    {
        id: "youtube-downloader-collection",
        titleKey: "Catalog.YouTubeDownloader.title",
        descriptionKey: "Catalog.YouTubeDownloader.description",
        icon: YouTubeIcon,
        href: "/tools/youtube-downloader",
        color: "text-red-600",
        tags: ["Media"]
    },
    {
        id: "image-converter-collection",
        titleKey: "Catalog.ImageConverter.title",
        descriptionKey: "Catalog.ImageConverter.description",
        icon: ImageIcon,
        href: "/tools/image-converter",
        color: "text-emerald-500",
        tags: ["Media"]
    },
    {
        id: "image-compressor-collection",
        titleKey: "Catalog.ImageCompressor.title",
        descriptionKey: "Catalog.ImageCompressor.description",
        icon: ImageIcon,
        href: "/tools/image-compressor",
        color: "text-purple-500",
        tags: ["Media"]
    },
    {
        id: "favicon-generator-collection",
        titleKey: "Catalog.FaviconGenerator.title",
        descriptionKey: "Catalog.FaviconGenerator.description",
        icon: Files,
        href: "/tools/favicon-generator",
        color: "text-indigo-500",
        tags: ["Design"]
    },
    {
        id: "banner-generator-collection",
        titleKey: "Catalog.BannerGenerator.title",
        descriptionKey: "Catalog.BannerGenerator.description",
        icon: Terminal,
        href: "/tools/banner-generator",
        color: "text-orange-500",
        tags: ["Development"]
    },
    {
        id: "background-remover-collection",
        titleKey: "Catalog.BackgroundRemover.title",
        descriptionKey: "Catalog.BackgroundRemover.description",
        icon: Wand2,
        href: "/tools/background-remover",
        color: "text-purple-500",
        tags: ["Media", "AI"]
    }
];

export function getToolById(id: string) {
    return toolsCatalog.find((tool) => tool.id === id || tool.href.endsWith(`/${id}`));
}
