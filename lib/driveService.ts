"use server";

import { createAdminClient } from "./supabase";
import { DriveMedia, MediaComment, UploadedBy } from "./types";
import { revalidatePath } from "next/cache";

// --- Server Actions ---

function mapDriveMedia(row: any): DriveMedia {
    return {
        id: row.drive_file_id,
        name: row.name,
        mimeType: row.mime_type,
        // Use Proxy URL for images
        thumbnailLink: `/api/drive/file/${row.drive_file_id}`,
        webContentLink: `/api/drive/file/${row.drive_file_id}`,
        // Original link to drive if needed, but we proxy everything for auth
        webViewLink: `/api/drive/file/${row.drive_file_id}`,
        createdTime: row.created_time,
        modifiedTime: row.modified_time,
        size: String(row.size),
        uploadedBy: row.uploaded_by as UploadedBy,
        imageMediaMetadata: {
            width: row.width || 0,
            height: row.height || 0,
        },
    };
}

export async function getMediaByMonth(year: number, month: number): Promise<DriveMedia[]> {
    const supabase = createAdminClient();

    // month is 0-indexed
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const { data, error } = await supabase
        .from("media_metadata")
        .select("*")
        .lte("created_time", endDate.toISOString())
        .gte("created_time", startDate.toISOString())
        .order("created_time", { ascending: false });

    if (error) {
        console.error("Failed to fetch media:", error);
        return [];
    }

    return data.map(mapDriveMedia);
}

export async function getMediaByDate(dateKey: string): Promise<DriveMedia[]> {
    const supabase = createAdminClient();

    // dateKey format "yyyy-MM-dd"
    // Range: Start of day to End of day in UTC?
    // The dateKey is usually from client local time context, but DB stores UTC.
    // We need to match precise day. 
    // However, simpler approach: filter by string prefix or range.
    // Let's assume dateKey is local YYYY-MM-DD.
    const start = new Date(`${dateKey}T00:00:00`);
    const end = new Date(`${dateKey}T23:59:59.999`); // Rough approximation

    const { data, error } = await supabase
        .from("media_metadata")
        .select("*")
        .lte("created_time", end.toISOString())
        .gte("created_time", start.toISOString())
        .order("created_time", { ascending: false });

    if (error) {
        console.error("Failed to fetch media by date", error);
        return [];
    }
    return data.map(mapDriveMedia);
}

export async function getCommentsForMedia(mediaId: string): Promise<MediaComment[]> {
    // MediaId here is drive_file_id
    const supabase = createAdminClient();

    // First map custom ID? No, use media_id directly.
    const { data, error } = await supabase
        .from("media_comments")
        .select("*")
        .eq("media_id", mediaId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Failed to fetch comments", error);
        return [];
    }

    return data.map((row: any) => ({
        id: row.id,
        mediaId: row.media_id,
        userId: row.user_id,
        userName: row.user_name,
        text: row.text,
        createdAt: row.created_at,
    }));
}

export async function addComment(mediaId: string, text: string, userId: UploadedBy): Promise<MediaComment> {
    const supabase = createAdminClient();
    // Resolve user name
    const userName = userId === "user-1" ? "あかり" : "るか";

    const { data, error } = await supabase
        .from("media_comments")
        .insert({
            media_id: mediaId,
            user_id: userId,
            user_name: userName,
            text: text,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to add comment: ${error.message}`);
    }

    revalidatePath("/");
    return {
        id: data.id,
        mediaId: data.media_id,
        userId: data.user_id,
        userName: data.user_name,
        text: data.text,
        createdAt: data.created_at,
    };
}
