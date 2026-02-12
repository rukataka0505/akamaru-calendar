"use client";

import React, { useState, useEffect } from "react";
import { Heart, ImageIcon } from "lucide-react";
import { DriveMedia, AlbumGroup } from "@/lib/types";
import { getMediaByMonth, groupMediaByDate } from "@/lib/mockDriveService";
import DateCard from "./DateCard";
import FavoritesView from "./FavoritesView";

type AlbumFilter = "all" | "favorites";

interface AlbumTimelineProps {
    favorites: Set<string>;
    onOpenFeed: (dateKey: string) => void;
}

export default function AlbumTimeline({
    favorites,
    onOpenFeed,
}: AlbumTimelineProps) {
    const [groups, setGroups] = useState<AlbumGroup[]>([]);
    const [allMedia, setAllMedia] = useState<DriveMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<AlbumFilter>("all");
    const [currentMonth] = useState(new Date());

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

    return (
        <div className="flex flex-col min-h-0 pb-16">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-border px-4 py-3">
                <h1 className="text-lg font-bold text-foreground mb-3">アルバム</h1>

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
                            カレンダーの記録から写真を追加しよう
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
