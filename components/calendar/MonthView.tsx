"use client";

import React, { useCallback, useMemo } from "react";
import { format, isSameDay, isToday, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarEvent } from "@/lib/types";

interface MonthViewProps {
    month: Date;
    selectedDate: Date | null;
    events: CalendarEvent[];
    onDateSelect: (date: Date) => void;
    onMonthChange: (date: Date) => void;
}

export default function MonthView({
    month,
    selectedDate,
    events,
    onDateSelect,
    onMonthChange,
}: MonthViewProps) {
    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        events.forEach((event) => {
            const start = new Date(event.start);
            const end = new Date(event.end);
            const days = eachDayOfInterval({ start, end });
            days.forEach((day) => {
                const key = format(day, "yyyy-MM-dd");
                if (!map.has(key)) map.set(key, []);
                map.get(key)!.push(event);
            });
        });
        return map;
    }, [events]);

    const handlePrevMonth = useCallback(() => {
        const prev = new Date(month.getFullYear(), month.getMonth() - 1, 1);
        onMonthChange(prev);
    }, [month, onMonthChange]);

    const handleNextMonth = useCallback(() => {
        const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
        onMonthChange(next);
    }, [month, onMonthChange]);

    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const weeks: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7));
    }

    const dayNames = ["月", "火", "水", "木", "金", "土", "日"];

    return (
        <div className="w-full">
            {/* Month Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div>
                    <h2 className="text-lg font-bold text-foreground">
                        {format(month, "yyyy年M月", { locale: ja })}
                        <span className="ml-1 text-xs text-muted-foreground">▼</span>
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrevMonth}
                        className="rounded-full p-1.5 transition-colors hover:bg-muted active:bg-border"
                        aria-label="前の月"
                    >
                        <ChevronLeft size={20} className="text-muted-foreground" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="rounded-full p-1.5 transition-colors hover:bg-muted active:bg-border"
                        aria-label="次の月"
                    >
                        <ChevronRight size={20} className="text-muted-foreground" />
                    </button>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-border">
                {dayNames.map((name, i) => (
                    <div
                        key={name}
                        className={`py-1.5 text-center text-[0.65rem] font-medium ${i === 5 ? "text-sky-500" : i === 6 ? "text-destructive" : "text-muted-foreground"
                            }`}
                    >
                        {name}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="border-b border-border">
                {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7">
                        {week.map((day) => {
                            const dateKey = format(day, "yyyy-MM-dd");
                            const dayEvents = eventsByDate.get(dateKey) || [];
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);
                            const isCurrentMonth = isSameMonth(day, month);
                            const dayOfWeek = day.getDay();
                            const isSaturday = dayOfWeek === 6;
                            const isSunday = dayOfWeek === 0;

                            return (
                                <button
                                    key={dateKey}
                                    onClick={() => onDateSelect(day)}
                                    className={`
                    relative flex flex-col items-center py-1 min-h-[52px] transition-spring
                    ${isSelected ? "bg-muted" : ""}
                    ${!isCurrentMonth ? "opacity-30" : ""}
                    active:bg-border
                  `}
                                >
                                    <span
                                        className={`
                      text-[0.75rem] leading-none flex items-center justify-center
                      ${isTodayDate
                                                ? "bg-accent text-white rounded-full w-6 h-6 font-bold"
                                                : isSelected
                                                    ? "font-semibold text-foreground"
                                                    : isSunday
                                                        ? "text-destructive"
                                                        : isSaturday
                                                            ? "text-sky-500"
                                                            : "text-foreground"
                                            }
                    `}
                                    >
                                        {format(day, "d")}
                                    </span>

                                    {/* Event Bars */}
                                    <div className="mt-0.5 flex w-full flex-col gap-[1px] px-[2px] overflow-hidden">
                                        {dayEvents.slice(0, 2).map((evt) => (
                                            <div
                                                key={evt.id}
                                                className="event-bar text-white"
                                                style={{ backgroundColor: evt.color }}
                                            >
                                                {evt.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <span className="text-[0.5rem] text-muted-foreground text-center">
                                                +{dayEvents.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
