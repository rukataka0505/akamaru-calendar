"use client";

import React, { useRef, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarEvent } from "@/lib/types";
import TimeGrid from "./TimeGrid";

interface DayViewProps {
    currentDate: Date;
    selectedDate: Date | null;
    events: CalendarEvent[];
    onTimeSelect: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
}

export default function DayView({
    currentDate,
    selectedDate,
    events,
    onTimeSelect,
    onEventClick,
}: DayViewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter events for this day
    const daysEvents = events.filter((event) => {
        const start = new Date(event.start);
        return isSameDay(start, currentDate);
    });

    // Scroll to current time or 8:00 AM
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 480;
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Day Header - showing the day of week and date huge */}
            <div className="flex items-center justify-center py-4 border-b border-border shrink-0">
                <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground font-medium mb-1">
                        {format(currentDate, "E曜日", { locale: ja })}
                    </span>
                    <span className={`text-4xl font-bold ${isSameDay(currentDate, new Date()) ? "text-accent" : "text-foreground"
                        }`}>
                        {format(currentDate, "d")}
                    </span>
                </div>
            </div>

            {/* Scrollable Grid Container */}
            <div className="flex-1 overflow-y-auto relative flex" ref={scrollRef}>
                {/* Time Labels Column (Sticky Left) */}
                <div className="sticky left-0 bg-white z-20 w-16 border-r border-border/50 flex flex-col min-h-[1440px]">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="h-[60px] relative">
                            <span className="absolute -top-3 right-3 text-xs text-muted-foreground font-medium">
                                {i}:00
                            </span>
                            {/* Optional: half-hour marker? No, keeping it clean */}
                        </div>
                    ))}
                </div>

                {/* Day Column */}
                <div className="flex-1 relative">
                    <TimeGrid
                        date={currentDate}
                        events={daysEvents}
                        selectedDate={selectedDate}
                        onTimeSelect={onTimeSelect}
                        onEventClick={onEventClick}
                        showTimeLabels={false} // Handled by side column
                        className="bg-transparent"
                    />
                </div>
            </div>
        </div>
    );
}
