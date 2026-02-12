"use client";

import React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Plus, ChevronRight, ChevronDown } from "lucide-react";
import { CalendarEvent } from "@/lib/types";

interface DayDetailProps {
    date: Date;
    events: CalendarEvent[];
    onAddEvent: () => void;
    onEditEvent: (event: CalendarEvent) => void;
}

export default function DayDetail({
    date,
    events,
    onAddEvent,
    onEditEvent,
}: DayDetailProps) {
    const dayEvents = events.filter((e) => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        return date >= start && date <= end;
    });

    return (
        <div className="flex flex-col bg-white" style={{ height: "100%" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground/80">
                    {format(date, "yyyy年M月d日(EEE)", { locale: ja })}
                </h3>
                <ChevronDown size={18} className="text-foreground/50" />
            </div>

            {/* Event List - fixed height with scroll */}
            <div className="flex-1 overflow-y-auto px-4">
                {dayEvents.length > 0 && (
                    <div className="flex flex-col">
                        {dayEvents.map((evt) => (
                            <div
                                key={evt.id}
                                onClick={() => onEditEvent(evt)}
                                className="flex items-center gap-3 py-3 border-b border-border/50 transition-colors active:bg-muted/30 cursor-pointer"
                            >
                                {/* Color ribbon bar */}
                                <div
                                    className="w-1 self-stretch rounded-full flex-shrink-0"
                                    style={{ backgroundColor: evt.color || "#a78bfa" }}
                                />
                                {/* Time label */}
                                <span className="text-xs text-muted-foreground w-8 flex-shrink-0">
                                    {evt.allDay
                                        ? "終日"
                                        : format(new Date(evt.start), "HH:mm")}
                                </span>
                                {/* Title */}
                                <p className="flex-1 text-sm font-medium text-foreground truncate">
                                    {evt.title}
                                </p>
                                {/* Arrow */}
                                <ChevronRight size={16} className="text-muted-foreground/50 flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Event Button */}
            <div className="px-4 py-3 border-t border-border/30">
                <button
                    onClick={onAddEvent}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted active:scale-[0.99]"
                >
                    <Plus size={16} />
                    <span>新しい予定の作成</span>
                </button>
            </div>
        </div>
    );
}
