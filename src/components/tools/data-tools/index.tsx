"use client"

import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileJson, Database, Link } from "lucide-react"
import { JsonConverter } from "./json-converter"
import { SlugGenerator } from "./slug-generator"
import { SqlFormatter } from "../sql-formatter"

export function DataTools() {
    const t = useTranslations("DataTools")

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t("description")}
                </p>
            </div>

            <Tabs defaultValue="converter" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="converter" className="flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        {t("tabs.converter")}
                    </TabsTrigger>
                    <TabsTrigger value="sql" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        {t("tabs.sql")}
                    </TabsTrigger>
                    <TabsTrigger value="slug" className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        {t("tabs.slug")}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="converter" className="space-y-4">
                    <div className="bg-card rounded-xl p-6 border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FileJson className="h-5 w-5 text-blue-500" />
                            JSON / CSV / Excel
                        </h2>
                        <JsonConverter />
                    </div>
                </TabsContent>
                <TabsContent value="sql" className="space-y-4">
                    <div className="bg-card rounded-xl p-6 border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Database className="h-5 w-5 text-orange-500" />
                            SQL Formatter
                        </h2>
                        <SqlFormatter />
                    </div>
                </TabsContent>
                <TabsContent value="slug" className="space-y-4">
                    <div className="bg-card rounded-xl p-6 border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Link className="h-5 w-5 text-green-500" />
                            URL Slug Generator
                        </h2>
                        <SlugGenerator />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
