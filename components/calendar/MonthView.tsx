"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { format, isSameDay, isToday, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarEvent } from "@/lib/types";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

interface MonthViewProps {
    month: Date;
    selectedDate: Date | null;
    events: CalendarEvent[];
    onDateSelect: (date: Date) => void;
    onMonthChange: (date: Date) => void;
}

// スライドアニメーションのバリアント定義
const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0.5,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? "-100%" : "100%",
        opacity: 0.5,
    }),
};

const transition = {
    x: { type: "tween", duration: 0.25, ease: "easeInOut" },
    opacity: { duration: 0.2 },
};

export default function MonthView({
    month,
    selectedDate,
    events,
    onDateSelect,
    onMonthChange,
}: MonthViewProps) {
    const [[direction], setDirection] = useState<[number]>([0]);
    const isAnimating = useRef(false);

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
        if (isAnimating.current) return;
        const prev = new Date(month.getFullYear(), month.getMonth() - 1, 1);
        setDirection([-1]);
        onMonthChange(prev);
    }, [month, onMonthChange]);

    const handleNextMonth = useCallback(() => {
        if (isAnimating.current) return;
        const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
        setDirection([1]);
        onMonthChange(next);
    }, [month, onMonthChange]);

    // パンジェスチャーのハンドラー（スワイプ検出）
    const handleDragEnd = useCallback(
        (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            const threshold = 50;
            const velocity = info.velocity.x;
            const offset = info.offset.x;

            if (offset < -threshold || velocity < -500) {
                handleNextMonth();
            } else if (offset > threshold || velocity > 500) {
                handlePrevMonth();
            }
        },
        [handleNextMonth, handlePrevMonth]
    );

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
    const monthKey = format(month, "yyyy-MM");

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden">
            {/* Month Header Removed - Controlled by Parent */}

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-border shrink-0">
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

            {/* Calendar Grid with Animation */}
            <div className="flex-1 relative border-b border-border">
                <AnimatePresence
                    initial={false}
                    custom={direction}
                    mode="popLayout"
                    onExitComplete={() => {
                        isAnimating.current = false;
                    }}
                >
                    <motion.div
                        key={monthKey}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={transition}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.15}
                        onDragEnd={handleDragEnd}
                        onAnimationStart={() => {
                            isAnimating.current = true;
                        }}
                        onAnimationComplete={() => {
                            isAnimating.current = false;
                        }}
                        className="flex flex-col h-full w-full"
                        style={{ touchAction: "pan-y" }}
                    >
                        {weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="grid grid-cols-7 flex-1 border-t border-border/50 first:border-t-0">
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
                                                relative flex flex-col items-center py-1 h-full w-full transition-colors
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
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
