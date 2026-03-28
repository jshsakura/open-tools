"use client"

import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PdfMerge } from "./pdf-merge"
import { PdfSplit } from "./pdf-split"
import { PdfToImage } from "./pdf-to-image"
import { FileText, Files, Images, Scissors } from "lucide-react"

export function PdfTools() {
    const t = useTranslations("PdfTools")

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </div>

            <Tabs defaultValue="merge" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="merge" className="flex items-center gap-2">
                        <Files className="h-4 w-4" />
                        {t("tabs.merge")}
                    </TabsTrigger>
                    <TabsTrigger value="split" className="flex items-center gap-2">
                        <Scissors className="h-4 w-4" />
                        {t("tabs.split")}
                    </TabsTrigger>
                    <TabsTrigger value="to-image" className="flex items-center gap-2">
                        <Images className="h-4 w-4" />
                        {t("tabs.toImage")}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="merge" className="space-y-4">
                    <PdfMerge />
                </TabsContent>
                <TabsContent value="split" className="space-y-4">
                    <PdfSplit />
                </TabsContent>
                <TabsContent value="to-image" className="space-y-4">
                    <PdfToImage />
                </TabsContent>
            </Tabs>
        </div>
    )
}
