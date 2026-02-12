"use client";

import React, { useRef, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { DriveMedia } from "@/lib/types";
import HeartButton from "./HeartButton";
import CommentSection from "./CommentSection";

interface MediaItemProps {
    media: DriveMedia;
    isFavorite: boolean;
    onToggleFavorite: (mediaId: string) => void;
}

export default function MediaItem({
    media,
    isFavorite,
    onToggleFavorite,
}: MediaItemProps) {
    const imgRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(media.webContentLink, "_blank");
    };

    return (
        <div
            ref={imgRef}
            className={`transition-all duration-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
        >
            {/* Image */}
            <div className="relative w-full aspect-[4/3] bg-neutral-900 rounded-xl overflow-hidden">
                {isVisible && (
                    <img
                        src={media.webContentLink}
                        alt={media.name}
                        loading="lazy"
                        onLoad={() => setIsLoaded(true)}
                        className="w-full h-full object-cover transition-opacity duration-500"
                        style={{ opacity: isLoaded ? 1 : 0 }}
                    />
                )}

                {/* Skeleton while loading */}
                {!isLoaded && (
                    <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
                )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between px-1 py-2">
                <div className="flex items-center gap-2">
                    <HeartButton
                        mediaId={media.id}
                        isFavorite={isFavorite}
                        onToggle={onToggleFavorite}
                    />
                </div>

                <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs hover:bg-white/20 hover:text-white transition-all active:scale-95"
                >
                    <Download size={14} />
                    <span>オリジナル</span>
                </button>
            </div>

            {/* Comment Section */}
            <div className="px-1 pb-3">
                <CommentSection mediaId={media.id} />
            </div>
        </div>
    );
}
