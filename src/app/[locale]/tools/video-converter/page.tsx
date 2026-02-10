"use client"


import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ToolLoadingSkeleton } from "@/components/tool-loader"

const VideoConverter = dynamic(
    () => import("@/components/tools/video-converter").then(mod => ({ default: mod.VideoConverter })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function VideoConverterPage() {
    return (
        <div className="container mx-auto py-10">
            <VideoConverter />
        </div>
    )
}
