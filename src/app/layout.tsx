import { Noto_Sans_KR, Jost } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const notoTabsKR = Noto_Sans_KR({
    weight: ["100", "300", "400", "500", "700", "900"],
    variable: "--font-noto-sans-kr",
    subsets: ["latin"],
});

const jost = Jost({
    subsets: ["latin"],
    variable: "--font-jost",
    weight: ["400", "500"],
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html suppressHydrationWarning>
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased relative overflow-x-hidden pt-14",
                    notoTabsKR.variable,
                    jost.variable
                )}
                suppressHydrationWarning
            >
                {children}
            </body>
        </html>
    );
}
