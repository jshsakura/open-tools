"use client"

import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Container, Terminal, ShieldCheck } from "lucide-react"
import { DockerConverter } from "./docker-converter"
import { ChmodCalculator } from "./chmod-calculator"
import { BusinessValidator } from "./business-validator"

export function DevTools() {
    const t = useTranslations("DevTools")

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t("description")}
                </p>
            </div>

            <Tabs defaultValue="docker" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="docker" className="flex items-center gap-2">
                        <Container className="h-4 w-4" />
                        {t("tabs.docker")}
                    </TabsTrigger>
                    <TabsTrigger value="chmod" className="flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        {t("tabs.chmod")}
                    </TabsTrigger>
                    <TabsTrigger value="validator" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        {t("tabs.validator")}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="docker" className="space-y-4">
                    <div className="bg-card rounded-xl p-6 border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Container className="h-5 w-5 text-blue-500" />
                            {t("tabs.docker")}
                        </h2>
                        <DockerConverter />
                    </div>
                </TabsContent>
                <TabsContent value="chmod" className="space-y-4">
                    <div className="bg-card rounded-xl p-6 border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-orange-500" />
                            {t("tabs.chmod")}
                        </h2>
                        <ChmodCalculator />
                    </div>
                </TabsContent>
                <TabsContent value="validator" className="space-y-4">
                    <div className="bg-card rounded-xl p-6 border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                            {t("tabs.validator")}
                        </h2>
                        <BusinessValidator />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
