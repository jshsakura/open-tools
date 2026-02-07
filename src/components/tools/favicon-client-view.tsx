"use client"

import dynamic from 'next/dynamic'
import { ToolLoadingSkeleton } from "@/components/tool-loader"

const FaviconGenerator = dynamic(
    () => import('@/components/tools/favicon-generator').then(mod => ({ default: mod.FaviconGenerator })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export function FaviconClientView() {
    return <FaviconGenerator />;
}
