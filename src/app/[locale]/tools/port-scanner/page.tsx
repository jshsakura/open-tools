"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from "next-intl"
import { ToolLoadingSkeleton } from "@/components/tool-loader"

const PortScannerTool = dynamic(
    () => import("@/components/tools/port-scanner").then(mod => ({ default: mod.PortScannerTool })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function PortScannerPage() {
    const t = useTranslations('Catalog.PortScanner')

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl font-black tracking-tighter sm:text-6xl text-foreground">
                    {t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    {t('description')}
                </p>
            </div>

            <PortScannerTool />
        </div>
    )
}
