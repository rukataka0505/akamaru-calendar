"use client";

import React, { useState, useRef, useCallback } from "react";
import DayDetail from "./DayDetail";
import { CalendarEvent } from "@/lib/types";

interface DayDetailDrawerProps {
    selectedDate: Date;
    events: CalendarEvent[];
    onAddEvent: () => void;
    onEditEvent: (event: CalendarEvent) => void;
    onClose: () => void;
}

export default function DayDetailDrawer({
    selectedDate,
    events,
    onAddEvent,
    onEditEvent,
    onClose,
}: DayDetailDrawerProps) {
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const currentY = useRef(0);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
        currentY.current = e.touches[0].clientY;
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;
        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;
        // Only allow dragging downward
        if (diff > 0) {
            setTranslateY(diff);
        }
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        const diff = currentY.current - startY.current;
        if (diff > 100) {
            // Swipe threshold reached, close
            setTranslateY(500);
            setTimeout(onClose, 200);
        } else {
            // Snap back
            setTranslateY(0);
        }
    }, [onClose]);

    return (
        <div
            className="pointer-events-auto bg-white rounded-t-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.08)] flex flex-col h-[40vh]"
            style={{
                transform: `translateY(${translateY}px)`,
                transition: isDragging ? "none" : "transform 0.3s ease-out",
            }}
        >
            {/* Drag Handle */}
            <div
                className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <DayDetail
                    date={selectedDate}
                    events={events}
                    onAddEvent={onAddEvent}
                    onEditEvent={onEditEvent}
                />
            </div>
        </div>
    );
}
