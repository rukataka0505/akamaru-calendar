"use client";

import React from "react";
import { AlbumGroup } from "@/lib/types";

interface DateCardProps {
    group: AlbumGroup;
    onOpen: (dateKey: string) => void;
}

export default function DateCard({ group, onOpen }: DateCardProps) {
    return (
        <button
            onClick={() => onOpen(group.date)}
            className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden group active:scale-[0.98] transition-transform duration-200"
        >
            {/* Background Image */}
            <img
                src={group.coverImage.thumbnailLink}
                alt={group.displayDate}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Top-right Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
                <span className="text-white text-xs font-medium">
                    {group.media.length}枚
                </span>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-lg font-bold tracking-tight drop-shadow-md">
                    {group.displayDate}
                </p>
            </div>
        </button>
    );
}
