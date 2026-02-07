"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, FileKey, Key, ShieldCheck, Fingerprint } from "lucide-react"

import { AesCrypto } from "./aes-crypto"
import { BcryptGenerator } from "./bcrypt-generator"
import { HmacGenerator } from "./hmac-generator"
import { RsaGenerator } from "./rsa-generator"
import { JwtDebugger } from "./jwt-debugger"
import { HashGenerator } from "./hash-generator"

export function SecurityTools() {
    const [activeTab, setActiveTab] = useState("aes")

    return (
        <Tabs defaultValue="aes" className="w-full space-y-8" onValueChange={setActiveTab}>
            <div className="flex justify-center">
                <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/50 rounded-xl">
                    <TabsTrigger value="aes" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
                        <Shield className="w-4 h-4 mr-2" />
                        AES
                    </TabsTrigger>
                    <TabsTrigger value="bcrypt" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
                        <Lock className="w-4 h-4 mr-2" />
                        Bcrypt
                    </TabsTrigger>
                    <TabsTrigger value="hmac" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
                        <FileKey className="w-4 h-4 mr-2" />
                        HMAC
                    </TabsTrigger>
                    <TabsTrigger value="rsa" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
                        <Key className="w-4 h-4 mr-2" />
                        RSA
                    </TabsTrigger>
                    <TabsTrigger value="jwt" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        JWT
                    </TabsTrigger>
                    <TabsTrigger value="hash" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
                        <Fingerprint className="w-4 h-4 mr-2" />
                        Hash
                    </TabsTrigger>
                </TabsList>
            </div>

            <div className="mt-8">
                <TabsContent value="aes" className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            <AesCrypto />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bcrypt" className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            <BcryptGenerator />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hmac" className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            <HmacGenerator />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rsa" className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            <RsaGenerator />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="jwt" className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            <JwtDebugger />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hash" className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            <HashGenerator />
                        </CardContent>
                    </Card>
                </TabsContent>
            </div>
        </Tabs>
    )
}
