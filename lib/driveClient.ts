
import { DriveMedia, AlbumGroup, UploadedBy } from "./types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// Keep logic from mockDriveService for grouping
export function groupMediaByDate(media: DriveMedia[]): AlbumGroup[] {
    const groupMap = new Map<string, DriveMedia[]>();

    media.forEach((item) => {
        // Use createdTime. Parse carefully.
        const date = new Date(item.createdTime);
        if (isNaN(date.getTime())) return;

        const dateKey = format(date, "yyyy-MM-dd");
        if (!groupMap.has(dateKey)) groupMap.set(dateKey, []);
        groupMap.get(dateKey)!.push(item);
    });

    const groups: AlbumGroup[] = [];
    groupMap.forEach((items, dateKey) => {
        groups.push({
            date: dateKey,
            displayDate: format(new Date(dateKey), "yyyy年M月d日 (E)", {
                locale: ja,
            }),
            media: items,
            coverImage: items[0],
        });
    });

    return groups.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export async function addPhotosToAlbum(
    files: File[],
    uploadedBy: UploadedBy
): Promise<{ added: DriveMedia[]; dateKeys: string[] }> {
    const added: DriveMedia[] = [];
    const dateKeysSet = new Set<string>();

    // Upload sequentially or parallel?
    // Parallel limit 3
    const CONCURRENCY = 3;

    for (let i = 0; i < files.length; i += CONCURRENCY) {
        const chunk = files.slice(i, i + CONCURRENCY);
        const promises = chunk.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("uploadedBy", uploadedBy);

            try {
                const res = await fetch("/api/drive/upload", {
                    method: "POST",
                    // headers: { "x-app-pin": ... } // Browser cookies handle auth
                    body: formData,
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Upload failed");
                }

                const json = await res.json();
                // The API returns metadata relative to DB schema (snake_case columns mapped?)
                // Wait, API route returns: { success: true, file: metaData }
                // DB row keys are snake_case. 
                // We need to map to DriveMedia.
                // Or if we fix API route to return mapped object?
                // Let's assume we map here.

                const row = json.file;
                const media: DriveMedia = {
                    id: row.drive_file_id,
                    name: row.name,
                    mimeType: row.mime_type,
                    thumbnailLink: `/api/drive/file/${row.drive_file_id}`,
                    webContentLink: `/api/drive/file/${row.drive_file_id}`,
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

                added.push(media);

                const dateKey = format(new Date(media.createdTime), "yyyy-MM-dd");
                dateKeysSet.add(dateKey);

            } catch (e) {
                console.error(`Failed to upload ${file.name}`, e);
                // Continue with others
            }
        });

        await Promise.all(promises);
    }

    return { added, dateKeys: Array.from(dateKeysSet) };
}
