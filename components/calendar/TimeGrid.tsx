"use client";

import React, { useRef, useEffect } from "react";
import { format, isSameDay, setHours, setMinutes } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarEvent } from "@/lib/types";
import EventBlock from "./EventBlock";

interface TimeGridProps {
    date: Date;
    events: CalendarEvent[];
    selectedDate: Date | null;
    onTimeSelect: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
    showTimeLabels?: boolean;
    className?: string;
}

export default function TimeGrid({
    date,
    events,
    selectedDate,
    onTimeSelect,
    onEventClick,
    showTimeLabels = false,
    className = "",
}: TimeGridProps) {
    // Generate 30-minute slots for 24 hours
    const slots = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2);
        const minute = (i % 2) * 30;
        return { hour, minute };
    });

    const handleSlotClick = (hour: number, minute: number) => {
        const clickedDate = setMinutes(setHours(date, hour), minute);
        onTimeSelect(clickedDate);
    };

    return (
        <div className={`relative flex flex-col h-full ${className}`}>
            <div className="relative min-h-[1440px]"> {/* 24h * 60px/h = 1440px */}
                {slots.map(({ hour, minute }, index) => {
                    const isHourStart = minute === 0;
                    const timeLabel = isHourStart ? `${hour}:00` : null;

                    // Determine if this slot is selected
                    let isSelected = false;
                    if (selectedDate && isSameDay(date, selectedDate)) {
                        const selectedHour = selectedDate.getHours();
                        const selectedMinute = selectedDate.getMinutes();
                        // Check if within this 30 min block
                        if (selectedHour === hour && selectedMinute >= minute && selectedMinute < minute + 30) {
                            isSelected = true;
                        }
                    }

                    return (
                        <div
                            key={`${hour}-${minute}`}
                            className={`absolute left-0 right-0 h-[30px] border-b border-border/30 flex items-center
                ${isHourStart ? "border-t border-border/50" : ""}
                ${isSelected ? "bg-accent/10 outline outline-2 outline-accent z-10" : ""}
              `}
                            style={{ top: `${index * 30}px` }}
                            onClick={() => handleSlotClick(hour, minute)}
                        >
                            {showTimeLabels && isHourStart && (
                                <span className="absolute left-[-3.5rem] -top-2.5 w-12 text-right text-xs text-muted-foreground pr-2">
                                    {hour !== 0 ? timeLabel : ""}
                                </span>
                            )}
                        </div>
                    );
                })}

                {/* Render Events */}
                {events.map((event) => {
                    const start = new Date(event.start);
                    const end = new Date(event.end);

                    // Simple position calc: minutes from start of day
                    const startMinutes = start.getHours() * 60 + start.getMinutes();
                    const endMinutes = end.getHours() * 60 + end.getMinutes();
                    const duration = endMinutes - startMinutes;

                    // 1 minute = 1px (since 30min = 30px)
                    const top = startMinutes;
                    const height = Math.max(duration, 15); // Min height 15px

                    return (
                        <EventBlock
                            key={event.id}
                            event={event}
                            onClick={onEventClick}
                            style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                // Basic overlap handling: user didn't specify, so maybe just full width standard z-index stacking
                                // For now, assume 90% width and z-index based on start time?
                                width: "90%",
                                left: "5%",
                                zIndex: 20,
                            }}
                        />
                    );
                })}

                {/* Current Time Indicator (Red Line) - Optional, good for Day/Week view */}
                {isSameDay(date, new Date()) && (
                    (() => {
                        const now = new Date();
                        const minutes = now.getHours() * 60 + now.getMinutes();
                        return (
                            <div
                                className="absolute left-0 right-0 border-t-2 border-red-500 z-50 pointer-events-none flex items-center"
                                style={{ top: `${minutes}px` }}
                            >
                                <div className="absolute -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
                            </div>
                        )
                    })()
                )}

            </div>
        </div>
    );
}
