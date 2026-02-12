"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { DriveMedia } from "@/lib/types";
import { getMediaByDate } from "@/lib/driveService";
import MediaItem from "./MediaItem";

interface MediaFeedProps {
    dateKey: string;
    favorites: Set<string>;
    onToggleFavorite: (mediaId: string) => void;
    onClose: () => void;
}

export default function MediaFeed({
    dateKey,
    favorites,
    onToggleFavorite,
    onClose,
}: MediaFeedProps) {
    const [media, setMedia] = useState<DriveMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const data = await getMediaByDate(dateKey);
            setMedia(data);
            setIsLoading(false);
        };
        load();
    }, [dateKey]);

    const displayDate = format(new Date(dateKey), "yyyy年M月d日 (E)", {
        locale: ja,
    });

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-[#FFF9F5] flex flex-col animate-slideUp">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#FFF9F5]/90 backdrop-blur-md border-b border-stone-200/50 safe-top">
                <button
                    onClick={onClose}
                    className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
                >
                    <ArrowLeft size={22} className="text-stone-800" />
                </button>
                <div>
                    <h2 className="text-stone-800 text-sm font-semibold">{displayDate}</h2>
                    <p className="text-stone-500 text-xs">
                        {isLoading ? "読み込み中..." : `${media.length}枚`}
                    </p>
                </div>
            </div>

            {/* Media List */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-6">
                {isLoading ? (
                    // Skeleton
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="w-full aspect-[4/3] rounded-xl bg-stone-200 animate-pulse" />
                    ))
                ) : (
                    media.map((item) => (
                        <MediaItem
                            key={item.id}
                            media={item}
                            isFavorite={favorites.has(item.id)}
                            onToggleFavorite={onToggleFavorite}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
