import type { Metadata } from "next";
import "./globals.css";
import { getBaseUrl } from "@/lib/seo";

export const metadata: Metadata = {
    metadataBase: new URL(getBaseUrl()),
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
