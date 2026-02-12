"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Drawer } from "vaul";
import { format, isSameDay, isToday, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { ja } from "date-fns/locale";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface RepeatCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDates: Date[];
    onDatesChange: (dates: Date[]) => void;
    eventTitle: string;
    eventColor: string;
    baseDate: Date;
}

function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(0);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) {
            onSwipeLeft();
        }
        if (isRightSwipe) {
            onSwipeRight();
        }
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
    };
}

export default function RepeatCalendarModal({
    isOpen,
    onClose,
    selectedDates,
    onDatesChange,
    eventTitle,
    eventColor,
    baseDate,
}: RepeatCalendarModalProps) {
    const [currentMonth, setCurrentMonth] = useState(baseDate);

    const handlePrevMonth = useCallback(() => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    }, [currentMonth]);

    const handleNextMonth = useCallback(() => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    }, [currentMonth]);

    const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe(handleNextMonth, handlePrevMonth);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 日曜始まり
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const weeks: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7));
    }

    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

    const handleDateToggle = useCallback((date: Date) => {
        const isSelected = selectedDates.some(d => isSameDay(d, date));
        if (isSelected) {
            // 解除
            onDatesChange(selectedDates.filter(d => !isSameDay(d, date)));
        } else {
            // 追加
            onDatesChange([...selectedDates, date]);
        }
    }, [selectedDates, onDatesChange]);

    const handleComplete = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex max-h-[85vh] flex-col rounded-t-2xl bg-white outline-none">
                    {/* Drag Handle */}
                    <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border" />

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 transition-colors hover:bg-muted active:bg-border"
                        >
                            <X size={22} className="text-muted-foreground" />
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="px-4 pb-2">
                        <p className="text-sm text-foreground">追加したい日付を選択してください。</p>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto px-2 pb-4">
                        {/* Month Header */}
                        <div className="flex items-center justify-center py-3 relative">
                            <h2 className="text-lg font-bold text-foreground">
                                {format(currentMonth, "yyyy年M月", { locale: ja })}
                            </h2>
                        </div>

                        {/* Calendar Grid */}
                        <div
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 border-b border-border">
                                {dayNames.map((name, i) => (
                                    <div
                                        key={name}
                                        className={`py-1.5 text-center text-[0.65rem] font-medium ${i === 0 ? "text-destructive" : i === 6 ? "text-sky-500" : "text-muted-foreground"
                                            }`}
                                    >
                                        {name}
                                    </div>
                                ))}
                            </div>

                            {/* Weeks */}
                            {weeks.map((week, weekIdx) => (
                                <div key={weekIdx} className="grid grid-cols-7 border-t border-border/50 first:border-t-0">
                                    {week.map((day) => {
                                        const dateKey = format(day, "yyyy-MM-dd");
                                        const isSelected = selectedDates.some(d => isSameDay(d, day));
                                        const isTodayDate = isToday(day);
                                        const isCurrentMonth = isSameMonth(day, currentMonth);
                                        const dayOfWeek = day.getDay();
                                        const isSaturday = dayOfWeek === 6;
                                        const isSunday = dayOfWeek === 0;

                                        return (
                                            <button
                                                key={dateKey}
                                                onClick={() => handleDateToggle(day)}
                                                className={`
                                                    relative flex flex-col items-center py-2 h-16 w-full transition-colors
                                                    ${isSelected ? "bg-accent-light" : ""}
                                                    ${!isCurrentMonth ? "opacity-30" : ""}
                                                    active:bg-border
                                                `}
                                            >
                                                <span
                                                    className={`
                                                        text-[0.75rem] leading-none flex items-center justify-center mb-1
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

                                                {/* Event Ribbon */}
                                                {isSelected && (
                                                    <div className="mt-0.5 w-full px-1">
                                                        <div
                                                            className="event-bar text-white text-center"
                                                            style={{ backgroundColor: eventColor }}
                                                        >
                                                            {eventTitle || "予定"}
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-6 pt-2">
                        <button
                            onClick={handleComplete}
                            className="w-full rounded-full bg-gray-700 py-3 text-sm font-semibold text-white active:bg-gray-800"
                        >
                            完了
                        </button>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
