
import { NextRequest, NextResponse } from "next/server";
import { drive } from "@/lib/google";
import { createAdminClient } from "@/lib/supabase";
import { verifyPin } from "@/lib/auth/pin";
import { Readable } from "stream";

// Helper to convert Web Stream to Node Stream
function webStreamToNodeStream(stream: ReadableStream<Uint8Array>): Readable {
    const reader = stream.getReader();
    return new Readable({
        async read() {
            const { done, value } = await reader.read();
            if (done) {
                this.push(null);
            } else {
                this.push(Buffer.from(value));
            }
        },
    });
}

export async function POST(req: NextRequest) {
    // 1. PIN Check
    // The client should send PIN in headers or cookie.
    // Since verifyPin checks cookie, we can use that logic or verify header.
    // Let's check headers first for API-like access, or fallback to cookie.
    // However, verifyPin is a Server Action that checks request cookies.
    // But inside Route Handlers, cookies() is available.

    // Custom check:
    const pinHeader = req.headers.get("x-app-pin");
    // Or check cookie manually? verifyPin() uses cookies(), so calling it might work if it's designed for it.
    // But verifyPin() implementation sets cookie if valid. Here we just want to verify.
    // Let's implement a simpler check or trust middleware/cookie.
    // Since we are migrating from simple verifyPin(), let's check cookie "app-pin-token".
    const cookiePin = req.cookies.get("app-pin-token");
    const isAuthorized = cookiePin?.value === "valid";

    if (!isAuthorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const uploadedBy = formData.get("uploadedBy") as string;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        // 2. Upload to Drive
        const driveRes = await drive.files.create({
            requestBody: {
                name: file.name,
                parents: folderId ? [folderId] : [],
                mimeType: file.type,
            },
            media: {
                mimeType: file.type,
                body: stream,
            },
            fields: "id, name, mimeType, webContentLink, webViewLink, createdTime, size, imageMediaMetadata",
        });

        const fileData = driveRes.data;

        if (!fileData.id) {
            throw new Error("Failed to get file ID from Drive");
        }

        // 3. Save Metadata to Supabase
        const supabase = createAdminClient();
        const { data: metaData, error } = await supabase
            .from("media_metadata")
            .insert({
                drive_file_id: fileData.id,
                name: fileData.name,
                mime_type: fileData.mimeType,
                uploaded_by: uploadedBy || "user-1", // Default to user-1 if missing
                created_time: fileData.createdTime || new Date().toISOString(),
                size: fileData.size ? parseInt(fileData.size) : 0,
                width: fileData.imageMediaMetadata?.width || 0,
                height: fileData.imageMediaMetadata?.height || 0,
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase Error:", error);
            throw new Error("Failed to save metadata to DB");
        }

        return NextResponse.json({ success: true, file: metaData });

    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
