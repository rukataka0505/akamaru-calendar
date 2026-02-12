"use client";

import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarEvent } from "@/lib/types";
import TimeGrid from "./TimeGrid";
import { motion, AnimatePresence } from "framer-motion";

interface WeekViewProps {
    currentDate: Date;
    selectedDate: Date | null;
    events: CalendarEvent[];
    onTimeSelect: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
    onPrev?: () => void;
    onNext?: () => void;
}

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
    x: { type: "tween", duration: 0.25, ease: "easeOut" },
    opacity: { duration: 0.15 },
};

export default function WeekView({
    currentDate,
    selectedDate,
    events,
    onTimeSelect,
    onEventClick,
    onPrev,
    onNext,
}: WeekViewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [direction, setDirection] = useState(0);
    const prevDateRef = useRef(currentDate);

    // Swipe state
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
    const swipeDirectionLockedRef = useRef<"horizontal" | "vertical" | null>(null);
    const [swipeOffsetX, setSwipeOffsetX] = useState(0);
    const isSwiping = useRef(false);

    useEffect(() => {
        if (prevDateRef.current < currentDate) {
            setDirection(1);
        } else if (prevDateRef.current > currentDate) {
            setDirection(-1);
        }
        prevDateRef.current = currentDate;
    }, [currentDate]);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const { allDayEvents, timeEvents } = useMemo(() => {
        const allDay: CalendarEvent[] = [];
        const time: CalendarEvent[] = [];
        events.forEach((event) => {
            if (event.allDay) {
                allDay.push(event);
            } else {
                time.push(event);
            }
        });
        return { allDayEvents: allDay, timeEvents: time };
    }, [events]);

    const timeEventsByDay = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        timeEvents.forEach((event) => {
            const start = new Date(event.start);
            const key = format(start, "yyyy-MM-dd");
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(event);
        });
        return map;
    }, [timeEvents]);

    const allDayEventsByDay = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        allDayEvents.forEach((event) => {
            const start = new Date(event.start);
            const end = new Date(event.end);
            if (start > end) return;
            const eventDays = eachDayOfInterval({ start, end });
            eventDays.forEach((day) => {
                const key = format(day, "yyyy-MM-dd");
                if (!map.has(key)) map.set(key, []);
                map.get(key)!.push(event);
            });
        });
        return map;
    }, [allDayEvents]);

    // Check if any day has all-day events
    const hasAnyAllDayEvents = useMemo(() => {
        return days.some(day => {
            const dateKey = format(day, "yyyy-MM-dd");
            return (allDayEventsByDay.get(dateKey) || []).length > 0;
        });
    }, [days, allDayEventsByDay]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 480;
        }
    }, []);

    // Touch handlers for swipe navigation
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        swipeDirectionLockedRef.current = null;
        isSwiping.current = false;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartRef.current) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;

        // Lock direction on first significant movement
        if (!swipeDirectionLockedRef.current) {
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            if (absDx < 5 && absDy < 5) return; // Not moved enough to determine direction

            if (absDx > absDy * 1.2) {
                swipeDirectionLockedRef.current = "horizontal";
                isSwiping.current = true;
            } else {
                swipeDirectionLockedRef.current = "vertical";
                return;
            }
        }

        if (swipeDirectionLockedRef.current === "horizontal") {
            e.preventDefault(); // Prevent vertical scroll while swiping horizontally
            setSwipeOffsetX(dx);
        }
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

        if (swipeDirectionLockedRef.current === "horizontal") {
            const threshold = 50;
            if (swipeOffsetX < -threshold && onNext) {
                onNext();
            } else if (swipeOffsetX > threshold && onPrev) {
                onPrev();
            }
        }

        touchStartRef.current = null;
        swipeDirectionLockedRef.current = null;
        isSwiping.current = false;
        setSwipeOffsetX(0);
    }, [swipeOffsetX, onPrev, onNext]);

    const weekKey = format(weekStart, "yyyy-MM-dd");

    return (
        <div
            className="flex flex-col h-full bg-white overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={weekKey}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={transition}
                    style={{
                        transform: swipeOffsetX !== 0 ? `translateX(${swipeOffsetX}px)` : undefined,
                    }}
                    className="flex flex-col h-full w-full bg-white relative"
                >
                    {/* Unified Scroll Container */}
                    <div className="flex-1 overflow-y-auto relative flex flex-col" ref={scrollRef}>

                        {/* Sticky Header Row */}
                        <div className="sticky top-0 z-30 flex bg-white border-b border-border shadow-sm shrink-0">
                            {/* Corner Spacer */}
                            <div className="w-12 shrink-0 border-r border-border bg-white" />

                            {/* Days Header */}
                            <div className="flex-1 flex">
                                {days.map((day, i) => {
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    const isToday = isSameDay(day, new Date());
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center justify-center py-2 border-r border-transparent">
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
                        </div>

                        {/* Sticky All Day Row - Fixed height to prevent grid misalignment */}
                        {hasAnyAllDayEvents && (
                            <div className="sticky top-[53px] z-20 flex bg-white border-b border-border shrink-0">
                                {/* Spacer */}
                                <div className="w-12 shrink-0 border-r border-border bg-white flex items-center justify-center">
                                    <span className="text-[9px] text-muted-foreground">終日</span>
                                </div>

                                {/* All Day Columns - Fixed height grid */}
                                <div className="flex-1 flex relative">
                                    {days.map((day, i) => {
                                        const dateKey = format(day, "yyyy-MM-dd");
                                        const dayAllDayEvents = allDayEventsByDay.get(dateKey) || [];

                                        return (
                                            <div key={i} className="flex-1 border-r border-gray-300 min-h-[28px] max-h-[56px] overflow-y-auto p-0.5 flex flex-col gap-0.5">
                                                {dayAllDayEvents.map(event => (
                                                    <div
                                                        key={event.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEventClick(event);
                                                        }}
                                                        className="text-[10px] text-white px-1 py-0.5 rounded truncate cursor-pointer shrink-0"
                                                        style={{ backgroundColor: event.color }}
                                                    >
                                                        {event.title}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Time Grid Row */}
                        <div className="flex relative min-h-[1440px]">
                            {/* Time Labels Column (Sticky Left) */}
                            <div className="sticky left-0 bg-white z-10 w-12 border-r border-border shrink-0 h-full">
                                <div className="relative h-full w-full">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute right-0 w-full border-b border-transparent flex justify-end pr-2"
                                            style={{ top: `${i * 60}px`, height: '60px' }}
                                        >
                                            <span className="text-xs text-muted-foreground -mt-3 block">
                                                {i !== 0 ? `${i}:00` : ""}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Grid Columns */}
                            <div className="flex-1 flex relative">
                                {days.map((day, i) => {
                                    const dateKey = format(day, "yyyy-MM-dd");
                                    const daysEvents = timeEventsByDay.get(dateKey) || [];

                                    return (
                                        <div key={i} className="flex-1 border-r border-gray-300 min-w-[50px] relative h-full">
                                            <TimeGrid
                                                date={day}
                                                events={daysEvents}
                                                selectedDate={selectedDate}
                                                onTimeSelect={onTimeSelect}
                                                onEventClick={onEventClick}
                                                showTimeLabels={false}
                                                className="bg-transparent"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
