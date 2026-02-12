"use client";

import React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { PlusCircle } from "lucide-react";
import { CalendarEvent } from "@/lib/types";

interface DayDetailProps {
    date: Date;
    events: CalendarEvent[];
    onAddEvent: () => void;
}

export default function DayDetail({
    date,
    events,
    onAddEvent,
}: DayDetailProps) {
    const dayEvents = events.filter((e) => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        return date >= start && date <= end;
    });

    return (
        <div className="flex flex-col flex-1 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-base font-bold text-foreground">
                    {format(date, "M月d日 EEEE", { locale: ja })}
                </h3>
                <button
                    onClick={onAddEvent}
                    className="rounded-full p-1 transition-colors hover:bg-muted active:bg-border"
                    aria-label="予定を追加"
                >
                    <PlusCircle size={24} className="text-foreground" />
                </button>
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {dayEvents.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                        予定がありません
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {dayEvents.map((evt) => (
                            <div
                                key={evt.id}
                                className="flex items-center gap-3 rounded-xl p-3 transition-colors active:bg-muted"
                                style={{ borderLeft: `3px solid ${evt.color}` }}
                            >
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {evt.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {evt.allDay
                                            ? "終日"
                                            : `${format(new Date(evt.start), "HH:mm")} - ${format(
                                                new Date(evt.end),
                                                "HH:mm"
                                            )}`}
                                    </p>
                                </div>
                                <span
                                    className="h-2 w-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: evt.color }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
