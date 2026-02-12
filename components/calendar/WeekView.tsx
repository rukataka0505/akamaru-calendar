"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarEvent } from "@/lib/types";
import TimeGrid from "./TimeGrid";

interface WeekViewProps {
    currentDate: Date; // The currently viewed date (determines the week)
    selectedDate: Date | null;
    events: CalendarEvent[];
    onTimeSelect: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
}

export default function WeekView({
    currentDate,
    selectedDate,
    events,
    onTimeSelect,
    onEventClick,
}: WeekViewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Filter events for each day
    const eventsByDay = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        events.forEach((event) => {
            const start = new Date(event.start);
            const key = format(start, "yyyy-MM-dd");
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(event);
        });
        return map;
    }, [events]);

    // Scroll to current time or 9:00 AM on mount
    useEffect(() => {
        if (scrollRef.current) {
            // Scroll to 8:00 AM (8 * 60 = 480px)
            scrollRef.current.scrollTop = 480;
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Week Header */}
            <div className="flex border-b border-border pl-12 pr-4 scrollbar-gutter-stable"> {/* Left padding for time labels */}
                {days.map((day, i) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-center py-2">
                            <span className={`text-[0.65rem] font-medium ${i === 5 ? "text-sky-500" : i === 6 ? "text-destructive" : "text-muted-foreground"
                                }`}>
                                {format(day, "E", { locale: ja })}
                            </span>
                            <div className={`
                            w-7 h-7 flex items-center justify-center rounded-full text-sm mt-0.5
                            ${isToday ? "bg-accent text-white font-bold" : ""}
                            ${isSelected && !isToday ? "bg-muted text-foreground font-semibold" : ""}
                        `}>
                                {format(day, "d")}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Scrollable Grid Container */}
            <div className="flex-1 overflow-y-auto relative flex" ref={scrollRef}>
                {/* Time Labels Column (Sticky Left) */}
                <div className="sticky left-0 bg-white z-20 w-12 border-r border-border/50 flex flex-col min-h-[1440px]">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="h-[60px] relative">
                            <span className="absolute -top-3 right-2 text-xs text-muted-foreground">
                                {i !== 0 ? `${i}:00` : ""}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                {days.map((day, i) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const daysEvents = eventsByDay.get(dateKey) || [];

                    return (
                        <div key={i} className="flex-1 border-r border-border/30 min-w-[50px] relative">
                            <TimeGrid
                                date={day}
                                events={daysEvents}
                                selectedDate={selectedDate}
                                onTimeSelect={onTimeSelect}
                                onEventClick={onEventClick}
                                showTimeLabels={false} // Handled by sticky column
                                className="bg-transparent"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
