"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, ImageIcon, Plus } from "lucide-react";
import { DriveMedia, AlbumGroup, UploadedBy } from "@/lib/types";
import { getMediaByMonth, groupMediaByDate, addPhotosToAlbum } from "@/lib/mockDriveService";
import DateCard from "./DateCard";
import FavoritesView from "./FavoritesView";

type AlbumFilter = "all" | "favorites";

interface AlbumTimelineProps {
    favorites: Set<string>;
    onOpenFeed: (dateKey: string) => void;
    currentUserId: UploadedBy;
}

export default function AlbumTimeline({
    favorites,
    onOpenFeed,
    currentUserId,
}: AlbumTimelineProps) {
    const [groups, setGroups] = useState<AlbumGroup[]>([]);
    const [allMedia, setAllMedia] = useState<DriveMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<AlbumFilter>("all");
    const [currentMonth] = useState(new Date());
    const [toast, setToast] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const media = await getMediaByMonth(
                currentMonth.getFullYear(),
                currentMonth.getMonth()
            );
            setAllMedia(media);
            setGroups(groupMediaByDate(media));
            setIsLoading(false);
        };
        load();
    }, [currentMonth]);

    // トースト自動消去
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleAddPhotos = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFilesSelected = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const fileList = e.target.files;
            if (!fileList || fileList.length === 0) return;

            const files = Array.from(fileList).filter((f) =>
                f.type.startsWith("image/")
            );
            if (files.length === 0) return;

            // 選択した写真を即座にアルバムに追加（二度選択なし）
            const { added } = await addPhotosToAlbum(files, currentUserId);

            // 全メディアを再取得してグループを更新
            const media = await getMediaByMonth(
                currentMonth.getFullYear(),
                currentMonth.getMonth()
            );
            setAllMedia(media);
            setGroups(groupMediaByDate(media));

            // トースト表示
            setToast(`${added.length}枚の写真を追加しました`);

            // input をリセット（同じファイルを再選択可能に）
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        },
        [currentUserId, currentMonth]
    );

    return (
        <div className="flex flex-col min-h-0 pb-16">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-border px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-lg font-bold text-foreground">アルバム</h1>
                    <button
                        onClick={handleAddPhotos}
                        className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 hover:shadow-md"
                    >
                        <Plus size={14} strokeWidth={2.5} />
                        写真を追加
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                    <button
                        onClick={() => setFilter("all")}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${filter === "all"
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <ImageIcon size={14} />
                        すべて
                    </button>
                    <button
                        onClick={() => setFilter("favorites")}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${filter === "favorites"
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Heart size={14} />
                        お気に入り
                        {favorites.size > 0 && (
                            <span className="bg-rose-100 text-rose-500 rounded-full px-1.5 text-[0.6rem] font-bold">
                                {favorites.size}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Hidden file input — triggers iOS Photo Picker */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    // Skeleton Loading
                    <div className="px-4 py-4 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-full aspect-[16/9] rounded-2xl bg-muted animate-pulse"
                            />
                        ))}
                    </div>
                ) : filter === "favorites" ? (
                    <div className="py-4">
                        <FavoritesView
                            allMedia={allMedia}
                            favorites={favorites}
                            onOpenMedia={onOpenFeed}
                        />
                    </div>
                ) : groups.length > 0 ? (
                    <div className="px-4 py-4 space-y-4">
                        {groups.map((group) => (
                            <DateCard key={group.date} group={group} onOpen={onOpenFeed} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <div className="text-4xl mb-3">📷</div>
                        <p className="text-sm font-medium">まだ写真がありません</p>
                        <p className="text-xs mt-1 text-muted-foreground/60">
                            上の「写真を追加」ボタンから写真を追加しよう
                        </p>
                        <button
                            onClick={handleAddPhotos}
                            className="mt-4 flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all active:scale-95"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            写真を追加
                        </button>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-foreground text-white rounded-full px-5 py-2.5 text-sm font-medium shadow-lg flex items-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        {toast}
                    </div>
                </div>
            )}
        </div>
    );
}
