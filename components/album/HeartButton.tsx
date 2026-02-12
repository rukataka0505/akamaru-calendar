"use client";

import React from "react";
import { Heart } from "lucide-react";

interface HeartButtonProps {
    mediaId: string;
    isFavorite: boolean;
    onToggle: (mediaId: string) => void;
}

export default function HeartButton({
    mediaId,
    isFavorite,
    onToggle,
}: HeartButtonProps) {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(mediaId);
    };

    return (
        <button
            onClick={handleClick}
            className={`
        relative flex items-center justify-center w-9 h-9 rounded-full
        transition-all duration-300 ease-out
        ${isFavorite
                    ? "text-rose-500 bg-rose-500/10"
                    : "text-white/70 bg-white/10 hover:bg-white/20 hover:text-white"
                }
        active:scale-90
      `}
            aria-label={isFavorite ? "お気に入り解除" : "お気に入り追加"}
        >
            <Heart
                size={20}
                fill={isFavorite ? "currentColor" : "none"}
                strokeWidth={2}
                className={`transition-all duration-300 ${isFavorite ? "heart-pop" : ""
                    }`}
            />
        </button>
    );
}
