
import { NextRequest, NextResponse } from "next/server";
import { drive } from "@/lib/google";
import { createAdminClient } from "@/lib/supabase";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ fileId: string }> } // Params is a Promise in Next.js 15+? No, standard in App Router but Next.js 15 changed it? 
    // Let's assume standard Next.js 14/15 async params behavior or check if "await params" is needed.
    // Next.js 15: params is a Promise.
    // We should await it.
) {
    const { fileId } = await params;

    // 1. Auth Check (Cookie)
    const cookiePin = req.cookies.get("app-pin-token");
    if (cookiePin?.value !== "valid") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 2. Get file stream from Drive
        const response = await drive.files.get(
            { fileId, alt: "media" },
            { responseType: "stream" }
        );

        const stream = response.data as any; // GaxiosResponse data is stream

        // 3. Create response with correct headers
        // We might want to get mimeType first if needed, but streaming blindly works often.
        // Or we can query the metadata concurrently.
        // Let's trust the stream or set a generic image type if guaranteed.

        // Convert Node stream to Web Stream for NextResponse
        const webStream = new ReadableStream({
            start(controller) {
                stream.on("data", (chunk: Buffer) => controller.enqueue(chunk));
                stream.on("end", () => controller.close());
                stream.on("error", (err: Error) => controller.error(err));
            }
        });

        return new NextResponse(webStream, {
            headers: {
                "Content-Type": response.headers["content-type"] || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
            }
        });

    } catch (error: any) {
        console.error("File Proxy Error:", error);
        return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
    }
}
