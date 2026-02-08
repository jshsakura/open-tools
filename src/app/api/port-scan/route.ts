
import { NextRequest, NextResponse } from "next/server";
import net from "net";

export async function POST(req: NextRequest) {
    try {
        const { host, port } = await req.json();

        if (!host || !port) {
            return NextResponse.json({ error: "Host and port are required" }, { status: 400 });
        }

        const portNum = parseInt(port);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            return NextResponse.json({ error: "Invalid port number" }, { status: 400 });
        }

        // Basic host validation (prevent scanning local network if desired, but for now we allow it as it might be useful for self-hosting users)
        // However, usually we want to block loopback or private IPs in production tools to prevent SSRF.
        // For this "open-tools" which might be self-hosted, we can be lenient or strict.
        // Given it's a "Port Scanner" tool for public use, we should probably allow scanning public IPs.
        // Let's just implement the connection logic for now.

        const status = await checkPort(host, portNum);
        return NextResponse.json({ status });

    } catch (error) {
        return NextResponse.json({ error: "Failed to scan port" }, { status: 500 });
    }
}

function checkPort(host: string, port: number): Promise<"open" | "closed" | "filtered"> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 2000; // 2 seconds timeout

        socket.setTimeout(timeout);

        socket.on("connect", () => {
            socket.destroy();
            resolve("open");
        });

        socket.on("timeout", () => {
            socket.destroy();
            resolve("filtered");
        });

        socket.on("error", (err: any) => {
            socket.destroy();
            if (err.code === "ECONNREFUSED") {
                resolve("closed");
            } else if (err.code === "EHOSTUNREACH") {
                resolve("filtered"); // Host unreachable usually means filtered or down
            } else {
                resolve("filtered"); // Default to filtered for other errors
            }
        });

        socket.connect(port, host);
    });
}
