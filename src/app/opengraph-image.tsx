import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = {
    width: 1200,
    height: 630,
}

export const contentType = "image/png"

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #0b1220 0%, #0f172a 60%, #111827 100%)",
                    color: "white",
                    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
                }}
            >
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        marginBottom: 16,
                    }}
                >
                    Open Tools
                </div>
                <div
                    style={{
                        fontSize: 28,
                        opacity: 0.9,
                    }}
                >
                    50+ 개의 개발자 도구를 한 곳에서
                </div>
            </div>
        ),
        size
    )
}
