"use client"

import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Languages, ShieldCheck } from "lucide-react"
import { HwpViewer } from "../hwp-viewer"
import { HangulProcessor } from "../text-tools/hangul-processor"
import { BusinessValidator } from "../dev-tools/business-validator"

export function KTools() {
    const t = useTranslations("KTools")

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t("description")}
                </p>
            </div>

            <Tabs defaultValue="hwp" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 hover:bg-muted/80 transition-colors">
                    <TabsTrigger value="hwp" className="flex items-center gap-2 py-3">
                        <FileText className="h-4 w-4" />
                        {t("tabs.hwp")}
                    </TabsTrigger>
                    <TabsTrigger value="hangul" className="flex items-center gap-2 py-3">
                        <Languages className="h-4 w-4" />
                        {t("tabs.hangul")}
                    </TabsTrigger>
                    <TabsTrigger value="validator" className="flex items-center gap-2 py-3">
                        <ShieldCheck className="h-4 w-4" />
                        {t("tabs.validator")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="hwp" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border shadow-md overflow-hidden">
                        <CardContent className="p-6 bg-gradient-to-br from-card to-muted/10">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <FileText className="h-6 w-6 text-blue-500" />
                                </div>
                                {t("tabs.hwp")}
                            </h2>
                            <HwpViewer />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hangul" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border shadow-md overflow-hidden">
                        <CardContent className="p-6 bg-gradient-to-br from-card to-muted/10">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <Languages className="h-6 w-6 text-orange-500" />
                                </div>
                                {t("tabs.hangul")}
                            </h2>
                            <HangulProcessor />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="validator" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border shadow-md overflow-hidden">
                        <CardContent className="p-6 bg-gradient-to-br from-card to-muted/10">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <ShieldCheck className="h-6 w-6 text-green-500" />
                                </div>
                                {t("tabs.validator")}
                            </h2>
                            <BusinessValidator />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
