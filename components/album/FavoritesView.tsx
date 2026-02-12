"use client";

import React from "react";
import { DriveMedia } from "@/lib/types";

interface FavoritesViewProps {
    allMedia: DriveMedia[];
    favorites: Set<string>;
    onOpenMedia: (dateKey: string) => void;
}

export default function FavoritesView({
    allMedia,
    favorites,
    onOpenMedia,
}: FavoritesViewProps) {
    const favoriteMedia = allMedia.filter((m) => favorites.has(m.id));

    if (favoriteMedia.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <div className="text-4xl mb-3">❤️</div>
                <p className="text-sm font-medium">お気に入りはまだありません</p>
                <p className="text-xs mt-1 text-muted-foreground/60">
                    写真のハートをタップして追加しよう
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-1 px-1">
            {favoriteMedia.map((media) => {
                const dateKey = media.createdTime.split("T")[0];
                return (
                    <button
                        key={media.id}
                        onClick={() => onOpenMedia(dateKey)}
                        className="relative aspect-square rounded-lg overflow-hidden group active:scale-95 transition-transform"
                    >
                        <img
                            src={media.thumbnailLink}
                            alt={media.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute top-1 right-1">
                            <span className="text-rose-400 drop-shadow-md text-xs">❤️</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
