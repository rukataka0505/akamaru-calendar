
import { NextRequest, NextResponse } from "next/server";
import { drive } from "@/lib/google";
import { createAdminClient } from "@/lib/supabase";
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
