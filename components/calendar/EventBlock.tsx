"use client";

import React from "react";
import { CalendarEvent } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface EventBlockProps {
    event: CalendarEvent;
    onClick: (event: CalendarEvent) => void;
    style?: React.CSSProperties;
    className?: string;
}

export default function EventBlock({ event, onClick, style, className }: EventBlockProps) {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onClick(event);
            }}
            style={{
                backgroundColor: event.color, // Ideally use a lighter shade for background and solid for border
                borderLeft: `4px solid ${event.color}`, // Using the color as border
                ...style,
            }}
            className={`absolute inset-x-1 rounded-md p-1 cursor-pointer overflow-hidden text-xs text-white shadow-sm hover:opacity-90 transition-opacity ${className}`}
        >
            <div className="font-semibold truncate">{event.title}</div>
            <div className="text-[10px] opacity-90 truncate">
                {format(event.start, "HH:mm", { locale: ja })} - {format(event.end, "HH:mm", { locale: ja })}
            </div>
            {event.location && (
                <div className="text-[10px] opacity-80 truncate">{event.location}</div>
            )}
        </div>
    );
}
