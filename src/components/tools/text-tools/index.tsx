"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, ArrowRightLeft } from "lucide-react";
import { LoremGenerator } from "./lorem-generator";
import { HangulProcessor } from "./hangul-processor";

export function TextTools() {
  const t = useTranslations("TextTools");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center space-y-2 mb-8">
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      <Tabs defaultValue="lorem" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="lorem" className="flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            {t("tabs.lorem")}
          </TabsTrigger>
          <TabsTrigger value="hangul" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            {t("tabs.hangul")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lorem" className="space-y-4">
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-orange-500" />
              {t("tabs.lorem")}
            </h2>
            <LoremGenerator />
          </div>
        </TabsContent>
        <TabsContent value="hangul" className="space-y-4">
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-green-500" />
              {t("tabs.hangul")}
            </h2>
            <HangulProcessor />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
