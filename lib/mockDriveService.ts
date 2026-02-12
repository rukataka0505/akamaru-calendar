"use client";

import { format, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { DriveMedia, AlbumGroup, MediaComment, UploadedBy } from "./types";

// Picsum photos を使ってモックデータを生成
function generateMockMedia(count: number, baseDate: Date): DriveMedia[] {
    const media: DriveMedia[] = [];
    const uploaders: UploadedBy[] = ["user-1", "user-2"];
    for (let i = 0; i < count; i++) {
        const seed = baseDate.getTime() + i;
        const id = `media-${format(baseDate, "yyyyMMdd")}-${i}`;
        media.push({
            id,
            name: `IMG_${format(baseDate, "yyyyMMdd")}_${String(i).padStart(3, "0")}.jpg`,
            mimeType: "image/jpeg",
            thumbnailLink: `https://picsum.photos/seed/${seed}/400/300`,
            webContentLink: `https://picsum.photos/seed/${seed}/1920/1440`,
            webViewLink: `https://picsum.photos/seed/${seed}/1920/1440`,
            createdTime: baseDate.toISOString(),
            modifiedTime: baseDate.toISOString(),
            size: String(Math.floor(Math.random() * 5000000) + 500000),
            uploadedBy: uploaders[Math.floor(Math.random() * 2)],
            imageMediaMetadata: {
                width: 1920,
                height: 1440,
            },
        });
    }
    return media;
}

// モックコメントデータ
const MOCK_COMMENTS: Record<string, MediaComment[]> = {};

function generateCommentsForMedia(mediaId: string): MediaComment[] {
    if (MOCK_COMMENTS[mediaId]) return MOCK_COMMENTS[mediaId];

    const comments: MediaComment[] = [];
    const count = Math.floor(Math.random() * 3);
    const sampleTexts = [
        "この写真すごくいい！✨",
        "いい笑顔だね 😊",
        "また行きたいね〜",
        "最高の思い出 💕",
        "かわいい！",
    ];
    const users = [
        { id: "user-1", name: "あかり" },
        { id: "user-2", name: "るか" },
    ];

    for (let i = 0; i < count; i++) {
        comments.push({
            id: `comment-${mediaId}-${i}`,
            mediaId,
            userId: users[i % 2].id,
            userName: users[i % 2].name,
            text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
            createdAt: new Date().toISOString(),
        });
    }

    MOCK_COMMENTS[mediaId] = comments;
    return comments;
}

// 過去30日分のモックデータを事前生成
const MOCK_MEDIA_CACHE: Map<string, DriveMedia[]> = new Map();

function ensureMockData() {
    if (MOCK_MEDIA_CACHE.size > 0) return;

    const today = new Date();
    // ランダムに15日分のデータを生成（毎日ではなく）
    const daysWithPhotos = [0, 1, 3, 5, 7, 8, 10, 12, 14, 16, 19, 21, 24, 26, 29];
    daysWithPhotos.forEach((daysAgo) => {
        const date = subDays(today, daysAgo);
        const dateKey = format(date, "yyyy-MM-dd");
        const photoCount = Math.floor(Math.random() * 6) + 2; // 2-7枚
        MOCK_MEDIA_CACHE.set(dateKey, generateMockMedia(photoCount, date));
    });
}

// === Public API ===

export async function getMediaByMonth(
    year: number,
    month: number
): Promise<DriveMedia[]> {
    await new Promise((r) => setTimeout(r, 300));
    ensureMockData();

    const allMedia: DriveMedia[] = [];
    MOCK_MEDIA_CACHE.forEach((media, dateKey) => {
        const [y, m] = dateKey.split("-").map(Number);
        if (y === year && m === month + 1) {
            allMedia.push(...media);
        }
    });

    return allMedia.sort(
        (a, b) =>
            new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
    );
}

export async function getMediaByDate(dateKey: string): Promise<DriveMedia[]> {
    await new Promise((r) => setTimeout(r, 150));
    ensureMockData();
    return MOCK_MEDIA_CACHE.get(dateKey) || [];
}

export function groupMediaByDate(media: DriveMedia[]): AlbumGroup[] {
    const groupMap = new Map<string, DriveMedia[]>();

    media.forEach((item) => {
        const dateKey = format(new Date(item.createdTime), "yyyy-MM-dd");
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

export async function getCommentsForMedia(
    mediaId: string
): Promise<MediaComment[]> {
    await new Promise((r) => setTimeout(r, 100));
    return generateCommentsForMedia(mediaId);
}

export async function addComment(
    mediaId: string,
    text: string
): Promise<MediaComment> {
    await new Promise((r) => setTimeout(r, 100));
    const comment: MediaComment = {
        id: `comment-${Date.now()}`,
        mediaId,
        userId: "user-1",
        userName: "あかり",
        text,
        createdAt: new Date().toISOString(),
    };

    if (!MOCK_COMMENTS[mediaId]) MOCK_COMMENTS[mediaId] = [];
    MOCK_COMMENTS[mediaId].push(comment);
    return comment;
}

// === Photo Upload (from file picker) ===

export async function addPhotosToAlbum(
    files: File[],
    uploadedBy: UploadedBy
): Promise<{ added: DriveMedia[]; dateKeys: string[] }> {
    await new Promise((r) => setTimeout(r, 200));
    ensureMockData();

    const added: DriveMedia[] = [];
    const dateKeysSet = new Set<string>();

    files.forEach((file, i) => {
        // File.lastModified はiOS写真ピッカーでは撮影日時を返す
        const fileDate = new Date(file.lastModified);
        const dateKey = format(fileDate, "yyyy-MM-dd");
        dateKeysSet.add(dateKey);

        const existingMedia = MOCK_MEDIA_CACHE.get(dateKey) || [];
        const idx = existingMedia.length;
        const seed = fileDate.getTime() + idx + i;

        const preview = URL.createObjectURL(file);

        const media: DriveMedia = {
            id: `media-${format(fileDate, "yyyyMMdd")}-${idx}`,
            name: file.name || `IMG_${format(fileDate, "yyyyMMdd")}_${String(idx).padStart(3, "0")}.jpg`,
            mimeType: file.type || "image/jpeg",
            thumbnailLink: preview,
            webContentLink: preview,
            webViewLink: preview,
            createdTime: fileDate.toISOString(),
            modifiedTime: new Date().toISOString(),
            size: String(file.size),
            uploadedBy,
            imageMediaMetadata: {
                width: 1920,
                height: 1440,
            },
        };

        existingMedia.push(media);
        MOCK_MEDIA_CACHE.set(dateKey, existingMedia);
        added.push(media);
    });

    return { added, dateKeys: Array.from(dateKeysSet) };
}
